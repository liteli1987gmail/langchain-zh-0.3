---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/promptlayer_chatopenai.ipynb
sidebar_label: PromptLayer ChatOpenAI
---
# PromptLayerChatOpenAI

本示例展示了如何连接到 [PromptLayer](https://www.promptlayer.com) 以开始记录您的 ChatOpenAI 请求。

## 安装 PromptLayer
使用 OpenAI 需要 `promptlayer` 包。使用 pip 安装 `promptlayer`。


```python
pip install promptlayer
```

## 导入


```python
<!--IMPORTS:[{"imported": "PromptLayerChatOpenAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.promptlayer_openai.PromptLayerChatOpenAI.html", "title": "PromptLayerChatOpenAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "PromptLayerChatOpenAI"}]-->
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## 设置环境 API 密钥
您可以通过点击导航栏中的设置齿轮在 [www.promptlayer.com](https://www.promptlayer.com) 创建一个 PromptLayer API 密钥。

将其设置为名为 `PROMPTLAYER_API_KEY` 的环境变量。


```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## 像正常一样使用 PromptLayerOpenAI LLM
*您可以选择性地传入 `pl_tags` 以使用 PromptLayer 的标签功能跟踪您的请求.*


```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```



```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```


**上述请求现在应该出现在您的 [PromptLayer 仪表板](https://www.promptlayer.com) 上。**

## 使用 PromptLayer 跟踪
如果您想使用任何 [PromptLayer 跟踪功能](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9)，您需要在实例化 PromptLayer LLM 时传递参数 `return_pl_id` 以获取请求 ID。


```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

使用此功能可以让您在 PromptLayer 仪表板中跟踪模型的性能。如果您使用的是提示模板，您也可以将模板附加到请求中。
总体而言，这使您有机会在PromptLayer仪表板中跟踪不同模板和模型的性能。


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
