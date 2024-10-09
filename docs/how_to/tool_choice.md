---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_choice.ipynb
---
# 如何强制模型调用工具

:::info Prerequisites

本指南假设您对以下概念有所了解：
- [聊天模型](/docs/concepts/#chat-models)
- [LangChain 工具](/docs/concepts/#tools)
- [如何使用模型调用工具](/docs/how_to/tool_calling)
:::

为了强制我们的 LLM 选择特定工具，我们可以使用 `tool_choice` 参数来确保某种行为。首先，让我们定义我们的模型和工具：


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to force models to call a tool"}]-->
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

例如，我们可以通过使用以下代码强制我们的工具调用乘法工具：


```python
llm_forced_to_multiply = llm.bind_tools(tools, tool_choice="Multiply")
llm_forced_to_multiply.invoke("what is 2 + 4")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_9cViskmLvPnHjXk9tbVla5HA', 'function': {'arguments': '{"a":2,"b":4}', 'name': 'Multiply'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 9, 'prompt_tokens': 103, 'total_tokens': 112}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-095b827e-2bdd-43bb-8897-c843f4504883-0', tool_calls=[{'name': 'Multiply', 'args': {'a': 2, 'b': 4}, 'id': 'call_9cViskmLvPnHjXk9tbVla5HA'}], usage_metadata={'input_tokens': 103, 'output_tokens': 9, 'total_tokens': 112})
```

即使我们传递给它的内容不需要乘法 - 它仍然会调用该工具！

我们还可以通过将“any”（或“required”，这是OpenAI特定的）关键字传递给`tool_choice`参数，强制我们的工具选择至少一个工具。


```python
llm_forced_to_use_tool = llm.bind_tools(tools, tool_choice="any")
llm_forced_to_use_tool.invoke("What day is today?")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_mCSiJntCwHJUBfaHZVUB2D8W', 'function': {'arguments': '{"a":1,"b":2}', 'name': 'Add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 94, 'total_tokens': 109}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-28f75260-9900-4bed-8cd3-f1579abb65e5-0', tool_calls=[{'name': 'Add', 'args': {'a': 1, 'b': 2}, 'id': 'call_mCSiJntCwHJUBfaHZVUB2D8W'}], usage_metadata={'input_tokens': 94, 'output_tokens': 15, 'total_tokens': 109})
```
