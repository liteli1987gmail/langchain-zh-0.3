---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/robocorp.ipynb
---
# Robocorp 工具包

本笔记本介绍如何开始使用 [Robocorp Action Server](https://github.com/robocorp/robocorp) 动作工具包和 LangChain。

Robocorp 是扩展 AI 代理、助手和副驾驶功能的最简单方法，支持自定义动作。

## 安装

首先，请查看 [Robocorp 快速入门](https://github.com/robocorp/robocorp#quickstart)，了解如何设置 `Action Server` 并创建您的动作。

在您的 LangChain 应用中，安装 `langchain-robocorp` 包：


```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

当你按照上述快速入门创建新的 `Action Server` 时。

它将创建一个包含文件的目录，包括 `action.py`。

我们可以添加 Python 函数作为动作，如 [这里](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action) 所示。

让我们在 `action.py` 中添加一个虚拟函数。

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

然后我们启动服务器：

```bash
action-server start
```

我们可以看到：

```
Found new action: get_weather_forecast

```

通过访问运行在 `http://localhost:8080` 的服务器进行本地测试，并使用 UI 运行该函数。

## 环境设置

可选地，你可以设置以下环境变量：

- `LANGCHAIN_TRACING_V2=true`：启用 LangSmith 日志运行追踪，也可以绑定到相应的 Action Server 动作运行日志。有关更多信息，请参见 [LangSmith 文档](https://docs.smith.langchain.com/tracing#log-runs)。

## 使用

我们启动了本地操作服务器，如上所示，运行在 `http://localhost:8080`。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Robocorp Toolkit"}, {"imported": "OpenAIFunctionsAgent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_functions_agent.base.OpenAIFunctionsAgent.html", "title": "Robocorp Toolkit"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Robocorp Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Robocorp Toolkit"}]-->
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```


### 单输入工具

默认情况下，`toolkit.get_tools()` 将返回作为结构化工具的操作。

要返回单输入工具，请传递一个聊天模型以用于处理输入。


```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
