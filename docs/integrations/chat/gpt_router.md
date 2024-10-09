---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/gpt_router.ipynb
sidebar_label: GPTRouter
---
# GPTRouter

[GPTRouter](https://github.com/Writesonic/GPTRouter) 是一个开源的 LLM API 网关，提供 30 多个 LLM、视觉和图像模型的通用 API，具有基于正常运行时间和延迟的智能回退、自动重试和流式处理功能。

 
本笔记本介绍了如何开始使用 LangChain + GPTRouter I/O 库。

* 设置 `GPT_ROUTER_API_KEY` 环境变量
* 或使用 `gpt_router_api_key` 关键字参数


```python
%pip install --upgrade --quiet  GPTRouter
```
```output
Requirement already satisfied: GPTRouter in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (0.1.3)
Requirement already satisfied: pydantic==2.5.2 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from GPTRouter) (2.5.2)
Requirement already satisfied: httpx>=0.25.2 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from GPTRouter) (0.25.2)
Requirement already satisfied: annotated-types>=0.4.0 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from pydantic==2.5.2->GPTRouter) (0.6.0)
Requirement already satisfied: pydantic-core==2.14.5 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from pydantic==2.5.2->GPTRouter) (2.14.5)
Requirement already satisfied: typing-extensions>=4.6.1 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from pydantic==2.5.2->GPTRouter) (4.8.0)
Requirement already satisfied: idna in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpx>=0.25.2->GPTRouter) (3.6)
Requirement already satisfied: anyio in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpx>=0.25.2->GPTRouter) (3.7.1)
Requirement already satisfied: sniffio in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpx>=0.25.2->GPTRouter) (1.3.0)
Requirement already satisfied: certifi in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpx>=0.25.2->GPTRouter) (2023.11.17)
Requirement already satisfied: httpcore==1.* in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpx>=0.25.2->GPTRouter) (1.0.2)
Requirement already satisfied: h11<0.15,>=0.13 in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from httpcore==1.*->httpx>=0.25.2->GPTRouter) (0.14.0)
Requirement already satisfied: exceptiongroup in /Users/sirjan-ws/.pyenv/versions/3.10.13/envs/langchain_venv5/lib/python3.10/site-packages (from anyio->httpx>=0.25.2->GPTRouter) (1.2.0)

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

```python
<!--IMPORTS:[{"imported": "GPTRouter", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.gpt_router.GPTRouter.html", "title": "GPTRouter"}, {"imported": "GPTRouterModel", "source": "langchain_community.chat_models.gpt_router", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.gpt_router.GPTRouterModel.html", "title": "GPTRouter"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "GPTRouter"}]-->
from langchain_community.chat_models import GPTRouter
from langchain_community.chat_models.gpt_router import GPTRouterModel
from langchain_core.messages import HumanMessage
```


```python
anthropic_claude = GPTRouterModel(name="claude-instant-1.2", provider_name="anthropic")
```


```python
chat = GPTRouter(models_priority_list=[anthropic_claude])
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
AIMessage(content=" J'aime programmer.")
```


## `GPTRouter` 还支持异步和流式处理功能：


```python
<!--IMPORTS:[{"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "GPTRouter"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "GPTRouter"}]-->
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
```


```python
await chat.agenerate([messages])
```



```output
LLMResult(generations=[[ChatGeneration(text=" J'aime programmer.", generation_info={'finish_reason': 'stop_sequence'}, message=AIMessage(content=" J'aime programmer."))]], llm_output={}, run=[RunInfo(run_id=UUID('9885f27f-c35a-4434-9f37-c254259762a5'))])
```



```python
chat = GPTRouter(
    models_priority_list=[anthropic_claude],
    streaming=True,
    verbose=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
chat(messages)
```
```output
 J'aime programmer.
```


```output
AIMessage(content=" J'aime programmer.")
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
