---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/singlestoredb_chat_message_history.ipynb
---
# SingleStoreDB

本笔记本介绍了如何使用SingleStoreDB存储聊天消息历史。


```python
<!--IMPORTS:[{"imported": "SingleStoreDBChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.singlestoredb.SingleStoreDBChatMessageHistory.html", "title": "SingleStoreDB"}]-->
from langchain_community.chat_message_histories import (
    SingleStoreDBChatMessageHistory,
)

history = SingleStoreDBChatMessageHistory(
    session_id="foo", host="root:pass@localhost:3306/db"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```


```python
history.messages
```
