---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_results_pass_to_model.ipynb
---
# 如何将工具输出传递给聊天模型

:::info Prerequisites
本指南假设您熟悉以下概念：

- [LangChain 工具](/docs/concepts/#tools)
- [函数/工具调用](/docs/concepts/#functiontool-calling)
- [使用聊天模型调用工具](/docs/how_to/tool_calling)
- [定义自定义工具](/docs/how_to/custom_tools/)

:::

一些模型能够进行 [**工具调用**](/docs/concepts/#functiontool-calling) - 生成符合特定用户提供的模式的参数。本指南将演示如何使用这些工具调用来实际调用一个函数并正确地将结果传递回模型。

![Diagram of a tool call invocation](/img/tool_invocation.png)

![Diagram of a tool call result](/img/tool_results.png)

首先，让我们定义我们的工具和模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>



```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to pass tool outputs to chat models"}]-->
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

llm_with_tools = llm.bind_tools(tools)
```

现在，让我们让模型调用一个工具。我们将其添加到我们视为对话历史的消息列表中：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to pass tool outputs to chat models"}]-->
from langchain_core.messages import HumanMessage

query = "What is 3 * 12? Also, what is 11 + 49?"

messages = [HumanMessage(query)]

ai_msg = llm_with_tools.invoke(messages)

print(ai_msg.tool_calls)

messages.append(ai_msg)
```
```output
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_GPGPE943GORirhIAYnWv00rK', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_dm8o64ZrY3WFZHAvCh1bEJ6i', 'type': 'tool_call'}]
```
接下来，让我们使用模型填充的参数调用工具函数！

方便的是，如果我们使用 `ToolCall` 调用 LangChain `Tool`，我们将自动获得一个可以反馈给模型的 `ToolMessage`：

:::caution Compatibility

此功能是在 `langchain-core == 0.2.19` 中添加的。请确保您的包是最新的。

如果您使用的是早期版本的 `langchain-core`，您需要从工具中提取 `args` 字段并手动构造 `ToolMessage`。

:::


```python
for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_msg = selected_tool.invoke(tool_call)
    messages.append(tool_msg)

messages
```



```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),
 ToolMessage(content='36', name='multiply', tool_call_id='call_loT2pliJwJe3p7nkgXYF48A1'),
 ToolMessage(content='60', name='add', tool_call_id='call_bG9tYZCXOeYDZf3W46TceoV4')]
```


最后，我们将使用工具结果调用模型。模型将使用此信息生成对我们原始查询的最终答案：


```python
llm_with_tools.invoke(messages)
```



```output
AIMessage(content='The result of \\(3 \\times 12\\) is 36, and the result of \\(11 + 49\\) is 60.', response_metadata={'token_usage': {'completion_tokens': 31, 'prompt_tokens': 153, 'total_tokens': 184}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'stop', 'logprobs': None}, id='run-87d1ef0a-1223-4bb3-9310-7b591789323d-0', usage_metadata={'input_tokens': 153, 'output_tokens': 31, 'total_tokens': 184})
```


请注意，每个 `ToolMessage` 必须包含一个与模型生成的原始工具调用中的 `id` 匹配的 `tool_call_id`。这有助于模型将工具响应与工具调用匹配。

工具调用代理，如 [LangGraph](https://langchain-ai.github.io/langgraph/tutorials/introduction/) 中的代理，使用此基本流程来回答查询和解决任务。

## 相关

- [LangGraph 快速入门](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
- 少量示例提示 [使用工具](/docs/how_to/tools_few_shot/)
- 流式 [工具调用](/docs/how_to/tool_streaming/)
- 将 [运行时值传递给工具](/docs/how_to/tool_runtime)
- 从模型获取 [结构化输出](/docs/how_to/structured_output/)
