---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/moonshot.ipynb
sidebar_label: Moonshot
---
# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) 是一家为企业和个人提供大型语言模型服务的中国初创公司。

本示例介绍了如何使用 LangChain 与 Moonshot 推理进行聊天。


```python
import os

# Generate your api key from: https://platform.moonshot.cn/console/api-keys
os.environ["MOONSHOT_API_KEY"] = "MOONSHOT_API_KEY"
```


```python
<!--IMPORTS:[{"imported": "MoonshotChat", "source": "langchain_community.chat_models.moonshot", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.moonshot.MoonshotChat.html", "title": "MoonshotChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "MoonshotChat"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "MoonshotChat"}]-->
from langchain_community.chat_models.moonshot import MoonshotChat
from langchain_core.messages import HumanMessage, SystemMessage
```


```python
chat = MoonshotChat()
# or use a specific model
# Available models: https://platform.moonshot.cn/docs
# chat = MoonshotChat(model="moonshot-v1-128k")
```


```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]

chat.invoke(messages)
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
