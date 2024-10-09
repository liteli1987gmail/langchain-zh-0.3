---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/multi_prompt_chain.ipynb
---
# 从 MultiPromptChain 迁移

[`MultiPromptChain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.router.multi_prompt.MultiPromptChain.html) 将输入查询路由到多个 LLMChains 之一——也就是说，给定一个输入查询，它使用 LLM 从提示列表中选择，格式化查询为提示，并生成响应。

`MultiPromptChain` 不支持常见的 [聊天模型](/docs/concepts/#chat-models) 特性，例如消息角色和 [工具调用](/docs/concepts/#functiontool-calling)。

一个 [LangGraph](https://langchain-ai.github.io/langgraph/) 实现为这个问题带来了许多优势：

- 支持聊天提示模板，包括带有 `system` 和其他角色的消息；
- 支持在路由步骤中使用工具调用；
- 支持单个步骤和输出标记的流式处理。

现在让我们并排查看它们。请注意，对于本指南，我们将使用 `langchain-openai >= 0.1.20`


```python
%pip install -qU langchain-core langchain-openai
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
<!--IMPORTS:[{"imported": "MultiPromptChain", "source": "langchain.chains.router.multi_prompt", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.router.multi_prompt.MultiPromptChain.html", "title": "Migrating from MultiPromptChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from MultiPromptChain"}]-->
from langchain.chains.router.multi_prompt import MultiPromptChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

prompt_1_template = """
You are an expert on animals. Please answer the below query:

{input}
"""

prompt_2_template = """
You are an expert on vegetables. Please answer the below query:

{input}
"""

prompt_infos = [
    {
        "name": "animals",
        "description": "prompt for an animal expert",
        "prompt_template": prompt_1_template,
    },
    {
        "name": "vegetables",
        "description": "prompt for a vegetable expert",
        "prompt_template": prompt_2_template,
    },
]

chain = MultiPromptChain.from_prompts(llm, prompt_infos)
```


```python
chain.invoke({"input": "What color are carrots?"})
```



```output
{'input': 'What color are carrots?',
 'text': 'Carrots are most commonly orange, but they can also be found in a variety of other colors including purple, yellow, white, and red. The orange variety is the most popular and widely recognized.'}
```


在 [LangSmith trace](https://smith.langchain.com/public/e935238b-0b63-4984-abc8-873b2170a32d/r) 中，我们可以看到这个过程的两个步骤，包括路由查询的提示词和最终选择的提示词。

</details>

## LangGraph

<details open>


```python
pip install -qU langgraph
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from MultiPromptChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from MultiPromptChain"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "Migrating from MultiPromptChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from MultiPromptChain"}]-->
from operator import itemgetter
from typing import Literal

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

llm = ChatOpenAI(model="gpt-4o-mini")

# Define the prompts we will route to
prompt_1 = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an expert on animals."),
        ("human", "{input}"),
    ]
)
prompt_2 = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an expert on vegetables."),
        ("human", "{input}"),
    ]
)

# Construct the chains we will route to. These format the input query
# into the respective prompt, run it through a chat model, and cast
# the result to a string.
chain_1 = prompt_1 | llm | StrOutputParser()
chain_2 = prompt_2 | llm | StrOutputParser()


# Next: define the chain that selects which branch to route to.
# Here we will take advantage of tool-calling features to force
# the output to select one of two desired branches.
route_system = "Route the user's query to either the animal or vegetable expert."
route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", route_system),
        ("human", "{input}"),
    ]
)


# Define schema for output:
class RouteQuery(TypedDict):
    """Route query to destination expert."""

    destination: Literal["animal", "vegetable"]


route_chain = route_prompt | llm.with_structured_output(RouteQuery)


# For LangGraph, we will define the state of the graph to hold the query,
# destination, and final answer.
class State(TypedDict):
    query: str
    destination: RouteQuery
    answer: str


# We define functions for each node, including routing the query:
async def route_query(state: State, config: RunnableConfig):
    destination = await route_chain.ainvoke(state["query"], config)
    return {"destination": destination}


# And one node for each prompt
async def prompt_1(state: State, config: RunnableConfig):
    return {"answer": await chain_1.ainvoke(state["query"], config)}


async def prompt_2(state: State, config: RunnableConfig):
    return {"answer": await chain_2.ainvoke(state["query"], config)}


# We then define logic that selects the prompt based on the classification
def select_node(state: State) -> Literal["prompt_1", "prompt_2"]:
    if state["destination"] == "animal":
        return "prompt_1"
    else:
        return "prompt_2"


# Finally, assemble the multi-prompt chain. This is a sequence of two steps:
# 1) Select "animal" or "vegetable" via the route_chain, and collect the answer
# alongside the input query.
# 2) Route the input query to chain_1 or chain_2, based on the
# selection.
graph = StateGraph(State)
graph.add_node("route_query", route_query)
graph.add_node("prompt_1", prompt_1)
graph.add_node("prompt_2", prompt_2)

graph.add_edge(START, "route_query")
graph.add_conditional_edges("route_query", select_node)
graph.add_edge("prompt_1", END)
graph.add_edge("prompt_2", END)
app = graph.compile()
```


```python
from IPython.display import Image

Image(app.get_graph().draw_mermaid_png())
```



![](data:image/jpg;base64,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)


我们可以如下调用链：


```python
state = await app.ainvoke({"query": "what color are carrots"})
print(state["destination"])
print(state["answer"])
```
```output
{'destination': 'vegetable'}
Carrots are most commonly orange, but they can also come in a variety of other colors, including purple, red, yellow, and white. The different colors often indicate varying flavors and nutritional profiles. For example, purple carrots contain anthocyanins, while orange carrots are rich in beta-carotene, which is converted to vitamin A in the body.
```
在 [LangSmith trace](https://smith.langchain.com/public/1017a9d2-2d2a-4954-a5fd-5689632b4c5f/r) 中，我们可以看到路由查询的工具调用和用于生成答案的选择提示词。

</details>

## 概述：

- 在底层，`MultiPromptChain` 通过指示大型语言模型生成 JSON 格式的文本来路由查询，并解析出预期的目标。它以字符串提示词模板的注册表作为输入。
- 上述的 LangGraph 实现通过低级原语实现，使用工具调用来路由到任意链。在这个例子中，链包括聊天模型模板和聊天模型。

## 下一步

请参见 [这个教程](/docs/tutorials/llm_chain) 以获取有关使用提示词模板、大型语言模型和输出解析器的更多详细信息。

查看[LangGraph文档](https://langchain-ai.github.io/langgraph/)以获取有关使用LangGraph构建的详细信息。
