---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/aim_tracking.ipynb
---
# Aim

Aim使可视化和调试LangChain执行变得非常简单。Aim跟踪大型语言模型和工具的输入和输出，以及代理的操作。

使用Aim，您可以轻松调试和检查单个执行：

![](https://user-images.githubusercontent.com/13848158/227784778-06b806c7-74a1-4d15-ab85-9ece09b458aa.png)

此外，您还可以选择并排比较多个执行：

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)

Aim是完全开源的，[了解更多](https://github.com/aimhubio/aim)关于Aim的信息。

让我们继续，看看如何启用和配置Aim回调。

<h3>Tracking LangChain Executions with Aim</h3>

在这个笔记本中，我们将探索三种使用场景。首先，我们将安装必要的包并导入某些模块。随后，我们将配置两个环境变量，这些变量可以在Python脚本中或通过终端设置。


```python
%pip install --upgrade --quiet  aim
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```


```python
<!--IMPORTS:[{"imported": "AimCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.aim_callback.AimCallbackHandler.html", "title": "Aim"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Aim"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Aim"}]-->
import os
from datetime import datetime

from langchain_community.callbacks import AimCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_openai import OpenAI
```

我们的示例使用GPT模型作为大型语言模型，OpenAI为此提供了API。您可以从以下链接获取密钥：https://platform.openai.com/account/api-keys。

我们将使用SerpApi从Google检索搜索结果。要获取SerpApi密钥，请访问https://serpapi.com/manage-api-key。


```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

`AimCallbackHandler`的事件方法接受LangChain模块或代理作为输入，并记录至少提示词和生成的结果，以及LangChain模块的序列化版本，记录到指定的Aim运行中。


```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

callbacks = [StdOutCallbackHandler(), aim_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```

`flush_tracker`函数用于在Aim上记录LangChain资产。默认情况下，会议会被重置，而不是直接终止。

<h3>Scenario 1</h3> In the first scenario, we will use OpenAI LLM.


```python
# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)
```

<h3>Scenario 2</h3> Scenario two involves chaining with multiple SubChains across multiple generations.


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Aim"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Aim"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```


```python
# scenario 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "the phenomenon behind the remarkable speed of cheetahs"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
aim_callback.flush_tracker(
    langchain_asset=synopsis_chain, experiment_name="scenario 3: Agent with Tools"
)
```

<h3>Scenario 3</h3> The third scenario involves an agent with tools.


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Aim"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Aim"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Aim"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
```


```python
# scenario 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
aim_callback.flush_tracker(langchain_asset=agent, reset=False, finish=True)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mLeonardo DiCaprio seemed to prove a long-held theory about his love life right after splitting from girlfriend Camila Morrone just months ...[0m
Thought:[32;1m[1;3m I need to find out Camila Morrone's age
Action: Search
Action Input: "Camila Morrone age"[0m
Observation: [36;1m[1;3m25 years[0m
Thought:[32;1m[1;3m I need to calculate 25 raised to the 0.43 power
Action: Calculator
Action Input: 25^0.43[0m
Observation: [33;1m[1;3mAnswer: 3.991298452658078
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Camila Morrone is Leo DiCaprio's girlfriend and her current age raised to the 0.43 power is 3.991298452658078.[0m

[1m> Finished chain.[0m
```