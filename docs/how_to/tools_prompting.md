---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_prompting.ipynb
sidebar_position: 3
---
# 如何为大型语言模型和聊天模型添加临时工具调用能力

:::caution

一些模型已经针对工具调用进行了微调，并提供了专用的工具调用API。通常，这些模型在工具调用方面优于未微调的模型，推荐用于需要工具调用的用例。有关更多信息，请参阅[如何使用聊天模型调用工具](/docs/how_to/tool_calling)指南。

:::

:::info Prerequisites

本指南假设您熟悉以下概念：

- [LangChain 工具](/docs/concepts/#tools)
- [函数/工具调用](https://python.langchain.com/docs/concepts/#functiontool-calling)
- [聊天模型](/docs/concepts/#chat-models)
- [大型语言模型](/docs/concepts/#llms)

:::

在本指南中，我们将看到如何为聊天模型添加**临时**工具调用支持。这是一种调用工具的替代方法，适用于使用不原生支持[工具调用](/docs/how_to/tool_calling)的模型。

我们将通过简单地编写一个提示来实现这一点，以使模型调用适当的工具。以下是逻辑的示意图：

![chain](../../static/img/tool_chain.svg)

## 设置

我们需要安装以下软件包：


```python
%pip install --upgrade --quiet langchain langchain-community
```

如果您想使用LangSmith，请取消下面的注释：


```python
import getpass
import os
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

您可以选择本指南中提供的任何模型。请记住，这些模型大多数已经[支持原生工具调用](/docs/integrations/chat/)，因此在这些模型中使用这里展示的提示策略是没有意义的，您应该遵循[如何使用聊天模型调用工具](/docs/how_to/tool_calling)指南。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs openaiParams={`model="gpt-4"`} />

为了说明这个想法，我们将通过Ollama使用`phi3`，它**不**支持原生工具调用。如果您也想使用`Ollama`，请遵循[这些说明](/docs/integrations/chat/ollama/)。


```python
<!--IMPORTS:[{"imported": "Ollama", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ollama.Ollama.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from langchain_community.llms import Ollama

model = Ollama(model="phi3")
```

## 创建一个工具

首先，让我们创建一个`add`和`multiply`工具。有关创建自定义工具的更多信息，请参见[本指南](/docs/how_to/custom_tools)。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from langchain_core.tools import tool


@tool
def multiply(x: float, y: float) -> float:
    """Multiply two numbers together."""
    return x * y


@tool
def add(x: int, y: int) -> int:
    "Add two numbers."
    return x + y


tools = [multiply, add]

# Let's inspect the tools
for t in tools:
    print("--")
    print(t.name)
    print(t.description)
    print(t.args)
```
```output
--
multiply
Multiply two numbers together.
{'x': {'title': 'X', 'type': 'number'}, 'y': {'title': 'Y', 'type': 'number'}}
--
add
Add two numbers.
{'x': {'title': 'X', 'type': 'integer'}, 'y': {'title': 'Y', 'type': 'integer'}}
```

```python
multiply.invoke({"x": 4, "y": 5})
```



```output
20.0
```


## 创建我们的提示

我们想要编写一个提示，指定模型可以访问的工具、这些工具的参数以及模型的期望输出格式。在这种情况下，我们将指示它输出一个形式为`{"name": "...", "arguments": {...}}`的JSON对象。


```python
<!--IMPORTS:[{"imported": "JsonOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}, {"imported": "render_text_description", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.render.render_text_description.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import render_text_description

rendered_tools = render_text_description(tools)
print(rendered_tools)
```
```output
multiply(x: float, y: float) -> float - Multiply two numbers together.
add(x: int, y: int) -> int - Add two numbers.
```

```python
system_prompt = f"""\
You are an assistant that has access to the following set of tools. 
Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. 
Return your response as a JSON blob with 'name' and 'arguments' keys.

The `arguments` should be a dictionary, with keys corresponding 
to the argument names and the values corresponding to the requested values.
"""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```


```python
chain = prompt | model
message = chain.invoke({"input": "what's 3 plus 1132"})

# Let's take a look at the output from the model
# if the model is an LLM (not a chat model), the output will be a string.
if isinstance(message, str):
    print(message)
else:  # Otherwise it's a chat model
    print(message.content)
```
```output
{
    "name": "add",
    "arguments": {
        "x": 3,
        "y": 1132
    }
}
```
## 添加输出解析器

我们将使用`JsonOutputParser`将模型的输出解析为JSON。


```python
<!--IMPORTS:[{"imported": "JsonOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from langchain_core.output_parsers import JsonOutputParser

chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "what's thirteen times 4"})
```



```output
{'name': 'multiply', 'arguments': {'x': 13.0, 'y': 4.0}}
```


:::important

🎉 太棒了！ 🎉 我们现在已经指示我们的模型如何**请求**调用一个工具。

现在，让我们创建一些逻辑来实际运行工具！
:::

## 调用工具 🏃

现在模型可以请求调用工具，我们需要编写一个可以实际调用工具的函数
该工具。

该函数将通过名称选择适当的工具，并将模型选择的参数传递给它。


```python
<!--IMPORTS:[{"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from typing import Any, Dict, Optional, TypedDict

from langchain_core.runnables import RunnableConfig


class ToolCallRequest(TypedDict):
    """A typed dict that shows the inputs into the invoke_tool function."""

    name: str
    arguments: Dict[str, Any]


def invoke_tool(
    tool_call_request: ToolCallRequest, config: Optional[RunnableConfig] = None
):
    """A function that we can use the perform a tool invocation.

    Args:
        tool_call_request: a dict that contains the keys name and arguments.
            The name must match the name of a tool that exists.
            The arguments are the arguments to that tool.
        config: This is configuration information that LangChain uses that contains
            things like callbacks, metadata, etc.See LCEL documentation about RunnableConfig.

    Returns:
        output from the requested tool
    """
    tool_name_to_tool = {tool.name: tool for tool in tools}
    name = tool_call_request["name"]
    requested_tool = tool_name_to_tool[name]
    return requested_tool.invoke(tool_call_request["arguments"], config=config)
```

让我们测试一下 🧪！


```python
invoke_tool({"name": "multiply", "arguments": {"x": 3, "y": 5}})
```



```output
15.0
```


## 让我们把它组合起来

让我们把它组合成一个可以进行加法和乘法运算的计算器链。


```python
chain = prompt | model | JsonOutputParser() | invoke_tool
chain.invoke({"input": "what's thirteen times 4.14137281"})
```



```output
53.83784653
```


## 返回工具输入

返回不仅是工具输出而且是工具输入是很有帮助的。我们可以通过 `RunnablePassthrough.assign` 轻松做到这一点，将工具输出传递。这样会将输入传递给 RunnablePassthrough 组件（假设是一个字典），并在其上添加一个键，同时仍然传递当前输入中的所有内容：


```python
<!--IMPORTS:[{"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models"}]-->
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=invoke_tool)
)
chain.invoke({"input": "what's thirteen times 4.14137281"})
```



```output
{'name': 'multiply',
 'arguments': {'x': 13, 'y': 4.14137281},
 'output': 53.83784653}
```


## 接下来是什么？

本使用手册展示了模型正确输出所有所需工具信息的“理想路径”。

实际上，如果您使用更复杂的工具，您将开始遇到模型的错误，特别是对于那些没有针对工具调用进行微调的模型和能力较弱的模型。

您需要准备好添加策略以改善模型的输出；例如，

1. 提供少量示例。
2. 添加错误处理（例如，捕获异常并将其反馈给大型语言模型，请求其纠正之前的输出）。
