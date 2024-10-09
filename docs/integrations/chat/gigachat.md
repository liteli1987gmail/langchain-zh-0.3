---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/gigachat.ipynb
---
# GigaChat
本笔记展示了如何将LangChain与[GigaChat](https://developers.sber.ru/portal/products/gigachat)结合使用。
要使用它，您需要安装```gigachat``` Python包。


```python
%pip install --upgrade --quiet  gigachat
```

要获取GigaChat凭证，您需要[创建账户](https://developers.sber.ru/studio/login)并[获取API访问权限](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## 示例


```python
import os
from getpass import getpass

if "GIGACHAT_CREDENTIALS" not in os.environ:
    os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "GigaChat", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.gigachat.GigaChat.html", "title": "GigaChat"}]-->
from langchain_community.chat_models import GigaChat

chat = GigaChat(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "GigaChat"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "GigaChat"}]-->
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful AI that shares everything you know. Talk in English."
    ),
    HumanMessage(content="What is capital of Russia?"),
]

print(chat.invoke(messages).content)
```
```output
The capital of Russia is Moscow.
```

## 相关

- 聊天模型[概念指南](/docs/concepts/#chat-models)
- 聊天模型[操作指南](/docs/how_to/#chat-models)
