---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_memory/conversation_buffer_memory.ipynb
---
# 从 ConversationBufferMemory 或 ConversationStringBufferMemory 迁移

[ConversationBufferMemory](https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html)
和 [ConversationStringBufferMemory](https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationStringBufferMemory.html)
用于跟踪人类与 AI 助手之间的对话，而无需任何额外处理。


:::note
`ConversationStringBufferMemory` 相当于 `ConversationBufferMemory`，但针对的是不是聊天模型的大型语言模型（LLMs）。
:::

使用现有现代原语处理对话历史的方法有：

1. 使用 [LangGraph 持久化](https://langchain-ai.github.io/langgraph/how-tos/persistence/) 以及对消息历史的适当处理
2. 使用 LCEL 与 [RunnableWithMessageHistory](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html#) 结合对消息历史的适当处理。

大多数用户会发现 [LangGraph 持久化](https://langchain-ai.github.io/langgraph/how-tos/persistence/) 比等效的 LCEL 更易于使用和配置，特别是对于更复杂的用例。

## 设置


```python
%%capture --no-stderr
%pip install --upgrade --quiet langchain-openai langchain
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 与LLMChain / ConversationChain的使用

本节展示如何从与`LLMChain`或`ConversationChain`一起使用的`ConversationBufferMemory`或`ConversationStringBufferMemory`迁移。

### 旧版

以下是`ConversationBufferMemory`与`LLMChain`或等效的`ConversationChain`的示例用法。

<details open>


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}]-->
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate(
    [
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

# highlight-start
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
# highlight-end

legacy_chain = LLMChain(
    llm=ChatOpenAI(),
    prompt=prompt,
    # highlight-next-line
    memory=memory,
)

legacy_result = legacy_chain.invoke({"text": "my name is bob"})
print(legacy_result)

legacy_result = legacy_chain.invoke({"text": "what was my name"})
```
```output
{'text': 'Hello Bob! How can I assist you today?', 'chat_history': [HumanMessage(content='my name is bob', additional_kwargs={}, response_metadata={}), AIMessage(content='Hello Bob! How can I assist you today?', additional_kwargs={}, response_metadata={})]}
```

```python
legacy_result["text"]
```



```output
'Your name is Bob. How can I assist you today, Bob?'
```


:::note
请注意，单个内存对象中不支持分离对话线程
:::

</details>

### LangGraph

下面的示例展示了如何使用LangGraph实现带有`ConversationBufferMemory`的`ConversationChain`或`LLMChain`。

本示例假设您对`LangGraph`已有一定了解。如果您不熟悉，请参阅[LangGraph快速入门指南](https://langchain-ai.github.io/langgraph/tutorials/introduction/)以获取更多详细信息。

`LangGraph`提供了许多额外功能（例如，时间旅行和中断），并且适用于其他更复杂（和现实）的架构。

<details open>


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}]-->
import uuid

from IPython.display import Image, display
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph

# Define a new graph
workflow = StateGraph(state_schema=MessagesState)

# Define a chat model
model = ChatOpenAI()


# Define the function that calls the model
def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    # We return a list, because this will get added to the existing list
    return {"messages": response}


# Define the two nodes we will cycle between
workflow.add_edge(START, "model")
workflow.add_node("model", call_model)


# Adding memory is straight forward in langgraph!
# highlight-next-line
memory = MemorySaver()

app = workflow.compile(
    # highlight-next-line
    checkpointer=memory
)


# The thread id is a unique key that identifies
# this particular conversation.
# We'll just generate a random uuid here.
# This enables a single application to manage conversations among multiple users.
thread_id = uuid.uuid4()
# highlight-next-line
config = {"configurable": {"thread_id": thread_id}}


input_message = HumanMessage(content="hi! I'm bob")
for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()

# Here, let's confirm that the AI remembers our name!
input_message = HumanMessage(content="what was my name?")
for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

hi! I'm bob
==================================[1m Ai Message [0m==================================

Hello Bob! How can I assist you today?
================================[1m Human Message [0m=================================

what was my name?
==================================[1m Ai Message [0m==================================

Your name is Bob. How can I help you today, Bob?
```
</details>

### LCEL RunnableWithMessageHistory

或者，如果您有一个简单的链，可以将链的聊天模型包装在 [RunnableWithMessageHistory](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html) 中。

有关更多信息，请参阅以下 [迁移指南](/docs/versions/migrating_chains/conversation_chain/)。


## 与预构建代理的使用

此示例展示了如何使用使用 [create_tool_calling_agent](https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html) 函数构建的预构建代理的代理执行器。

如果您正在使用其中一个 [旧的 LangChain 预构建代理](https://python.langchain.com/v0.1/docs/modules/agents/agent_types/)，您应该能够
用新的 [langgraph 预构建代理](https://langchain-ai.github.io/langgraph/how-tos/create-react-agent/) 替换该代码，该代理利用
聊天模型的原生工具调用能力，并且可能会更好地开箱即用。

### 旧版用法

<details open>


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.memory import ConversationBufferMemory
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0)


@tool
def get_user_age(name: str) -> str:
    """Use this tool to find the user's age."""
    # This is a placeholder for the actual implementation
    if "bob" in name.lower():
        return "42 years old"
    return "41 years old"


tools = [get_user_age]

prompt = ChatPromptTemplate.from_messages(
    [
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Construct the Tools agent
agent = create_tool_calling_agent(model, tools, prompt)
# Instantiate memory
# highlight-start
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
# highlight-end

# Create an agent
agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    # highlight-next-line
    memory=memory,  # Pass the memory to the executor
)

# Verify that the agent can use tools
print(agent_executor.invoke({"input": "hi! my name is bob what is my age?"}))
print()
# Verify that the agent has access to conversation history.
# The agent should be able to answer that the user's name is bob.
print(agent_executor.invoke({"input": "do you remember my name?"}))
```
```output
{'input': 'hi! my name is bob what is my age?', 'chat_history': [HumanMessage(content='hi! my name is bob what is my age?', additional_kwargs={}, response_metadata={}), AIMessage(content='Bob, you are 42 years old.', additional_kwargs={}, response_metadata={})], 'output': 'Bob, you are 42 years old.'}

{'input': 'do you remember my name?', 'chat_history': [HumanMessage(content='hi! my name is bob what is my age?', additional_kwargs={}, response_metadata={}), AIMessage(content='Bob, you are 42 years old.', additional_kwargs={}, response_metadata={}), HumanMessage(content='do you remember my name?', additional_kwargs={}, response_metadata={}), AIMessage(content='Yes, your name is Bob.', additional_kwargs={}, response_metadata={})], 'output': 'Yes, your name is Bob.'}
```
</details>

### LangGraph

您可以按照标准 LangChain 教程 [构建代理](/docs/tutorials/agents/) 来深入了解其工作原理。

这个示例在这里明确展示，以便用户更容易比较传统实现与相应的LangGraph实现。

这个示例展示了如何在LangGraph中为[预构建的React代理](https://langchain-ai.github.io/langgraph/reference/prebuilt/#create_react_agent)添加记忆。

有关更多详细信息，请参阅LangGraph中的[如何为预构建的ReAct代理添加记忆](https://langchain-ai.github.io/langgraph/how-tos/create-react-agent-memory/)指南。

<details open>


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory"}]-->
import uuid

from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent


@tool
def get_user_age(name: str) -> str:
    """Use this tool to find the user's age."""
    # This is a placeholder for the actual implementation
    if "bob" in name.lower():
        return "42 years old"
    return "41 years old"


# highlight-next-line
memory = MemorySaver()
model = ChatOpenAI()
app = create_react_agent(
    model,
    tools=[get_user_age],
    # highlight-next-line
    checkpointer=memory,
)

# highlight-start
# The thread id is a unique key that identifies
# this particular conversation.
# We'll just generate a random uuid here.
# This enables a single application to manage conversations among multiple users.
thread_id = uuid.uuid4()
config = {"configurable": {"thread_id": thread_id}}
# highlight-end

# Tell the AI that our name is Bob, and ask it to use a tool to confirm
# that it's capable of working like an agent.
input_message = HumanMessage(content="hi! I'm bob. What is my age?")

for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()

# Confirm that the chat bot has access to previous conversation
# and can respond to the user saying that the user's name is Bob.
input_message = HumanMessage(content="do you remember my name?")

for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

hi! I'm bob. What is my age?
==================================[1m Ai Message [0m==================================
Tool Calls:
  get_user_age (call_oEDwEbIDNdokwqhAV6Azn47c)
 Call ID: call_oEDwEbIDNdokwqhAV6Azn47c
  Args:
    name: bob
=================================[1m Tool Message [0m=================================
Name: get_user_age

42 years old
==================================[1m Ai Message [0m==================================

Bob, you are 42 years old! If you need any more assistance or information, feel free to ask.
================================[1m Human Message [0m=================================

do you remember my name?
==================================[1m Ai Message [0m==================================

Yes, your name is Bob. If you have any other questions or need assistance, feel free to ask!
```
如果我们使用不同的线程ID，它将开始一个新的对话，机器人将不知道我们的名字！


```python
config = {"configurable": {"thread_id": "123456789"}}

input_message = HumanMessage(content="hi! do you remember my name?")

for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

hi! do you remember my name?
==================================[1m Ai Message [0m==================================

Hello! Yes, I remember your name. It's great to see you again! How can I assist you today?
```
</details>

## 下一步

探索与LangGraph的持久性：

* [LangGraph快速入门教程](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
* [如何为您的图添加持久性（“记忆”）](https://langchain-ai.github.io/langgraph/how-tos/persistence/)
* [如何管理对话历史](https://langchain-ai.github.io/langgraph/how-tos/memory/manage-conversation-history/)
* [如何添加对话历史的摘要](https://langchain-ai.github.io/langgraph/how-tos/memory/add-summary-conversation-history/)

使用简单的 LCEL 添加持久性（对于更复杂的用例，建议使用 langgraph）：

* [如何添加消息历史](/docs/how_to/message_history/)

处理消息历史：

* [如何修剪消息](/docs/how_to/trim_messages)
* [如何过滤消息](/docs/how_to/filter_messages/)
* [如何合并消息运行](/docs/how_to/merge_message_runs/)

