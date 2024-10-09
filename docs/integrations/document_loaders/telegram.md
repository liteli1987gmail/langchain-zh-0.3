---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/telegram.ipynb
---
# Telegram

>[Telegram Messenger](https://web.telegram.org/a/) 是一个全球可访问的免费增值、跨平台、加密、基于云的集中式即时消息服务。该应用程序还提供可选的端到端加密聊天和视频通话、VoIP、文件共享以及其他几个功能。

本笔记本涵盖如何将数据从 `Telegram` 加载到可以被 LangChain 处理的格式。


```python
<!--IMPORTS:[{"imported": "TelegramChatApiLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.telegram.TelegramChatApiLoader.html", "title": "Telegram"}, {"imported": "TelegramChatFileLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.telegram.TelegramChatFileLoader.html", "title": "Telegram"}]-->
from langchain_community.document_loaders import (
    TelegramChatApiLoader,
    TelegramChatFileLoader,
)
```


```python
loader = TelegramChatFileLoader("example_data/telegram.json")
```


```python
loader.load()
```



```output
[Document(page_content="Henry on 2020-01-01T00:00:02: It's 2020...\n\nHenry on 2020-01-01T00:00:04: Fireworks!\n\nGrace ðŸ§¤ ðŸ\x8d’ on 2020-01-01T00:00:05: You're a minute late!\n\n", metadata={'source': 'example_data/telegram.json'})]
```


`TelegramChatApiLoader` 直接从 Telegram 中的任何指定聊天加载数据。要导出数据，您需要验证您的 Telegram 账户。

您可以从 https://my.telegram.org/auth?to=apps 获取 API_HASH 和 API_ID。

chat_entity – 推荐为频道的 [实体](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity)。




```python
loader = TelegramChatApiLoader(
    chat_entity="<CHAT_URL>",  # recommended to use Entity here
    api_hash="<API HASH >",
    api_id="<API_ID>",
    username="",  # needed only for caching the session.
)
```


```python
loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
