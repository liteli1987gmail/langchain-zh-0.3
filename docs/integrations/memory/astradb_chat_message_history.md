---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/astradb_chat_message_history.ipynb
---
# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 是一个无服务器的向量数据库，基于 Cassandra 构建，并通过易于使用的 JSON API 方便地提供。

本笔记本介绍了如何使用 Astra DB 存储聊天消息历史。

## 设置

要运行此笔记本，您需要一个正在运行的 Astra DB。在您的 Astra 控制面板上获取连接密钥：

- API 端点看起来像 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`;
- 令牌看起来像 `AstraCS:6gBhNmsk135...`。


```python
%pip install --upgrade --quiet  "astrapy>=0.7.1 langchain-community" 
```

### 设置数据库连接参数和密钥


```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```
```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```
根据是本地还是基于云的Astra DB，创建相应的数据库连接“会话”对象。

## 示例


```python
<!--IMPORTS:[{"imported": "AstraDBChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.astradb.AstraDBChatMessageHistory.html", "title": "Astra DB "}]-->
from langchain_community.chat_message_histories import AstraDBChatMessageHistory

message_history = AstraDBChatMessageHistory(
    session_id="test-session",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```


```python
message_history.messages
```



```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

