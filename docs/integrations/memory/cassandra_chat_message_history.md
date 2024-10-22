---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/cassandra_chat_message_history.ipynb
---
# Cassandra

>[Apache Cassandra®](https://cassandra.apache.org) 是一个 `NoSQL`、行导向、高度可扩展且高度可用的数据库，非常适合存储大量数据。

>`Cassandra` 是存储聊天消息历史的好选择，因为它易于扩展并且可以处理大量写入。

本笔记本介绍了如何使用 Cassandra 存储聊天消息历史。



## 设置

要运行此笔记本，您需要一个正在运行的 `Cassandra` 集群或一个在云中运行的 `DataStax Astra DB` 实例（您可以在 [datastax.com](https://astra.datastax.com) 免费获取一个）。有关更多信息，请查看 [cassio.org](https://cassio.org/start_here/)。


```python
%pip install --upgrade --quiet  "cassio>=0.1.0 langchain-community"
```

### 设置数据库连接参数和密钥


```python
import getpass

database_mode = (input("\n(C)assandra or (A)stra DB? ")).upper()

keyspace_name = input("\nKeyspace name? ")

if database_mode == "A":
    ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
    #
    ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
elif database_mode == "C":
    CASSANDRA_CONTACT_POINTS = input(
        "Contact points? (comma-separated, empty for localhost) "
    ).strip()
```

根据是本地还是基于云的Astra DB，创建相应的数据库连接“会话”对象。


```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

if database_mode == "C":
    if CASSANDRA_CONTACT_POINTS:
        cluster = Cluster(
            [cp.strip() for cp in CASSANDRA_CONTACT_POINTS.split(",") if cp.strip()]
        )
    else:
        cluster = Cluster()
    session = cluster.connect()
elif database_mode == "A":
    ASTRA_DB_CLIENT_ID = "token"
    cluster = Cluster(
        cloud={
            "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
        },
        auth_provider=PlainTextAuthProvider(
            ASTRA_DB_CLIENT_ID,
            ASTRA_DB_APPLICATION_TOKEN,
        ),
    )
    session = cluster.connect()
else:
    raise NotImplementedError
```

## 示例


```python
<!--IMPORTS:[{"imported": "CassandraChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.cassandra.CassandraChatMessageHistory.html", "title": "Cassandra "}]-->
from langchain_community.chat_message_histories import (
    CassandraChatMessageHistory,
)

message_history = CassandraChatMessageHistory(
    session_id="test-session",
    session=session,
    keyspace=keyspace_name,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```


```python
message_history.messages
```

#### 归属声明

> Apache Cassandra、Cassandra和Apache是[Apache软件基金会](http://www.apache.org/)在美国和/或其他国家的注册商标或商标。
