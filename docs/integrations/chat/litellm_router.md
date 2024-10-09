---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/litellm_router.ipynb
sidebar_label: LiteLLM Router
---
# ChatLiteLLMRouter

[LiteLLM](https://github.com/BerriAI/litellm) 是一个简化调用 Anthropic、Azure、Huggingface、Replicate 等的库。

本笔记本介绍了如何开始使用 LangChain + LiteLLM Router I/O 库。


```python
<!--IMPORTS:[{"imported": "ChatLiteLLMRouter", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.litellm_router.ChatLiteLLMRouter.html", "title": "ChatLiteLLMRouter"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatLiteLLMRouter"}]-->
from langchain_community.chat_models import ChatLiteLLMRouter
from langchain_core.messages import HumanMessage
from litellm import Router
```


```python
model_list = [
    {
        "model_name": "gpt-4",
        "litellm_params": {
            "model": "azure/gpt-4-1106-preview",
            "api_key": "<your-api-key>",
            "api_version": "2023-05-15",
            "api_base": "https://<your-endpoint>.openai.azure.com/",
        },
    },
    {
        "model_name": "gpt-4",
        "litellm_params": {
            "model": "azure/gpt-4-1106-preview",
            "api_key": "<your-api-key>",
            "api_version": "2023-05-15",
            "api_base": "https://<your-endpoint>.openai.azure.com/",
        },
    },
]
litellm_router = Router(model_list=model_list)
chat = ChatLiteLLMRouter(router=litellm_router)
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
AIMessage(content="J'aime programmer.")
```


## `ChatLiteLLMRouter` 还支持异步和流式处理功能：


```python
<!--IMPORTS:[{"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "ChatLiteLLMRouter"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ChatLiteLLMRouter"}]-->
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
```


```python
await chat.agenerate([messages])
```



```output
LLMResult(generations=[[ChatGeneration(text="J'adore programmer.", generation_info={'finish_reason': 'stop'}, message=AIMessage(content="J'adore programmer."))]], llm_output={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': None}, run=[RunInfo(run_id=UUID('75003ec9-1e2b-43b7-a216-10dcc0f75e00'))])
```



```python
chat = ChatLiteLLMRouter(
    router=litellm_router,
    streaming=True,
    verbose=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
chat(messages)
```
```output
J'adore programmer.
```


```output
AIMessage(content="J'adore programmer.")
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
