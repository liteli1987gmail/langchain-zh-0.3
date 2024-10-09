---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/volcengine_maas.ipynb
sidebar_label: Volc Enging Maas
---
# VolcEngineMaasChat

本笔记本为您提供了关于如何开始使用VolcEngine MAAS聊天模型的指南。


```python
# Install the package
%pip install --upgrade --quiet  volcengine
```


```python
<!--IMPORTS:[{"imported": "VolcEngineMaasChat", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.volcengine_maas.VolcEngineMaasChat.html", "title": "VolcEngineMaasChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "VolcEngineMaasChat"}]-->
from langchain_community.chat_models import VolcEngineMaasChat
from langchain_core.messages import HumanMessage
```


```python
chat = VolcEngineMaasChat(volc_engine_maas_ak="your ak", volc_engine_maas_sk="your sk")
```

或者您可以在环境变量中设置 access_key 和 secret_key
```bash
export VOLC_ACCESSKEY=YOUR_AK
export VOLC_SECRETKEY=YOUR_SK
```


```python
chat([HumanMessage(content="给我讲个笑话")])
```



```output
AIMessage(content='好的，这是一个笑话：\n\n为什么鸟儿不会玩电脑游戏？\n\n因为它们没有翅膀！')
```


# volc 引擎 maas 聊天与流式处理


```python
chat = VolcEngineMaasChat(
    volc_engine_maas_ak="your ak",
    volc_engine_maas_sk="your sk",
    streaming=True,
)
```


```python
chat([HumanMessage(content="给我讲个笑话")])
```



```output
AIMessage(content='好的，这是一个笑话：\n\n三岁的女儿说她会造句了，妈妈让她用“年轻”造句，女儿说：“妈妈减肥，一年轻了好几斤”。')
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
