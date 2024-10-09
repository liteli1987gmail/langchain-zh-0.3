---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/baichuan.ipynb
sidebar_label: Baichuan Chat
---
# 与 Baichuan-192K 聊天

由 Baichuan Intelligent Technology 提供的 Baichuan 聊天模型 API。有关更多信息，请参见 [https://platform.baichuan-ai.com/docs/api](https://platform.baichuan-ai.com/docs/api)


```python
<!--IMPORTS:[{"imported": "ChatBaichuan", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.baichuan.ChatBaichuan.html", "title": "Chat with Baichuan-192K"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat with Baichuan-192K"}]-->
from langchain_community.chat_models import ChatBaichuan
from langchain_core.messages import HumanMessage
```


```python
chat = ChatBaichuan(baichuan_api_key="YOUR_API_KEY")
```

或者，您可以通过以下方式设置您的API密钥：


```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```


```python
chat([HumanMessage(content="我日薪8块钱，请问在闰年的二月，我月薪多少")])
```



```output
AIMessage(content='首先，我们需要确定闰年的二月有多少天。闰年的二月有29天。\n\n然后，我们可以计算你的月薪：\n\n日薪 = 月薪 / (当月天数)\n\n所以，你的月薪 = 日薪 * 当月天数\n\n将数值代入公式：\n\n月薪 = 8元/天 * 29天 = 232元\n\n因此，你在闰年的二月的月薪是232元。')
```


## 使用流式处理与Baichuan-192K聊天


```python
chat = ChatBaichuan(
    baichuan_api_key="YOUR_API_KEY",
    streaming=True,
)
```


```python
chat([HumanMessage(content="我日薪8块钱，请问在闰年的二月，我月薪多少")])
```



```output
AIMessageChunk(content='首先，我们需要确定闰年的二月有多少天。闰年的二月有29天。\n\n然后，我们可以计算你的月薪：\n\n日薪 = 月薪 / (当月天数)\n\n所以，你的月薪 = 日薪 * 当月天数\n\n将数值代入公式：\n\n月薪 = 8元/天 * 29天 = 232元\n\n因此，你在闰年的二月的月薪是232元。')
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
