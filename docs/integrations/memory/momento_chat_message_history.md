---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/momento_chat_message_history.ipynb
---
# Momento 缓存

>[Momento 缓存](https://docs.momentohq.com/) 是世界上第一个真正无服务器的缓存服务。它提供即时弹性、零扩展能力，
> 以及超快的性能。


本笔记本介绍了如何使用 [Momento 缓存](https://www.gomomento.com/services/cache) 来存储聊天消息历史，使用 `MomentoChatMessageHistory` 类。有关如何设置 Momento 的更多细节，请参见 Momento [文档](https://docs.momentohq.com/getting-started)。

请注意，默认情况下，如果不存在具有给定名称的缓存，我们将创建一个缓存。

您需要获取一个 Momento API 密钥才能使用此类。您可以将其作为命名参数 `api_key` 传递给 `MomentoChatMessageHistory.from_client_params`，或者直接传递给 momento.CacheClient，或者可以将其设置为环境变量 `MOMENTO_API_KEY`。


```python
<!--IMPORTS:[{"imported": "MomentoChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.momento.MomentoChatMessageHistory.html", "title": "Momento Cache"}]-->
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```


```python
history.messages
```



```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
```

