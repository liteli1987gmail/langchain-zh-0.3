---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/conversation_chain.ipynb
---
# 从ConversationChain迁移

[`ConversationChain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.conversation.base.ConversationChain.html) 结合了之前消息的记忆，以维持有状态的对话。

切换到LCEL实现的一些优势包括：

- 天生支持线程/独立会话。要使其与`ConversationChain`一起工作，您需要在链外实例化一个单独的记忆类。
- 更明确的参数。`ConversationChain`包含一个隐藏的默认提示，这可能会导致混淆。
- 支持流式处理。`ConversationChain`仅通过回调支持流式处理。

`RunnableWithMessageHistory`通过配置参数实现会话。它应该与一个返回[聊天消息历史](https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html)的可调用对象一起实例化。默认情况下，它期望此函数接受一个参数`session_id`。


```python
%pip install --upgrade --quiet langchain langchain-openai
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 传统

<details open>


```python
<!--IMPORTS:[{"imported": "ConversationChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.conversation.base.ConversationChain.html", "title": "Migrating from ConversationalChain"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Migrating from ConversationalChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from ConversationalChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from ConversationalChain"}]-->
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

template = """
You are a pirate. Answer the following questions as best you can.
Chat history: {history}
Question: {input}
"""

prompt = ChatPromptTemplate.from_template(template)

memory = ConversationBufferMemory()

chain = ConversationChain(
    llm=ChatOpenAI(),
    memory=memory,
    prompt=prompt,
)

chain({"input": "how are you?"})
```



```output
{'input': 'how are you?',
 'history': '',
 'response': "Arr matey, I be doin' well on the high seas, plunderin' and pillagin' as usual. How be ye?"}
```


</details>

## LCEL

<details open>


```python
<!--IMPORTS:[{"imported": "InMemoryChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.InMemoryChatMessageHistory.html", "title": "Migrating from ConversationalChain"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from ConversationalChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from ConversationalChain"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Migrating from ConversationalChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from ConversationalChain"}]-->
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a pirate. Answer the following questions as best you can."),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
    ]
)

history = InMemoryChatMessageHistory()


def get_history():
    return history


chain = prompt | ChatOpenAI() | StrOutputParser()

wrapped_chain = RunnableWithMessageHistory(
    chain,
    get_history,
    history_messages_key="chat_history",
)

wrapped_chain.invoke({"input": "how are you?"})
```



```output
"Arr, me matey! I be doin' well, sailin' the high seas and searchin' for treasure. How be ye?"
```


上述示例对所有会话使用相同的 `history`。下面的示例展示了如何为每个会话使用不同的聊天历史。


```python
<!--IMPORTS:[{"imported": "BaseChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html", "title": "Migrating from ConversationalChain"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Migrating from ConversationalChain"}]-->
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


chain = prompt | ChatOpenAI() | StrOutputParser()

wrapped_chain = RunnableWithMessageHistory(
    chain,
    get_session_history,
    history_messages_key="chat_history",
)

wrapped_chain.invoke(
    {"input": "Hello!"},
    config={"configurable": {"session_id": "abc123"}},
)
```



```output
'Ahoy there, me hearty! What can this old pirate do for ye today?'
```


</details>

## 下一步

请参阅[本教程](/docs/tutorials/chatbot)，获取关于使用[`RunnableWithMessageHistory`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html)的更全面的构建指南。

查看[LCEL 概念文档](/docs/concepts/#langchain-expression-language-lcel)，以获取更多背景信息。
