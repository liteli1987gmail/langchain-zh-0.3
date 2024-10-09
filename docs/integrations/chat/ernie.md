---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/ernie.ipynb
sidebar_label: Ernie Bot Chat
---
# ErnieBotChat

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11) 是百度开发的大型语言模型，涵盖了大量中文数据。
本笔记本介绍如何开始使用 ErnieBot 聊天模型。

**已弃用警告**

我们建议用户使用 `langchain_community.chat_models.ErnieBotChat`
改用 `langchain_community.chat_models.QianfanChatEndpoint`。

`QianfanChatEndpoint` 的文档在 [这里](/docs/integrations/chat/baidu_qianfan_endpoint/)。

我们推荐用户使用 `QianfanChatEndpoint` 的原因有四个：

1. `QianfanChatEndpoint` 支持更多 Qianfan 平台上的大型语言模型。
2. `QianfanChatEndpoint` 支持流式处理模式。
3. `QianfanChatEndpoint` 支持函数调用用法。
4. `ErnieBotChat` 缺乏维护并已弃用。

迁移的一些提示：

- 将 `ernie_client_id` 更改为 `qianfan_ak`，同时将 `ernie_client_secret` 更改为 `qianfan_sk`。
- 安装 `qianfan` 包。比如 `pip install qianfan`
- 将 `ErnieBotChat` 更改为 `QianfanChatEndpoint`。


```python
<!--IMPORTS:[{"imported": "QianfanChatEndpoint", "source": "langchain_community.chat_models.baidu_qianfan_endpoint", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.baidu_qianfan_endpoint.QianfanChatEndpoint.html", "title": "ErnieBotChat"}]-->
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## 使用


```python
<!--IMPORTS:[{"imported": "ErnieBotChat", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.ernie.ErnieBotChat.html", "title": "ErnieBotChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ErnieBotChat"}]-->
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

或者你可以在环境变量中设置 `client_id` 和 `client_secret`
```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```


```python
chat([HumanMessage(content="hello there, who are you?")])
```



```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
