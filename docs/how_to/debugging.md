---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/debugging.ipynb
---
# 如何调试你的大型语言模型应用

与构建任何类型的软件一样，在使用大型语言模型时，你总会需要调试。模型调用可能会失败，或者模型输出格式不正确，或者会有一些嵌套的模型调用，而不清楚在这个过程中哪里产生了错误的输出。

调试主要有三种方法：

- 详细模式：这会为你链中的“重要”事件添加打印语句。
- 调试模式：这会为你链中的所有事件添加日志语句。
- LangSmith 跟踪：这会将事件记录到 [LangSmith](https://docs.smith.langchain.com/) 以便在那里进行可视化。

|                        | 详细模式 | 调试模式 | LangSmith 跟踪 |
|------------------------|--------------|------------|-------------------|
| 免费                   | ✅            | ✅          | ✅                 |
| 用户界面               | ❌            | ❌          | ✅                 |
| 持久化              | ❌            | ❌          | ✅                 |
| 查看所有事件         | ❌            | ✅          | ✅                 |
| 查看“重要”事件      | ✅            | ❌          | ✅                 |
| 本地运行             | ✅            | ✅          | ❌                 |


## 跟踪

使用LangChain构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。
随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。
最好的方法是使用[LangSmith](https://smith.langchain.com)。

在上面的链接注册后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以通过以下方式设置它们：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

假设我们有一个代理，并希望可视化它采取的行动和收到的工具输出。没有任何调试，这就是我们看到的：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
/>



```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to debug your LLM apps"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to debug your LLM apps"}, {"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "How to debug your LLM apps"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to debug your LLM apps"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant.",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Construct the Tools agent
agent = create_tool_calling_agent(llm, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke(
    {"input": "Who directed the 2023 film Oppenheimer and what is their age in days?"}
)
```



```output
{'input': 'Who directed the 2023 film Oppenheimer and what is their age in days?',
 'output': 'The 2023 film "Oppenheimer" was directed by Christopher Nolan.\n\nTo calculate Christopher Nolan\'s age in days, we first need his birthdate, which is July 30, 1970. Let\'s calculate his age in days from his birthdate to today\'s date, December 7, 2023.\n\n1. Calculate the total number of days from July 30, 1970, to December 7, 2023.\n2. Nolan was born on July 30, 1970. From July 30, 1970, to July 30, 2023, is 53 years.\n3. From July 30, 2023, to December 7, 2023, is 130 days.\n\nNow, calculate the total days:\n- 53 years = 53 x 365 = 19,345 days\n- Adding leap years from 1970 to 2023: There are 13 leap years (1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020). So, add 13 days.\n- Total days from years and leap years = 19,345 + 13 = 19,358 days\n- Add the days from July 30, 2023, to December 7, 2023 = 130 days\n\nTotal age in days = 19,358 + 130 = 19,488 days\n\nChristopher Nolan is 19,488 days old as of December 7, 2023.'}
```


我们没有得到太多输出，但由于我们设置了LangSmith，我们可以轻松看到幕后发生了什么：

https://smith.langchain.com/public/a89ff88f-9ddc-4757-a395-3a1b365655bf/r

## `set_debug` 和 `set_verbose`

如果您在Jupyter笔记本中进行原型设计或运行Python脚本，打印出链运行的中间步骤可能会很有帮助。

有多种方法可以以不同的详细程度启用打印。

注意：即使启用了LangSmith，这些仍然有效，因此您可以同时开启并运行两者。


### `set_verbose(True)`

设置 `verbose` 标志将以稍微更易读的格式打印输入和输出，并将跳过记录某些原始输出（例如 LLM 调用的令牌使用统计），以便您可以专注于应用逻辑。


```python
<!--IMPORTS:[{"imported": "set_verbose", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_verbose.html", "title": "How to debug your LLM apps"}]-->
from langchain.globals import set_verbose

set_verbose(True)
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke(
    {"input": "Who directed the 2023 film Oppenheimer and what is their age in days?"}
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'director of the 2023 film Oppenheimer'}`


[0m[36;1m[1;3m[{'url': 'https://m.imdb.com/title/tt15398776/', 'content': 'Oppenheimer: Directed by Christopher Nolan. With Cillian Murphy, Emily Blunt, Robert Downey Jr., Alden Ehrenreich. The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'}][0m[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'birth date of Christopher Nolan'}`


[0m[36;1m[1;3m[{'url': 'https://m.imdb.com/name/nm0634240/bio/', 'content': 'Christopher Nolan. Writer: Tenet. Best known for his cerebral, often nonlinear, storytelling, acclaimed Academy Award winner writer/director/producer Sir Christopher Nolan CBE was born in London, England. Over the course of more than 25 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made and became one of the most ...'}][0m[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'Christopher Nolan birth date'}`
responded: The 2023 film **Oppenheimer** was directed by **Christopher Nolan**.

To calculate Christopher Nolan's age in days, I need his exact birth date. Let me find that information for you.

[0m[36;1m[1;3m[{'url': 'https://m.imdb.com/name/nm0634240/bio/', 'content': 'Christopher Nolan. Writer: Tenet. Best known for his cerebral, often nonlinear, storytelling, acclaimed Academy Award winner writer/director/producer Sir Christopher Nolan CBE was born in London, England. Over the course of more than 25 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made and became one of the most ...'}][0m[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'Christopher Nolan date of birth'}`
responded: It appears that I need to refine my search to get the exact birth date of Christopher Nolan. Let me try again to find that specific information.

[0m[36;1m[1;3m[{'url': 'https://m.imdb.com/name/nm0634240/bio/', 'content': 'Christopher Nolan. Writer: Tenet. Best known for his cerebral, often nonlinear, storytelling, acclaimed Academy Award winner writer/director/producer Sir Christopher Nolan CBE was born in London, England. Over the course of more than 25 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made and became one of the most ...'}][0m[32;1m[1;3mI am currently unable to retrieve the exact birth date of Christopher Nolan from the sources available. However, it is widely known that he was born on July 30, 1970. Using this date, I can calculate his age in days as of today.

Let's calculate:

- Christopher Nolan's birth date: July 30, 1970.
- Today's date: December 7, 2023.

The number of days between these two dates can be calculated as follows:

1. From July 30, 1970, to July 30, 2023, is 53 years.
2. From July 30, 2023, to December 7, 2023, is 130 days.

Calculating the total days for 53 years (considering leap years):
- 53 years × 365 days/year = 19,345 days
- Adding leap years (1972, 1976, ..., 2020, 2024 - 13 leap years): 13 days

Total days from birth until July 30, 2023: 19,345 + 13 = 19,358 days
Adding the days from July 30, 2023, to December 7, 2023: 130 days

Total age in days as of December 7, 2023: 19,358 + 130 = 19,488 days.

Therefore, Christopher Nolan is 19,488 days old as of December 7, 2023.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'Who directed the 2023 film Oppenheimer and what is their age in days?',
 'output': "I am currently unable to retrieve the exact birth date of Christopher Nolan from the sources available. However, it is widely known that he was born on July 30, 1970. Using this date, I can calculate his age in days as of today.\n\nLet's calculate:\n\n- Christopher Nolan's birth date: July 30, 1970.\n- Today's date: December 7, 2023.\n\nThe number of days between these two dates can be calculated as follows:\n\n1. From July 30, 1970, to July 30, 2023, is 53 years.\n2. From July 30, 2023, to December 7, 2023, is 130 days.\n\nCalculating the total days for 53 years (considering leap years):\n- 53 years × 365 days/year = 19,345 days\n- Adding leap years (1972, 1976, ..., 2020, 2024 - 13 leap years): 13 days\n\nTotal days from birth until July 30, 2023: 19,345 + 13 = 19,358 days\nAdding the days from July 30, 2023, to December 7, 2023: 130 days\n\nTotal age in days as of December 7, 2023: 19,358 + 130 = 19,488 days.\n\nTherefore, Christopher Nolan is 19,488 days old as of December 7, 2023."}
```


### `set_debug(True)`

设置全局 `debug` 标志将导致所有支持回调的 LangChain 组件（链、模型、代理、工具、检索器）打印它们接收到的输入和生成的输出。这是最详细的设置，将完全记录原始输入和输出。


```python
<!--IMPORTS:[{"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "How to debug your LLM apps"}]-->
from langchain.globals import set_debug

set_debug(True)
set_verbose(False)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke(
    {"input": "Who directed the 2023 film Oppenheimer and what is their age in days?"}
)
```
```output
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor] Entering Chain run with input:
[0m{
  "input": "Who directed the 2023 film Oppenheimer and what is their age in days?"
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad>] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad> > 4:chain:RunnableParallel<agent_scratchpad>] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad> > 4:chain:RunnableParallel<agent_scratchpad> > 5:chain:RunnableLambda] Entering Chain run with input:
[0m{
  "input": ""
}
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad> > 4:chain:RunnableParallel<agent_scratchpad> > 5:chain:RunnableLambda] [1ms] Exiting Chain run with output:
[0m{
  "output": []
}
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad> > 4:chain:RunnableParallel<agent_scratchpad>] [2ms] Exiting Chain run with output:
[0m{
  "agent_scratchpad": []
}
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 3:chain:RunnableAssign<agent_scratchpad>] [5ms] Exiting Chain run with output:
[0m{
  "input": "Who directed the 2023 film Oppenheimer and what is their age in days?",
  "intermediate_steps": [],
  "agent_scratchpad": []
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 6:prompt:ChatPromptTemplate] Entering Prompt run with input:
[0m{
  "input": "Who directed the 2023 film Oppenheimer and what is their age in days?",
  "intermediate_steps": [],
  "agent_scratchpad": []
}
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 6:prompt:ChatPromptTemplate] [1ms] Exiting Prompt run with output:
[0m[outputs]
[32;1m[1;3m[llm/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 7:llm:ChatOpenAI] Entering LLM run with input:
[0m{
  "prompts": [
    "System: You are a helpful assistant.\nHuman: Who directed the 2023 film Oppenheimer and what is their age in days?"
  ]
}
[36;1m[1;3m[llm/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 7:llm:ChatOpenAI] [3.17s] Exiting LLM run with output:
[0m{
  "generations": [
    [
      {
        "text": "",
        "generation_info": {
          "finish_reason": "tool_calls"
        },
        "type": "ChatGenerationChunk",
        "message": {
          "lc": 1,
          "type": "constructor",
          "id": [
            "langchain",
            "schema",
            "messages",
            "AIMessageChunk"
          ],
          "kwargs": {
            "content": "",
            "example": false,
            "additional_kwargs": {
              "tool_calls": [
                {
                  "index": 0,
                  "id": "call_fnfq6GjSQED4iF6lo4rxkUup",
                  "function": {
                    "arguments": "{\"query\": \"director of the 2023 film Oppenheimer\"}",
                    "name": "tavily_search_results_json"
                  },
                  "type": "function"
                },
                {
                  "index": 1,
                  "id": "call_mwhVi6pk49f4OIo5rOWrr4TD",
                  "function": {
                    "arguments": "{\"query\": \"birth date of Christopher Nolan\"}",
                    "name": "tavily_search_results_json"
                  },
                  "type": "function"
                }
              ]
            },
            "tool_call_chunks": [
              {
                "name": "tavily_search_results_json",
                "args": "{\"query\": \"director of the 2023 film Oppenheimer\"}",
                "id": "call_fnfq6GjSQED4iF6lo4rxkUup",
                "index": 0
              },
              {
                "name": "tavily_search_results_json",
                "args": "{\"query\": \"birth date of Christopher Nolan\"}",
                "id": "call_mwhVi6pk49f4OIo5rOWrr4TD",
                "index": 1
              }
            ],
            "response_metadata": {
              "finish_reason": "tool_calls"
            },
            "id": "run-6e160323-15f9-491d-aadf-b5d337e9e2a1",
            "tool_calls": [
              {
                "name": "tavily_search_results_json",
                "args": {
                  "query": "director of the 2023 film Oppenheimer"
                },
                "id": "call_fnfq6GjSQED4iF6lo4rxkUup"
              },
              {
                "name": "tavily_search_results_json",
                "args": {
                  "query": "birth date of Christopher Nolan"
                },
                "id": "call_mwhVi6pk49f4OIo5rOWrr4TD"
              }
            ],
            "invalid_tool_calls": []
          }
        }
      }
    ]
  ],
  "llm_output": null,
  "run": null
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 8:parser:ToolsAgentOutputParser] Entering Parser run with input:
[0m[inputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence > 8:parser:ToolsAgentOutputParser] [1ms] Exiting Parser run with output:
[0m[outputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 2:chain:RunnableSequence] [3.18s] Exiting Chain run with output:
[0m[outputs]
[32;1m[1;3m[tool/start][0m [1m[1:chain:AgentExecutor > 9:tool:tavily_search_results_json] Entering Tool run with input:
[0m"{'query': 'director of the 2023 film Oppenheimer'}"
``````output
Error in ConsoleCallbackHandler.on_tool_end callback: AttributeError("'list' object has no attribute 'strip'")
``````output
[32;1m[1;3m[tool/start][0m [1m[1:chain:AgentExecutor > 10:tool:tavily_search_results_json] Entering Tool run with input:
[0m"{'query': 'birth date of Christopher Nolan'}"
``````output
Error in ConsoleCallbackHandler.on_tool_end callback: AttributeError("'list' object has no attribute 'strip'")
``````output
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad>] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad> > 13:chain:RunnableParallel<agent_scratchpad>] Entering Chain run with input:
[0m{
  "input": ""
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad> > 13:chain:RunnableParallel<agent_scratchpad> > 14:chain:RunnableLambda] Entering Chain run with input:
[0m{
  "input": ""
}
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad> > 13:chain:RunnableParallel<agent_scratchpad> > 14:chain:RunnableLambda] [1ms] Exiting Chain run with output:
[0m[outputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad> > 13:chain:RunnableParallel<agent_scratchpad>] [4ms] Exiting Chain run with output:
[0m[outputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 12:chain:RunnableAssign<agent_scratchpad>] [8ms] Exiting Chain run with output:
[0m[outputs]
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 15:prompt:ChatPromptTemplate] Entering Prompt run with input:
[0m[inputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 15:prompt:ChatPromptTemplate] [1ms] Exiting Prompt run with output:
[0m[outputs]
[32;1m[1;3m[llm/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 16:llm:ChatOpenAI] Entering LLM run with input:
[0m{
  "prompts": [
    "System: You are a helpful assistant.\nHuman: Who directed the 2023 film Oppenheimer and what is their age in days?\nAI: \nTool: [{\"url\": \"https://m.imdb.com/title/tt15398776/fullcredits/\", \"content\": \"Oppenheimer (2023) cast and crew credits, including actors, actresses, directors, writers and more. Menu. ... director of photography: behind-the-scenes Jason Gary ... best boy grip ... film loader Luc Poullain ... aerial coordinator\"}]\nTool: [{\"url\": \"https://en.wikipedia.org/wiki/Christopher_Nolan\", \"content\": \"In early 2003, Nolan approached Warner Bros. with the idea of making a new Batman film, based on the character's origin story.[58] Nolan was fascinated by the notion of grounding it in a more realistic world than a comic-book fantasy.[59] He relied heavily on traditional stunts and miniature effects during filming, with minimal use of computer-generated imagery (CGI).[60] Batman Begins (2005), the biggest project Nolan had undertaken to that point,[61] was released to critical acclaim and commercial success.[62][63] Starring Christian Bale as Bruce Wayne / Batman—along with Michael Caine, Gary Oldman, Morgan Freeman and Liam Neeson—Batman Begins revived the franchise.[64][65] Batman Begins was 2005's ninth-highest-grossing film and was praised for its psychological depth and contemporary relevance;[63][66] it is cited as one of the most influential films of the 2000s.[67] Film author Ian Nathan wrote that within five years of his career, Nolan \\\"[went] from unknown to indie darling to gaining creative control over one of the biggest properties in Hollywood, and (perhaps unwittingly) fomenting the genre that would redefine the entire industry\\\".[68]\\nNolan directed, co-wrote and produced The Prestige (2006), an adaptation of the Christopher Priest novel about two rival 19th-century magicians.[69] He directed, wrote and edited the short film Larceny (1996),[19] which was filmed over a weekend in black and white with limited equipment and a small cast and crew.[12][20] Funded by Nolan and shot with the UCL Union Film society's equipment, it appeared at the Cambridge Film Festival in 1996 and is considered one of UCL's best shorts.[21] For unknown reasons, the film has since been removed from public view.[19] Nolan filmed a third short, Doodlebug (1997), about a man seemingly chasing an insect with his shoe, only to discover that it is a miniature of himself.[14][22] Nolan and Thomas first attempted to make a feature in the mid-1990s with Larry Mahoney, which they scrapped.[23] During this period in his career, Nolan had little to no success getting his projects off the ground, facing several rejections; he added, \\\"[T]here's a very limited pool of finance in the UK. Philosophy professor David Kyle Johnson wrote that \\\"Inception became a classic almost as soon as it was projected on silver screens\\\", praising its exploration of philosophical ideas, including leap of faith and allegory of the cave.[97] The film grossed over $836 million worldwide.[98] Nominated for eight Academy Awards—including Best Picture and Best Original Screenplay—it won Best Cinematography, Best Sound Mixing, Best Sound Editing and Best Visual Effects.[99] Nolan was nominated for a BAFTA Award and a Golden Globe Award for Best Director, among other accolades.[40]\\nAround the release of The Dark Knight Rises (2012), Nolan's third and final Batman film, Joseph Bevan of the British Film Institute wrote a profile on him: \\\"In the space of just over a decade, Christopher Nolan has shot from promising British indie director to undisputed master of a new brand of intelligent escapism. He further wrote that Nolan's body of work reflect \\\"a heterogeneity of conditions of products\\\" extending from low-budget films to lucrative blockbusters, \\\"a wide range of genres and settings\\\" and \\\"a diversity of styles that trumpet his versatility\\\".[193]\\nDavid Bordwell, a film theorist, wrote that Nolan has been able to blend his \\\"experimental impulses\\\" with the demands of mainstream entertainment, describing his oeuvre as \\\"experiments with cinematic time by means of techniques of subjective viewpoint and crosscutting\\\".[194] Nolan's use of practical, in-camera effects, miniatures and models, as well as shooting on celluloid film, has been highly influential in early 21st century cinema.[195][196] IndieWire wrote in 2019 that, Nolan \\\"kept a viable alternate model of big-budget filmmaking alive\\\", in an era where blockbuster filmmaking has become \\\"a largely computer-generated art form\\\".[196] Initially reluctant to make a sequel, he agreed after Warner Bros. repeatedly insisted.[78] Nolan wanted to expand on the noir quality of the first film by broadening the canvas and taking on \\\"the dynamic of a story of the city, a large crime story ... where you're looking at the police, the justice system, the vigilante, the poor people, the rich people, the criminals\\\".[79] Continuing to minimalise the use of CGI, Nolan employed high-resolution IMAX cameras, making it the first major motion picture to use this technology.[80][81]\"}]"
  ]
}
[36;1m[1;3m[llm/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 16:llm:ChatOpenAI] [20.22s] Exiting LLM run with output:
[0m{
  "generations": [
    [
      {
        "text": "The 2023 film \"Oppenheimer\" was directed by Christopher Nolan.\n\nTo calculate Christopher Nolan's age in days, we first need his birth date, which is July 30, 1970. Let's calculate his age in days from his birth date to today's date, December 7, 2023.\n\n1. Calculate the total number of days from July 30, 1970, to December 7, 2023.\n2. Christopher Nolan was born on July 30, 1970. From July 30, 1970, to July 30, 2023, is 53 years.\n3. From July 30, 2023, to December 7, 2023, is 130 days.\n\nNow, calculate the total days for 53 years:\n- Each year has 365 days, so 53 years × 365 days/year = 19,345 days.\n- Adding the leap years from 1970 to 2023: 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, and 2024 (up to February). This gives us 14 leap years.\n- Total days from leap years: 14 days.\n\nAdding all together:\n- Total days = 19,345 days (from years) + 14 days (from leap years) + 130 days (from July 30, 2023, to December 7, 2023) = 19,489 days.\n\nTherefore, as of December 7, 2023, Christopher Nolan is 19,489 days old.",
        "generation_info": {
          "finish_reason": "stop"
        },
        "type": "ChatGenerationChunk",
        "message": {
          "lc": 1,
          "type": "constructor",
          "id": [
            "langchain",
            "schema",
            "messages",
            "AIMessageChunk"
          ],
          "kwargs": {
            "content": "The 2023 film \"Oppenheimer\" was directed by Christopher Nolan.\n\nTo calculate Christopher Nolan's age in days, we first need his birth date, which is July 30, 1970. Let's calculate his age in days from his birth date to today's date, December 7, 2023.\n\n1. Calculate the total number of days from July 30, 1970, to December 7, 2023.\n2. Christopher Nolan was born on July 30, 1970. From July 30, 1970, to July 30, 2023, is 53 years.\n3. From July 30, 2023, to December 7, 2023, is 130 days.\n\nNow, calculate the total days for 53 years:\n- Each year has 365 days, so 53 years × 365 days/year = 19,345 days.\n- Adding the leap years from 1970 to 2023: 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, and 2024 (up to February). This gives us 14 leap years.\n- Total days from leap years: 14 days.\n\nAdding all together:\n- Total days = 19,345 days (from years) + 14 days (from leap years) + 130 days (from July 30, 2023, to December 7, 2023) = 19,489 days.\n\nTherefore, as of December 7, 2023, Christopher Nolan is 19,489 days old.",
            "example": false,
            "additional_kwargs": {},
            "tool_call_chunks": [],
            "response_metadata": {
              "finish_reason": "stop"
            },
            "id": "run-1c08a44f-db70-4836-935b-417caaf422a5",
            "tool_calls": [],
            "invalid_tool_calls": []
          }
        }
      }
    ]
  ],
  "llm_output": null,
  "run": null
}
[32;1m[1;3m[chain/start][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 17:parser:ToolsAgentOutputParser] Entering Parser run with input:
[0m[inputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence > 17:parser:ToolsAgentOutputParser] [2ms] Exiting Parser run with output:
[0m[outputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor > 11:chain:RunnableSequence] [20.27s] Exiting Chain run with output:
[0m[outputs]
[36;1m[1;3m[chain/end][0m [1m[1:chain:AgentExecutor] [26.37s] Exiting Chain run with output:
[0m{
  "output": "The 2023 film \"Oppenheimer\" was directed by Christopher Nolan.\n\nTo calculate Christopher Nolan's age in days, we first need his birth date, which is July 30, 1970. Let's calculate his age in days from his birth date to today's date, December 7, 2023.\n\n1. Calculate the total number of days from July 30, 1970, to December 7, 2023.\n2. Christopher Nolan was born on July 30, 1970. From July 30, 1970, to July 30, 2023, is 53 years.\n3. From July 30, 2023, to December 7, 2023, is 130 days.\n\nNow, calculate the total days for 53 years:\n- Each year has 365 days, so 53 years × 365 days/year = 19,345 days.\n- Adding the leap years from 1970 to 2023: 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, and 2024 (up to February). This gives us 14 leap years.\n- Total days from leap years: 14 days.\n\nAdding all together:\n- Total days = 19,345 days (from years) + 14 days (from leap years) + 130 days (from July 30, 2023, to December 7, 2023) = 19,489 days.\n\nTherefore, as of December 7, 2023, Christopher Nolan is 19,489 days old."
}
```


```output
{'input': 'Who directed the 2023 film Oppenheimer and what is their age in days?',
 'output': 'The 2023 film "Oppenheimer" was directed by Christopher Nolan.\n\nTo calculate Christopher Nolan\'s age in days, we first need his birth date, which is July 30, 1970. Let\'s calculate his age in days from his birth date to today\'s date, December 7, 2023.\n\n1. Calculate the total number of days from July 30, 1970, to December 7, 2023.\n2. Christopher Nolan was born on July 30, 1970. From July 30, 1970, to July 30, 2023, is 53 years.\n3. From July 30, 2023, to December 7, 2023, is 130 days.\n\nNow, calculate the total days for 53 years:\n- Each year has 365 days, so 53 years × 365 days/year = 19,345 days.\n- Adding the leap years from 1970 to 2023: 1972, 1976, 1980, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016, 2020, and 2024 (up to February). This gives us 14 leap years.\n- Total days from leap years: 14 days.\n\nAdding all together:\n- Total days = 19,345 days (from years) + 14 days (from leap years) + 130 days (from July 30, 2023, to December 7, 2023) = 19,489 days.\n\nTherefore, as of December 7, 2023, Christopher Nolan is 19,489 days old.'}
```

