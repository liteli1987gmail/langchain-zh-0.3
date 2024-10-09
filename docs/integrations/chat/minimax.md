---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/minimax.ipynb
sidebar_label: MiniMax
---
# MiniMaxChat

[Minimax](https://api.minimax.chat) 是一家为公司和个人提供大型语言模型服务的中国初创公司。

本示例介绍了如何使用 LangChain 与 MiniMax 推理进行聊天。


```python
import os

os.environ["MINIMAX_GROUP_ID"] = "MINIMAX_GROUP_ID"
os.environ["MINIMAX_API_KEY"] = "MINIMAX_API_KEY"
```


```python
<!--IMPORTS:[{"imported": "MiniMaxChat", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.minimax.MiniMaxChat.html", "title": "MiniMaxChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "MiniMaxChat"}]-->
from langchain_community.chat_models import MiniMaxChat
from langchain_core.messages import HumanMessage
```


```python
chat = MiniMaxChat()
```


```python
chat(
    [
        HumanMessage(
            content="Translate this sentence from English to French. I love programming."
        )
    ]
)
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
