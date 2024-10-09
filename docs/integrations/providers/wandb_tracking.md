---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/wandb_tracking.ipynb
---
# 权重与偏差

本笔记本介绍了如何将您的LangChain实验跟踪到一个集中化的权重与偏差仪表板中。要了解更多关于提示工程和回调的信息，请参考此报告，该报告解释了两者以及您可以期待看到的结果仪表板。


<a href="https://colab.research.google.com/drive/1DXH4beT4HFaRKy_Vm4PoxhXVDRf7Ym8L?usp=sharing" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>


[查看报告](https://wandb.ai/a-sh0ts/langchain_callback_demo/reports/Prompt-Engineering-LLMs-with-LangChain-and-W-B--VmlldzozNjk1NTUw#👋-how-to-build-a-callback-in-langchain-for-better-prompt-engineering)
)


**注意**：_`WandbCallbackHandler`正在被弃用，取而代之的是`WandbTracer`_。将来请使用`WandbTracer`，因为它更灵活并允许更细粒度的日志记录。要了解更多关于`WandbTracer`的信息，请参考[agent_with_wandb_tracing](/docs/integrations/providers/wandb_tracing)笔记本或使用以下[Colab笔记本](http://wandb.me/prompts-quickstart)。要了解更多关于权重与偏差提示的信息，请参考以下[提示文档](https://docs.wandb.ai/guides/prompts)。


```python
%pip install --upgrade --quiet  wandb
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  textstat
%pip install --upgrade --quiet  spacy
!python -m spacy download en_core_web_sm
```


```python
import os

os.environ["WANDB_API_KEY"] = ""
# os.environ["OPENAI_API_KEY"] = ""
# os.environ["SERPAPI_API_KEY"] = ""
```


```python
<!--IMPORTS:[{"imported": "WandbCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.wandb_callback.WandbCallbackHandler.html", "title": "Weights & Biases"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "Weights & Biases"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Weights & Biases"}]-->
from datetime import datetime

from langchain_community.callbacks import WandbCallbackHandler
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_openai import OpenAI
```

```
Callback Handler that logs to Weights and Biases.

Parameters:
    job_type (str): The type of job.
    project (str): The project to log to.
    entity (str): The entity to log to.
    tags (list): The tags to log.
    group (str): The group to log to.
    name (str): The name of the run.
    notes (str): The notes to log.
    visualize (bool): Whether to visualize the run.
    complexity_metrics (bool): Whether to log complexity metrics.
    stream_logs (bool): Whether to stream callback actions to W&B
```

```
Default values for WandbCallbackHandler(...)

visualize: bool = False,
complexity_metrics: bool = False,
stream_logs: bool = False,
```


注意：对于测试工作流，我们的默认分析基于textstat，可视化基于spacy


```python
"""Main function.

This function is used to try the callback handler.
Scenarios:
1. OpenAI LLM
2. Chain with multiple SubChains on multiple generations
3. Agent with Tools
"""
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
wandb_callback = WandbCallbackHandler(
    job_type="inference",
    project="langchain_callback_demo",
    group=f"minimal_{session_group}",
    name="llm",
    tags=["test"],
)
callbacks = [StdOutCallbackHandler(), wandb_callback]
llm = OpenAI(temperature=0, callbacks=callbacks)
```
```output
[34m[1mwandb[0m: Currently logged in as: [33mharrison-chase[0m. Use [1m`wandb login --relogin`[0m to force relogin
```
```html
Tracking run with wandb version 0.14.0 
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150408-e47j1914</code> 
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">llm</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/> 
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a> 
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914</a> 
```
```output
[34m[1mwandb[0m: [33mWARNING[0m The wandb callback is currently in beta and is subject to change based on updates to `langchain`. Please report any issues to https://github.com/wandb/wandb/issues with the tag `langchain`.
```


```
# Defaults for WandbCallbackHandler.flush_tracker(...)

reset: bool = True,
finish: bool = False,
```



`flush_tracker`函数用于将LangChain会话记录到Weights & Biases。它接受LangChain模块或代理，并至少记录提示和生成内容，以及LangChain模块的序列化形式到指定的Weights & Biases项目。默认情况下，我们重置会话，而不是直接结束会话。


```python
# SCENARIO 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
wandb_callback.flush_tracker(llm, name="simple_sequential")
```

```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong> 
```

```html
View run <strong style="color:#cdcd00">llm</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/e47j1914</a><br/>Synced 5 W&B file(s), 2 media file(s), 5 artifact file(s) and 0 other file(s) 
```

```html
Find logs at: <code>./wandb/run-20230318_150408-e47j1914/logs</code> 
```

```output
VBox(children=(Label(value='Waiting for wandb.init()...\r'), FloatProgress(value=0.016745895149999985, max=1.0…
```

```html
Tracking run with wandb version 0.14.0 
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150534-jyxma7hu</code> 
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">simple_sequential</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/> 
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a> 
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu</a> 
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Weights & Biases"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Weights & Biases"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```


```python
# SCENARIO 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
    {"title": "cocaine bear vs heroin wolf"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
wandb_callback.flush_tracker(synopsis_chain, name="agent")
```

```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong> 
```

```html
View run <strong style="color:#cdcd00">simple_sequential</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/jyxma7hu</a><br/>Synced 4 W&B file(s), 2 media file(s), 6 artifact file(s) and 0 other file(s) 
```

```html
Find logs at: <code>./wandb/run-20230318_150534-jyxma7hu/logs</code> 
```

```output
VBox(children=(Label(value='Waiting for wandb.init()...\r'), FloatProgress(value=0.016736786816666675, max=1.0…
```

```html
Tracking run with wandb version 0.14.0 
```

```html
Run data is saved locally in <code>/Users/harrisonchase/workplace/langchain/docs/ecosystem/wandb/run-20230318_150550-wzy59zjq</code> 
```

```html
Syncing run <strong><a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">agent</a></strong> to <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">Weights & Biases</a> (<a href='https://wandb.me/run' target="_blank">docs</a>)<br/> 
```

```html
View project at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo</a> 
```

```html
View run at <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq</a> 
```


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Weights & Biases"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Weights & Biases"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Weights & Biases"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
```


```python
# SCENARIO 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=callbacks,
)
wandb_callback.flush_tracker(agent, reset=False, finish=True)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Leo DiCaprio's girlfriend is and then calculate her age raised to the 0.43 power.
Action: Search
Action Input: "Leo DiCaprio girlfriend"[0m
Observation: [36;1m[1;3mDiCaprio had a steady girlfriend in Camila Morrone. He had been with the model turned actress for nearly five years, as they were first said to be dating at the end of 2017. And the now 26-year-old Morrone is no stranger to Hollywood.[0m
Thought:[32;1m[1;3m I need to calculate her age raised to the 0.43 power.
Action: Calculator
Action Input: 26^0.43[0m
Observation: [33;1m[1;3mAnswer: 4.059182145592686
[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: Leo DiCaprio's girlfriend is Camila Morrone and her current age raised to the 0.43 power is 4.059182145592686.[0m

[1m> Finished chain.[0m
```
```html
Waiting for W&B process to finish... <strong style="color:green">(success).</strong> 
```

```html
View run <strong style="color:#cdcd00">agent</strong> at: <a href='https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq' target="_blank">https://wandb.ai/harrison-chase/langchain_callback_demo/runs/wzy59zjq</a><br/>Synced 5 W&B file(s), 2 media file(s), 7 artifact file(s) and 0 other file(s) 
```

```html
Find logs at: <code>./wandb/run-20230318_150550-wzy59zjq/logs</code> 
```
