---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/agents.ipynb
keywords: [agent, agents]
---
# 构建一个代理

:::info Prerequisites

本指南假设您对以下概念有所了解：

- [聊天模型](/docs/concepts/#chat-models)
- [工具](/docs/concepts/#tools)
- [代理](/docs/concepts/#agents)

:::

单靠语言模型无法采取行动 - 它们只是输出文本。
LangChain的一个重要用例是创建**代理**。
代理是使用大型语言模型作为推理引擎的系统，以确定采取哪些行动以及传递给它们的输入。
在执行操作后，结果可以反馈到大型语言模型中，以确定是否需要更多操作，或者是否可以结束。

在本教程中，我们将构建一个可以与搜索引擎互动的代理。您将能够向这个代理提问，观看它调用搜索工具，并与它进行对话。

## 端到端代理

下面的代码片段表示一个完全功能的代理，它使用大型语言模型来决定使用哪些工具。它配备了一个通用搜索工具。它具有对话记忆 - 这意味着它可以作为一个多轮聊天机器人使用。

在本指南的其余部分，我们将逐步介绍各个组件及其功能 - 但如果您只想获取一些代码并开始使用，请随意使用这个！


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "Build an Agent"}, {"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "Build an Agent"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Build an Agent"}]-->
# Import relevant functionality
from langchain_anthropic import ChatAnthropic
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

# Create the agent
memory = MemorySaver()
model = ChatAnthropic(model_name="claude-3-sonnet-20240229")
search = TavilySearchResults(max_results=2)
tools = [search]
agent_executor = create_react_agent(model, tools, checkpointer=memory)

# Use the agent
config = {"configurable": {"thread_id": "abc123"}}
for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="hi im bob! and i live in sf")]}, config
):
    print(chunk)
    print("----")

for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="whats the weather where I live?")]}, config
):
    print(chunk)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content="Hello Bob! Since you didn't ask a specific question, I don't need to use any tools to respond. It's nice to meet you. San Francisco is a wonderful city with lots to see and do. I hope you're enjoying living there. Please let me know if you have any other questions!", response_metadata={'id': 'msg_01Mmfzfs9m4XMgVzsCZYMWqH', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 271, 'output_tokens': 65}}, id='run-44c57f9c-a637-4888-b7d9-6d985031ae48-0', usage_metadata={'input_tokens': 271, 'output_tokens': 65, 'total_tokens': 336})]}}
----
{'agent': {'messages': [AIMessage(content=[{'text': 'To get current weather information for your location in San Francisco, let me invoke the search tool:', 'type': 'text'}, {'id': 'toolu_01BGEyQaSz3pTq8RwUUHSRoo', 'input': {'query': 'san francisco weather'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}], response_metadata={'id': 'msg_013AVSVsRLKYZjduLpJBY4us', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'tool_use', 'stop_sequence': None, 'usage': {'input_tokens': 347, 'output_tokens': 80}}, id='run-de7923b6-5ee2-4ebe-bd95-5aed4933d0e3-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'san francisco weather'}, 'id': 'toolu_01BGEyQaSz3pTq8RwUUHSRoo'}], usage_metadata={'input_tokens': 347, 'output_tokens': 80, 'total_tokens': 427})]}}
----
{'tools': {'messages': [ToolMessage(content='[{"url": "https://www.weatherapi.com/", "content": "{\'location\': {\'name\': \'San Francisco\', \'region\': \'California\', \'country\': \'United States of America\', \'lat\': 37.78, \'lon\': -122.42, \'tz_id\': \'America/Los_Angeles\', \'localtime_epoch\': 1717238643, \'localtime\': \'2024-06-01 3:44\'}, \'current\': {\'last_updated_epoch\': 1717237800, \'last_updated\': \'2024-06-01 03:30\', \'temp_c\': 12.0, \'temp_f\': 53.6, \'is_day\': 0, \'condition\': {\'text\': \'Mist\', \'icon\': \'//cdn.weatherapi.com/weather/64x64/night/143.png\', \'code\': 1030}, \'wind_mph\': 5.6, \'wind_kph\': 9.0, \'wind_degree\': 310, \'wind_dir\': \'NW\', \'pressure_mb\': 1013.0, \'pressure_in\': 29.92, \'precip_mm\': 0.0, \'precip_in\': 0.0, \'humidity\': 88, \'cloud\': 100, \'feelslike_c\': 10.5, \'feelslike_f\': 50.8, \'windchill_c\': 9.3, \'windchill_f\': 48.7, \'heatindex_c\': 11.1, \'heatindex_f\': 51.9, \'dewpoint_c\': 8.8, \'dewpoint_f\': 47.8, \'vis_km\': 6.4, \'vis_miles\': 3.0, \'uv\': 1.0, \'gust_mph\': 12.5, \'gust_kph\': 20.1}}"}, {"url": "https://www.timeanddate.com/weather/usa/san-francisco/historic", "content": "Past Weather in San Francisco, California, USA \\u2014 Yesterday and Last 2 Weeks. Time/General. Weather. Time Zone. DST Changes. Sun & Moon. Weather Today Weather Hourly 14 Day Forecast Yesterday/Past Weather Climate (Averages) Currently: 68 \\u00b0F. Passing clouds."}]', name='tavily_search_results_json', tool_call_id='toolu_01BGEyQaSz3pTq8RwUUHSRoo')]}}
----
{'agent': {'messages': [AIMessage(content='Based on the search results, the current weather in San Francisco is:\n\nTemperature: 53.6°F (12°C)\nConditions: Misty\nWind: 5.6 mph (9 kph) from the Northwest\nHumidity: 88%\nCloud Cover: 100% \n\nThe results provide detailed information like wind chill, heat index, visibility and more. It looks like a typical cool, foggy morning in San Francisco. Let me know if you need any other details about the weather where you live!', response_metadata={'id': 'msg_019WGLbaojuNdbCnqac7zaGW', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 1035, 'output_tokens': 120}}, id='run-1bb68bf3-b212-4ef4-8a31-10c830421c78-0', usage_metadata={'input_tokens': 1035, 'output_tokens': 120, 'total_tokens': 1155})]}}
----
```
## 设置

### Jupyter Notebook

本指南（以及文档中的大多数其他指南）使用 [Jupyter notebooks](https://jupyter.org/) 并假设读者也是如此。Jupyter notebooks 是学习如何使用大型语言模型系统的完美交互环境，因为事情有时会出错（意外输出、API故障等），观察这些情况是更好地理解如何构建大型语言模型的好方法。

本教程和其他教程最方便的运行方式是使用 Jupyter notebook。有关安装的说明，请参见 [这里](https://jupyter.org/install)。

### 安装

要安装 LangChain，请运行：


```python
%pip install -U langchain-community langgraph langchain-anthropic tavily-python langgraph-checkpoint-sqlite
```

有关更多详细信息，请参见我们的 [安装指南](/docs/how_to/installation)。

### LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型。
随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。
最好的方法是使用 [LangSmith](https://smith.langchain.com)。

在您注册上述链接后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Tavily

我们将使用 [Tavily](/docs/integrations/tools/tavily_search)（一个搜索引擎）作为工具。
为了使用它，您需要获取并设置一个API密钥：

```bash
export TAVILY_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["TAVILY_API_KEY"] = getpass.getpass()
```

## 定义工具

我们首先需要创建我们想要使用的工具。我们主要选择的工具将是 [Tavily](/docs/integrations/tools/tavily_search) - 一个搜索引擎。LangChain中内置了一个工具，可以轻松使用Tavily搜索引擎作为工具。



```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "Build an Agent"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

search = TavilySearchResults(max_results=2)
search_results = search.invoke("what is the weather in SF")
print(search_results)
# If we want, we can create other tools.
# Once we have all the tools we want, we can put them in a list that we will reference later.
tools = [search]
```



```output
[{'url': 'https://www.weatherapi.com/',
  'content': "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.78, 'lon': -122.42, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1717238703, 'localtime': '2024-06-01 3:45'}, 'current': {'last_updated_epoch': 1717237800, 'last_updated': '2024-06-01 03:30', 'temp_c': 12.0, 'temp_f': 53.6, 'is_day': 0, 'condition': {'text': 'Mist', 'icon': '//cdn.weatherapi.com/weather/64x64/night/143.png', 'code': 1030}, 'wind_mph': 5.6, 'wind_kph': 9.0, 'wind_degree': 310, 'wind_dir': 'NW', 'pressure_mb': 1013.0, 'pressure_in': 29.92, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 88, 'cloud': 100, 'feelslike_c': 10.5, 'feelslike_f': 50.8, 'windchill_c': 9.3, 'windchill_f': 48.7, 'heatindex_c': 11.1, 'heatindex_f': 51.9, 'dewpoint_c': 8.8, 'dewpoint_f': 47.8, 'vis_km': 6.4, 'vis_miles': 3.0, 'uv': 1.0, 'gust_mph': 12.5, 'gust_kph': 20.1}}"},
 {'url': 'https://www.wunderground.com/hourly/us/ca/san-francisco/date/2024-01-06',
  'content': 'Current Weather for Popular Cities . San Francisco, CA 58 ° F Partly Cloudy; Manhattan, NY warning 51 ° F Cloudy; Schiller Park, IL (60176) warning 51 ° F Fair; Boston, MA warning 41 ° F ...'}]
```


## 使用语言模型

接下来，让我们学习如何通过调用工具来使用语言模型。LangChain支持许多不同的语言模型，您可以互换使用 - 请选择您想要使用的模型！

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs openaiParams={`model="gpt-4"`} />


您可以通过传入消息列表来调用语言模型。默认情况下，响应是一个 `content` 字符串。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Build an Agent"}]-->
from langchain_core.messages import HumanMessage

response = model.invoke([HumanMessage(content="hi!")])
response.content
```



```output
'Hi there!'
```


我们现在可以看到启用此模型进行工具调用的情况。为了启用这一点，我们使用 `.bind_tools` 来让语言模型了解这些工具。


```python
model_with_tools = model.bind_tools(tools)
```

我们现在可以调用模型。让我们先用一条普通消息调用它，看看它的响应。我们可以查看 `content` 字段和 `tool_calls` 字段。


```python
response = model_with_tools.invoke([HumanMessage(content="Hi!")])

print(f"ContentString: {response.content}")
print(f"ToolCalls: {response.tool_calls}")
```
```output
ContentString: Hello!
ToolCalls: []
```
现在，让我们尝试用一些输入来调用它，这些输入会期望调用一个工具。


```python
response = model_with_tools.invoke([HumanMessage(content="What's the weather in SF?")])

print(f"ContentString: {response.content}")
print(f"ToolCalls: {response.tool_calls}")
```
```output
ContentString: 
ToolCalls: [{'name': 'tavily_search_results_json', 'args': {'query': 'weather san francisco'}, 'id': 'toolu_01VTP7DUvSfgtYxsq9x4EwMp'}]
```
我们可以看到现在没有文本内容，但有一个工具调用！它希望我们调用 Tavily Search 工具。

这还没有调用那个工具 - 它只是告诉我们去调用。为了实际调用它，我们需要创建我们的代理。

## 创建代理

现在我们已经定义了工具和大型语言模型，我们可以创建代理。我们将使用 [LangGraph](/docs/concepts/#langgraph) 来构建代理。
目前我们正在使用高级接口来构建代理，但LangGraph的好处在于，这个高级接口是由一个低级的、高度可控的API支持的，以防您想修改代理逻辑。


现在，我们可以用大型语言模型和工具初始化代理。

请注意，我们传入的是 `model`，而不是 `model_with_tools`。这是因为 `create_react_agent` 会在后台为我们调用 `.bind_tools`。


```python
from langgraph.prebuilt import create_react_agent

agent_executor = create_react_agent(model, tools)
```

## 运行代理

我们现在可以在几个查询上运行代理！请注意，目前这些都是 **无状态** 查询（它不会记住之前的交互）。请注意，代理将在交互结束时返回 **最终** 状态（包括任何输入，我们稍后将看到如何仅获取输出）。

首先，让我们看看当不需要调用工具时它的响应：


```python
response = agent_executor.invoke({"messages": [HumanMessage(content="hi!")]})

response["messages"]
```



```output
[HumanMessage(content='hi!', id='a820fcc5-9b87-457a-9af0-f21768143ee3'),
 AIMessage(content='Hello!', response_metadata={'id': 'msg_01VbC493X1VEDyusgttiEr1z', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 264, 'output_tokens': 5}}, id='run-0e0ddae8-a85b-4bd6-947c-c36c857a4698-0', usage_metadata={'input_tokens': 264, 'output_tokens': 5, 'total_tokens': 269})]
```


为了确切了解后台发生了什么（并确保它没有调用工具），我们可以查看 [LangSmith 跟踪](https://smith.langchain.com/public/28311faa-e135-4d6a-ab6b-caecf6482aaa/r)。

现在让我们在一个应该调用工具的示例上试试。


```python
response = agent_executor.invoke(
    {"messages": [HumanMessage(content="whats the weather in sf?")]}
)
response["messages"]
```



```output
[HumanMessage(content='whats the weather in sf?', id='1d6c96bb-4ddb-415c-a579-a07d5264de0d'),
 AIMessage(content=[{'id': 'toolu_01Y5EK4bw2LqsQXeaUv8iueF', 'input': {'query': 'weather in san francisco'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}], response_metadata={'id': 'msg_0132wQUcEduJ8UKVVVqwJzM4', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'tool_use', 'stop_sequence': None, 'usage': {'input_tokens': 269, 'output_tokens': 61}}, id='run-26d5e5e8-d4fd-46d2-a197-87b95b10e823-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'weather in san francisco'}, 'id': 'toolu_01Y5EK4bw2LqsQXeaUv8iueF'}], usage_metadata={'input_tokens': 269, 'output_tokens': 61, 'total_tokens': 330}),
 ToolMessage(content='[{"url": "https://www.weatherapi.com/", "content": "{\'location\': {\'name\': \'San Francisco\', \'region\': \'California\', \'country\': \'United States of America\', \'lat\': 37.78, \'lon\': -122.42, \'tz_id\': \'America/Los_Angeles\', \'localtime_epoch\': 1717238703, \'localtime\': \'2024-06-01 3:45\'}, \'current\': {\'last_updated_epoch\': 1717237800, \'last_updated\': \'2024-06-01 03:30\', \'temp_c\': 12.0, \'temp_f\': 53.6, \'is_day\': 0, \'condition\': {\'text\': \'Mist\', \'icon\': \'//cdn.weatherapi.com/weather/64x64/night/143.png\', \'code\': 1030}, \'wind_mph\': 5.6, \'wind_kph\': 9.0, \'wind_degree\': 310, \'wind_dir\': \'NW\', \'pressure_mb\': 1013.0, \'pressure_in\': 29.92, \'precip_mm\': 0.0, \'precip_in\': 0.0, \'humidity\': 88, \'cloud\': 100, \'feelslike_c\': 10.5, \'feelslike_f\': 50.8, \'windchill_c\': 9.3, \'windchill_f\': 48.7, \'heatindex_c\': 11.1, \'heatindex_f\': 51.9, \'dewpoint_c\': 8.8, \'dewpoint_f\': 47.8, \'vis_km\': 6.4, \'vis_miles\': 3.0, \'uv\': 1.0, \'gust_mph\': 12.5, \'gust_kph\': 20.1}}"}, {"url": "https://www.timeanddate.com/weather/usa/san-francisco/hourly", "content": "Sun & Moon. Weather Today Weather Hourly 14 Day Forecast Yesterday/Past Weather Climate (Averages) Currently: 59 \\u00b0F. Passing clouds. (Weather station: San Francisco International Airport, USA). See more current weather."}]', name='tavily_search_results_json', id='37aa1fd9-b232-4a02-bd22-bc5b9b44a22c', tool_call_id='toolu_01Y5EK4bw2LqsQXeaUv8iueF'),
 AIMessage(content='Based on the search results, here is a summary of the current weather in San Francisco:\n\nThe weather in San Francisco is currently misty with a temperature of around 53°F (12°C). There is complete cloud cover and moderate winds from the northwest around 5-9 mph (9-14 km/h). Humidity is high at 88%. Visibility is around 3 miles (6.4 km). \n\nThe results provide an hourly forecast as well as current conditions from a couple different weather sources. Let me know if you need any additional details about the San Francisco weather!', response_metadata={'id': 'msg_01BRX9mrT19nBDdHYtR7wJ92', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 920, 'output_tokens': 132}}, id='run-d0325583-3ddc-4432-b2b2-d023eb97660f-0', usage_metadata={'input_tokens': 920, 'output_tokens': 132, 'total_tokens': 1052})]
```


我们可以查看 [LangSmith 跟踪](https://smith.langchain.com/public/f520839d-cd4d-4495-8764-e32b548e235d/r)，以确保它有效地调用了搜索工具。

## 流式消息

我们已经看到如何使用 `.invoke` 调用代理以获取最终响应。如果代理正在执行多个步骤，这可能需要一些时间。为了显示中间进度，我们可以在消息发生时流式返回消息。


```python
for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="whats the weather in sf?")]}
):
    print(chunk)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_50Kb8zHmFqPYavQwF5TgcOH8', 'function': {'arguments': '{\n  "query": "current weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 23, 'prompt_tokens': 134, 'total_tokens': 157}, 'model_name': 'gpt-4', 'system_fingerprint': None, 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-042d5feb-c2cc-4c3f-b8fd-dbc22fd0bc07-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'current weather in San Francisco'}, 'id': 'call_50Kb8zHmFqPYavQwF5TgcOH8'}])]}}
----
{'action': {'messages': [ToolMessage(content='[{"url": "https://www.weatherapi.com/", "content": "{\'location\': {\'name\': \'San Francisco\', \'region\': \'California\', \'country\': \'United States of America\', \'lat\': 37.78, \'lon\': -122.42, \'tz_id\': \'America/Los_Angeles\', \'localtime_epoch\': 1714426906, \'localtime\': \'2024-04-29 14:41\'}, \'current\': {\'last_updated_epoch\': 1714426200, \'last_updated\': \'2024-04-29 14:30\', \'temp_c\': 17.8, \'temp_f\': 64.0, \'is_day\': 1, \'condition\': {\'text\': \'Sunny\', \'icon\': \'//cdn.weatherapi.com/weather/64x64/day/113.png\', \'code\': 1000}, \'wind_mph\': 23.0, \'wind_kph\': 37.1, \'wind_degree\': 290, \'wind_dir\': \'WNW\', \'pressure_mb\': 1019.0, \'pressure_in\': 30.09, \'precip_mm\': 0.0, \'precip_in\': 0.0, \'humidity\': 50, \'cloud\': 0, \'feelslike_c\': 17.8, \'feelslike_f\': 64.0, \'vis_km\': 16.0, \'vis_miles\': 9.0, \'uv\': 5.0, \'gust_mph\': 27.5, \'gust_kph\': 44.3}}"}, {"url": "https://world-weather.info/forecast/usa/san_francisco/april-2024/", "content": "Extended weather forecast in San Francisco. Hourly Week 10 days 14 days 30 days Year. Detailed \\u26a1 San Francisco Weather Forecast for April 2024 - day/night \\ud83c\\udf21\\ufe0f temperatures, precipitations - World-Weather.info."}]', name='tavily_search_results_json', id='d88320ac-3fe1-4f73-870a-3681f15f6982', tool_call_id='call_50Kb8zHmFqPYavQwF5TgcOH8')]}}
----
{'agent': {'messages': [AIMessage(content='The current weather in San Francisco, California is sunny with a temperature of 17.8°C (64.0°F). The wind is coming from the WNW at 23.0 mph. The humidity is at 50%. [source](https://www.weatherapi.com/)', response_metadata={'token_usage': {'completion_tokens': 58, 'prompt_tokens': 602, 'total_tokens': 660}, 'model_name': 'gpt-4', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-0cd2a507-ded5-4601-afe3-3807400e9989-0')]}}
----
```
## 流式令牌

除了流式返回消息，流式返回令牌也是有用的。
我们可以使用 `.astream_events` 方法来实现这一点。

:::important
此 `.astream_events` 方法仅适用于 Python 3.11 或更高版本。
:::


```python
async for event in agent_executor.astream_events(
    {"messages": [HumanMessage(content="whats the weather in sf?")]}, version="v1"
):
    kind = event["event"]
    if kind == "on_chain_start":
        if (
            event["name"] == "Agent"
        ):  # Was assigned when creating the agent with `.with_config({"run_name": "Agent"})`
            print(
                f"Starting agent: {event['name']} with input: {event['data'].get('input')}"
            )
    elif kind == "on_chain_end":
        if (
            event["name"] == "Agent"
        ):  # Was assigned when creating the agent with `.with_config({"run_name": "Agent"})`
            print()
            print("--")
            print(
                f"Done agent: {event['name']} with output: {event['data'].get('output')['output']}"
            )
    if kind == "on_chat_model_stream":
        content = event["data"]["chunk"].content
        if content:
            # Empty content in the context of OpenAI means
            # that the model is asking for a tool to be invoked.
            # So we only print non-empty content
            print(content, end="|")
    elif kind == "on_tool_start":
        print("--")
        print(
            f"Starting tool: {event['name']} with inputs: {event['data'].get('input')}"
        )
    elif kind == "on_tool_end":
        print(f"Done tool: {event['name']}")
        print(f"Tool output was: {event['data'].get('output')}")
        print("--")
```
```output
--
Starting tool: tavily_search_results_json with inputs: {'query': 'current weather in San Francisco'}
Done tool: tavily_search_results_json
Tool output was: [{'url': 'https://www.weatherapi.com/', 'content': "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.78, 'lon': -122.42, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1714427052, 'localtime': '2024-04-29 14:44'}, 'current': {'last_updated_epoch': 1714426200, 'last_updated': '2024-04-29 14:30', 'temp_c': 17.8, 'temp_f': 64.0, 'is_day': 1, 'condition': {'text': 'Sunny', 'icon': '//cdn.weatherapi.com/weather/64x64/day/113.png', 'code': 1000}, 'wind_mph': 23.0, 'wind_kph': 37.1, 'wind_degree': 290, 'wind_dir': 'WNW', 'pressure_mb': 1019.0, 'pressure_in': 30.09, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 50, 'cloud': 0, 'feelslike_c': 17.8, 'feelslike_f': 64.0, 'vis_km': 16.0, 'vis_miles': 9.0, 'uv': 5.0, 'gust_mph': 27.5, 'gust_kph': 44.3}}"}, {'url': 'https://www.weathertab.com/en/c/e/04/united-states/california/san-francisco/', 'content': 'San Francisco Weather Forecast for Apr 2024 - Risk of Rain Graph. Rain Risk Graph: Monthly Overview. Bar heights indicate rain risk percentages. Yellow bars mark low-risk days, while black and grey bars signal higher risks. Grey-yellow bars act as buffers, advising to keep at least one day clear from the riskier grey and black days, guiding ...'}]
--
The| current| weather| in| San| Francisco|,| California|,| USA| is| sunny| with| a| temperature| of| |17|.|8|°C| (|64|.|0|°F|).| The| wind| is| blowing| from| the| W|NW| at| a| speed| of| |37|.|1| k|ph| (|23|.|0| mph|).| The| humidity| level| is| at| |50|%.| [|Source|](|https|://|www|.weather|api|.com|/)|
```
## 添加内存

如前所述，该代理是无状态的。这意味着它不记得之前的交互。为了给它添加内存，我们需要传入一个检查点。当传入检查点时，我们还必须在调用代理时传入 `thread_id`（以便它知道从哪个线程/对话恢复）。


```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
```


```python
agent_executor = create_react_agent(model, tools, checkpointer=memory)

config = {"configurable": {"thread_id": "abc123"}}
```


```python
for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="hi im bob!")]}, config
):
    print(chunk)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content="Hello Bob! It's nice to meet you again.", response_metadata={'id': 'msg_013C1z2ZySagEFwmU1EsysR2', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 1162, 'output_tokens': 14}}, id='run-f878acfd-d195-44e8-9166-e2796317e3f8-0', usage_metadata={'input_tokens': 1162, 'output_tokens': 14, 'total_tokens': 1176})]}}
----
```

```python
for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="whats my name?")]}, config
):
    print(chunk)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content='You mentioned your name is Bob when you introduced yourself earlier. So your name is Bob.', response_metadata={'id': 'msg_01WNwnRNGwGDRw6vRdivt6i1', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 1184, 'output_tokens': 21}}, id='run-f5c0b957-8878-405a-9d4b-a7cd38efe81f-0', usage_metadata={'input_tokens': 1184, 'output_tokens': 21, 'total_tokens': 1205})]}}
----
```
示例 [LangSmith 跟踪](https://smith.langchain.com/public/fa73960b-0f7d-4910-b73d-757a12f33b2b/r)

如果我想开始一个新的对话，我所要做的就是更改使用的 `thread_id`


```python
config = {"configurable": {"thread_id": "xyz123"}}
for chunk in agent_executor.stream(
    {"messages": [HumanMessage(content="whats my name?")]}, config
):
    print(chunk)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content="I'm afraid I don't actually know your name. As an AI assistant without personal information about you, I don't have a specific name associated with our conversation.", response_metadata={'id': 'msg_01NoaXNNYZKSoBncPcLkdcbo', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 267, 'output_tokens': 36}}, id='run-c9f7df3d-525a-4d8f-bbcf-a5b4a5d2e4b0-0', usage_metadata={'input_tokens': 267, 'output_tokens': 36, 'total_tokens': 303})]}}
----
```
## 结论

到此为止！在这个快速入门中，我们介绍了如何创建一个简单的代理。
我们已经展示了如何流式返回响应 - 不仅是中间步骤，还有令牌！
我们还添加了内存功能，这样你就可以与它们进行对话。
代理是一个复杂的话题，还有很多需要学习的内容！

有关代理的更多信息，请查看[LangGraph](/docs/concepts/#langgraph)文档。它有自己的一套概念、教程和使用指南。
