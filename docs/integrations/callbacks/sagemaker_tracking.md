---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/sagemaker_tracking.ipynb
---
# SageMaker 跟踪

>[Amazon SageMaker](https://aws.amazon.com/sagemaker/) 是一个完全托管的服务，用于快速轻松地构建、训练和部署机器学习 (ML) 模型。

>[Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html) 是 `Amazon SageMaker` 的一项功能，允许您组织、跟踪、比较和评估 ML 实验和模型版本。

本笔记本展示了如何使用 LangChain 回调将提示词和其他 LLM 超参数记录和跟踪到 `SageMaker Experiments` 中。在这里，我们使用不同的场景来展示该功能：

* **场景 1**: *单一 LLM* - 使用单个 LLM 模型根据给定提示生成输出的案例。
* **场景 2**: *顺序链* - 使用两个 LLM 模型的顺序链的案例。
* **场景 3**: *带工具的代理 (思维链)* - 除了 LLM 之外，还使用多个工具（搜索和数学）的案例。


在本笔记本中，我们将创建一个单一实验来记录每个场景的提示。

## 安装和设置


```python
%pip install --upgrade --quiet  sagemaker
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

首先，设置所需的API密钥

* OpenAI: https://platform.openai.com/account/api-keys (用于OpenAI大型语言模型)
* Google SERP API: https://serpapi.com/manage-api-key (用于Google搜索工具)


```python
import os

## Add your API keys below
os.environ["OPENAI_API_KEY"] = "<ADD-KEY-HERE>"
os.environ["SERPAPI_API_KEY"] = "<ADD-KEY-HERE>"
```


```python
<!--IMPORTS:[{"imported": "SageMakerCallbackHandler", "source": "langchain_community.callbacks.sagemaker_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.sagemaker_callback.SageMakerCallbackHandler.html", "title": "SageMaker Tracking"}]-->
from langchain_community.callbacks.sagemaker_callback import SageMakerCallbackHandler
```


```python
<!--IMPORTS:[{"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "SageMaker Tracking"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "SageMaker Tracking"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "SageMaker Tracking"}, {"imported": "SimpleSequentialChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sequential.SimpleSequentialChain.html", "title": "SageMaker Tracking"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "SageMaker Tracking"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "SageMaker Tracking"}]-->
from langchain.agents import initialize_agent, load_tools
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from sagemaker.analytics import ExperimentAnalytics
from sagemaker.experiments.run import Run
from sagemaker.session import Session
```

## 大型语言模型提示跟踪


```python
# LLM Hyperparameters
HPARAMS = {
    "temperature": 0.1,
    "model_name": "gpt-3.5-turbo-instruct",
}

# Bucket used to save prompt logs (Use `None` is used to save the default bucket or otherwise change it)
BUCKET_NAME = None

# Experiment name
EXPERIMENT_NAME = "langchain-sagemaker-tracker"

# Create SageMaker Session with the given bucket
session = Session(default_bucket=BUCKET_NAME)
```

### 场景 1 - 大型语言模型


```python
RUN_NAME = "run-scenario-1"
PROMPT_TEMPLATE = "tell me a joke about {topic}"
INPUT_VARIABLES = {"topic": "fish"}
```


```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create prompt template
    prompt = PromptTemplate.from_template(template=PROMPT_TEMPLATE)

    # Create LLM Chain
    chain = LLMChain(llm=llm, prompt=prompt, callbacks=[sagemaker_callback])

    # Run chain
    chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### 场景 2 - 顺序链


```python
RUN_NAME = "run-scenario-2"

PROMPT_TEMPLATE_1 = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
PROMPT_TEMPLATE_2 = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
Play Synopsis: {synopsis}
Review from a New York Times play critic of the above play:"""

INPUT_VARIABLES = {
    "input": "documentary about good video games that push the boundary of game design"
}
```


```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Create prompt templates for the chain
    prompt_template1 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_1)
    prompt_template2 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_2)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create chain1
    chain1 = LLMChain(llm=llm, prompt=prompt_template1, callbacks=[sagemaker_callback])

    # Create chain2
    chain2 = LLMChain(llm=llm, prompt=prompt_template2, callbacks=[sagemaker_callback])

    # Create Sequential chain
    overall_chain = SimpleSequentialChain(
        chains=[chain1, chain2], callbacks=[sagemaker_callback]
    )

    # Run overall sequential chain
    overall_chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### 场景 3 - 带工具的代理


```python
RUN_NAME = "run-scenario-3"
PROMPT_TEMPLATE = "Who is the oldest person alive? And what is their current age raised to the power of 1.51?"
```


```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Define tools
    tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[sagemaker_callback])

    # Initialize agent with all the tools
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", callbacks=[sagemaker_callback]
    )

    # Run agent
    agent.run(input=PROMPT_TEMPLATE)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

## 加载日志数据

一旦提示被记录，我们可以轻松地加载并将其转换为Pandas DataFrame，如下所示。


```python
# Load
logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# Convert as pandas dataframe
df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

如上所示，实验中有三次运行（行），对应于每个场景。每次运行记录提示和相关的大型语言模型设置/超参数，并以json格式保存到s3桶中。欢迎加载并探索每个json路径的日志数据。
