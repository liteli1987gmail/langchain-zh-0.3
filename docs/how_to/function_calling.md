---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/function_calling.ipynb
sidebar_position: 2
---
# 如何进行工具/函数调用

:::info
我们将工具调用与函数调用交替使用。虽然
函数调用有时指的是对单个函数的调用，
但我们将所有模型视为可以在
每个消息中返回多个工具或函数调用。
:::

工具调用允许模型通过生成与用户定义的模式相匹配的输出来响应给定的提示。
虽然这个名称暗示模型正在执行某些操作，但实际上并非如此！模型正在生成
工具的参数，实际运行工具（或不运行）取决于用户 -
工具的参数，实际运行工具（或不运行）由用户决定 -
例如，如果您想要 [提取匹配某些模式的输出](/docs/tutorials/extraction)
从非结构化文本中，您可以给模型一个“提取”工具，该工具接受
与所需模式匹配的参数，然后将生成的输出视为您的最终
结果。

工具调用包括一个名称、参数字典和一个可选的标识符。该
参数字典的结构为``。

许多大型语言模型提供商，包括[Anthropic](https://www.anthropic.com/)，
[Cohere](https://cohere.com/)，[Google](https://cloud.google.com/vertex-ai)，
[Mistral](https://mistral.ai/)，[OpenAI](https://openai.com/)，以及其他
支持工具调用功能的变体。这些功能通常允许请求
包含可用工具及其模式，并且响应中包含
对这些工具的调用。例如，给定一个搜索引擎工具，一个大型语言模型可能会处理一个
查询，首先发出对搜索引擎的调用。调用大型语言模型的系统可以
接收工具调用，执行它，并将输出返回给大型语言模型以通知其
响应。LangChain 包含一套 [内置工具](/docs/integrations/tools/)
并支持几种定义您自己的 [自定义工具](/docs/how_to/custom_tools) 的方法。
调用工具对于构建 [使用工具的链和代理](/docs/how_to#tools) 非常有用，
并且更一般地从模型获取结构化输出。

大模型供应商采用不同的约定来格式化工具架构和工具调用。
例如，Anthropic 将工具调用作为解析结构返回，位于更大的内容块中：
```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```
而OpenAI将工具调用分离为一个独立的参数，参数以JSON字符串形式表示：
```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```
LangChain实现了定义工具的标准接口，将其传递给大型语言模型（LLMs），
并表示工具调用。

## 将工具传递给大型语言模型（LLMs）

支持工具调用功能的聊天模型实现了一个`.bind_tools`方法，该方法
接收一个LangChain [工具对象](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool)的列表
并将它们绑定到聊天模型的预期格式中。后续对聊天模型的调用将包括工具模式在其对大型语言模型（LLMs）的调用中。
聊天模型将在其对大型语言模型的调用中包含工具模式。

例如，我们可以使用`@tool`装饰器定义自定义工具的模式
在Python函数上：


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to do tool/function calling"}]-->
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

或者，我们使用 Pydantic 定义模式：



```python
from pydantic import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class Add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class Multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [Add, Multiply]
```

我们可以将它们绑定到聊天模型，如下所示：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

我们可以使用 `bind_tools()` 方法来处理转换
`Multiply` 到一个“工具”并将其绑定到模型（即，
每次调用模型时传入它）。


```python
llm_with_tools = llm.bind_tools(tools)
```

## 工具调用

如果工具调用包含在 LLM 响应中，它们将附加到相应的
[消息](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage)
或 [消息块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
作为一个 [工具调用](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall) 的列表
对象在 `.tool_calls` 属性中。`ToolCall` 是一个类型字典，包含一个
工具名称、参数值的字典，以及（可选）一个标识符。没有工具调用的消息
默认为此属性的空列表。

示例：


```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```



```output
[{'name': 'Multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_1Tdp5wUXbYQzpkBoagGXqUTo'},
 {'name': 'Add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_k9v09vYioS3X0Qg35zESuUKI'}]
```


`.tool_calls` 属性应包含有效的工具调用。请注意，有时，
大模型供应商可能会输出格式错误的工具调用（例如，参数不是
有效的 JSON）。在这些情况下解析失败时，实例
无效工具调用的 [InvalidToolCall](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall)
会填充在 `.invalid_tool_calls` 属性中。一个 `InvalidToolCall` 可以包含
名称、字符串参数、标识符和错误消息。

如果需要，[输出解析器](/docs/how_to#output-parsers) 可以进一步
处理输出。例如，我们可以转换回原始的 Pydantic 类：


```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to do tool/function calling"}]-->
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[Multiply, Add])
chain.invoke(query)
```



```output
[Multiply(a=3, b=12), Add(a=11, b=49)]
```


### 流式处理

当工具在流式上下文中被调用时，
[消息块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
将通过 `.tool_call_chunks` 属性填充包含 [工具调用块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk)
对象的列表。一个 `ToolCallChunk` 包含
工具的可选字符串字段 `name`、`args` 和 `id`，并包括一个可选的
整数字段 `index`，可用于将块连接在一起。字段是可选的
因为工具调用的部分可能会跨不同的块进行流式处理（例如，一个块
包含参数的子字符串可能对工具名称和ID具有空值）。

因为消息块继承自其父消息类，一个
[AIMessageChunk](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
带有工具调用块的也将包括 `.tool_calls` 和 `.invalid_tool_calls` 字段。
这些字段是从消息的工具调用块中尽力解析的。

请注意，并非所有大模型供应商当前都支持工具调用的流式处理。

示例：


```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```
```output
[]
[{'name': 'Multiply', 'args': '', 'id': 'call_d39MsxKM5cmeGJOoYKdGBgzc', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'Add', 'args': '', 'id': 'call_QJpdxD9AehKbdXzMHxgDMMhs', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```
请注意，添加消息块将合并其对应的工具调用块。这是LangChain的各种[工具输出解析器](/docs/how_to/output_parser_structured)支持流式处理的原则。

例如，下面我们累积工具调用块：


```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```
```output
[]
[{'name': 'Multiply', 'args': '', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a"', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, ', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '{"a"', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '{"a": 11,', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": ', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": 49}', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_erKtz8z3e681cmxYKbRof0NS', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": 49}', 'id': 'call_tYHYdEV2YBvzDcSCiFCExNvw', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```
```output
<class 'str'>
```
下面我们累积工具调用以演示部分解析：


```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```
```output
[]
[]
[{'name': 'Multiply', 'args': {}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}]
[{'name': 'Multiply', 'args': {'a': 3}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}, {'name': 'Add', 'args': {}, 'id': 'call_UjSHJKROSAw2BDc8cp9cSv4i'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}, {'name': 'Add', 'args': {'a': 11}, 'id': 'call_UjSHJKROSAw2BDc8cp9cSv4i'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}, {'name': 'Add', 'args': {'a': 11}, 'id': 'call_UjSHJKROSAw2BDc8cp9cSv4i'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}, {'name': 'Add', 'args': {'a': 11, 'b': 49}, 'id': 'call_UjSHJKROSAw2BDc8cp9cSv4i'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_BXqUtt6jYCwR1DguqpS2ehP0'}, {'name': 'Add', 'args': {'a': 11, 'b': 49}, 'id': 'call_UjSHJKROSAw2BDc8cp9cSv4i'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```
```output
<class 'dict'>
```
## 将工具输出传递给模型

如果我们使用模型生成的工具调用来实际调用工具，并希望将工具结果传回模型，我们可以使用`ToolMessage`来实现。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to do tool/function calling"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to do tool/function calling"}]-->
from langchain_core.messages import HumanMessage, ToolMessage

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)
for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))
messages
```



```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_K5DsWEmgt6D08EI9AFu9NaL1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'Multiply'}, 'type': 'function'}, {'id': 'call_qywVrsplg0ZMv7LHYYMjyG81', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'Add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 105, 'total_tokens': 155}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-1a0b8cdd-9221-4d94-b2ed-5701f67ce9fe-0', tool_calls=[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_K5DsWEmgt6D08EI9AFu9NaL1'}, {'name': 'Add', 'args': {'a': 11, 'b': 49}, 'id': 'call_qywVrsplg0ZMv7LHYYMjyG81'}]),
 ToolMessage(content='36', tool_call_id='call_K5DsWEmgt6D08EI9AFu9NaL1'),
 ToolMessage(content='60', tool_call_id='call_qywVrsplg0ZMv7LHYYMjyG81')]
```



```python
llm_with_tools.invoke(messages)
```



```output
AIMessage(content='3 * 12 is 36 and 11 + 49 is 60.', response_metadata={'token_usage': {'completion_tokens': 18, 'prompt_tokens': 171, 'total_tokens': 189}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-a6c8093c-b16a-4c92-8308-7c9ac998118c-0')
```


## 少量示例提示

对于更复杂的工具使用，向提示中添加少量示例非常有用。我们可以通过添加带有`ToolCall`和相应`ToolMessage`的`AIMessage`来实现。

例如，即使有一些特殊指令，我们的模型也可能因运算顺序而出错：


```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```



```output
[{'name': 'Multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_Dl3FXRVkQCFW4sUNYOe4rFr7'},
 {'name': 'Add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_n03l4hmka7VZTCiP387Wud2C'}]
```


模型不应该尝试添加任何内容，因为它在技术上还无法知道119 * 8的结果。

通过添加带有一些示例的提示，我们可以纠正这种行为：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to do tool/function calling"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to do tool/function calling"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to do tool/function calling"}]-->
from langchain_core.messages import AIMessage
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
  'id': 'call_MoSgwzIhPxhclfygkYaKIsGZ'}]
```


这次我们似乎得到了正确的输出。

这是[LangSmith跟踪](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r)的样子。

## 下一步

- **输出解析**: 查看[OpenAI工具输出
解析器](/docs/how_to/output_parser_structured)
以了解如何将函数调用API响应提取为
各种格式。
- **结构化输出链**: [某些模型具有构造函数](/docs/how_to/structured_output)，
可以为您处理创建结构化输出链。
- **工具使用**: 查看如何构建链和代理。
调用[这些工具](/docs/how_to#tools)。
指南。
