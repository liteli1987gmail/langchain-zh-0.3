---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/comet_tracking.ipynb
---
# Comet

>[Comet](https://www.comet.com/) 机器学习平台与您现有的基础设施和工具集成
>以便您可以管理、可视化和优化模型——从训练运行到生产监控

![](https://user-images.githubusercontent.com/7529846/230328046-a8b18c51-12e3-4617-9b39-97614a571a2d.png)

在本指南中，我们将演示如何使用 [Comet](https://www.comet.com/site/?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook) 跟踪您的 LangChain 实验、评估指标和大型语言模型会话。

<a target="_blank" href="https://colab.research.google.com/github/hwchase17/langchain/blob/master/docs/ecosystem/comet_tracking">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

**示例项目：** [Comet与LangChain](https://www.comet.com/examples/comet-example-langchain/view/b5ZThK6OFdhKWVSP3fDfRtrNF/panels?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook)

![](https://user-images.githubusercontent.com/7529846/230326720-a9711435-9c6f-4edb-a707-94b67271ab25.png)


### 安装Comet及其依赖项


```python
%pip install --upgrade --quiet  comet_ml langchain langchain-openai google-search-results spacy textstat pandas


!{sys.executable} -m spacy download en_core_web_sm
```

### 初始化 Comet 并设置您的凭据

您可以在这里获取您的 [Comet API 密钥](https://www.comet.com/signup?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook)，或者在初始化 Comet 后点击链接


```python
import comet_ml

comet_ml.init(project_name="comet-example-langchain")
```

### 设置 OpenAI 和 SerpAPI 凭据

您需要一个 [OpenAI API 密钥](https://platform.openai.com/account/api-keys) 和一个 [SerpAPI API 密钥](https://serpapi.com/dashboard) 来运行以下示例


```python
import os

os.environ["OPENAI_API_KEY"] = "..."
# os.environ["OPENAI_ORGANIZATION"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

### 场景 1：仅使用 LLM


```python
<!--IMPORTS:[{"imported": "CometCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.comet_ml_callback.CometCallbackHandler.html", "title": "Comet"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Comet"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Comet"}]-->
from langchain_community.callbacks import CometCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=True,
    stream_logs=True,
    tags=["llm"],
    visualizations=["dep"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks, verbose=True)

llm_result = llm.generate(["Tell me a joke", "Tell me a poem", "Tell me a fact"] * 3)
print("LLM result", llm_result)
comet_callback.flush_tracker(llm, finish=True)
```

### 场景 2：在链中使用 LLM


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Comet"}, {"imported": "CometCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.comet_ml_callback.CometCallbackHandler.html", "title": "Comet"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Comet"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Comet"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Comet"}]-->
from langchain.chains import LLMChain
from langchain_community.callbacks import CometCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    complexity_metrics=True,
    project_name="comet-example-langchain",
    stream_logs=True,
    tags=["synopsis-chain"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
print(synopsis_chain.apply(test_prompts))
comet_callback.flush_tracker(synopsis_chain, finish=True)
```

### 场景 3：使用带工具的代理


```python
<!--IMPORTS:[{"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Comet"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Comet"}, {"imported": "CometCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.comet_ml_callback.CometCallbackHandler.html", "title": "Comet"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Comet"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Comet"}]-->
from langchain.agents import initialize_agent, load_tools
from langchain_community.callbacks import CometCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=True,
    stream_logs=True,
    tags=["agent"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    callbacks=callbacks,
    verbose=True,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
comet_callback.flush_tracker(agent, finish=True)
```

### 场景 4：使用自定义评估指标

`CometCallbackManager` 还允许您定义和使用自定义评估指标来评估模型生成的输出。让我们看看这是如何工作的。


在下面的代码片段中，我们将使用 [ROUGE](https://huggingface.co/spaces/evaluate-metric/rouge) 指标来评估输入提示生成的摘要的质量。


```python
%pip install --upgrade --quiet  rouge-score
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Comet"}, {"imported": "CometCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.comet_ml_callback.CometCallbackHandler.html", "title": "Comet"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Comet"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Comet"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Comet"}]-->
from langchain.chains import LLMChain
from langchain_community.callbacks import CometCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from rouge_score import rouge_scorer


class Rouge:
    def __init__(self, reference):
        self.reference = reference
        self.scorer = rouge_scorer.RougeScorer(["rougeLsum"], use_stemmer=True)

    def compute_metric(self, generation, prompt_idx, gen_idx):
        prediction = generation.text
        results = self.scorer.score(target=self.reference, prediction=prediction)

        return {
            "rougeLsum_score": results["rougeLsum"].fmeasure,
            "reference": self.reference,
        }


reference = """
The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building.
It was the first structure to reach a height of 300 metres.

It is now taller than the Chrysler Building in New York City by 5.2 metres (17 ft)
Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France .
"""
rouge_score = Rouge(reference=reference)

template = """Given the following article, it is your job to write a summary.
Article:
{article}
Summary: This is the summary for the above article:"""
prompt_template = PromptTemplate(input_variables=["article"], template=template)

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=False,
    stream_logs=True,
    tags=["custom_metrics"],
    custom_metrics=rouge_score.compute_metric,
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9)

synopsis_chain = LLMChain(llm=llm, prompt=prompt_template)

test_prompts = [
    {
        "article": """
                 The tower is 324 metres (1,063 ft) tall, about the same height as
                 an 81-storey building, and the tallest structure in Paris. Its base is square,
                 measuring 125 metres (410 ft) on each side.
                 During its construction, the Eiffel Tower surpassed the
                 Washington Monument to become the tallest man-made structure in the world,
                 a title it held for 41 years until the Chrysler Building
                 in New York City was finished in 1930.

                 It was the first structure to reach a height of 300 metres.
                 Due to the addition of a broadcasting aerial at the top of the tower in 1957,
                 it is now taller than the Chrysler Building by 5.2 metres (17 ft).

                 Excluding transmitters, the Eiffel Tower is the second tallest
                 free-standing structure in France after the Millau Viaduct.
                 """
    }
]
print(synopsis_chain.apply(test_prompts, callbacks=callbacks))
comet_callback.flush_tracker(synopsis_chain, finish=True)
```

### 回调追踪器

还有一个与 Comet 的集成：

查看一个[示例](/docs/integrations/callbacks/comet_tracing)。



```python
<!--IMPORTS:[{"imported": "CometTracer", "source": "langchain_community.callbacks.tracers.comet", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.tracers.comet.CometTracer.html", "title": "Comet"}]-->
from langchain_community.callbacks.tracers.comet import CometTracer
```
