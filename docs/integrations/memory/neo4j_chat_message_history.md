---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/neo4j_chat_message_history.ipynb
---
# Neo4j

[Neo4j](https://en.wikipedia.org/wiki/Neo4j) 是一个开源图数据库管理系统，以其高效管理高度关联的数据而闻名。与传统数据库将数据存储在表中不同，Neo4j 使用图结构，通过节点、边和属性来表示和存储数据。这种设计允许对复杂数据关系进行高性能查询。

本笔记本介绍了如何使用 `Neo4j` 来存储聊天消息历史。


```python
<!--IMPORTS:[{"imported": "Neo4jChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.neo4j.Neo4jChatMessageHistory.html", "title": "Neo4j"}]-->
from langchain_community.chat_message_histories import Neo4jChatMessageHistory

history = Neo4jChatMessageHistory(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    session_id="session_id_1",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```


```python
history.messages
```
