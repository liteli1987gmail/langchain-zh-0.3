---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/llm_math_chain.ipynb
---
# 从 LLMMathChain 迁移

[`LLMMathChain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm_math.base.LLMMathChain.html) 使得可以评估由大型语言模型生成的数学表达式。生成表达式的指令被格式化为提示词，并在使用 [numexpr](https://numexpr.readthedocs.io/en/latest/user_guide.html) 库进行评估之前，从字符串响应中解析出表达式。

这可以通过 [工具调用](/docs/concepts/#functiontool-calling) 更自然地实现。我们可以为聊天模型配备一个简单的计算器工具，利用 `numexpr` 并围绕它构建一个简单的链，使用 [LangGraph](https://langchain-ai.github.io/langgraph/)。这种方法的一些优点包括：

- 利用为此目的进行微调的聊天模型的工具调用能力；
- 减少从字符串 LLM 响应中提取表达式时的解析错误；
- 将指令委派给 [消息角色](/docs/concepts/#messages)（例如，聊天模型可以理解 `ToolMessage` 代表什么，而无需额外的提示）；
- 支持流式处理，包括单个标记和链步骤。


```python
%pip install --upgrade --quiet numexpr
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 传统

<details open>


```python
<!--IMPORTS:[{"imported": "LLMMathChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm_math.base.LLMMathChain.html", "title": "Migrating from LLMMathChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from LLMMathChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMMathChain"}]-->
from langchain.chains import LLMMathChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

chain = LLMMathChain.from_llm(llm)

chain.invoke("What is 551368 divided by 82?")
```



```output
{'question': 'What is 551368 divided by 82?', 'answer': 'Answer: 6724.0'}
```


</details>

## LangGraph

<details open>


```python
<!--IMPORTS:[{"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "Migrating from LLMMathChain"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "Migrating from LLMMathChain"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Migrating from LLMMathChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMMathChain"}]-->
import math
from typing import Annotated, Sequence

import numexpr
from langchain_core.messages import BaseMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt.tool_node import ToolNode
from typing_extensions import TypedDict


@tool
def calculator(expression: str) -> str:
    """Calculate expression using Python's numexpr library.

    Expression should be a single line mathematical expression
    that solves the problem.

    Examples:
        "37593 * 67" for "37593 times 67"
        "37593**(1/5)" for "37593^(1/5)"
    """
    local_dict = {"pi": math.pi, "e": math.e}
    return str(
        numexpr.evaluate(
            expression.strip(),
            global_dict={},  # restrict access to globals
            local_dict=local_dict,  # add common mathematical functions
        )
    )


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [calculator]
llm_with_tools = llm.bind_tools(tools, tool_choice="any")


class ChainState(TypedDict):
    """LangGraph state."""

    messages: Annotated[Sequence[BaseMessage], add_messages]


async def acall_chain(state: ChainState, config: RunnableConfig):
    last_message = state["messages"][-1]
    response = await llm_with_tools.ainvoke(state["messages"], config)
    return {"messages": [response]}


async def acall_model(state: ChainState, config: RunnableConfig):
    response = await llm.ainvoke(state["messages"], config)
    return {"messages": [response]}


graph_builder = StateGraph(ChainState)
graph_builder.add_node("call_tool", acall_chain)
graph_builder.add_node("execute_tool", ToolNode(tools))
graph_builder.add_node("call_model", acall_model)
graph_builder.set_entry_point("call_tool")
graph_builder.add_edge("call_tool", "execute_tool")
graph_builder.add_edge("execute_tool", "call_model")
graph_builder.add_edge("call_model", END)
chain = graph_builder.compile()
```


```python
# Visualize chain:

from IPython.display import Image

Image(chain.get_graph().draw_mermaid_png())
```



![](data:image/jpg;base64,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)



```python
# Stream chain steps:

example_query = "What is 551368 divided by 82"

events = chain.astream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
async for event in events:
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

What is 551368 divided by 82
==================================[1m Ai Message [0m==================================
Tool Calls:
  calculator (call_1ic3gjuII0Aq9vxlSYiwvjSb)
 Call ID: call_1ic3gjuII0Aq9vxlSYiwvjSb
  Args:
    expression: 551368 / 82
=================================[1m Tool Message [0m=================================
Name: calculator

6724.0
==================================[1m Ai Message [0m==================================

551368 divided by 82 equals 6724.
```
</details>

## 下一步

查看构建和使用工具的指南 [这里](/docs/how_to/#tools)。

查看 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) 以获取有关使用 LangGraph 构建的详细信息。
