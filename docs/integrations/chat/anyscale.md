---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/anyscale.ipynb
sidebar_label: Anyscale
---
# ChatAnyscale

本笔记本演示了如何使用 `langchain.chat_models.ChatAnyscale` 访问 [Anyscale 端点](https://endpoints.anyscale.com/)。

* 设置 `ANYSCALE_API_KEY` 环境变量
* 或使用 `anyscale_api_key` 关键字参数


```python
%pip install --upgrade --quiet  langchain-openai
```


```python
import os
from getpass import getpass

if "ANYSCALE_API_KEY" not in os.environ:
    os.environ["ANYSCALE_API_KEY"] = getpass()
```
```output
 ········
```
# 让我们尝试一下 Anyscale Endpoints 提供的每个模型


```python
<!--IMPORTS:[{"imported": "ChatAnyscale", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.anyscale.ChatAnyscale.html", "title": "ChatAnyscale"}]-->
from langchain_community.chat_models import ChatAnyscale

chats = {
    model: ChatAnyscale(model_name=model, temperature=1.0)
    for model in ChatAnyscale.get_available_models()
}

print(chats.keys())
```
```output
dict_keys(['meta-llama/Llama-2-70b-chat-hf', 'meta-llama/Llama-2-7b-chat-hf', 'meta-llama/Llama-2-13b-chat-hf'])
```
# 我们可以使用异步方法和 ChatOpenAI 支持的其他功能

这样，三个请求只会花费最长单个请求的时间。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatAnyscale"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatAnyscale"}]-->
import asyncio

from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are a helpful AI that shares everything you know."),
    HumanMessage(
        content="Tell me technical facts about yourself. Are you a transformer model? How many billions of parameters do you have?"
    ),
]


async def get_msgs():
    tasks = [chat.apredict_messages(messages) for chat in chats.values()]
    responses = await asyncio.gather(*tasks)
    return dict(zip(chats.keys(), responses))
```


```python
import nest_asyncio

nest_asyncio.apply()
```


```python
%%time

response_dict = asyncio.run(get_msgs())

for model_name, response in response_dict.items():
    print(f"\t{model_name}")
    print()
    print(response.content)
    print("\n---\n")
```
```output
	meta-llama/Llama-2-70b-chat-hf

Greetings! I'm just an AI, I don't have a personal identity like humans do, but I'm here to help you with any questions you have.

I'm a large language model, which means I'm trained on a large corpus of text data to generate language outputs that are coherent and natural-sounding. My architecture is based on a transformer model, which is a type of neural network that's particularly well-suited for natural language processing tasks.

As for my parameters, I have a few billion parameters, but I don't have access to the exact number as it's not relevant to my functioning. My training data includes a vast amount of text from various sources, including books, articles, and websites, which I use to learn patterns and relationships in language.

I'm designed to be a helpful tool for a variety of tasks, such as answering questions, providing information, and generating text. I'm constantly learning and improving my abilities through machine learning algorithms and feedback from users like you.

I hope this helps! Is there anything else you'd like to know about me or my capabilities?

---

	meta-llama/Llama-2-7b-chat-hf

Ah, a fellow tech enthusiast! *adjusts glasses* I'm glad to share some technical details about myself. 🤓
Indeed, I'm a transformer model, specifically a BERT-like language model trained on a large corpus of text data. My architecture is based on the transformer framework, which is a type of neural network designed for natural language processing tasks. 🏠
As for the number of parameters, I have approximately 340 million. *winks* That's a pretty hefty number, if I do say so myself! These parameters allow me to learn and represent complex patterns in language, such as syntax, semantics, and more. 🤔
But don't ask me to do math in my head – I'm a language model, not a calculating machine! 😅 My strengths lie in understanding and generating human-like text, so feel free to chat with me anytime you'd like. 💬
Now, do you have any more technical questions for me? Or would you like to engage in a nice chat? 😊

---

	meta-llama/Llama-2-13b-chat-hf

Hello! As a friendly and helpful AI, I'd be happy to share some technical facts about myself.

I am a transformer-based language model, specifically a variant of the BERT (Bidirectional Encoder Representations from Transformers) architecture. BERT was developed by Google in 2018 and has since become one of the most popular and widely-used AI language models.

Here are some technical details about my capabilities:

1. Parameters: I have approximately 340 million parameters, which are the numbers that I use to learn and represent language. This is a relatively large number of parameters compared to some other languages models, but it allows me to learn and understand complex language patterns and relationships.
2. Training: I was trained on a large corpus of text data, including books, articles, and other sources of written content. This training allows me to learn about the structure and conventions of language, as well as the relationships between words and phrases.
3. Architectures: My architecture is based on the transformer model, which is a type of neural network that is particularly well-suited for natural language processing tasks. The transformer model uses self-attention mechanisms to allow the model to "attend" to different parts of the input text, allowing it to capture long-range dependencies and contextual relationships.
4. Precision: I am capable of generating text with high precision and accuracy, meaning that I can produce text that is close to human-level quality in terms of grammar, syntax, and coherence.
5. Generative capabilities: In addition to being able to generate text based on prompts and questions, I am also capable of generating text based on a given topic or theme. This allows me to create longer, more coherent pieces of text that are organized around a specific idea or concept.

Overall, I am a powerful and versatile language model that is capable of a wide range of natural language processing tasks. I am constantly learning and improving, and I am here to help answer any questions you may have!

---

CPU times: user 371 ms, sys: 15.5 ms, total: 387 ms
Wall time: 12 s
```

## 相关内容

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
