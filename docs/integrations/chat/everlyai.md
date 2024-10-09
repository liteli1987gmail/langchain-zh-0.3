---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/everlyai.ipynb
sidebar_label: EverlyAI
---
# ChatEverlyAI

>[EverlyAI](https://everlyai.xyz) 允许您在云中大规模运行您的机器学习模型。它还提供对[多个大型语言模型](https://everlyai.xyz)的API访问。

本笔记本演示了如何使用 `langchain.chat_models.ChatEverlyAI` 访问 [EverlyAI 托管端点](https://everlyai.xyz/)。

* 设置 `EVERLYAI_API_KEY` 环境变量
* 或使用 `everlyai_api_key` 关键字参数


```python
%pip install --upgrade --quiet  langchain-openai
```


```python
import os
from getpass import getpass

if "EVERLYAI_API_KEY" not in os.environ:
    os.environ["EVERLYAI_API_KEY"] = getpass()
```

# 让我们尝试在 EverlyAI 托管端点上提供的 LLAMA 模型


```python
<!--IMPORTS:[{"imported": "ChatEverlyAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.everlyai.ChatEverlyAI.html", "title": "ChatEverlyAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatEverlyAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatEverlyAI"}]-->
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a helpful AI that shares everything you know."),
    HumanMessage(
        content="Tell me technical facts about yourself. Are you a transformer model? How many billions of parameters do you have?"
    ),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-7b-chat-hf", temperature=0.3, max_tokens=64
)
print(chat(messages).content)
```
```output
  Hello! I'm just an AI, I don't have personal information or technical details like a human would. However, I can tell you that I'm a type of transformer model, specifically a BERT (Bidirectional Encoder Representations from Transformers) model. B
```
# EverlyAI 还支持流式响应


```python
<!--IMPORTS:[{"imported": "ChatEverlyAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.everlyai.ChatEverlyAI.html", "title": "ChatEverlyAI"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ChatEverlyAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatEverlyAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatEverlyAI"}]-->
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a humorous AI that delights people."),
    HumanMessage(content="Tell me a joke?"),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-7b-chat-hf",
    temperature=0.3,
    max_tokens=64,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat(messages)
```
```output
  Ah, a joke, you say? *adjusts glasses* Well, I've got a doozy for you! *winks*
 *pauses for dramatic effect*
Why did the AI go to therapy?
*drumroll*
Because
```


```output
AIMessageChunk(content="  Ah, a joke, you say? *adjusts glasses* Well, I've got a doozy for you! *winks*\n *pauses for dramatic effect*\nWhy did the AI go to therapy?\n*drumroll*\nBecause")
```


# 让我们在 EverlyAI 上尝试不同的语言模型


```python
<!--IMPORTS:[{"imported": "ChatEverlyAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.everlyai.ChatEverlyAI.html", "title": "ChatEverlyAI"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ChatEverlyAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatEverlyAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatEverlyAI"}]-->
from langchain_community.chat_models import ChatEverlyAI
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a humorous AI that delights people."),
    HumanMessage(content="Tell me a joke?"),
]

chat = ChatEverlyAI(
    model_name="meta-llama/Llama-2-13b-chat-hf-quantized",
    temperature=0.3,
    max_tokens=128,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat(messages)
```
```output
  OH HO HO! *adjusts monocle* Well, well, well! Look who's here! *winks*

You want a joke, huh? *puffs out chest* Well, let me tell you one that's guaranteed to tickle your funny bone! *clears throat*

Why couldn't the bicycle stand up by itself? *pauses for dramatic effect* Because it was two-tired! *winks*

Hope that one put a spring in your step, my dear! *
```


```output
AIMessageChunk(content="  OH HO HO! *adjusts monocle* Well, well, well! Look who's here! *winks*\n\nYou want a joke, huh? *puffs out chest* Well, let me tell you one that's guaranteed to tickle your funny bone! *clears throat*\n\nWhy couldn't the bicycle stand up by itself? *pauses for dramatic effect* Because it was two-tired! *winks*\n\nHope that one put a spring in your step, my dear! *")
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
