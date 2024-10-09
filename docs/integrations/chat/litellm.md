---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/litellm.ipynb
sidebar_label: LiteLLM
---
# ChatLiteLLM

[LiteLLM](https://github.com/BerriAI/litellm) 是一个简化调用 Anthropic、Azure、Huggingface、Replicate 等的库。

本笔记本介绍了如何开始使用 LangChain + LiteLLM I/O 库。


```python
<!--IMPORTS:[{"imported": "ChatLiteLLM", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.litellm.ChatLiteLLM.html", "title": "ChatLiteLLM"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatLiteLLM"}]-->
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.messages import HumanMessage
```


```python
chat = ChatLiteLLM(model="gpt-3.5-turbo")
```


```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat(messages)
```



```output
AIMessage(content=" J'aime la programmation.", additional_kwargs={}, example=False)
```


## `ChatLiteLLM` 还支持异步和流式处理功能：


```python
<!--IMPORTS:[{"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "ChatLiteLLM"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ChatLiteLLM"}]-->
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
```


```python
await chat.agenerate([messages])
```



```output
LLMResult(generations=[[ChatGeneration(text=" J'aime programmer.", generation_info=None, message=AIMessage(content=" J'aime programmer.", additional_kwargs={}, example=False))]], llm_output={}, run=[RunInfo(run_id=UUID('8cc8fb68-1c35-439c-96a0-695036a93652'))])
```



```python
chat = ChatLiteLLM(
    streaming=True,
    verbose=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
chat(messages)
```
```output
 J'aime la programmation.
```


```output
AIMessage(content=" J'aime la programmation.", additional_kwargs={}, example=False)
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
