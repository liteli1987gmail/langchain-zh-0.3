---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/custom_tools.ipynb
---
# 如何创建工具

在构建代理时，您需要提供一个它可以使用的 `Tool` 列表。除了被调用的实际函数外，Tool 由几个组件组成：

| 属性         | 类型                             | 描述                                                                                                                                                                    |
|---------------|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 名称          | str                             | 在提供给 LLM 或代理的一组工具中必须是唯一的。                                                                                                              |
| 描述          | str                             | 描述工具的功能。被 LLM 或代理用作上下文。                                                                                                             |
| args_schema   | pydantic.BaseModel | 可选但推荐，如果使用回调处理程序则是必需的。可以用来提供更多信息（例如，少量示例）或验证预期参数。 |
| return_direct | boolean                         | 仅与代理相关。当为 True 时，在调用给定工具后，代理将停止并直接将结果返回给用户。                                             |

LangChain 支持从以下内容创建工具：

1. 函数;
2. LangChain [运行接口](/docs/concepts#runnable-interface);
3. 通过从 [BaseTool](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.BaseTool.html) 子类化 -- 这是最灵活的方法，它提供了最大的控制程度，但需要更多的努力和代码。

从函数创建工具可能足以满足大多数用例，可以通过简单的 [@tool 装饰器](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.tool.html#langchain_core.tools.tool) 来完成。如果需要更多配置，例如同时指定同步和异步实现，也可以使用 [StructuredTool.from_function](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.StructuredTool.html#langchain_core.tools.StructuredTool.from_function) 类方法。

在本指南中，我们提供了这些方法的概述。

:::tip

如果工具具有精心选择的名称、描述和 JSON 模式，模型的表现会更好。
:::

## 从函数创建工具

### @tool 装饰器

这个 `@tool` 装饰器是定义自定义工具的最简单方法。默认情况下，装饰器使用函数名称作为工具名称，但可以通过将字符串作为第一个参数传递来覆盖。此外，装饰器将使用函数的文档字符串作为工具的描述 - 因此必须提供文档字符串。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to create tools"}]-->
from langchain_core.tools import tool


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


# Let's inspect some of the attributes associated with the tool.
print(multiply.name)
print(multiply.description)
print(multiply.args)
```
```output
multiply
Multiply two numbers.
{'a': {'title': 'A', 'type': 'integer'}, 'b': {'title': 'B', 'type': 'integer'}}
```
或者创建一个 **异步** 实现，像这样：


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to create tools"}]-->
from langchain_core.tools import tool


@tool
async def amultiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
```

请注意，`@tool` 支持解析注释、嵌套模式和其他特性：


```python
from typing import Annotated, List


@tool
def multiply_by_max(
    a: Annotated[str, "scale factor"],
    b: Annotated[List[int], "list of ints over which to take maximum"],
) -> int:
    """Multiply a by the maximum of b."""
    return a * max(b)


multiply_by_max.args_schema.schema()
```



```output
{'description': 'Multiply a by the maximum of b.',
 'properties': {'a': {'description': 'scale factor',
   'title': 'A',
   'type': 'string'},
  'b': {'description': 'list of ints over which to take maximum',
   'items': {'type': 'integer'},
   'title': 'B',
   'type': 'array'}},
 'required': ['a', 'b'],
 'title': 'multiply_by_maxSchema',
 'type': 'object'}
```


您还可以通过将工具名称和 JSON 参数传递给工具装饰器来自定义它们。


```python
from pydantic import BaseModel, Field


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


@tool("multiplication-tool", args_schema=CalculatorInput, return_direct=True)
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


# Let's inspect some of the attributes associated with the tool.
print(multiply.name)
print(multiply.description)
print(multiply.args)
print(multiply.return_direct)
```
```output
multiplication-tool
Multiply two numbers.
{'a': {'description': 'first number', 'title': 'A', 'type': 'integer'}, 'b': {'description': 'second number', 'title': 'B', 'type': 'integer'}}
True
```
#### 文档字符串解析

`@tool` 可以选择性地解析 [Google 风格文档字符串](https://google.github.io/styleguide/pyguide.html#383-functions-and-methods)，并将文档字符串组件（如参数描述）与工具模式的相关部分关联起来。要切换此行为，请指定 `parse_docstring`：


```python
@tool(parse_docstring=True)
def foo(bar: str, baz: int) -> str:
    """The foo.

    Args:
        bar: The bar.
        baz: The baz.
    """
    return bar


foo.args_schema.schema()
```



```output
{'description': 'The foo.',
 'properties': {'bar': {'description': 'The bar.',
   'title': 'Bar',
   'type': 'string'},
  'baz': {'description': 'The baz.', 'title': 'Baz', 'type': 'integer'}},
 'required': ['bar', 'baz'],
 'title': 'fooSchema',
 'type': 'object'}
```


:::caution
默认情况下，如果文档字符串无法正确解析，`@tool(parse_docstring=True)` 将引发 `ValueError`。有关详细信息和示例，请参见 [API 参考](https://python.langchain.com/api_reference/core/tools/langchain_core.tools.tool.html)。
:::

### 结构化工具

`StructuredTool.from_function` 类方法提供比 `@tool` 装饰器更多的可配置性，而无需太多额外代码。


```python
<!--IMPORTS:[{"imported": "StructuredTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.structured.StructuredTool.html", "title": "How to create tools"}]-->
from langchain_core.tools import StructuredTool


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


async def amultiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(func=multiply, coroutine=amultiply)

print(calculator.invoke({"a": 2, "b": 3}))
print(await calculator.ainvoke({"a": 2, "b": 5}))
```
```output
6
10
```
要进行配置：


```python
class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(
    func=multiply,
    name="Calculator",
    description="multiply numbers",
    args_schema=CalculatorInput,
    return_direct=True,
    # coroutine= ... <- you can specify an async method if desired as well
)

print(calculator.invoke({"a": 2, "b": 3}))
print(calculator.name)
print(calculator.description)
print(calculator.args)
```
```output
6
Calculator
multiply numbers
{'a': {'description': 'first number', 'title': 'A', 'type': 'integer'}, 'b': {'description': 'second number', 'title': 'B', 'type': 'integer'}}
```
## 从可运行对象创建工具

接受字符串或 `dict` 输入的 LangChain [Runnables](/docs/concepts#runnable-interface) 可以使用 [as_tool](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.as_tool) 方法转换为工具，该方法允许为参数指定名称、描述和其他模式信息。

示例用法：


```python
<!--IMPORTS:[{"imported": "GenericFakeChatModel", "source": "langchain_core.language_models", "docs": "https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.fake_chat_models.GenericFakeChatModel.html", "title": "How to create tools"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to create tools"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to create tools"}]-->
from langchain_core.language_models import GenericFakeChatModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [("human", "Hello. Please respond in the style of {answer_style}.")]
)

# Placeholder LLM
llm = GenericFakeChatModel(messages=iter(["hello matey"]))

chain = prompt | llm | StrOutputParser()

as_tool = chain.as_tool(
    name="Style responder", description="Description of when to use tool."
)
as_tool.args
```
```output
/var/folders/4j/2rz3865x6qg07tx43146py8h0000gn/T/ipykernel_95770/2548361071.py:14: LangChainBetaWarning: This API is in beta and may change in the future.
  as_tool = chain.as_tool(
```


```output
{'answer_style': {'title': 'Answer Style', 'type': 'string'}}
```


有关更多详细信息，请参见 [本指南](/docs/how_to/convert_runnable_to_tool)。

## 子类化 BaseTool

您可以通过从 `BaseTool` 子类化来定义自定义工具。这提供了对工具定义的最大控制，但需要编写更多代码。


```python
<!--IMPORTS:[{"imported": "AsyncCallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.AsyncCallbackManagerForToolRun.html", "title": "How to create tools"}, {"imported": "CallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManagerForToolRun.html", "title": "How to create tools"}, {"imported": "BaseTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.BaseTool.html", "title": "How to create tools"}]-->
from typing import Optional, Type

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.tools import BaseTool
from pydantic import BaseModel


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


# Note: It's important that every field has type hints. BaseTool is a
# Pydantic class and not having type hints can lead to unexpected behavior.
class CustomCalculatorTool(BaseTool):
    name: str = "Calculator"
    description: str = "useful for when you need to answer questions about math"
    args_schema: Type[BaseModel] = CalculatorInput
    return_direct: bool = True

    def _run(
        self, a: int, b: int, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return a * b

    async def _arun(
        self,
        a: int,
        b: int,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        # If the calculation is cheap, you can just delegate to the sync implementation
        # as shown below.
        # If the sync calculation is expensive, you should delete the entire _arun method.
        # LangChain will automatically provide a better implementation that will
        # kick off the task in a thread to make sure it doesn't block other async code.
        return self._run(a, b, run_manager=run_manager.get_sync())
```


```python
multiply = CustomCalculatorTool()
print(multiply.name)
print(multiply.description)
print(multiply.args)
print(multiply.return_direct)

print(multiply.invoke({"a": 2, "b": 3}))
print(await multiply.ainvoke({"a": 2, "b": 3}))
```
```output
Calculator
useful for when you need to answer questions about math
{'a': {'description': 'first number', 'title': 'A', 'type': 'integer'}, 'b': {'description': 'second number', 'title': 'B', 'type': 'integer'}}
True
6
6
```
## 如何创建异步工具

LangChain 工具实现了 [运行接口 🏃](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html)。

所有 Runnables 都暴露 `invoke` 和 `ainvoke` 方法（以及其他方法，如 `batch`、`abatch`、`astream` 等）。

因此，即使您只提供工具的 `sync` 实现，您仍然可以使用 `ainvoke` 接口，但有一些重要事项需要了解：
需要了解的一些重要事项：

* LangChain 默认提供异步实现，假设该函数计算开销较大，因此会将执行委托给另一个线程。
* 如果您在异步代码库中工作，应该创建异步工具而不是同步工具，以避免因该线程而产生小的开销。
* 如果您需要同步和异步实现，请使用 `StructuredTool.from_function` 或从 `BaseTool` 子类化。
* 如果同时实现同步和异步，并且同步代码运行速度较快，请覆盖默认的 LangChain 异步实现并直接调用同步代码。
* 您不能也不应该将同步 `invoke` 与异步工具一起使用。


```python
<!--IMPORTS:[{"imported": "StructuredTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.structured.StructuredTool.html", "title": "How to create tools"}]-->
from langchain_core.tools import StructuredTool


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(func=multiply)

print(calculator.invoke({"a": 2, "b": 3}))
print(
    await calculator.ainvoke({"a": 2, "b": 5})
)  # Uses default LangChain async implementation incurs small overhead
```
```output
6
10
```

```python
<!--IMPORTS:[{"imported": "StructuredTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.structured.StructuredTool.html", "title": "How to create tools"}]-->
from langchain_core.tools import StructuredTool


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


async def amultiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(func=multiply, coroutine=amultiply)

print(calculator.invoke({"a": 2, "b": 3}))
print(
    await calculator.ainvoke({"a": 2, "b": 5})
)  # Uses use provided amultiply without additional overhead
```
```output
6
10
```
当仅提供异步定义时，您不应该也不能使用 `.invoke`。


```python
@tool
async def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


try:
    multiply.invoke({"a": 2, "b": 3})
except NotImplementedError:
    print("Raised not implemented error. You should not be doing this.")
```
```output
Raised not implemented error. You should not be doing this.
```
## 处理工具错误

如果您在使用带有代理的工具，您可能需要一个错误处理策略，以便代理能够从错误中恢复并继续执行。

一个简单的策略是在工具内部抛出 `ToolException`，并使用 `handle_tool_error` 指定错误处理程序。

当指定错误处理程序时，异常将被捕获，错误处理程序将决定从工具返回哪个输出。

您可以将 `handle_tool_error` 设置为 `True`、字符串值或函数。如果是函数，该函数应接受一个 `ToolException` 作为参数并返回一个值。

请注意，仅仅抛出 `ToolException` 是无效的。您需要首先设置工具的 `handle_tool_error`，因为它的默认值是 `False`。


```python
<!--IMPORTS:[{"imported": "ToolException", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.ToolException.html", "title": "How to create tools"}]-->
from langchain_core.tools import ToolException


def get_weather(city: str) -> int:
    """Get weather for the given city."""
    raise ToolException(f"Error: There is no city by the name of {city}.")
```

这是一个默认 `handle_tool_error=True` 行为的示例。


```python
get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error=True,
)

get_weather_tool.invoke({"city": "foobar"})
```



```output
'Error: There is no city by the name of foobar.'
```


我们可以将 `handle_tool_error` 设置为一个始终返回的字符串。


```python
get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error="There is no such city, but it's probably above 0K there!",
)

get_weather_tool.invoke({"city": "foobar"})
```



```output
"There is no such city, but it's probably above 0K there!"
```


使用函数处理错误：


```python
def _handle_error(error: ToolException) -> str:
    return f"The following errors occurred during tool execution: `{error.args[0]}`"


get_weather_tool = StructuredTool.from_function(
    func=get_weather,
    handle_tool_error=_handle_error,
)

get_weather_tool.invoke({"city": "foobar"})
```



```output
'The following errors occurred during tool execution: `Error: There is no city by the name of foobar.`'
```


## 返回工具执行的工件

有时工具执行的工件我们希望能够让下游组件在我们的链或代理中访问，但我们不想将其暴露给模型本身。例如，如果工具返回自定义对象如文档，我们可能希望将一些视图或元数据传递给模型，而不将原始输出传递给模型。同时，我们可能希望能够在其他地方访问这个完整的输出，例如在下游工具中。

工具和 [ToolMessage](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html) 接口使得能够区分工具输出中用于模型的部分（这是 ToolMessage.content）和用于模型外部使用的部分（ToolMessage.artifact）。

:::info Requires ``langchain-core >= 0.2.19``

此功能是在 ``langchain-core == 0.2.19`` 中添加的。请确保您的包是最新的。

:::

如果我们希望我们的工具区分消息内容和其他工件，我们需要在定义工具时指定 `response_format="content_and_artifact"`，并确保返回一个元组 (content, artifact)：


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to create tools"}]-->
import random
from typing import List, Tuple

from langchain_core.tools import tool


@tool(response_format="content_and_artifact")
def generate_random_ints(min: int, max: int, size: int) -> Tuple[str, List[int]]:
    """Generate size random ints in the range [min, max]."""
    array = [random.randint(min, max) for _ in range(size)]
    content = f"Successfully generated array of {size} random ints in [{min}, {max}]."
    return content, array
```

如果我们直接使用工具参数调用我们的工具，我们将只得到输出的内容部分：


```python
generate_random_ints.invoke({"min": 0, "max": 9, "size": 10})
```



```output
'Successfully generated array of 10 random ints in [0, 9].'
```


如果我们使用 ToolCall（如工具调用模型生成的那样）调用我们的工具，我们将得到一个 ToolMessage，其中包含内容和工具生成的工件：


```python
generate_random_ints.invoke(
    {
        "name": "generate_random_ints",
        "args": {"min": 0, "max": 9, "size": 10},
        "id": "123",  # required
        "type": "tool_call",  # required
    }
)
```



```output
ToolMessage(content='Successfully generated array of 10 random ints in [0, 9].', name='generate_random_ints', tool_call_id='123', artifact=[4, 8, 2, 4, 1, 0, 9, 5, 8, 1])
```


在子类化 BaseTool 时，我们也可以这样做：


```python
<!--IMPORTS:[{"imported": "BaseTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.BaseTool.html", "title": "How to create tools"}]-->
from langchain_core.tools import BaseTool


class GenerateRandomFloats(BaseTool):
    name: str = "generate_random_floats"
    description: str = "Generate size random floats in the range [min, max]."
    response_format: str = "content_and_artifact"

    ndigits: int = 2

    def _run(self, min: float, max: float, size: int) -> Tuple[str, List[float]]:
        range_ = max - min
        array = [
            round(min + (range_ * random.random()), ndigits=self.ndigits)
            for _ in range(size)
        ]
        content = f"Generated {size} floats in [{min}, {max}], rounded to {self.ndigits} decimals."
        return content, array

    # Optionally define an equivalent async method

    # async def _arun(self, min: float, max: float, size: int) -> Tuple[str, List[float]]:
    #     ...
```


```python
rand_gen = GenerateRandomFloats(ndigits=4)

rand_gen.invoke(
    {
        "name": "generate_random_floats",
        "args": {"min": 0.1, "max": 3.3333, "size": 3},
        "id": "123",
        "type": "tool_call",
    }
)
```



```output
ToolMessage(content='Generated 3 floats in [0.1, 3.3333], rounded to 4 decimals.', name='generate_random_floats', tool_call_id='123', artifact=[1.5566, 0.5134, 2.7914])
```

