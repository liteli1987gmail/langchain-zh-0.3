---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_few_shot.ipynb
---
# 如何使用少量示例提示与工具调用

对于更复杂的工具使用，向提示中添加少量示例非常有用。我们可以通过向提示中添加带有 `ToolCall` 的 `AIMessage` 和相应的 `ToolMessage` 来实现。

首先，让我们定义我们的工具和模型。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to use few-shot prompting with tool calling"}]-->
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b."""
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b."""
    return a * b


tools = [add, multiply]
```


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use few-shot prompting with tool calling"}]-->
import os
from getpass import getpass

from langchain_openai import ChatOpenAI

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)
```

让我们运行我们的模型，我们可以注意到即使有一些特殊指令，我们的模型也可能因为运算顺序而出错。


```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'Multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_T88XN6ECucTgbXXkyDeC2CQj'},
 {'name': 'Add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_licdlmGsRqzup8rhqJSb1yZ4'}]
```

模型现在不应该尝试添加任何内容，因为它在技术上还无法知道119 * 8的结果。

通过添加一个带有一些示例的提示，我们可以纠正这种行为：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to use few-shot prompting with tool calling"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to use few-shot prompting with tool calling"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to use few-shot prompting with tool calling"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use few-shot prompting with tool calling"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to use few-shot prompting with tool calling"}]-->
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "Multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "Add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator. 

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'Multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_9MvuwQqg7dlJupJcoTWiEsDo'}]
```

这次我们得到了正确的输出。

这是[LangSmith跟踪](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r)的样子。
