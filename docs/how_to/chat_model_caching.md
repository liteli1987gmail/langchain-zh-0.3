---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chat_model_caching.ipynb
---
# 如何缓存聊天模型的响应

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [大型语言模型](/docs/concepts/#llms)

:::

LangChain 为聊天模型提供了一个可选的缓存层。这主要有两个好处：

- 如果您经常请求相同的完成，这可以通过减少您对大模型供应商的 API 调用次数来节省您的费用。这在应用开发期间尤其有用。
- 通过减少您对大模型供应商的 API 调用次数，它可以加快您的应用程序速度。

本指南将引导您如何在您的应用中启用此功能。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "set_llm_cache", "source": "langchain_core.globals", "docs": "https://python.langchain.com/api_reference/core/globals/langchain_core.globals.set_llm_cache.html", "title": "How to cache chat model responses"}]-->
# <!-- ruff: noqa: F821 -->
from langchain_core.globals import set_llm_cache
```

## 内存缓存

这是一个临时缓存，用于在内存中存储模型调用。当您的环境重启时，它将被清除，并且在进程之间不共享。


```python
<!--IMPORTS:[{"imported": "InMemoryCache", "source": "langchain_core.caches", "docs": "https://python.langchain.com/api_reference/core/caches/langchain_core.caches.InMemoryCache.html", "title": "How to cache chat model responses"}]-->
%%time
from langchain_core.caches import InMemoryCache

set_llm_cache(InMemoryCache())

# The first time, it is not yet in cache, so it should take longer
llm.invoke("Tell me a joke")
```
```output
CPU times: user 645 ms, sys: 214 ms, total: 859 ms
Wall time: 829 ms
```


```output
AIMessage(content="Why don't scientists trust atoms?\n\nBecause they make up everything!", response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 11, 'total_tokens': 24}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-b6836bdd-8c30-436b-828f-0ac5fc9ab50e-0')
```



```python
%%time
# The second time it is, so it goes faster
llm.invoke("Tell me a joke")
```
```output
CPU times: user 822 µs, sys: 288 µs, total: 1.11 ms
Wall time: 1.06 ms
```


```output
AIMessage(content="Why don't scientists trust atoms?\n\nBecause they make up everything!", response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 11, 'total_tokens': 24}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-b6836bdd-8c30-436b-828f-0ac5fc9ab50e-0')
```


## SQLite 缓存

此缓存实现使用 `SQLite` 数据库来存储响应，并且在进程重启时仍然有效。


```python
!rm .langchain.db
```


```python
<!--IMPORTS:[{"imported": "SQLiteCache", "source": "langchain_community.cache", "docs": "https://python.langchain.com/api_reference/community/cache/langchain_community.cache.SQLiteCache.html", "title": "How to cache chat model responses"}]-->
# We can do the same thing with a SQLite cache
from langchain_community.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```


```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm.invoke("Tell me a joke")
```
```output
CPU times: user 9.91 ms, sys: 7.68 ms, total: 17.6 ms
Wall time: 657 ms
```


```output
AIMessage(content='Why did the scarecrow win an award? Because he was outstanding in his field!', response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 11, 'total_tokens': 28}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-39d9e1e8-7766-4970-b1d8-f50213fd94c5-0')
```



```python
%%time
# The second time it is, so it goes faster
llm.invoke("Tell me a joke")
```
```output
CPU times: user 52.2 ms, sys: 60.5 ms, total: 113 ms
Wall time: 127 ms
```


```output
AIMessage(content='Why did the scarecrow win an award? Because he was outstanding in his field!', id='run-39d9e1e8-7766-4970-b1d8-f50213fd94c5-0')
```


## 下一步

您现在已经学习了如何缓存模型响应以节省时间和金钱。

接下来，请查看本节中其他关于聊天模型的使用指南，例如 [如何让模型返回结构化输出](/docs/how_to/structured_output) 或 [如何创建您自己的自定义聊天模型](/docs/how_to/custom_chat_model)。
