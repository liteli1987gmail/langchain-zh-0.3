---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_calling.ipynb
keywords: [tool calling, tool call]
---
# 如何使用聊天模型调用工具

:::info Prerequisites

本指南假设您熟悉以下概念：

- [聊天模型](/docs/concepts/#chat-models)
- [工具调用](/docs/concepts/#functiontool-calling)
- [工具](/docs/concepts/#tools)
- [输出解析器](/docs/concepts/#output-parsers)
:::

[工具调用](/docs/concepts/#functiontool-calling) 允许聊天模型通过“调用工具”来响应给定的提示。

请记住，虽然“工具调用”这个名称暗示模型直接执行某些操作，但实际上并非如此！模型仅生成工具的参数，实际运行工具（或不运行）取决于用户。

工具调用是一种通用技术，可以从模型生成结构化输出，即使您不打算调用任何工具也可以使用它。一个示例用例是 [从非结构化文本中提取](/docs/tutorials/extraction/)。

![Diagram of calling a tool](/img/tool_call.png)

如果你想了解如何使用模型生成的工具调用来实际运行工具，请[查看此指南](/docs/how_to/tool_results_pass_to_model/)。

:::note Supported models

工具调用并不是通用的，但许多流行的LLM提供商支持它。你可以在这里找到[支持工具调用的所有模型列表](/docs/integrations/chat/)。

:::

LangChain实现了定义工具、将其传递给LLM以及表示工具调用的标准接口。
本指南将介绍如何将工具绑定到LLM，然后调用LLM生成这些参数。

## 定义工具模式

为了使模型能够调用工具，我们需要传入描述工具功能及其参数的工具模式。支持工具调用功能的聊天模型实现了一个`.bind_tools()`方法，用于将工具模式传递给模型。工具模式可以作为Python函数（带有类型提示和文档字符串）、Pydantic模型、TypedDict类或LangChain [工具对象](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool)传入。模型的后续调用将与提示一起传入这些工具模式。

### Python函数
我们的工具模式可以是Python函数：


```python
# The function name, type hints, and docstring are all part of the tool
# schema that's passed to the model. Defining good, descriptive schemas
# is an extension of prompt engineering and is an important part of
# getting models to perform well.
def add(a: int, b: int) -> int:
    """Add two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a + b


def multiply(a: int, b: int) -> int:
    """Multiply two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a * b
```

### LangChain 工具

LangChain 还实现了一个 `@tool` 装饰器，允许进一步控制工具模式，例如工具名称和参数描述。有关详细信息，请参阅 [这里](/docs/how_to/custom_tools/#creating-tools-from-functions) 的使用指南。

### Pydantic 类

您可以等效地使用 [Pydantic](https://docs.pydantic.dev) 定义没有附带函数的模式。

请注意，除非提供默认值，否则所有字段都是 `必需` 的。



```python
from pydantic import BaseModel, Field


class add(BaseModel):
    """Add two integers."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")
```

### TypedDict 类

:::info Requires `langchain-core>=0.2.25`
:::

或者使用 TypedDict 和注解：


```python
from typing_extensions import Annotated, TypedDict


class add(TypedDict):
    """Add two integers."""

    # Annotations must have the type and can optionally include a default value and description (in that order).
    a: Annotated[int, ..., "First integer"]
    b: Annotated[int, ..., "Second integer"]


class multiply(TypedDict):
    """Multiply two integers."""

    a: Annotated[int, ..., "First integer"]
    b: Annotated[int, ..., "Second integer"]


tools = [add, multiply]
```

要将这些模式实际绑定到聊天模型，我们将使用 `.bind_tools()` 方法。这将处理将
 `add` 和 `multiply` 模式转换为模型所需的格式。工具模式将在每次调用模型时传递。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>



```python
llm_with_tools = llm.bind_tools(tools)

query = "What is 3 * 12?"

llm_with_tools.invoke(query)
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_iXj4DiW1p7WLjTAQMRO0jxMs', 'function': {'arguments': '{"a":3,"b":12}', 'name': 'multiply'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 80, 'total_tokens': 97}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-0b620986-3f62-4df7-9ba3-4595089f9ad4-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_iXj4DiW1p7WLjTAQMRO0jxMs', 'type': 'tool_call'}], usage_metadata={'input_tokens': 80, 'output_tokens': 17, 'total_tokens': 97})
```


正如我们所看到的，我们的LLM生成了工具的参数！您可以查看[bind_tools()](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.BaseChatOpenAI.html#langchain_openai.chat_models.base.BaseChatOpenAI.bind_tools)的文档，了解自定义LLM选择工具的所有方法，以及[如何强制LLM调用工具的指南](/docs/how_to/tool_choice/)，而不是让它自行决定。

## 工具调用

如果工具调用包含在LLM响应中，它们将附加到相应的
[消息](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage)
或[消息块](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
作为[工具调用](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall)对象的列表，位于`.tool_calls`属性中。
请注意，聊天模型可以同时调用多个工具。

请注意，聊天模型可以同时调用多个工具。

一个 `ToolCall` 是一个包含
工具名称、参数值字典和（可选）标识符的类型字典。没有工具调用的消息
默认将此属性设置为空列表。


```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```



```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_1fyhJAbJHuKQe6n0PacubGsL',
  'type': 'tool_call'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_fc2jVkKzwuPWyU7kS9qn1hyG',
  'type': 'tool_call'}]
```


`.tool_calls` 属性应包含有效的工具调用。请注意，有时，
大模型供应商可能会输出格式错误的工具调用（例如，参数不是
有效的 JSON）。在这些情况下解析失败时，
[InvalidToolCall](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall) 的实例
会填充在 `.invalid_tool_calls` 属性中。一个 `InvalidToolCall` 可以具有
名称、字符串参数、标识符和错误消息。


## 解析

如果需要，[输出解析器](/docs/how_to#output-parsers)可以进一步处理输出。例如，我们可以使用将`.tool_calls`中填充的现有值转换为Pydantic对象的
[PydanticToolsParser](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html)：


```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to use chat models to call tools"}]-->
from langchain_core.output_parsers import PydanticToolsParser
from pydantic import BaseModel, Field


class add(BaseModel):
    """Add two integers."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


chain = llm_with_tools | PydanticToolsParser(tools=[add, multiply])
chain.invoke(query)
```



```output
[multiply(a=3, b=12), add(a=11, b=49)]
```


## 下一步

现在您已经学习了如何将工具模式绑定到聊天模型，并让模型调用该工具。

接下来，请查看此指南，了解如何通过调用函数并将结果传回模型来实际使用该工具：

- 将[工具结果传回模型](/docs/how_to/tool_results_pass_to_model)

您还可以查看一些更具体的工具调用用法：

- 从模型获取[结构化输出](/docs/how_to/structured_output/)
- 使用工具进行少量示例提示[与工具](/docs/how_to/tools_few_shot/)
- 流式[工具调用](/docs/how_to/tool_streaming/)
- 将 [运行时值传递给工具](/docs/how_to/tool_runtime)
