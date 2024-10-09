---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/konko.ipynb
sidebar_label: Konko
---
# ChatKonko

# Konko

>[Konko](https://www.konko.ai/) API 是一个完全托管的 Web API，旨在帮助应用程序开发人员：


1. **选择** 适合其应用程序的开源或专有大型语言模型 (LLMs)
2. **更快地构建** 应用程序，集成领先的应用程序框架和完全托管的 API
3. **微调** 较小的开源大型语言模型，以在成本的很小一部分下实现行业领先的性能
4. **部署生产级 API**，满足安全性、隐私、吞吐量和延迟服务水平协议 (SLA)，无需基础设施设置或管理，使用 Konko AI 的 SOC 2 合规的多云基础设施


本示例介绍如何使用 LangChain 与 `Konko` 聊天完成 [模型](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-chatcompletion) 进行交互

要运行此笔记本，您需要 Konko API 密钥。请登录我们的 Web 应用程序 [创建 API 密钥](https://platform.konko.ai/settings/api-keys) 以访问模型




```python
<!--IMPORTS:[{"imported": "ChatKonko", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.konko.ChatKonko.html", "title": "ChatKonko"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatKonko"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatKonko"}]-->
from langchain_community.chat_models import ChatKonko
from langchain_core.messages import HumanMessage, SystemMessage
```

#### 设置环境变量

1. 您可以设置以下环境变量
1. KONKO_API_KEY（必需）
2. OPENAI_API_KEY（可选）
2. 在您当前的 shell 会话中，使用 export 命令：

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## 调用模型

在 [Konko 概述页面](https://docs.konko.ai/docs/list-of-models) 上查找模型

找到运行在 Konko 实例上的模型列表的另一种方法是通过这个 [端点](https://docs.konko.ai/reference/get-models)。

从这里，我们可以初始化我们的模型：



```python
chat = ChatKonko(max_tokens=400, model="meta-llama/llama-2-13b-chat")
```


```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Explain Big Bang Theory briefly"),
]
chat(messages)
```



```output
AIMessage(content="  Sure thing! The Big Bang Theory is a scientific theory that explains the origins of the universe. In short, it suggests that the universe began as an infinitely hot and dense point around 13.8 billion years ago and expanded rapidly. This expansion continues to this day, and it's what makes the universe look the way it does.\n\nHere's a brief overview of the key points:\n\n1. The universe started as a singularity, a point of infinite density and temperature.\n2. The singularity expanded rapidly, causing the universe to cool and expand.\n3. As the universe expanded, particles began to form, including protons, neutrons, and electrons.\n4. These particles eventually came together to form atoms, and later, stars and galaxies.\n5. The universe is still expanding today, and the rate of this expansion is accelerating.\n\nThat's the Big Bang Theory in a nutshell! It's a pretty mind-blowing idea when you think about it, and it's supported by a lot of scientific evidence. Do you have any other questions about it?")
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
