---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/sparkllm.ipynb
---
# SparkLLM 聊天

由 iFlyTek 提供的 SparkLLM 聊天模型 API。有关更多信息，请参见 [iFlyTek 开放平台](https://www.xfyun.cn/)。

## 基本使用


```python
<!--IMPORTS:[{"imported": "ChatSparkLLM", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.sparkllm.ChatSparkLLM.html", "title": "SparkLLM Chat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "SparkLLM Chat"}]-->
"""For basic init and call"""
from langchain_community.chat_models import ChatSparkLLM
from langchain_core.messages import HumanMessage

chat = ChatSparkLLM(
    spark_app_id="<app_id>", spark_api_key="<api_key>", spark_api_secret="<api_secret>"
)
message = HumanMessage(content="Hello")
chat([message])
```



```output
AIMessage(content='Hello! How can I help you today?')
```


- 从 [iFlyTek SparkLLM API 控制台](https://console.xfyun.cn/services/bm3) 获取 SparkLLM 的 app_id、api_key 和 api_secret (更多信息，请参见 [iFlyTek SparkLLM 介绍](https://xinghuo.xfyun.cn/sparkapi) )，然后设置环境变量 `IFLYTEK_SPARK_APP_ID`、`IFLYTEK_SPARK_API_KEY` 和 `IFLYTEK_SPARK_API_SECRET`，或者在创建 `ChatSparkLLM` 时传递参数，如上面的示例所示。

## 用于 ChatSparkLLM 的流式处理


```python
chat = ChatSparkLLM(
    spark_app_id="<app_id>",
    spark_api_key="<api_key>",
    spark_api_secret="<api_secret>",
    streaming=True,
)
for chunk in chat.stream("Hello!"):
    print(chunk.content, end="")
```
```output
Hello! How can I help you today?
```
## 用于 v2


```python
<!--IMPORTS:[{"imported": "ChatSparkLLM", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.sparkllm.ChatSparkLLM.html", "title": "SparkLLM Chat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "SparkLLM Chat"}]-->
"""For basic init and call"""
from langchain_community.chat_models import ChatSparkLLM
from langchain_core.messages import HumanMessage

chat = ChatSparkLLM(
    spark_app_id="<app_id>",
    spark_api_key="<api_key>",
    spark_api_secret="<api_secret>",
    spark_api_url="wss://spark-api.xf-yun.com/v2.1/chat",
    spark_llm_domain="generalv2",
)
message = HumanMessage(content="Hello")
chat([message])
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
