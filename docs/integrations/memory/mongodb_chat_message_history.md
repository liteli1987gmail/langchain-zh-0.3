---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/mongodb_chat_message_history.ipynb
---
# MongoDB

>`MongoDB` 是一个源可用的跨平台文档导向数据库程序。被归类为 NoSQL 数据库程序，`MongoDB` 使用类似 `JSON` 的文档，具有可选的模式。
>
>`MongoDB` 由 MongoDB Inc. 开发，并根据服务器端公共许可证 (SSPL) 进行许可。 - [维基百科](https://en.wikipedia.org/wiki/MongoDB)

本笔记本介绍如何使用 `MongoDBChatMessageHistory` 类在 MongoDB 数据库中存储聊天消息历史。


## 设置

集成位于 `langchain-mongodb` 包中，因此我们需要安装它。

```bash
pip install -U --quiet langchain-mongodb
```

为了获得最佳的可观察性，设置 [LangSmith](https://smith.langchain.com/) 也是有帮助的（但不是必需的）


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用

要使用存储，您只需提供两样东西：

1. 会话 ID - 会话的唯一标识符，如用户名、电子邮件、聊天 ID 等。
2. 连接字符串 - 指定数据库连接的字符串。它将传递给 MongoDB 的 create_engine 函数。

如果您想自定义聊天历史记录的存储位置，您还可以传递：
1. *database_name* - 要使用的数据库名称
1. *collection_name* - 在该数据库中要使用的集合


```python
<!--IMPORTS:[{"imported": "MongoDBChatMessageHistory", "source": "langchain_mongodb.chat_message_histories", "docs": "https://python.langchain.com/api_reference/mongodb/chat_message_histories/langchain_mongodb.chat_message_histories.MongoDBChatMessageHistory.html", "title": "MongoDB"}]-->
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory

chat_message_history = MongoDBChatMessageHistory(
    session_id="test_session",
    connection_string="mongodb://mongo_user:password123@mongo:27017",
    database_name="my_db",
    collection_name="chat_histories",
)

chat_message_history.add_user_message("Hello")
chat_message_history.add_ai_message("Hi")
```


```python
chat_message_history.messages
```



```output
[HumanMessage(content='Hello'), AIMessage(content='Hi')]
```


## 链接

我们可以轻松地将此消息历史类与 [LCEL Runnables](/docs/how_to/message_history) 结合起来

为此，我们需要使用OpenAI，因此需要安装它。您还需要将OPENAI_API_KEY环境变量设置为您的OpenAI密钥。



```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "MongoDB"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "MongoDB"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "MongoDB"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "MongoDB"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```


```python
import os

assert os.environ[
    "OPENAI_API_KEY"
], "Set the OPENAI_API_KEY environment variable with your OpenAI API key."
```


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```


```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string="mongodb://mongo_user:password123@mongo:27017",
        database_name="my_db",
        collection_name="chat_histories",
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```


```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```


```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```



```output
AIMessage(content='Hi Bob! How can I assist you today?')
```



```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```



```output
AIMessage(content='Your name is Bob. Is there anything else I can help you with, Bob?')
```

