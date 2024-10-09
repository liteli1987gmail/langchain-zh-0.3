---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/tencent_hunyuan.ipynb
sidebar_label: Tencent Hunyuan
---
# 腾讯混元

>[腾讯的混合模型API](https://cloud.tencent.com/document/product/1729) (`混元API`)
> 实现对话交流、内容生成，
> 分析和理解，并可广泛应用于智能
> 客服、智能营销、角色扮演、广告文案、产品描述，
> 脚本创作、简历生成、文章写作、代码生成、数据分析和内容
> 分析。

查看[更多信息](https://cloud.tencent.com/document/product/1729)。


```python
<!--IMPORTS:[{"imported": "ChatHunyuan", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.hunyuan.ChatHunyuan.html", "title": "Tencent Hunyuan"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Tencent Hunyuan"}]-->
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```


```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```


```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```



```output
AIMessage(content="J'aime programmer.")
```


## 用于流式处理的ChatHunyuan


```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```


```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```



```output
AIMessageChunk(content="J'aime programmer.")
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
