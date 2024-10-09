---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/postgres_chat_message_history.ipynb
---
# Postgres

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) 也被称为 `Postgres`，是一种强调可扩展性和 SQL 兼容性的免费开源关系数据库管理系统 (RDBMS)。

本笔记本介绍了如何使用 Postgres 存储聊天消息历史。


```python
<!--IMPORTS:[{"imported": "PostgresChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.postgres.PostgresChatMessageHistory.html", "title": "Postgres"}]-->
from langchain_community.chat_message_histories import (
    PostgresChatMessageHistory,
)

history = PostgresChatMessageHistory(
    connection_string="postgresql://postgres:mypassword@localhost/chat_history",
    session_id="foo",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```


```python
history.messages
```
