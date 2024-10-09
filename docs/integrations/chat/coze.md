---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/coze.ipynb
sidebar_label: Coze Chat
---
# 与 Coze Bot 聊天

ChatCoze 聊天模型 API，由 coze.com 提供。有关更多信息，请参见 [https://www.coze.com/open/docs/chat](https://www.coze.com/open/docs/chat)


```python
<!--IMPORTS:[{"imported": "ChatCoze", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.coze.ChatCoze.html", "title": "Chat with Coze Bot"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat with Coze Bot"}]-->
from langchain_community.chat_models import ChatCoze
from langchain_core.messages import HumanMessage
```


```python
chat = ChatCoze(
    coze_api_base="YOUR_API_BASE",
    coze_api_key="YOUR_API_KEY",
    bot_id="YOUR_BOT_ID",
    user="YOUR_USER_ID",
    conversation_id="YOUR_CONVERSATION_ID",
    streaming=False,
)
```

或者，您可以通过以下方式设置您的API密钥和API基础：


```python
import os

os.environ["COZE_API_KEY"] = "YOUR_API_KEY"
os.environ["COZE_API_BASE"] = "YOUR_API_BASE"
```


```python
chat([HumanMessage(content="什么是扣子(coze)")])
```



```output
AIMessage(content='为你找到关于coze的信息如下：

Coze是一个由字节跳动推出的AI聊天机器人和应用程序编辑开发平台。

用户无论是否有编程经验，都可以通过该平台快速创建各种类型的聊天机器人、智能体、AI应用和插件，并将其部署在社交平台和即时聊天应用程序中。

国际版使用的模型比国内版更强大。')
```


## 与Coze流式聊天


```python
chat = ChatCoze(
    coze_api_base="YOUR_API_BASE",
    coze_api_key="YOUR_API_KEY",
    bot_id="YOUR_BOT_ID",
    user="YOUR_USER_ID",
    conversation_id="YOUR_CONVERSATION_ID",
    streaming=True,
)
```


```python
chat([HumanMessage(content="什么是扣子(coze)")])
```



```output
AIMessageChunk(content='为你查询到Coze是一个由字节跳动推出的AI聊天机器人和应用程序编辑开发平台。')
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
