---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/tavily_search.ipynb
---
# Tavily 搜索

[Tavily 的搜索 API](https://tavily.com) 是一个专为 AI 代理 (大型语言模型) 构建的搜索引擎，提供实时、准确和事实性的结果，速度极快。

## 概述

### 集成细节
| 类别 | 包名 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/tools/tavily_search) | 包最新 |
| :--- | :--- | :---: | :---: | :---: |
| [TavilySearchResults](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html) | [langchain-community](https://python.langchain.com/api_reference/community/index.html) | ❌ | ✅ | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-community?style=flat-square&label=%20) |

### 工具特性
| [返回工件](/docs/how_to/tool_artifacts/) | 原生异步 | 返回数据 | 定价 |
| :---: | :---: | :---: | :---: |
| ✅ | ✅ | 标题, URL, 内容, 答案 | 每月 1,000 次免费搜索 |


## 设置

集成位于 `LangChain 社区` 包中。我们还需要安装 `tavily-python` 包。


```python
%pip install -qU "langchain-community>=0.2.11" tavily-python
```

### 凭证

我们还需要设置我们的 Tavily API 密钥。您可以通过访问 [此网站](https://app.tavily.com/sign-in) 并创建一个帐户来获取 API 密钥。


```python
import getpass
import os

if not os.environ.get("TAVILY_API_KEY"):
    os.environ["TAVILY_API_KEY"] = getpass.getpass("Tavily API key:\n")
```

设置 [LangSmith](https://smith.langchain.com/) 以获得最佳的可观察性也是有帮助的（但不是必需的）：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 实例化

在这里我们展示如何实例化 Tavily 搜索工具的一个实例，使用


```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "Tavily Search"}]-->
from langchain_community.tools import TavilySearchResults

tool = TavilySearchResults(
    max_results=5,
    search_depth="advanced",
    include_answer=True,
    include_raw_content=True,
    include_images=True,
    # include_domains=[...],
    # exclude_domains=[...],
    # name="...",            # overwrite default tool name
    # description="...",     # overwrite default tool description
    # args_schema=...,       # overwrite default args_schema: BaseModel
)
```

## 调用

### [直接使用参数调用](/docs/concepts/#invoke-with-just-the-arguments)

`TavilySearchResults` 工具接受一个单一的 "query" 参数，该参数应为自然语言查询：


```python
tool.invoke({"query": "What happened at the last wimbledon"})
```



```output
[{'url': 'https://www.theguardian.com/sport/live/2023/jul/16/wimbledon-mens-singles-final-2023-carlos-alcaraz-v-novak-djokovic-live?page=with:block-64b3ff568f08df28470056bf',
  'content': 'Carlos Alcaraz recovered from a set down to topple Djokovic 1-6, 7-6(6), 6-1, 3-6, 6-4 and win his first Wimbledon title in a battle for the ages'},
 {'url': 'https://www.nytimes.com/athletic/live-blogs/wimbledon-2024-live-updates-alcaraz-djokovic-mens-final-result/kJJdTKhOgkZo/',
  'content': "It was Djokovic's first straight-sets defeat at Wimbledon since the 2013 final, when he lost to Andy Murray. Below, The Athletic 's writers, Charlie Eccleshare and Matt Futterman, analyze the ..."},
 {'url': 'https://www.foxsports.com.au/tennis/wimbledon/fk-you-stars-explosion-stuns-wimbledon-as-massive-final-locked-in/news-story/41cf7d28a12845cdab6be4150a22a170',
  'content': 'The last time Djokovic and Wimbledon met was at the French Open in June when the Serb claimed victory in a third round tie which ended at 3:07 in the morning. On Friday, however, Djokovic was ...'},
 {'url': 'https://www.cnn.com/2024/07/09/sport/novak-djokovic-wimbledon-crowd-quarterfinals-spt-intl/index.html',
  'content': 'Novak Djokovic produced another impressive performance at Wimbledon on Monday to cruise into the quarterfinals, but the 24-time grand slam champion was far from happy after his win.'},
 {'url': 'https://www.cnn.com/2024/07/05/sport/andy-murray-wimbledon-farewell-ceremony-spt-intl/index.html',
  'content': "It was an emotional night for three-time grand slam champion Andy Murray on Thursday, as the 37-year-old's Wimbledon farewell began with doubles defeat.. Murray will retire from the sport this ..."}]
```


### [使用 ToolCall 调用](/docs/concepts/#invoke-with-toolcall)

我们还可以使用模型生成的 ToolCall 调用该工具，在这种情况下将返回一个 ToolMessage：


```python
# This is usually generated by a model, but we'll create a tool call directly for demon purposes.
model_generated_tool_call = {
    "args": {"query": "euro 2024 host nation"},
    "id": "1",
    "name": "tavily",
    "type": "tool_call",
}
tool_msg = tool.invoke(model_generated_tool_call)

# The content is a JSON string of results
print(tool_msg.content[:400])
```
```output
[{"url": "https://www.radiotimes.com/tv/sport/football/euro-2024-location/", "content": "Euro 2024 host cities. Germany have 10 host cities for Euro 2024, topped by the country's capital Berlin. Berlin. Cologne. Dortmund. Dusseldorf. Frankfurt. Gelsenkirchen. Hamburg."}, {"url": "https://www.sportingnews.com/ca/soccer/news/list-euros-host-nations-uefa-european-championship-countries/85f8069d69c9f4
```

```python
# The artifact is a dict with richer, raw results
{k: type(v) for k, v in tool_msg.artifact.items()}
```



```output
{'query': str,
 'follow_up_questions': NoneType,
 'answer': str,
 'images': list,
 'results': list,
 'response_time': float}
```



```python
import json

# Abbreviate the results for demo purposes
print(json.dumps({k: str(v)[:200] for k, v in tool_msg.artifact.items()}, indent=2))
```
```output
{
  "query": "euro 2024 host nation",
  "follow_up_questions": "None",
  "answer": "Germany will be the host nation for Euro 2024, with the tournament scheduled to take place from June 14 to July 14. The matches will be held in 10 different cities across Germany, including Berlin, Co",
  "images": "['https://i.ytimg.com/vi/3hsX0vLatNw/maxresdefault.jpg', 'https://img.planetafobal.com/2021/10/sedes-uefa-euro-2024-alemania-fg.jpg', 'https://editorial.uefa.com/resources/0274-14fe4fafd0d4-413fc8a7b7",
  "results": "[{'title': 'Where is Euro 2024? Country, host cities and venues', 'url': 'https://www.radiotimes.com/tv/sport/football/euro-2024-location/', 'content': \"Euro 2024 host cities. Germany have 10 host cit",
  "response_time": "3.97"
}
```
## 链接

我们可以通过首先将工具绑定到一个 [工具调用模型](/docs/how_to/tool_calling/) 然后调用它来在链中使用我们的工具：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Tavily Search"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "Tavily Search"}, {"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "Tavily Search"}]-->
import datetime

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig, chain

today = datetime.datetime.today().strftime("%D")
prompt = ChatPromptTemplate(
    [
        ("system", f"You are a helpful assistant. The date today is {today}."),
        ("human", "{user_input}"),
        ("placeholder", "{messages}"),
    ]
)

# specifying tool_choice will force the model to call this tool.
llm_with_tools = llm.bind_tools([tool])

llm_chain = prompt | llm_with_tools


@chain
def tool_chain(user_input: str, config: RunnableConfig):
    input_ = {"user_input": user_input}
    ai_msg = llm_chain.invoke(input_, config=config)
    tool_msgs = tool.batch(ai_msg.tool_calls, config=config)
    return llm_chain.invoke({**input_, "messages": [ai_msg, *tool_msgs]}, config=config)


tool_chain.invoke("who won the last womens singles wimbledon")
```



```output
AIMessage(content="The last women's singles champion at Wimbledon was Markéta Vondroušová, who won the title in 2023.", response_metadata={'token_usage': {'completion_tokens': 26, 'prompt_tokens': 802, 'total_tokens': 828}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_4e2b2da518', 'finish_reason': 'stop', 'logprobs': None}, id='run-2bfeec6e-8f04-477e-bf51-9500f18bd514-0', usage_metadata={'input_tokens': 802, 'output_tokens': 26, 'total_tokens': 828})
```


这是本次运行的 [LangSmith 跟踪](https://smith.langchain.com/public/b43232c1-b243-4a7f-afeb-5fba8c84ba56/r)。

## API 参考

有关所有 TavilySearchResults 特性和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
