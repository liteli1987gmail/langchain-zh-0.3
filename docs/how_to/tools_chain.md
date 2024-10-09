---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_chain.ipynb
sidebar_position: 0
---
# 如何在链中使用工具

在本指南中，我们将介绍创建调用工具的链和代理的基本方法。工具可以是任何东西——API、函数、数据库等。工具使我们能够扩展模型的能力，不仅仅是输出文本/消息。使用模型与工具的关键是正确提示模型并解析其响应，以便它选择正确的工具并为其提供正确的输入。

## 设置

我们需要安装以下软件包以进行本指南：


```python
%pip install --upgrade --quiet langchain
```

如果您想在 [LangSmith](https://docs.smith.langchain.com/) 中跟踪您的运行，请取消注释并设置以下环境变量：


```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 创建一个工具

首先，我们需要创建一个要调用的工具。在这个例子中，我们将从一个函数创建一个自定义工具。有关创建自定义工具的更多信息，请参见 [本指南](/docs/how_to/custom_tools)。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to use tools in a chain"}]-->
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```


```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```
```output
multiply
multiply(first_int: int, second_int: int) -> int - Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```



```output
20
```


## 链

如果我们知道只需要固定次数地使用一个工具，我们可以为此创建一个链。让我们创建一个简单的链，仅仅是乘以用户指定的数字。

![chain](../../static/img/tool_chain.svg)

### 工具/函数调用
与大型语言模型一起使用工具的最可靠方法之一是使用工具调用 API（有时也称为函数调用）。这仅适用于明确支持工具调用的模型。您可以在 [这里](/docs/integrations/chat/) 查看哪些模型支持工具调用，并在 [本指南](/docs/how_to/function_calling) 中了解更多关于如何使用工具调用的信息。

首先我们将定义我们的模型和工具。我们将从一个单一的工具 `multiply` 开始。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>


我们将使用 `bind_tools` 将工具的定义作为每次调用模型的一部分传递，以便模型在适当的时候可以调用该工具：


```python
llm_with_tools = llm.bind_tools([multiply])
```

当模型调用工具时，这将显示在输出的 `AIMessage.tool_calls` 属性中：


```python
msg = llm_with_tools.invoke("whats 5 times forty two")
msg.tool_calls
```



```output
[{'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 42},
  'id': 'call_cCP9oA3tRz7HDrjFn1FdmDaG'}]
```


查看 [LangSmith 跟踪这里](https://smith.langchain.com/public/81ff0cbd-e05b-4720-bf61-2c9807edb708/r)。

### 调用工具

太好了！我们能够生成工具调用。但是如果我们想实际调用工具呢？为此，我们需要将生成的工具参数传递给我们的工具。作为一个简单的例子，我们将提取第一个工具调用的参数：


```python
from operator import itemgetter

chain = llm_with_tools | (lambda x: x.tool_calls[0]["args"]) | multiply
chain.invoke("What's four times 23")
```



```output
92
```


查看 [LangSmith 跟踪这里](https://smith.langchain.com/public/16bbabb9-fc9b-41e5-a33d-487c42df4f85/r)。

## 代理

当我们知道任何用户输入所需的工具使用特定顺序时，链是很好的选择。但对于某些用例，我们使用工具的次数取决于输入。在这些情况下，我们希望让模型自己决定使用工具的次数和顺序。[代理](/docs/tutorials/agents) 让我们可以做到这一点。

LangChain 提供了许多内置代理，针对不同的用例进行了优化。阅读所有 [代理类型这里](/docs/concepts#agents)。

我们将使用 [工具调用代理](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html)，这通常是最可靠的类型，也是大多数用例推荐使用的。

![agent](../../static/img/tool_agent.svg)


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to use tools in a chain"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to use tools in a chain"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```


```python
# Get the prompt to use - can be replaced with any prompt that includes variables "agent_scratchpad" and "input"!
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```
```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```
代理也很棒，因为它们使得使用多个工具变得简单。


```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, add, exponentiate]
```


```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```


```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

有了代理，我们可以提出需要任意多次使用工具的问题：


```python
agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result"
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`


[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`


[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 405, 'exponent': 2}`


[0m[38;5;200m[1;3m13286025[0m[32;1m[1;3mThe result of taking 3 to the fifth power is 243. 

The sum of twelve and three is 15. 

Multiplying 243 by 15 gives 3645. 

Finally, squaring 3645 gives 13286025.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'The result of taking 3 to the fifth power is 243. \n\nThe sum of twelve and three is 15. \n\nMultiplying 243 by 15 gives 3645. \n\nFinally, squaring 3645 gives 13286025.'}
```


请查看[LangSmith追踪这里](https://smith.langchain.com/public/eeeb27a4-a2f8-4f06-a3af-9c983f76146c/r)。
