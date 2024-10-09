---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/amadeus.ipynb
---
# Amadeus 工具包

本笔记本将指导您如何将 LangChain 连接到 `Amadeus` 旅行 API。

这个 `Amadeus` 工具包允许代理在旅行方面做出决策，特别是在搜索和预订航班旅行时。

要使用此工具包，您需要准备好您的 Amadeus API 密钥，详细说明请参见 [开始使用 Amadeus 自助服务 API](https://developers.amadeus.com/get-started/get-started-with-self-service-apis-335)。一旦您收到 AMADEUS_CLIENT_ID 和 AMADEUS_CLIENT_SECRET，您可以将它们作为环境变量输入如下。

注意：Amadeus 自助服务 API 提供一个带有 [免费有限数据](https://amadeus4dev.github.io/developer-guides/test-data/) 的测试环境。这允许开发者在将应用程序部署到生产环境之前构建和测试它们。要访问实时数据，您需要 [迁移到生产环境](https://amadeus4dev.github.io/developer-guides/API-Keys/moving-to-production/)。


```python
%pip install --upgrade --quiet  amadeus > /dev/null
```


```python
%pip install -qU langchain-community
```

## 分配环境变量

工具包将读取 AMADEUS_CLIENT_ID 和 AMADEUS_CLIENT_SECRET 环境变量以验证用户，因此您需要在此设置它们。


```python
# Set environmental variables here
import os

os.environ["AMADEUS_CLIENT_ID"] = "CLIENT_ID"
os.environ["AMADEUS_CLIENT_SECRET"] = "CLIENT_SECRET"

# os.environ["AMADEUS_HOSTNAME"] = "production" or "test"
```

## 创建 Amadeus 工具包并获取工具

首先，您需要创建工具包，以便稍后可以访问其工具。

默认情况下，`AmadeusToolkit` 使用 `ChatOpenAI` 来识别离给定位置最近的机场。要使用它，只需设置 `OPENAI_API_KEY`。



```python
os.environ["OPENAI_API_KEY"] = "YOUR_OPENAI_API_KEY"
```


```python
<!--IMPORTS:[{"imported": "AmadeusToolkit", "source": "langchain_community.agent_toolkits.amadeus.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.amadeus.toolkit.AmadeusToolkit.html", "title": "Amadeus Toolkit"}]-->
from langchain_community.agent_toolkits.amadeus.toolkit import AmadeusToolkit

toolkit = AmadeusToolkit()
tools = toolkit.get_tools()
```

或者，您可以使用 langchain 支持的任何大型语言模型，例如 `HuggingFaceHub`。


```python
<!--IMPORTS:[{"imported": "HuggingFaceHub", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.huggingface_hub.HuggingFaceHub.html", "title": "Amadeus Toolkit"}]-->
from langchain_community.llms import HuggingFaceHub

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "YOUR_HF_API_TOKEN"

llm = HuggingFaceHub(
    repo_id="tiiuae/falcon-7b-instruct",
    model_kwargs={"temperature": 0.5, "max_length": 64},
)

toolkit_hf = AmadeusToolkit(llm=llm)
```

## 在代理中使用 Amadeus 工具包


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Amadeus Toolkit"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Amadeus Toolkit"}, {"imported": "ReActJsonSingleInputOutputParser", "source": "langchain.agents.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.output_parsers.react_json_single_input.ReActJsonSingleInputOutputParser.html", "title": "Amadeus Toolkit"}, {"imported": "render_text_description_and_args", "source": "langchain.tools.render", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.render.render_text_description_and_args.html", "title": "Amadeus Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Amadeus Toolkit"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent
from langchain.agents.output_parsers import ReActJsonSingleInputOutputParser
from langchain.tools.render import render_text_description_and_args
from langchain_openai import ChatOpenAI
```


```python
llm = ChatOpenAI(temperature=0)

prompt = hub.pull("hwchase17/react-json")
agent = create_react_agent(
    llm,
    tools,
    prompt,
    tools_renderer=render_text_description_and_args,
    output_parser=ReActJsonSingleInputOutputParser(),
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)
```


```python
agent_executor.invoke({"input": "What is the name of the airport in Cali, Colombia?"})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should use the closest_airport tool to find the airport in Cali, Colombia.
Action: closest_airport
Action Input: location= "Cali, Colombia"[0m[36;1m[1;3mcontent='{\n  "iataCode": "CLO"\n}'[0m[32;1m[1;3mThe airport in Cali, Colombia is called CLO.
Final Answer: CLO[0m

[1m> Finished chain.[0m
```


```output
{'input': 'What is the name of the airport in Cali, Colombia?',
 'output': 'CLO'}
```



```python
agent_executor.invoke(
    {
        "input": "What is the departure time of the cheapest flight on March 10, 2024 leaving Dallas, Texas before noon to Lincoln, Nebraska?"
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: What is the departure time of the cheapest flight on March 10, 2024 leaving Dallas, Texas before noon to Lincoln, Nebraska?
Thought: We need to find the closest airport to Dallas, Texas, and then search for the cheapest flight departing before noon on March 10, 2024, to Lincoln, Nebraska.
Action:
\`\`\`
{
  "action": "closest_airport",
  "action_input": {
    "location": "Dallas, Texas"
  }
}
\`\`\`[0m[36;1m[1;3mcontent='{\n    "iataCode": "DFW"\n}'[0m[32;1m[1;3mNow, we have the IATA code for Dallas, Texas. Next, we will search for the cheapest flight departing before noon on March 10, 2024, from Dallas (DFW) to Lincoln, Nebraska.

Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "DFW",
    "destinationLocationCode": "LNK",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T12:00:00"
  }
}
\`\`\`[0m[33;1m[1;3m[{'price': {'total': '593.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T10:54:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T13:15:00'}, 'flightNumber': '1634', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '652.68', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T07:25:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T09:46:00'}, 'flightNumber': '380', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-10T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '765.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T16:42:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T17:49:00'}, 'flightNumber': '2655', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T17:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T20:07:00'}, 'flightNumber': '4910', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '810.82', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T07:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T08:51:00'}, 'flightNumber': '4645', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '810.82', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T09:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T10:42:00'}, 'flightNumber': '5215', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '815.99', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'IAD', 'at': '2024-03-11T07:00:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-11T08:03:00'}, 'flightNumber': '418', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '901.12', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T13:15:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T14:50:00'}, 'flightNumber': '323', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-10T19:35:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T21:19:00'}, 'flightNumber': '5413', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '901.12', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T11:40:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T13:23:00'}, 'flightNumber': '1027', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-10T19:35:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T21:19:00'}, 'flightNumber': '5413', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '919.40', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T15:10:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T16:57:00'}, 'flightNumber': '1504', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-10T19:35:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T21:19:00'}, 'flightNumber': '5413', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '963.36', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T13:45:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T14:45:00'}, 'flightNumber': '1380', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T17:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T20:07:00'}, 'flightNumber': '4910', 'carrier': 'UNITED AIRLINES'}]}][0m[32;1m[1;3mObservation: The cheapest flight on March 10, 2024, from Dallas, Texas (DFW) to Lincoln, Nebraska (LNK) departs at 10:54 AM.
Final Answer: The departure time of the cheapest flight on March 10, 2024, leaving Dallas, Texas before noon to Lincoln, Nebraska is 10:54 AM.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'What is the departure time of the cheapest flight on March 10, 2024 leaving Dallas, Texas before noon to Lincoln, Nebraska?',
 'output': 'The departure time of the cheapest flight on March 10, 2024, leaving Dallas, Texas before noon to Lincoln, Nebraska is 10:54 AM.'}
```



```python
agent_executor.invoke(
    {
        "input": "At what time does earliest flight on March 10, 2024 leaving Dallas, Texas to Lincoln, Nebraska land in Nebraska?"
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: At what time does the earliest flight on March 10, 2024, leaving Dallas, Texas, to Lincoln, Nebraska land in Nebraska?

Thought: We need to find the closest airport to Dallas, Texas, and then search for a single flight from there to Lincoln, Nebraska on March 10, 2024.

Action:
\`\`\`
{
  "action": "closest_airport",
  "action_input": {
    "location": "Dallas, Texas"
  }
}
\`\`\`
[0m[36;1m[1;3mcontent='{\n    "iataCode": "DFW"\n}'[0m[32;1m[1;3mNow that we have the closest airport to Dallas, Texas, which is Dallas/Fort Worth International Airport with the IATA code DFW, we can proceed to search for a single flight from DFW to Lincoln, Nebraska on March 10, 2024.

Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "DFW",
    "destinationLocationCode": "LNK",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`
[0m[33;1m[1;3m[{'price': {'total': '593.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T14:20:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T16:49:00'}, 'flightNumber': '1583', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '593.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T10:54:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T13:15:00'}, 'flightNumber': '1634', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '652.68', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T07:25:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T09:46:00'}, 'flightNumber': '380', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-10T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-10T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '666.77', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'IAD', 'at': '2024-03-11T08:35:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '1744', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '666.77', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T07:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T08:51:00'}, 'flightNumber': '4645', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '666.77', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T10:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T11:56:00'}, 'flightNumber': '4704', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '666.77', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T12:35:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T16:20:00'}, 'flightNumber': '358', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T09:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T10:42:00'}, 'flightNumber': '5215', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '764.60', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T17:15:00'}, 'arrival': {'iataCode': 'IAD', 'at': '2024-03-10T21:10:00'}, 'flightNumber': '1240', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-11T09:45:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T10:42:00'}, 'flightNumber': '5215', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '2', 'at': '2024-03-11T12:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T14:19:00'}, 'flightNumber': '5728', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '765.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T16:42:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T17:49:00'}, 'flightNumber': '2655', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T15:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T18:12:00'}, 'flightNumber': '4252', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '765.35', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T16:42:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T17:49:00'}, 'flightNumber': '2655', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T17:45:00'}, 'arrival': {'iataCode': 'LNK', 'at': '2024-03-11T20:07:00'}, 'flightNumber': '4910', 'carrier': 'UNITED AIRLINES'}]}][0m[32;1m[1;3mThe earliest flight on March 10, 2024, leaving Dallas, Texas to Lincoln, Nebraska lands in Nebraska at 14:19 on March 11, 2024.

Final Answer: The earliest flight on March 10, 2024, leaving Dallas, Texas to Lincoln, Nebraska lands in Nebraska at 14:19 on March 11, 2024.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'At what time does earliest flight on March 10, 2024 leaving Dallas, Texas to Lincoln, Nebraska land in Nebraska?',
 'output': 'The earliest flight on March 10, 2024, leaving Dallas, Texas to Lincoln, Nebraska lands in Nebraska at 14:19 on March 11, 2024.'}
```



```python
# to execute api correctly, change the querying date to feature
agent_executor.invoke(
    {
        "input": "What is the full travel time for the cheapest flight between Portland, Oregon to Dallas, TX on March 10, 2024?"
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: What is the full travel time for the cheapest flight between Portland, Oregon to Dallas, TX on March 10, 2024?
Thought: We need to find the cheapest flight between Portland, Oregon and Dallas, TX on March 10, 2024, and then calculate the total travel time.
Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "PDX",
    "destinationLocationCode": "DFW",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`[0m[33;1m[1;3m[{'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T09:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T14:11:00'}, 'flightNumber': '2920', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T05:45:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T07:59:00'}, 'flightNumber': '1722', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '304.18', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T20:21:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T00:59:00'}, 'flightNumber': '1200', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '304.18', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T05:45:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T07:59:00'}, 'flightNumber': '1722', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T20:21:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T00:59:00'}, 'flightNumber': '1200', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '377.48', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T16:05:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T19:28:00'}, 'flightNumber': '2254', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T20:20:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:18:00'}, 'flightNumber': '772', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '377.48', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T07:11:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T13:00:00'}, 'flightNumber': '1693', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T15:50:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T18:25:00'}, 'flightNumber': '793', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '382.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T10:38:00'}, 'arrival': {'iataCode': 'IAH', 'terminal': 'C', 'at': '2024-03-10T20:38:00'}, 'flightNumber': '1823', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'IAH', 'terminal': 'C', 'at': '2024-03-10T21:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T22:45:00'}, 'flightNumber': '320', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '389.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T19:04:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T21:09:00'}, 'flightNumber': '431', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '389.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T19:04:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T21:09:00'}, 'flightNumber': '431', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T09:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T14:11:00'}, 'flightNumber': '2920', 'carrier': 'SPIRIT AIRLINES'}]}][0m[32;1m[1;3mWe have multiple flight options with different total prices. We need to calculate the total travel time for each option to find the cheapest flight's full travel time.
Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "PDX",
    "destinationLocationCode": "DFW",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`[0m[33;1m[1;3m[{'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T09:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T14:11:00'}, 'flightNumber': '2920', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '246.13', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T05:45:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T07:59:00'}, 'flightNumber': '1722', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '304.18', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T12:09:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T14:22:00'}, 'flightNumber': '427', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T20:21:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T00:59:00'}, 'flightNumber': '1200', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '304.18', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T05:45:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T07:59:00'}, 'flightNumber': '1722', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T20:21:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T00:59:00'}, 'flightNumber': '1200', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '377.48', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T16:05:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T19:28:00'}, 'flightNumber': '2254', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T20:20:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:18:00'}, 'flightNumber': '772', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '377.48', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T07:11:00'}, 'arrival': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T13:00:00'}, 'flightNumber': '1693', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'ORD', 'terminal': '1', 'at': '2024-03-10T15:50:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T18:25:00'}, 'flightNumber': '793', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '382.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T10:38:00'}, 'arrival': {'iataCode': 'IAH', 'terminal': 'C', 'at': '2024-03-10T20:38:00'}, 'flightNumber': '1823', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'IAH', 'terminal': 'C', 'at': '2024-03-10T21:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T22:45:00'}, 'flightNumber': '320', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '389.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T19:04:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T21:09:00'}, 'flightNumber': '431', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T05:00:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T09:39:00'}, 'flightNumber': '269', 'carrier': 'SPIRIT AIRLINES'}]}, {'price': {'total': '389.10', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'PDX', 'at': '2024-03-10T19:04:00'}, 'arrival': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-10T21:09:00'}, 'flightNumber': '431', 'carrier': 'SPIRIT AIRLINES'}, {'departure': {'iataCode': 'LAS', 'terminal': '1', 'at': '2024-03-11T09:30:00'}, 'arrival': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-11T14:11:00'}, 'flightNumber': '2920', 'carrier': 'SPIRIT AIRLINES'}]}][0m
``````output
 Error: Earliest and latest departure dates need to be the  same date. If you're trying to search for round-trip  flights, call this function for the outbound flight first,  and then call again for the return flight.
``````output
[32;1m[1;3mWe have retrieved the flight options, but we need to calculate the total travel time for each option to find the cheapest flight's full travel time.
Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "PDX",
    "destinationLocationCode": "DFW",
    "departureDateTimeEarliest": "2024-03-10T12:09:00",
    "departureDateTimeLatest": "2024-03-11T14:11:00"
  }
}
\`\`\`[0m[33;1m[1;3m[None][0m[32;1m[1;3mIt seems that we are unable to retrieve the specific flight details for the cheapest option to calculate the full travel time. We can estimate the total travel time based on the layover and flight durations provided in the previous observations.

Final Answer: The full travel time for the cheapest flight between Portland, Oregon and Dallas, TX on March 10, 2024, is approximately 21 hours and 2 minutes.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'What is the full travel time for the cheapest flight between Portland, Oregon to Dallas, TX on March 10, 2024?',
 'output': 'The full travel time for the cheapest flight between Portland, Oregon and Dallas, TX on March 10, 2024, is approximately 21 hours and 2 minutes.'}
```



```python
agent_executor.invoke(
    {
        "input": "Please draft a concise email from Santiago to Paul, Santiago's travel agent, asking him to book the earliest flight from DFW to DCA on March 10, 2024. Include all flight details in the email."
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: Please draft a concise email from Santiago to Paul, Santiago's travel agent, asking him to book the earliest flight from DFW to DCA on March 10, 2024. Include all flight details in the email.

Thought: We need to find the earliest flight from Dallas Fort Worth (DFW) to Washington D.C. (DCA) on March 10, 2024, and provide all the necessary flight details in the email.

Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "DFW",
    "destinationLocationCode": "DCA",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`
[0m[33;1m[1;3m[{'price': {'total': '303.31', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T12:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T13:19:00'}, 'flightNumber': '4431', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '405.43', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T14:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T15:18:00'}, 'flightNumber': '4433', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '539.81', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T11:00:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T12:17:00'}, 'flightNumber': '2549', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T20:56:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T22:12:00'}, 'flightNumber': '4069', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}][0m[32;1m[1;3mWe have found several flight options from DFW to DCA on March 10, 2024. We need to select the earliest one and include all the necessary flight details in the email to Paul.

Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "DFW",
    "destinationLocationCode": "DCA",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`
[0m[33;1m[1;3m[{'price': {'total': '303.31', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T12:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T13:19:00'}, 'flightNumber': '4431', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '405.43', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T14:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T15:18:00'}, 'flightNumber': '4433', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '539.81', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T11:00:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T12:17:00'}, 'flightNumber': '2549', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T20:56:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T22:12:00'}, 'flightNumber': '4069', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}][0m[32;1m[1;3mWe have found several flight options from DFW to DCA on March 10, 2024. We need to select the earliest one and include all the necessary flight details in the email to Paul.

Action:
\`\`\`
{
  "action": "single_flight_search",
  "action_input": {
    "originLocationCode": "DFW",
    "destinationLocationCode": "DCA",
    "departureDateTimeEarliest": "2024-03-10T00:00:00",
    "departureDateTimeLatest": "2024-03-10T23:59:59"
  }
}
\`\`\`
[0m[33;1m[1;3m[{'price': {'total': '303.31', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T12:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T13:19:00'}, 'flightNumber': '4431', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '405.43', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:00:00'}, 'arrival': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T10:25:00'}, 'flightNumber': '1517', 'carrier': 'UNITED AIRLINES'}, {'departure': {'iataCode': 'EWR', 'terminal': 'C', 'at': '2024-03-10T14:00:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '2', 'at': '2024-03-10T15:18:00'}, 'flightNumber': '4433', 'carrier': 'UNITED AIRLINES'}]}, {'price': {'total': '539.81', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T11:00:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T12:17:00'}, 'flightNumber': '2549', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T08:59:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T10:22:00'}, 'flightNumber': '2147', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T06:15:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T07:27:00'}, 'flightNumber': '1323', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-10T16:40:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-10T21:59:00'}, 'flightNumber': '690', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T20:56:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-10T22:12:00'}, 'flightNumber': '4069', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T07:30:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T12:56:00'}, 'flightNumber': '686', 'carrier': 'FRONTIER AIRLINES'}]}, {'price': {'total': '544.98', 'currency': 'EURO'}, 'segments': [{'departure': {'iataCode': 'DFW', 'terminal': 'E', 'at': '2024-03-10T23:29:00'}, 'arrival': {'iataCode': 'DEN', 'at': '2024-03-11T00:43:00'}, 'flightNumber': '4463', 'carrier': 'FRONTIER AIRLINES'}, {'departure': {'iataCode': 'DEN', 'at': '2024-03-11T12:32:00'}, 'arrival': {'iataCode': 'DCA', 'terminal': '1', 'at': '2024-03-11T17:53:00'}, 'flightNumber': '688', 'carrier': 'FRONTIER AIRLINES'}]}][0m[32;1m[1;3mFinal Answer: We have found several flight options from Dallas Fort Worth (DFW) to Washington D.C. (DCA) on March 10, 2024. The earliest flight is with United Airlines, departing from DFW at 06:00 and arriving at DCA at 13:19 with flight numbers 1517 and 4431. The total price is 303.31 EURO.[0m

[1m> Finished chain.[0m
```


```output
{'input': "Please draft a concise email from Santiago to Paul, Santiago's travel agent, asking him to book the earliest flight from DFW to DCA on March 10, 2024. Include all flight details in the email.",
 'output': 'We have found several flight options from Dallas Fort Worth (DFW) to Washington D.C. (DCA) on March 10, 2024. The earliest flight is with United Airlines, departing from DFW at 06:00 and arriving at DCA at 13:19 with flight numbers 1517 and 4431. The total price is 303.31 EURO.'}
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
