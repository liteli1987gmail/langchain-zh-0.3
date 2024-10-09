---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/llm_caching.ipynb
---
# 如何缓存大型语言模型的响应

LangChain 提供了一个可选的缓存层用于大型语言模型。这有两个好处：

如果您经常请求相同的完成，这可以通过减少您向大模型供应商发出的 API 调用次数来节省您的费用。
它可以通过减少您向大模型供应商发出的 API 调用次数来加快您的应用程序速度。



```python
%pip install -qU langchain_openai langchain_community

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
# Please manually enter OpenAI Key
```


```python
<!--IMPORTS:[{"imported": "set_llm_cache", "source": "langchain_core.globals", "docs": "https://python.langchain.com/api_reference/core/globals/langchain_core.globals.set_llm_cache.html", "title": "How to cache LLM responses"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to cache LLM responses"}]-->
from langchain_core.globals import set_llm_cache
from langchain_openai import OpenAI

# To make the caching really obvious, lets use a slower and older model.
# Caching supports newer chat models as well.
llm = OpenAI(model="gpt-3.5-turbo-instruct", n=2, best_of=2)
```


```python
<!--IMPORTS:[{"imported": "InMemoryCache", "source": "langchain_core.caches", "docs": "https://python.langchain.com/api_reference/core/caches/langchain_core.caches.InMemoryCache.html", "title": "How to cache LLM responses"}]-->
%%time
from langchain_core.caches import InMemoryCache

set_llm_cache(InMemoryCache())

# The first time, it is not yet in cache, so it should take longer
llm.invoke("Tell me a joke")
```
```output
CPU times: user 546 ms, sys: 379 ms, total: 925 ms
Wall time: 1.11 s
```


```output
"\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```



```python
%%time
# The second time it is, so it goes faster
llm.invoke("Tell me a joke")
```
```output
CPU times: user 192 µs, sys: 77 µs, total: 269 µs
Wall time: 270 µs
```


```output
"\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```


## SQLite 缓存


```python
!rm .langchain.db
```


```python
<!--IMPORTS:[{"imported": "SQLiteCache", "source": "langchain_community.cache", "docs": "https://python.langchain.com/api_reference/community/cache/langchain_community.cache.SQLiteCache.html", "title": "How to cache LLM responses"}]-->
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
CPU times: user 10.6 ms, sys: 4.21 ms, total: 14.8 ms
Wall time: 851 ms
```


```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```



```python
%%time
# The second time it is, so it goes faster
llm.invoke("Tell me a joke")
```
```output
CPU times: user 59.7 ms, sys: 63.6 ms, total: 123 ms
Wall time: 134 ms
```


```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!"
```

