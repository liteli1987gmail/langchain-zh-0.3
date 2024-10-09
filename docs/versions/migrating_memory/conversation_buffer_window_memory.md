---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_memory/conversation_buffer_window_memory.ipynb
---
# 从 ConversationBufferWindowMemory 或 ConversationTokenBufferMemory 迁移

如果您尝试从下面列出的旧内存类迁移，请遵循本指南：


| 内存类型                          | 描述                                                                                                                                                       |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ConversationBufferWindowMemory` | 保留对话的最后 `n` 条消息。当消息数量超过 `n` 条时，删除最旧的消息。                                                                      |
| `ConversationTokenBufferMemory`  | 仅保留对话中最近的消息，前提是对话中的总令牌数不超过某个限制。 |

`ConversationBufferWindowMemory` 和 `ConversationTokenBufferMemory` 在原始对话历史上应用额外处理，以将对话历史修剪到适合聊天模型上下文窗口的大小。

此处理功能可以使用 LangChain 内置的 [trim_messages](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html) 函数来实现。

:::important

我们将首先探索一种简单的方法，涉及对整个对话历史应用处理逻辑。

虽然这种方法易于实现，但它有一个缺点：随着对话的增长，延迟也会增加，因为逻辑在每次轮换时都会重新应用于对话中的所有先前交流。

更高级的策略专注于逐步更新对话历史，以避免冗余处理。

例如，langgraph [关于摘要的操作指南](https://langchain-ai.github.io/langgraph/how-tos/memory/add-summary-conversation-history/) 演示了
如何维护对话的实时摘要，同时丢弃较旧的消息，确保它们在后续回合中不会被重新处理。
:::

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

## 使用 LLMChain / 会话链的遗留用法

<details open>


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ConversationBufferWindowMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer_window.ConversationBufferWindowMemory.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
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
        SystemMessage(content="You are a helpful assistant."),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

# highlight-start
memory = ConversationBufferWindowMemory(memory_key="chat_history", return_messages=True)
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
print(legacy_result)
```
```output
{'text': 'Nice to meet you, Bob! How can I assist you today?', 'chat_history': []}
{'text': 'Your name is Bob. How can I assist you further, Bob?', 'chat_history': [HumanMessage(content='my name is bob', additional_kwargs={}, response_metadata={}), AIMessage(content='Nice to meet you, Bob! How can I assist you today?', additional_kwargs={}, response_metadata={})]}
```
</details>

## 重新实现 ConversationBufferWindowMemory 逻辑

让我们首先创建适当的逻辑来处理聊天历史，然后我们将看到如何将其集成到应用程序中。您可以稍后用更高级的逻辑替换此基本设置，以满足您的特定需求。

我们将使用 `trim_messages` 来实现逻辑，以保留聊天的最后 `n` 条消息。当消息数量超过 `n` 时，它将删除最旧的消息。

此外，如果系统消息存在，我们也将保留它 -- 当存在时，它是包含聊天模型指令的会话中的第一条消息。


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    trim_messages,
)
from langchain_openai import ChatOpenAI

messages = [
    SystemMessage("you're a good assistant, you always respond with a joke."),
    HumanMessage("i wonder why it's called langchain"),
    AIMessage(
        'Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!'
    ),
    HumanMessage("and who is harrison chasing anyways"),
    AIMessage(
        "Hmmm let me think.\n\nWhy, he's probably chasing after the last cup of coffee in the office!"
    ),
    HumanMessage("why is 42 always the answer?"),
    AIMessage(
        "Because it’s the only number that’s constantly right, even when it doesn’t add up!"
    ),
    HumanMessage("What did the cow say?"),
]
```


```python
<!--IMPORTS:[{"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
from langchain_core.messages import trim_messages

selected_messages = trim_messages(
    messages,
    token_counter=len,  # <-- len will simply count the number of messages rather than tokens
    max_tokens=5,  # <-- allow up to 5 messages.
    strategy="last",
    # The start_on is specified
    # to make sure we do not generate a sequence where
    # a ToolMessage that contains the result of a tool invocation
    # appears before the AIMessage that requested a tool invocation
    # as this will cause some chat models to raise an error.
    start_on=("human", "ai"),
    include_system=True,  # <-- Keep the system message
    allow_partial=False,
)

for msg in selected_messages:
    msg.pretty_print()
```
```output
================================[1m System Message [0m================================

you're a good assistant, you always respond with a joke.
==================================[1m Ai Message [0m==================================

Hmmm let me think.

Why, he's probably chasing after the last cup of coffee in the office!
================================[1m Human Message [0m=================================

why is 42 always the answer?
==================================[1m Ai Message [0m==================================

Because it’s the only number that’s constantly right, even when it doesn’t add up!
================================[1m Human Message [0m=================================

What did the cow say?
```
## 重新实现 ConversationTokenBufferMemory 逻辑

在这里，我们将使用 `trim_messages` 来保留系统消息和会话中最近的消息，前提是会话中的总令牌数不超过某个限制。



```python
<!--IMPORTS:[{"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
from langchain_core.messages import trim_messages

selected_messages = trim_messages(
    messages,
    # Please see API reference for trim_messages for other ways to specify a token counter.
    token_counter=ChatOpenAI(model="gpt-4o"),
    max_tokens=80,  # <-- token limit
    # The start_on is specified
    # to make sure we do not generate a sequence where
    # a ToolMessage that contains the result of a tool invocation
    # appears before the AIMessage that requested a tool invocation
    # as this will cause some chat models to raise an error.
    start_on=("human", "ai"),
    strategy="last",
    include_system=True,  # <-- Keep the system message
)

for msg in selected_messages:
    msg.pretty_print()
```
```output
================================[1m System Message [0m================================

you're a good assistant, you always respond with a joke.
================================[1m Human Message [0m=================================

why is 42 always the answer?
==================================[1m Ai Message [0m==================================

Because it’s the only number that’s constantly right, even when it doesn’t add up!
================================[1m Human Message [0m=================================

What did the cow say?
```
## 使用 LangGraph 的现代用法

下面的示例展示了如何使用 LangGraph 添加简单的会话预处理逻辑。

:::note

如果您想避免每次都在整个聊天历史上运行计算，可以遵循
关于摘要的[操作指南](https://langchain-ai.github.io/langgraph/how-tos/memory/add-summary-conversation-history/)，演示了
如何丢弃旧消息，确保它们在后续回合中不会被重新处理。

:::

<details open>


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
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
    # highlight-start
    selected_messages = trim_messages(
        state["messages"],
        token_counter=len,  # <-- len will simply count the number of messages rather than tokens
        max_tokens=5,  # <-- allow up to 5 messages.
        strategy="last",
        # The start_on is specified
        # to make sure we do not generate a sequence where
        # a ToolMessage that contains the result of a tool invocation
        # appears before the AIMessage that requested a tool invocation
        # as this will cause some chat models to raise an error.
        start_on=("human", "ai"),
        include_system=True,  # <-- Keep the system message
        allow_partial=False,
    )

    # highlight-end
    response = model.invoke(selected_messages)
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
thread_id = uuid.uuid4()
# highlight-next-line
config = {"configurable": {"thread_id": thread_id}}

input_message = HumanMessage(content="hi! I'm bob")
for event in app.stream({"messages": [input_message]}, config, stream_mode="values"):
    event["messages"][-1].pretty_print()

# Here, let's confirm that the AI remembers our name!
config = {"configurable": {"thread_id": thread_id}}
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

Your name is Bob. How can I help you, Bob?
```
</details>

## 使用预构建的langgraph代理

此示例展示了如何使用[create_tool_calling_agent](https://api.python.langchain.com/en/latest/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html)函数构建的预构建代理的代理执行器。

如果您使用的是[旧版LangChain预构建代理](https://python.langchain.com/v0.1/docs/modules/agents/agent_types/)，您应该能够
用新的[langgraph预构建代理](https://langchain-ai.github.io/langgraph/how-tos/create-react-agent/)替换该代码，该代理利用
聊天模型的原生工具调用能力，并且可能会更好地开箱即用。

<details open>


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
import uuid

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    trim_messages,
)
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


memory = MemorySaver()
model = ChatOpenAI()


# highlight-start
def state_modifier(state) -> list[BaseMessage]:
    """Given the agent state, return a list of messages for the chat model."""
    # We're using the message processor defined above.
    return trim_messages(
        state["messages"],
        token_counter=len,  # <-- len will simply count the number of messages rather than tokens
        max_tokens=5,  # <-- allow up to 5 messages.
        strategy="last",
        # The start_on is specified
        # to make sure we do not generate a sequence where
        # a ToolMessage that contains the result of a tool invocation
        # appears before the AIMessage that requested a tool invocation
        # as this will cause some chat models to raise an error.
        start_on=("human", "ai"),
        include_system=True,  # <-- Keep the system message
        allow_partial=False,
    )


# highlight-end

app = create_react_agent(
    model,
    tools=[get_user_age],
    checkpointer=memory,
    # highlight-next-line
    state_modifier=state_modifier,
)

# The thread id is a unique key that identifies
# this particular conversation.
# We'll just generate a random uuid here.
thread_id = uuid.uuid4()
config = {"configurable": {"thread_id": thread_id}}

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
  get_user_age (call_jsMvoIFv970DhqqLCJDzPKsp)
 Call ID: call_jsMvoIFv970DhqqLCJDzPKsp
  Args:
    name: bob
=================================[1m Tool Message [0m=================================
Name: get_user_age

42 years old
==================================[1m Ai Message [0m==================================

Bob, you are 42 years old.
================================[1m Human Message [0m=================================

do you remember my name?
==================================[1m Ai Message [0m==================================

Yes, your name is Bob.
```
</details>

## LCEL：添加预处理步骤

添加复杂的对话管理的最简单方法是在聊天模型前引入一个预处理步骤，并将完整的对话历史传递给预处理步骤。

这种方法在概念上很简单，并且在许多情况下都能工作；例如，如果使用[RunnableWithMessageHistory](/docs/how_to/message_history/)而不是包装聊天模型，则用预处理器包装聊天模型。

这种方法明显的缺点是，随着对话历史的增长，延迟开始增加，原因有两个：

1. 随着对话变长，可能需要从您用于存储对话历史的任何存储中获取更多数据（如果不将其存储在内存中）。
2. 预处理逻辑最终会进行大量冗余计算，重复对话之前步骤的计算。

:::caution

如果您想使用聊天模型的工具调用功能，请记得在将历史预处理步骤添加到模型之前，将工具绑定到模型！

:::

<details open>


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating off ConversationBufferWindowMemory or ConversationTokenBufferMemory"}]-->
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    trim_messages,
)
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI()


@tool
def what_did_the_cow_say() -> str:
    """Check to see what the cow said."""
    return "foo"


# highlight-start
message_processor = trim_messages(  # Returns a Runnable if no messages are provided
    token_counter=len,  # <-- len will simply count the number of messages rather than tokens
    max_tokens=5,  # <-- allow up to 5 messages.
    strategy="last",
    # The start_on is specified
    # to make sure we do not generate a sequence where
    # a ToolMessage that contains the result of a tool invocation
    # appears before the AIMessage that requested a tool invocation
    # as this will cause some chat models to raise an error.
    start_on=("human", "ai"),
    include_system=True,  # <-- Keep the system message
    allow_partial=False,
)
# highlight-end

# Note that we bind tools to the model first!
model_with_tools = model.bind_tools([what_did_the_cow_say])

# highlight-next-line
model_with_preprocessor = message_processor | model_with_tools

full_history = [
    SystemMessage("you're a good assistant, you always respond with a joke."),
    HumanMessage("i wonder why it's called langchain"),
    AIMessage(
        'Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!'
    ),
    HumanMessage("and who is harrison chasing anyways"),
    AIMessage(
        "Hmmm let me think.\n\nWhy, he's probably chasing after the last cup of coffee in the office!"
    ),
    HumanMessage("why is 42 always the answer?"),
    AIMessage(
        "Because it’s the only number that’s constantly right, even when it doesn’t add up!"
    ),
    HumanMessage("What did the cow say?"),
]


# We pass it explicity to the model_with_preprocesor for illustrative purposes.
# If you're using `RunnableWithMessageHistory` the history will be automatically
# read from the source the you configure.
model_with_preprocessor.invoke(full_history).pretty_print()
```
```output
==================================[1m Ai Message [0m==================================
Tool Calls:
  what_did_the_cow_say (call_urHTB5CShhcKz37QiVzNBlIS)
 Call ID: call_urHTB5CShhcKz37QiVzNBlIS
  Args:
```
</details>

如果您需要实现更高效的逻辑，并且想要使用 `RunnableWithMessageHistory`，目前实现此目的的方法
是从 [BaseChatMessageHistory](https://api.python.langchain.com/en/latest/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html) 子类化，并
为 `add_messages` 定义适当的逻辑（而不是简单地附加历史，而是重写它）。

除非您有充分的理由实现此解决方案，否则您应该使用 LangGraph。

## 下一步

探索与 LangGraph 的持久性：

* [LangGraph 快速入门教程](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
* [如何为您的图添加持久性（“记忆”）](https://langchain-ai.github.io/langgraph/how-tos/persistence/)
* [如何管理对话历史](https://langchain-ai.github.io/langgraph/how-tos/memory/manage-conversation-history/)
* [如何添加对话历史的摘要](https://langchain-ai.github.io/langgraph/how-tos/memory/add-summary-conversation-history/)

使用简单的 LCEL 添加持久性（对于更复杂的用例请使用 langgraph）：

* [如何添加消息历史](/docs/how_to/message_history/)

处理消息历史：

* [如何修剪消息](/docs/how_to/trim_messages)
* [如何过滤消息](/docs/how_to/filter_messages/)
* [如何合并消息运行](/docs/how_to/merge_message_runs/)

