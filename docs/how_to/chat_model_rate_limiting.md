---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chat_model_rate_limiting.ipynb
---
# 如何处理速率限制

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [大型语言模型](/docs/concepts/#llms)
:::


您可能会遇到由于请求过多而被大模型供应商的API限制速率的情况。

例如，如果您在测试数据集上对聊天模型进行基准测试时运行了许多并行查询，就可能会发生这种情况。

如果您面临这种情况，可以使用速率限制器来帮助将您的请求速率与API允许的速率相匹配。
由API提供。

:::info Requires ``langchain-core >= 0.2.24``

此功能是在 ``langchain-core == 0.2.24`` 中添加的。请确保您的软件包是最新的。
:::

## 初始化速率限制器

LangChain内置了一个内存速率限制器。该速率限制器是线程安全的，可以被同一进程中的多个线程共享。

提供的速率限制器只能限制单位时间内的请求数量。如果您还需要根据请求的大小进行限制，它将无能为力。
请求的大小。


```python
<!--IMPORTS:[{"imported": "InMemoryRateLimiter", "source": "langchain_core.rate_limiters", "docs": "https://python.langchain.com/api_reference/core/rate_limiters/langchain_core.rate_limiters.InMemoryRateLimiter.html", "title": "How to handle rate limits"}]-->
from langchain_core.rate_limiters import InMemoryRateLimiter

rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.1,  # <-- Super slow! We can only make a request once every 10 seconds!!
    check_every_n_seconds=0.1,  # Wake up every 100 ms to check whether allowed to make a request,
    max_bucket_size=10,  # Controls the maximum burst size.
)
```

## 选择模型

选择任何模型，并通过 `rate_limiter` 属性将速率限制器传递给它。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to handle rate limits"}]-->
import os
import time
from getpass import getpass

if "ANTHROPIC_API_KEY" not in os.environ:
    os.environ["ANTHROPIC_API_KEY"] = getpass()


from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model_name="claude-3-opus-20240229", rate_limiter=rate_limiter)
```

让我们确认速率限制器是否有效。我们每10秒只能调用模型一次。


```python
for _ in range(5):
    tic = time.time()
    model.invoke("hello")
    toc = time.time()
    print(toc - tic)
```
```output
11.599073648452759
10.7502121925354
10.244257926940918
8.83088755607605
11.645203590393066
```