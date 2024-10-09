---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/comet_tracing.ipynb
---
# Comet 跟踪

有两种方法可以使用 Comet 跟踪您的 LangChain 执行：

1. 将 `LANGCHAIN_COMET_TRACING` 环境变量设置为 "true"。这是推荐的方式。
2. 手动导入 `CometTracer` 并显式传递它。


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Comet Tracing"}, {"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Comet Tracing"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Comet Tracing"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Comet Tracing"}]-->
import os

import comet_llm
from langchain_openai import OpenAI

os.environ["LANGCHAIN_COMET_TRACING"] = "true"

# Connect to Comet if no API Key is set
comet_llm.init()

# comet documentation to configure comet using env variables
# https://www.comet.com/docs/v2/api-and-sdk/llm-sdk/configuration/
# here we are configuring the comet project
os.environ["COMET_PROJECT_NAME"] = "comet-example-langchain-tracing"

from langchain.agents import AgentType, initialize_agent, load_tools
```


```python
# Agent run with tracing. Ensure that OPENAI_API_KEY is set appropriately to run this example.

llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
```


```python
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("What is 2 raised to .123243 power?")  # this should be traced
# An url for the chain like the following should print in your console:
# https://www.comet.com/<workspace>/<project_name>
# The url can be used to view the LLM chain in Comet.
```


```python
<!--IMPORTS:[{"imported": "CometTracer", "source": "langchain_community.callbacks.tracers.comet", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.tracers.comet.CometTracer.html", "title": "Comet Tracing"}]-->
# Now, we unset the environment variable and use a context manager.
if "LANGCHAIN_COMET_TRACING" in os.environ:
    del os.environ["LANGCHAIN_COMET_TRACING"]

from langchain_community.callbacks.tracers.comet import CometTracer

tracer = CometTracer()

# Recreate the LLM, tools and agent and passing the callback to each of them
llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run(
    "What is 2 raised to .123243 power?", callbacks=[tracer]
)  # this should be traced
```
