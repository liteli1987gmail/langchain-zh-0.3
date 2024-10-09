---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_streaming.ipynb
---
# 如何流式调用工具

当在流式上下文中调用工具时，
[消息块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
将通过 `.tool_call_chunks` 属性填充为 [工具调用块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk) 的对象列表。一个 `ToolCallChunk` 包含
工具 `name`、`args` 和 `id` 的可选字符串字段，并包含一个可选的
整数字段 `index`，可用于将块连接在一起。字段是可选的
因为工具调用的部分内容可能会跨不同的块进行流式传输（例如，一个包含参数子字符串的块可能对工具名称和 id 的值为 null）。
因为消息块继承自其父消息类，一个
这包括参数的子字符串，工具名称和ID可能为空值。

因为消息块继承自其父消息类，
[AIMessageChunk](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
工具调用的块还将包括 `.tool_calls` 和 `.invalid_tool_calls` 字段。
这些字段是从消息的工具调用块中尽力解析的。

请注意，并非所有大模型供应商目前都支持工具调用的流式处理。在我们开始之前，让我们定义我们的工具和模型。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to stream tool calls"}]-->
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
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to stream tool calls"}]-->
import os
from getpass import getpass

from langchain_openai import ChatOpenAI

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)
```

现在让我们定义查询并流式输出：


```python
query = "What is 3 * 12? Also, what is 11 + 49?"

async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```
```output
[]
[{'name': 'Multiply', 'args': '', 'id': 'call_3aQwTP9CYlFxwOvQZPHDu6wL', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'Add', 'args': '', 'id': 'call_SQUoSsJz2p9Kx2x73GOgN1ja', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```
请注意，添加消息块将合并其对应的工具调用块。这是LangChain的各种[工具输出解析器](/docs/how_to/output_parser_structured)支持流式处理的原理。

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
[{'name': 'Multiply', 'args': '', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a"', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, ', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '{"a"', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '{"a": 11,', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": ', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": 49}', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
[{'name': 'Multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_AkL3dVeCjjiqvjv8ckLxL3gP', 'index': 0}, {'name': 'Add', 'args': '{"a": 11, "b": 49}', 'id': 'call_b4iMiB3chGNGqbt5SjqqD2Wh', 'index': 1}]
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
[{'name': 'Multiply', 'args': {}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}]
[{'name': 'Multiply', 'args': {'a': 3}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}, {'name': 'Add', 'args': {}, 'id': 'call_54Hx3DGjZitFlEjgMe1DYonh'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}, {'name': 'Add', 'args': {'a': 11}, 'id': 'call_54Hx3DGjZitFlEjgMe1DYonh'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}, {'name': 'Add', 'args': {'a': 11}, 'id': 'call_54Hx3DGjZitFlEjgMe1DYonh'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}, {'name': 'Add', 'args': {'a': 11, 'b': 49}, 'id': 'call_54Hx3DGjZitFlEjgMe1DYonh'}]
[{'name': 'Multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_4p0D4tHVXSiae9Mu0e8jlI1m'}, {'name': 'Add', 'args': {'a': 11, 'b': 49}, 'id': 'call_54Hx3DGjZitFlEjgMe1DYonh'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```
```output
<class 'dict'>
```