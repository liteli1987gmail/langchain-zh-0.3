---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/migrate_agent.ipynb
keywords: [create_react_agent, create_react_agent()]
---
# 如何从遗留的 LangChain 代理迁移到 LangGraph

:::info Prerequisites

本指南假设您熟悉以下概念：
- [代理](/docs/concepts/#agents)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [工具调用](/docs/how_to/tool_calling/)

:::

在这里，我们重点介绍如何从遗留的 LangChain 代理迁移到更灵活的 [LangGraph](https://langchain-ai.github.io/langgraph/) 代理。
LangChain 代理（特别是 [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor)）具有多个配置参数。
在这个笔记本中，我们将展示这些参数如何映射到 LangGraph 反应代理执行器，使用 [create_react_agent](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent) 预构建助手方法。

#### 先决条件

本使用指南使用 OpenAI 作为大型语言模型。安装依赖项以运行。


```python
%%capture --no-stderr
%pip install -U langgraph langchain langchain-openai
```

然后，设置您的 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API key:\n")
```

## 基本用法

对于工具调用的 ReAct 风格代理的基本创建和使用，功能是相同的。首先，让我们定义一个模型和工具，然后我们将使用这些来创建一个代理。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    return input + 2


tools = [magic_function]


query = "what is the value of magic_function(3)?"
```

对于 LangChain [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor)，我们定义一个带有代理临时记事本占位符的提示。代理可以如下调用：


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({"input": query})
```



```output
{'input': 'what is the value of magic_function(3)?',
 'output': 'The value of `magic_function(3)` is 5.'}
```


LangGraph 的 [react agent executor](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent) 管理一个由消息列表定义的状态。它将继续处理该列表，直到代理的输出中没有工具调用。要启动它，我们输入一系列消息。输出将包含图的整个状态——在这种情况下，是对话历史。




```python
from langgraph.prebuilt import create_react_agent

app = create_react_agent(model, tools)


messages = app.invoke({"messages": [("human", query)]})
{
    "input": query,
    "output": messages["messages"][-1].content,
}
```



```output
{'input': 'what is the value of magic_function(3)?',
 'output': 'The value of `magic_function(3)` is 5.'}
```



```python
message_history = messages["messages"]

new_query = "Pardon?"

messages = app.invoke({"messages": message_history + [("human", new_query)]})
{
    "input": new_query,
    "output": messages["messages"][-1].content,
}
```



```output
{'input': 'Pardon?',
 'output': 'The value returned by `magic_function` when the input is 3 is 5.'}
```


## 提示词模板

使用传统的 LangChain 代理，您必须传入一个提示词模板。您可以使用它来控制代理。

使用 LangGraph [react agent executor](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent)，默认情况下没有提示。您可以通过几种方式实现对代理的类似控制：

1. 将系统消息作为输入传入
2. 用系统消息初始化代理
3. 使用一个函数初始化代理，以在传递给模型之前转换消息。

让我们看看下面的所有内容。我们将传入自定义指令，让代理用西班牙语回应。

首先，使用 `AgentExecutor`：


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Respond only in Spanish."),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({"input": query})
```



```output
{'input': 'what is the value of magic_function(3)?',
 'output': 'El valor de `magic_function(3)` es 5.'}
```


现在，让我们传递一个自定义系统消息给 [react agent executor](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent)。

LangGraph 的预构建 `create_react_agent` 并不直接将提示模板作为参数，而是接受一个 [`state_modifier`](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent) 参数。这个参数在调用大型语言模型之前修改图的状态，可以是以下四个值之一：

- 一个 `SystemMessage`，它会被添加到消息列表的开头。
- 一个 `string`，它会被转换为 `SystemMessage` 并添加到消息列表的开头。
- 一个 `Callable`，它应该接受完整的图状态。输出将传递给语言模型。
- 或者一个 [`Runnable`](/docs/concepts/#langchain-expression-language-lcel)，它应该接受完整的图状态。输出将传递给语言模型。

这就是它在实际中的样子：


```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent

system_message = "You are a helpful assistant. Respond only in Spanish."
# This could also be a SystemMessage object
# system_message = SystemMessage(content="You are a helpful assistant. Respond only in Spanish.")

app = create_react_agent(model, tools, state_modifier=system_message)


messages = app.invoke({"messages": [("user", query)]})
```

我们还可以传入一个任意函数。这个函数应该接收一组消息并输出一组消息。
我们可以在这里对消息进行各种任意格式化。在这种情况下，让我们在消息列表的开头添加一个系统消息。


```python
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Respond only in Spanish."),
        ("placeholder", "{messages}"),
    ]
)


def _modify_state_messages(state: AgentState):
    return prompt.invoke({"messages": state["messages"]}).to_messages() + [
        ("user", "Also say 'Pandamonium!' after the answer.")
    ]


app = create_react_agent(model, tools, state_modifier=_modify_state_messages)


messages = app.invoke({"messages": [("human", query)]})
print(
    {
        "input": query,
        "output": messages["messages"][-1].content,
    }
)
```
```output
{'input': 'what is the value of magic_function(3)?', 'output': 'The value of magic_function(3) is 5. ¡Pandamonium!'}
```
## 内存

### 在 LangChain 中

使用 LangChain 的 [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.iter)，您可以添加聊天 [内存](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.memory)，以便它可以进行多轮对话。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "InMemoryChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.InMemoryChatMessageHistory.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
memory = InMemoryChatMessageHistory(session_id="test-session")
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        # First put the history
        ("placeholder", "{chat_history}"),
        # Then the new input
        ("human", "{input}"),
        # Finally the scratchpad
        ("placeholder", "{agent_scratchpad}"),
    ]
)


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    return input + 2


tools = [magic_function]


agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    lambda session_id: memory,
    input_messages_key="input",
    history_messages_key="chat_history",
)

config = {"configurable": {"session_id": "test-session"}}
print(
    agent_with_chat_history.invoke(
        {"input": "Hi, I'm polly! What's the output of magic_function of 3?"}, config
    )["output"]
)
print("---")
print(agent_with_chat_history.invoke({"input": "Remember my name?"}, config)["output"])
print("---")
print(
    agent_with_chat_history.invoke({"input": "what was that output again?"}, config)[
        "output"
    ]
)
```
```output
Hi Polly! The output of applying the magic function to the input 3 is 5.
---
Yes, you mentioned your name is Polly.
---
The output of applying the magic function to the input 3 is 5.
```
### 在 LangGraph 中

内存只是 [持久性](https://langchain-ai.github.io/langgraph/how-tos/persistence/)，也称为 [检查点](https://langchain-ai.github.io/langgraph/reference/checkpoints/)。

向代理添加一个 `checkpointer`，您将免费获得聊天内存。


```python
from langgraph.checkpoint.memory import MemorySaver  # an in-memory checkpointer
from langgraph.prebuilt import create_react_agent

system_message = "You are a helpful assistant."
# This could also be a SystemMessage object
# system_message = SystemMessage(content="You are a helpful assistant. Respond only in Spanish.")

memory = MemorySaver()
app = create_react_agent(
    model, tools, state_modifier=system_message, checkpointer=memory
)

config = {"configurable": {"thread_id": "test-thread"}}
print(
    app.invoke(
        {
            "messages": [
                ("user", "Hi, I'm polly! What's the output of magic_function of 3?")
            ]
        },
        config,
    )["messages"][-1].content
)
print("---")
print(
    app.invoke({"messages": [("user", "Remember my name?")]}, config)["messages"][
        -1
    ].content
)
print("---")
print(
    app.invoke({"messages": [("user", "what was that output again?")]}, config)[
        "messages"
    ][-1].content
)
```
```output
Hi Polly! The output of applying the magic function to the input 3 is 5.
---
Yes, your name is Polly!
---
The output of applying the magic function to the input 3 was 5.
```
## 迭代步骤

### 在 LangChain 中

使用 LangChain 的 [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.iter)，您可以使用 [stream](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.stream)（或异步 `astream`）方法或 [iter](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.iter) 方法迭代步骤。LangGraph 支持使用 [stream](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.stream) 逐步迭代。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")


prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    return input + 2


tools = [magic_function]

agent = create_tool_calling_agent(model, tools, prompt=prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

for step in agent_executor.stream({"input": query}):
    print(step)
```
```output
{'actions': [ToolAgentAction(tool='magic_function', tool_input={'input': 3}, log="\nInvoking: `magic_function` with `{'input': 3}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'finish_reason': 'tool_calls', 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_c9aa9c0491'}, id='run-dc7ce17d-02fd-4fdb-be82-7c902410b6b7', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'type': 'tool_call'}], tool_call_chunks=[{'name': 'magic_function', 'args': '{"input":3}', 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'index': 0, 'type': 'tool_call_chunk'}])], tool_call_id='call_gNzQT96XWoyZqVl1jI1yMnjy')], 'messages': [AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'finish_reason': 'tool_calls', 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_c9aa9c0491'}, id='run-dc7ce17d-02fd-4fdb-be82-7c902410b6b7', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'type': 'tool_call'}], tool_call_chunks=[{'name': 'magic_function', 'args': '{"input":3}', 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'index': 0, 'type': 'tool_call_chunk'}])]}
{'steps': [AgentStep(action=ToolAgentAction(tool='magic_function', tool_input={'input': 3}, log="\nInvoking: `magic_function` with `{'input': 3}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'finish_reason': 'tool_calls', 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_c9aa9c0491'}, id='run-dc7ce17d-02fd-4fdb-be82-7c902410b6b7', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'type': 'tool_call'}], tool_call_chunks=[{'name': 'magic_function', 'args': '{"input":3}', 'id': 'call_gNzQT96XWoyZqVl1jI1yMnjy', 'index': 0, 'type': 'tool_call_chunk'}])], tool_call_id='call_gNzQT96XWoyZqVl1jI1yMnjy'), observation=5)], 'messages': [FunctionMessage(content='5', name='magic_function')]}
{'output': 'The value of `magic_function(3)` is 5.', 'messages': [AIMessage(content='The value of `magic_function(3)` is 5.')]}
```
### 在 LangGraph 中

在 LangGraph 中，事情是通过 [stream](https://langchain-ai.github.io/langgraph/reference/graphs/#langgraph.graph.graph.CompiledGraph.stream) 或异步 `astream` 方法本地处理的。


```python
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("placeholder", "{messages}"),
    ]
)


def _modify_state_messages(state: AgentState):
    return prompt.invoke({"messages": state["messages"]}).to_messages()


app = create_react_agent(model, tools, state_modifier=_modify_state_messages)

for step in app.stream({"messages": [("human", query)]}, stream_mode="updates"):
    print(step)
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_I0nztlIcc0e9ry5dn53YLZUM', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 61, 'total_tokens': 75}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-5f9bd87d-3692-4d13-8d27-1859e13e2156-0', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_I0nztlIcc0e9ry5dn53YLZUM', 'type': 'tool_call'}], usage_metadata={'input_tokens': 61, 'output_tokens': 14, 'total_tokens': 75})]}}
{'tools': {'messages': [ToolMessage(content='5', name='magic_function', tool_call_id='call_I0nztlIcc0e9ry5dn53YLZUM')]}}
{'agent': {'messages': [AIMessage(content='The value of `magic_function(3)` is 5.', response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 84, 'total_tokens': 98}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'stop', 'logprobs': None}, id='run-f6015ca6-93e5-45e8-8b28-b3f0a8d203dc-0', usage_metadata={'input_tokens': 84, 'output_tokens': 14, 'total_tokens': 98})]}}
```
## `return_intermediate_steps`

### 在 LangChain 中

在 AgentExecutor 上设置此参数允许用户访问 intermediate_steps，这将代理操作（例如，工具调用）与其结果配对。



```python
agent_executor = AgentExecutor(agent=agent, tools=tools, return_intermediate_steps=True)
result = agent_executor.invoke({"input": query})
print(result["intermediate_steps"])
```
```output
[(ToolAgentAction(tool='magic_function', tool_input={'input': 3}, log="\nInvoking: `magic_function` with `{'input': 3}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_wjaAyTjI2LSYOq7C8QZYSxEs', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'finish_reason': 'tool_calls', 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_c9aa9c0491'}, id='run-99e06b70-1ef6-4761-834b-87b6c5252e20', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_wjaAyTjI2LSYOq7C8QZYSxEs', 'type': 'tool_call'}], tool_call_chunks=[{'name': 'magic_function', 'args': '{"input":3}', 'id': 'call_wjaAyTjI2LSYOq7C8QZYSxEs', 'index': 0, 'type': 'tool_call_chunk'}])], tool_call_id='call_wjaAyTjI2LSYOq7C8QZYSxEs'), 5)]
```
### 在 LangGraph 中

默认情况下，LangGraph 中的 [react agent executor](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent) 将所有消息附加到中央状态。因此，只需查看完整状态即可轻松查看任何中间步骤。


```python
from langgraph.prebuilt import create_react_agent

app = create_react_agent(model, tools=tools)

messages = app.invoke({"messages": [("human", query)]})

messages
```



```output
{'messages': [HumanMessage(content='what is the value of magic_function(3)?', id='2d369331-8052-4167-bd85-9f6d8ad021ae'),
  AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_oXiSQSe6WeWj7XIKXxZrO2IC', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 55, 'total_tokens': 69}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-297e7fc9-726f-46a0-8c67-dc28ed1724d0-0', tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_oXiSQSe6WeWj7XIKXxZrO2IC', 'type': 'tool_call'}], usage_metadata={'input_tokens': 55, 'output_tokens': 14, 'total_tokens': 69}),
  ToolMessage(content='5', name='magic_function', id='46370faf-9598-423c-b94b-aca8cb4f035d', tool_call_id='call_oXiSQSe6WeWj7XIKXxZrO2IC'),
  AIMessage(content='The value of `magic_function(3)` is 5.', response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 78, 'total_tokens': 92}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'stop', 'logprobs': None}, id='run-f48efaff-0c2c-4632-bbf9-7ee626f73d02-0', usage_metadata={'input_tokens': 78, 'output_tokens': 14, 'total_tokens': 92})]}
```


## `max_iterations`

### 在 LangChain 中

`AgentExecutor` 实现了一个 `max_iterations` 参数，允许用户中止超过指定迭代次数的运行。


```python
@tool
def magic_function(input: str) -> str:
    """Applies a magic function to an input."""
    return "Sorry, there was an error. Please try again."


tools = [magic_function]
```


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Respond only in Spanish."),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)

agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=3,
)

agent_executor.invoke({"input": query})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `magic_function` with `{'input': '3'}`


[0m[36;1m[1;3mSorry, there was an error. Please try again.[0m[32;1m[1;3mHubo un error al intentar obtener el valor de `magic_function(3)`. ¿Podrías intentarlo de nuevo o proporcionar más detalles?[0m

[1m> Finished chain.[0m
```


```output
{'input': 'what is the value of magic_function(3)?',
 'output': 'Hubo un error al intentar obtener el valor de `magic_function(3)`. ¿Podrías intentarlo de nuevo o proporcionar más detalles?'}
```


### 在 LangGraph 中

在 LangGraph 中，这通过 `recursion_limit` 配置参数进行控制。

请注意，在 `AgentExecutor` 中，“迭代”包括工具调用和执行的完整轮次。在 LangGraph 中，每一步都贡献于递归限制，因此我们需要乘以二（并加一）以获得等效结果。

如果达到递归限制，LangGraph 会引发特定的异常类型，我们可以像处理 AgentExecutor 一样捕获和管理。


```python
from langgraph.errors import GraphRecursionError
from langgraph.prebuilt import create_react_agent

RECURSION_LIMIT = 2 * 3 + 1

app = create_react_agent(model, tools=tools)

try:
    for chunk in app.stream(
        {"messages": [("human", query)]},
        {"recursion_limit": RECURSION_LIMIT},
        stream_mode="values",
    ):
        print(chunk["messages"][-1])
except GraphRecursionError:
    print({"input": query, "output": "Agent stopped due to max iterations."})
```
```output
content='what is the value of magic_function(3)?' id='fe74bb30-45b8-4a40-a5ed-fd6678da5428'
content='' additional_kwargs={'tool_calls': [{'id': 'call_TNKfNy6fgZNdJAvHUMXwtp8f', 'function': {'arguments': '{"input":"3"}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 55, 'total_tokens': 69}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-dad8bfc1-477c-40d2-9016-243d25c0dd13-0' tool_calls=[{'name': 'magic_function', 'args': {'input': '3'}, 'id': 'call_TNKfNy6fgZNdJAvHUMXwtp8f', 'type': 'tool_call'}] usage_metadata={'input_tokens': 55, 'output_tokens': 14, 'total_tokens': 69}
content='Sorry, there was an error. Please try again.' name='magic_function' id='653226e0-3187-40be-a774-4c7c2612239e' tool_call_id='call_TNKfNy6fgZNdJAvHUMXwtp8f'
content='It looks like there was an issue with processing the request. Let me try that again.' additional_kwargs={'tool_calls': [{'id': 'call_K0wJ8fQLYGv8fYXY1Uo5U5sG', 'function': {'arguments': '{"input":"3"}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 33, 'prompt_tokens': 88, 'total_tokens': 121}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-d4c85437-6625-4e57-81f9-86de6842be7b-0' tool_calls=[{'name': 'magic_function', 'args': {'input': '3'}, 'id': 'call_K0wJ8fQLYGv8fYXY1Uo5U5sG', 'type': 'tool_call'}] usage_metadata={'input_tokens': 88, 'output_tokens': 33, 'total_tokens': 121}
content='Sorry, there was an error. Please try again.' name='magic_function' id='9b530d03-95df-401e-bb4f-5cada1195033' tool_call_id='call_K0wJ8fQLYGv8fYXY1Uo5U5sG'
content='It seems that there is a persistent issue with processing the request. Let me attempt it one more time.' additional_kwargs={'tool_calls': [{'id': 'call_7ECwwNBDo4SH56oczErZJVRT', 'function': {'arguments': '{"input":"3"}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 36, 'prompt_tokens': 143, 'total_tokens': 179}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-9f3f651e-a641-4112-99ed-d1ac11169582-0' tool_calls=[{'name': 'magic_function', 'args': {'input': '3'}, 'id': 'call_7ECwwNBDo4SH56oczErZJVRT', 'type': 'tool_call'}] usage_metadata={'input_tokens': 143, 'output_tokens': 36, 'total_tokens': 179}
content='Sorry, there was an error. Please try again.' name='magic_function' id='e4cd152b-4eb1-47df-ac76-f88e79adbe19' tool_call_id='call_7ECwwNBDo4SH56oczErZJVRT'
content="It seems there is a consistent issue with processing the request for the magic function. Let's try using a different approach to resolve this." additional_kwargs={'tool_calls': [{'id': 'call_DMAL0UwBRijzuPjCTSwR2r17', 'function': {'arguments': '{"input":"three"}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 41, 'prompt_tokens': 201, 'total_tokens': 242}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_c9aa9c0491', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-cd9f4e5c-f881-462c-abe3-890e73f46a01-0' tool_calls=[{'name': 'magic_function', 'args': {'input': 'three'}, 'id': 'call_DMAL0UwBRijzuPjCTSwR2r17', 'type': 'tool_call'}] usage_metadata={'input_tokens': 201, 'output_tokens': 41, 'total_tokens': 242}
{'input': 'what is the value of magic_function(3)?', 'output': 'Agent stopped due to max iterations.'}
```
## `max_execution_time`

### 在 LangChain 中

`AgentExecutor` 实现了一个 `max_execution_time` 参数，允许用户中止超过总时间限制的运行。


```python
import time


@tool
def magic_function(input: str) -> str:
    """Applies a magic function to an input."""
    time.sleep(2.5)
    return "Sorry, there was an error. Please try again."


tools = [magic_function]

agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_execution_time=2,
    verbose=True,
)

agent_executor.invoke({"input": query})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `magic_function` with `{'input': '3'}`


[0m[36;1m[1;3mSorry, there was an error. Please try again.[0m[32;1m[1;3m[0m

[1m> Finished chain.[0m
```


```output
{'input': 'what is the value of magic_function(3)?',
 'output': 'Agent stopped due to max iterations.'}
```


### 在 LangGraph 中

使用 LangGraph 的反应代理，您可以在两个级别上控制超时。

您可以设置一个 `step_timeout` 来限制每个 **步骤**：


```python
from langgraph.prebuilt import create_react_agent

app = create_react_agent(model, tools=tools)
# Set the max timeout for each step here
app.step_timeout = 2

try:
    for chunk in app.stream({"messages": [("human", query)]}):
        print(chunk)
        print("------")
except TimeoutError:
    print({"input": query, "output": "Agent stopped due to a step timeout."})
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_o8Ym0u9UfzArhIm1lV7O0CXF', 'function': {'arguments': '{"input":"3"}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 55, 'total_tokens': 69}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-d9faf125-1ff8-4de2-a75b-97e07d28dc4d-0', tool_calls=[{'name': 'magic_function', 'args': {'input': '3'}, 'id': 'call_o8Ym0u9UfzArhIm1lV7O0CXF', 'type': 'tool_call'}], usage_metadata={'input_tokens': 55, 'output_tokens': 14, 'total_tokens': 69})]}}
------
{'input': 'what is the value of magic_function(3)?', 'output': 'Agent stopped due to a step timeout.'}
```
设置整个运行的单个最大超时的另一种方法是直接使用 Python 标准库 [asyncio](https://docs.python.org/3/library/asyncio.html)。


```python
import asyncio

from langgraph.prebuilt import create_react_agent

app = create_react_agent(model, tools=tools)


async def stream(app, inputs):
    async for chunk in app.astream({"messages": [("human", query)]}):
        print(chunk)
        print("------")


try:
    task = asyncio.create_task(stream(app, {"messages": [("human", query)]}))
    await asyncio.wait_for(task, timeout=3)
except TimeoutError:
    print("Task Cancelled.")
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_gsGzyhyvR25iNV6W9VR2TIdQ', 'function': {'arguments': '{"input":"3"}', 'name': 'magic_function'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 55, 'total_tokens': 69}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9ad8f834-06c5-41cf-9eec-6b7e0f5e777e-0', tool_calls=[{'name': 'magic_function', 'args': {'input': '3'}, 'id': 'call_gsGzyhyvR25iNV6W9VR2TIdQ', 'type': 'tool_call'}], usage_metadata={'input_tokens': 55, 'output_tokens': 14, 'total_tokens': 69})]}}
------
Task Cancelled.
```
## `early_stopping_method`

### 在 LangChain 中

使用 LangChain 的 [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.iter)，您可以配置一个 [early_stopping_method](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.early_stopping_method)，以返回一个字符串，说明“代理因迭代限制或时间限制而停止。”（`


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")


prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    return "Sorry there was an error, please try again."


tools = [magic_function]

agent = create_tool_calling_agent(model, tools, prompt=prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, early_stopping_method="force", max_iterations=1
)

result = agent_executor.invoke({"input": query})
print("Output with early_stopping_method='force':")
print(result["output"])
```
```output
Output with early_stopping_method='force':
Agent stopped due to max iterations.
```
### 在 LangGraph 中

在 LangGraph 中，您可以显式处理代理外的响应行为，因为可以访问完整状态。


```python
from langgraph.errors import GraphRecursionError
from langgraph.prebuilt import create_react_agent

RECURSION_LIMIT = 2 * 1 + 1

app = create_react_agent(model, tools=tools)

try:
    for chunk in app.stream(
        {"messages": [("human", query)]},
        {"recursion_limit": RECURSION_LIMIT},
        stream_mode="values",
    ):
        print(chunk["messages"][-1])
except GraphRecursionError:
    print({"input": query, "output": "Agent stopped due to max iterations."})
```
```output
content='what is the value of magic_function(3)?' id='6487a942-0a9a-4e8a-9556-553a45fa9c5a'
content='' additional_kwargs={'tool_calls': [{'id': 'call_pe5KVY5No9iT4JWqrm5MwL1D', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 55, 'total_tokens': 69}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-04147325-fb72-462a-a1d9-6aa4e86e3d8a-0' tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_pe5KVY5No9iT4JWqrm5MwL1D', 'type': 'tool_call'}] usage_metadata={'input_tokens': 55, 'output_tokens': 14, 'total_tokens': 69}
content='Sorry there was an error, please try again.' name='magic_function' id='bc0bf58f-7c6c-42ed-a96d-a2afa79f16a9' tool_call_id='call_pe5KVY5No9iT4JWqrm5MwL1D'
content="It seems there was an issue with processing the request. I'll try again." additional_kwargs={'tool_calls': [{'id': 'call_5rV7k3g7oW38bD9KUTsSxK8l', 'function': {'arguments': '{"input":3}', 'name': 'magic_function'}, 'type': 'function'}]} response_metadata={'token_usage': {'completion_tokens': 30, 'prompt_tokens': 87, 'total_tokens': 117}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None} id='run-6e43ffd4-fb6f-4222-8503-a50ae268c0be-0' tool_calls=[{'name': 'magic_function', 'args': {'input': 3}, 'id': 'call_5rV7k3g7oW38bD9KUTsSxK8l', 'type': 'tool_call'}] usage_metadata={'input_tokens': 87, 'output_tokens': 30, 'total_tokens': 117}
{'input': 'what is the value of magic_function(3)?', 'output': 'Agent stopped due to max iterations.'}
```
## `trim_intermediate_steps`

### 在 LangChain 中

使用 LangChain 的 [AgentExecutor](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor)，您可以使用 [trim_intermediate_steps](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html#langchain.agents.agent.AgentExecutor.trim_intermediate_steps) 修剪长时间运行代理的中间步骤，该参数可以是一个整数（表示代理应保留最后 N 步）或一个自定义函数。

例如，我们可以修剪值，使代理仅查看最近的中间步骤。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to migrate from legacy LangChain agents to LangGraph"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")


prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


magic_step_num = 1


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    global magic_step_num
    print(f"Call number: {magic_step_num}")
    magic_step_num += 1
    return input + magic_step_num


tools = [magic_function]

agent = create_tool_calling_agent(model, tools, prompt=prompt)


def trim_steps(steps: list):
    # Let's give the agent amnesia
    return []


agent_executor = AgentExecutor(
    agent=agent, tools=tools, trim_intermediate_steps=trim_steps
)


query = "Call the magic function 4 times in sequence with the value 3. You cannot call it multiple times at once."

for step in agent_executor.stream({"input": query}):
    pass
```
```output
Call number: 1
Call number: 2
Call number: 3
Call number: 4
Call number: 5
Call number: 6
Call number: 7
Call number: 8
Call number: 9
Call number: 10
Call number: 11
Call number: 12
Call number: 13
Call number: 14
``````output
Stopping agent prematurely due to triggering stop condition
``````output
Call number: 15
```
### 在LangGraph中

我们可以像之前一样使用[`state_modifier`](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent)，在传入[提示词模板](#prompt-templates)时。


```python
from langgraph.errors import GraphRecursionError
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState

magic_step_num = 1


@tool
def magic_function(input: int) -> int:
    """Applies a magic function to an input."""
    global magic_step_num
    print(f"Call number: {magic_step_num}")
    magic_step_num += 1
    return input + magic_step_num


tools = [magic_function]


def _modify_state_messages(state: AgentState):
    # Give the agent amnesia, only keeping the original user query
    return [("system", "You are a helpful assistant"), state["messages"][0]]


app = create_react_agent(model, tools, state_modifier=_modify_state_messages)

try:
    for step in app.stream({"messages": [("human", query)]}, stream_mode="updates"):
        pass
except GraphRecursionError as e:
    print("Stopping agent prematurely due to triggering stop condition")
```
```output
Call number: 1
Call number: 2
Call number: 3
Call number: 4
Call number: 5
Call number: 6
Call number: 7
Call number: 8
Call number: 9
Call number: 10
Call number: 11
Call number: 12
Stopping agent prematurely due to triggering stop condition
```
## 下一步

您现在已经学习了如何将您的LangChain代理执行器迁移到LangGraph。

接下来，查看其他[LangGraph使用指南](https://langchain-ai.github.io/langgraph/how-tos/)。
