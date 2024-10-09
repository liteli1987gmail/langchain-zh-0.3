---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/chatbot.ipynb
sidebar_position: 1
keywords: [conversationchain]
---
# 构建一个聊天机器人

:::info Prerequisites

本指南假设您对以下概念有所了解：

- [聊天模型](/docs/concepts/#chat-models)
- [提示词模板](/docs/concepts/#prompt-templates)
- [聊天历史](/docs/concepts/#chat-history)

:::

## 概述

我们将通过一个示例来设计和实现一个基于大型语言模型的聊天机器人。
这个聊天机器人将能够进行对话并记住之前的互动。


请注意，我们构建的这个聊天机器人将仅使用语言模型进行对话。
您可能还在寻找其他几个相关概念：

- [对话式RAG](/docs/tutorials/qa_chat_history): 在外部数据源上启用聊天机器人体验
- [代理](/docs/tutorials/agents): 构建一个可以采取行动的聊天机器人

本教程将涵盖基础知识，这对这两个更高级的主题将有所帮助，但如果您选择，可以直接跳到那里。

## 设置

### Jupyter Notebook

本指南（以及文档中的大多数其他指南）使用 [Jupyter notebooks](https://jupyter.org/) 并假设读者也是如此。Jupyter notebooks 非常适合学习如何使用大型语言模型系统，因为有时事情可能会出错（意外输出、API故障等），在交互环境中浏览指南是更好地理解它们的好方法。

本教程和其他教程可能最方便地在 Jupyter notebook 中运行。有关如何安装的说明，请参见 [这里](https://jupyter.org/install)。

### 安装

要安装 LangChain，请运行：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from "@theme/CodeBlock";

<Tabs>
  <TabItem value="pip" label="Pip" default>
    <CodeBlock language="bash">pip install langchain</CodeBlock>
  </TabItem>
  <TabItem value="conda" label="Conda">
    <CodeBlock language="bash">conda install langchain -c conda-forge</CodeBlock>
  </TabItem>
</Tabs>



有关更多详细信息，请参阅我们的[安装指南](/docs/how_to/installation)。

### LangSmith

您使用LangChain构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。
随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。
做到这一点的最佳方法是使用[LangSmith](https://smith.langchain.com)。

在您注册上述链接后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 快速入门

首先，让我们学习如何单独使用语言模型。LangChain支持许多不同的语言模型，您可以互换使用 - 请选择您想要使用的模型！

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs openaiParams={`model="gpt-3.5-turbo"`} />


让我们首先直接使用模型。`ChatModel`是LangChain“运行接口”的实例，这意味着它们提供了一个标准接口供我们与之交互。要简单地调用模型，我们可以将消息列表传递给`.invoke`方法。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Build a Chatbot"}]-->
from langchain_core.messages import HumanMessage

model.invoke([HumanMessage(content="Hi! I'm Bob")])
```



```output
AIMessage(content='Hello Bob! How can I assist you today?', response_metadata={'token_usage': {'completion_tokens': 10, 'prompt_tokens': 12, 'total_tokens': 22}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-d939617f-0c3b-45e9-a93f-13dafecbd4b5-0', usage_metadata={'input_tokens': 12, 'output_tokens': 10, 'total_tokens': 22})
```


模型本身没有任何状态概念。例如，如果您问一个后续问题：


```python
model.invoke([HumanMessage(content="What's my name?")])
```



```output
AIMessage(content="I'm sorry, I don't have access to personal information unless you provide it to me. How may I assist you today?", response_metadata={'token_usage': {'completion_tokens': 26, 'prompt_tokens': 12, 'total_tokens': 38}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-47bc8c20-af7b-4fd2-9345-f0e9fdf18ce3-0', usage_metadata={'input_tokens': 12, 'output_tokens': 26, 'total_tokens': 38})
```


让我们看看示例[LangSmith追踪](https://smith.langchain.com/public/5c21cb92-2814-4119-bae9-d02b8db577ac/r)

我们可以看到它没有将之前的对话轮次作为上下文，因此无法回答问题。
这会导致糟糕的聊天机器人体验！

为了绕过这个问题，我们需要将整个对话历史传递给模型。让我们看看这样做会发生什么：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Build a Chatbot"}]-->
from langchain_core.messages import AIMessage

model.invoke(
    [
        HumanMessage(content="Hi! I'm Bob"),
        AIMessage(content="Hello Bob! How can I assist you today?"),
        HumanMessage(content="What's my name?"),
    ]
)
```



```output
AIMessage(content='Your name is Bob. How can I help you, Bob?', response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 35, 'total_tokens': 48}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-9f90291b-4df9-41dc-9ecf-1ee1081f4490-0', usage_metadata={'input_tokens': 35, 'output_tokens': 13, 'total_tokens': 48})
```


现在我们可以看到我们得到了一个好的回应！

这是支撑聊天机器人进行对话交互的基本理念。
那么我们如何最好地实现这一点呢？

## 消息历史

我们可以使用消息历史类来包装我们的模型，使其具有状态。
这将跟踪模型的输入和输出，并将其存储在某个数据存储中。
未来的交互将加载这些消息，并将其作为输入的一部分传递给链。
让我们看看如何使用这个！

首先，让我们确保安装 `langchain-community`，因为我们将使用其中的集成来存储消息历史。


```python
%pip install langchain_community
```

之后，我们可以导入相关类并设置我们的链，该链包装模型并添加此消息历史。这里的一个关键部分是我们作为 `get_session_history` 传入的函数。这个函数预计接受一个 `session_id` 并返回一个消息历史对象。这个 `session_id` 用于区分不同的对话，并应作为配置的一部分在调用新链时传入（我们将展示如何做到这一点）。


```python
<!--IMPORTS:[{"imported": "BaseChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html", "title": "Build a Chatbot"}, {"imported": "InMemoryChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.InMemoryChatMessageHistory.html", "title": "Build a Chatbot"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Build a Chatbot"}]-->
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(model, get_session_history)
```

我们现在需要创建一个 `config`，每次都传递给可运行的部分。这个配置包含的信息并不是直接作为输入的一部分，但仍然是有用的。在这种情况下，我们想要包含一个 `session_id`。这应该看起来像：


```python
config = {"configurable": {"session_id": "abc2"}}
```


```python
response = with_message_history.invoke(
    [HumanMessage(content="Hi! I'm Bob")],
    config=config,
)

response.content
```



```output
'Hi Bob! How can I assist you today?'
```



```python
response = with_message_history.invoke(
    [HumanMessage(content="What's my name?")],
    config=config,
)

response.content
```



```output
'Your name is Bob. How can I help you today, Bob?'
```


太好了！我们的聊天机器人现在记住了关于我们的事情。如果我们更改配置以引用不同的 `session_id`，我们可以看到它开始新的对话。


```python
config = {"configurable": {"session_id": "abc3"}}

response = with_message_history.invoke(
    [HumanMessage(content="What's my name?")],
    config=config,
)

response.content
```



```output
"I'm sorry, I cannot determine your name as I am an AI assistant and do not have access to that information."
```


然而，我们始终可以回到原始对话（因为我们将其保存在数据库中）


```python
config = {"configurable": {"session_id": "abc2"}}

response = with_message_history.invoke(
    [HumanMessage(content="What's my name?")],
    config=config,
)

response.content
```



```output
'Your name is Bob. How can I assist you today, Bob?'
```


这就是我们如何支持聊天机器人与多个用户进行对话的方式！

现在，我们所做的只是为模型添加了一个简单的持久化层。我们可以通过添加提示词模板来使其变得更加复杂和个性化。

## 提示词模板

提示词模板帮助将原始用户信息转换为大型语言模型可以处理的格式。在这种情况下，原始用户输入只是一个消息，我们将其传递给大型语言模型。现在让我们使其变得更复杂一些。首先，让我们添加一个带有一些自定义指令的系统消息（但仍然将消息作为输入）。接下来，我们将添加除了消息之外的更多输入。

首先，让我们添加一个系统消息。为此，我们将创建一个 ChatPromptTemplate。我们将利用 `MessagesPlaceholder` 来传递所有消息。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a Chatbot"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Build a Chatbot"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | model
```

请注意，这稍微改变了输入类型 - 我们现在传递的是一个包含 `messages` 键的字典，其中包含一系列消息，而不是传递消息列表。


```python
response = chain.invoke({"messages": [HumanMessage(content="hi! I'm bob")]})

response.content
```



```output
'Hello Bob! How can I assist you today?'
```


我们现在可以将其包装在与之前相同的消息历史对象中


```python
with_message_history = RunnableWithMessageHistory(chain, get_session_history)
```


```python
config = {"configurable": {"session_id": "abc5"}}
```


```python
response = with_message_history.invoke(
    [HumanMessage(content="Hi! I'm Jim")],
    config=config,
)

response.content
```



```output
'Hello, Jim! How can I assist you today?'
```



```python
response = with_message_history.invoke(
    [HumanMessage(content="What's my name?")],
    config=config,
)

response.content
```



```output
'Your name is Jim.'
```


太棒了！现在让我们使我们的提示变得更复杂一点。假设提示模板现在看起来像这样：


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability in {language}.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | model
```

请注意，我们在提示中添加了一个新的 `language` 输入。我们现在可以调用链并传入我们选择的语言。


```python
response = chain.invoke(
    {"messages": [HumanMessage(content="hi! I'm bob")], "language": "Spanish"}
)

response.content
```



```output
'¡Hola, Bob! ¿En qué puedo ayudarte hoy?'
```


现在让我们将这个更复杂的链封装在一个消息历史类中。这次，由于输入中有多个键，我们需要指定正确的键来保存聊天历史。


```python
with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="messages",
)
```


```python
config = {"configurable": {"session_id": "abc11"}}
```


```python
response = with_message_history.invoke(
    {"messages": [HumanMessage(content="hi! I'm todd")], "language": "Spanish"},
    config=config,
)

response.content
```



```output
'¡Hola Todd! ¿En qué puedo ayudarte hoy?'
```



```python
response = with_message_history.invoke(
    {"messages": [HumanMessage(content="whats my name?")], "language": "Spanish"},
    config=config,
)

response.content
```



```output
'Tu nombre es Todd.'
```


为了帮助您理解内部发生的事情，请查看 [这个 LangSmith 跟踪](https://smith.langchain.com/public/f48fabb6-6502-43ec-8242-afc352b769ed/r)。

## 管理对话历史

构建聊天机器人时，一个重要的概念是如何管理对话历史。如果不加以管理，消息列表将无限增长，并可能溢出大型语言模型的上下文窗口。因此，添加一个限制您传入消息大小的步骤是很重要的。

**重要的是，您需要在提示模板之前但在从消息历史加载之前的消息之后执行此操作。**

我们可以通过在提示前添加一个简单的步骤，适当地修改 `messages` 键，然后将该新链封装在消息历史类中来实现。

LangChain 提供了一些内置的助手来 [管理消息列表](/docs/how_to/#messages)。在这种情况下，我们将使用 [trim_messages](/docs/how_to/trim_messages/) 助手来减少我们发送给模型的消息数量。修剪器允许我们指定希望保留的令牌数量，以及其他参数，例如是否希望始终保留系统消息以及是否允许部分消息：


```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Build a Chatbot"}, {"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "Build a Chatbot"}]-->
from langchain_core.messages import SystemMessage, trim_messages

trimmer = trim_messages(
    max_tokens=65,
    strategy="last",
    token_counter=model,
    include_system=True,
    allow_partial=False,
    start_on="human",
)

messages = [
    SystemMessage(content="you're a good assistant"),
    HumanMessage(content="hi! I'm bob"),
    AIMessage(content="hi!"),
    HumanMessage(content="I like vanilla ice cream"),
    AIMessage(content="nice"),
    HumanMessage(content="whats 2 + 2"),
    AIMessage(content="4"),
    HumanMessage(content="thanks"),
    AIMessage(content="no problem!"),
    HumanMessage(content="having fun?"),
    AIMessage(content="yes!"),
]

trimmer.invoke(messages)
```



```output
[SystemMessage(content="you're a good assistant"),
 HumanMessage(content='whats 2 + 2'),
 AIMessage(content='4'),
 HumanMessage(content='thanks'),
 AIMessage(content='no problem!'),
 HumanMessage(content='having fun?'),
 AIMessage(content='yes!')]
```


要在我们的链中使用它，我们只需在将 `messages` 输入传递给提示之前运行修剪器。

现在如果我们尝试询问模型我们的名字，它将不知道，因为我们修剪了聊天历史的那部分：


```python
<!--IMPORTS:[{"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Build a Chatbot"}]-->
from operator import itemgetter

from langchain_core.runnables import RunnablePassthrough

chain = (
    RunnablePassthrough.assign(messages=itemgetter("messages") | trimmer)
    | prompt
    | model
)

response = chain.invoke(
    {
        "messages": messages + [HumanMessage(content="what's my name?")],
        "language": "English",
    }
)
response.content
```



```output
"I'm sorry, but I don't have access to your personal information. How can I assist you today?"
```


但是如果我们询问最近几条消息中的信息，它会记住：


```python
response = chain.invoke(
    {
        "messages": messages + [HumanMessage(content="what math problem did i ask")],
        "language": "English",
    }
)
response.content
```



```output
'You asked "what\'s 2 + 2?"'
```


现在让我们将其包装在消息历史中


```python
with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="messages",
)

config = {"configurable": {"session_id": "abc20"}}
```


```python
response = with_message_history.invoke(
    {
        "messages": messages + [HumanMessage(content="whats my name?")],
        "language": "English",
    },
    config=config,
)

response.content
```



```output
"I'm sorry, I don't have access to that information. How can I assist you today?"
```


正如预期的那样，我们声明姓名的第一条消息已被删除。此外，聊天历史中现在有两条新消息（我们最新的问题和最新的回答）。这意味着以前可以在我们的对话历史中访问的更多信息现在不再可用！在这种情况下，我们最初的数学问题也已从历史中删除，因此模型不再知道它：


```python
response = with_message_history.invoke(
    {
        "messages": [HumanMessage(content="what math problem did i ask?")],
        "language": "English",
    },
    config=config,
)

response.content
```



```output
"You haven't asked a math problem yet. Feel free to ask any math-related question you have, and I'll be happy to help you with it."
```


如果你查看LangSmith，你可以准确地看到在[LangSmith追踪](https://smith.langchain.com/public/a64b8b7c-1fd6-4dbb-b11a-47cd09a5e4f1/r)中发生了什么。

## 流式处理

现在我们有了一个功能齐全的聊天机器人。然而，对于聊天机器人应用程序来说，一个*非常*重要的用户体验考虑是流式处理。大型语言模型有时可能需要一段时间才能响应，因此为了改善用户体验，大多数应用程序所做的一件事是随着每个令牌的生成流回。这样用户就可以看到进度。

实际上，这非常简单！

所有链都暴露一个`.stream`方法，使用消息历史的链也不例外。我们可以简单地使用该方法获取流式响应。


```python
config = {"configurable": {"session_id": "abc15"}}
for r in with_message_history.stream(
    {
        "messages": [HumanMessage(content="hi! I'm todd. tell me a joke")],
        "language": "English",
    },
    config=config,
):
    print(r.content, end="|")
```
```output
|Hi| Todd|!| Sure|,| here|'s| a| joke| for| you|:| Why| couldn|'t| the| bicycle| find| its| way| home|?| Because| it| lost| its| bearings|!| 😄||
```
## 下一步

现在你了解了如何在LangChain中创建聊天机器人的基础知识，你可能感兴趣的一些更高级的教程是：

- [对话式RAG](/docs/tutorials/qa_chat_history): 在外部数据源上启用聊天机器人体验
- [代理](/docs/tutorials/agents): 构建一个可以采取行动的聊天机器人

如果你想深入了解具体内容，值得查看的有：

- [流式处理](/docs/how_to/streaming): 流式处理对聊天应用程序是*至关重要*的
- [如何添加消息历史](/docs/how_to/message_history): 深入了解与消息历史相关的所有内容
- [如何管理大量消息历史](/docs/how_to/trim_messages/): 管理大量聊天历史的更多技巧
