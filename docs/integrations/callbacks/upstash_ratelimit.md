---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/upstash_ratelimit.ipynb
---
# Upstash 限流回调

在本指南中，我们将介绍如何使用 `UpstashRatelimitHandler` 基于请求数量或令牌数量添加限流。该处理程序使用 [Upstash 的 ratelimit 库](https://github.com/upstash/ratelimit-py/)，该库利用 [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)。

Upstash 限流通过在每次调用 `limit` 方法时向 Upstash Redis 发送 HTTP 请求来工作。用户的剩余令牌/请求会被检查和更新。根据剩余的令牌，我们可以停止执行诸如调用大型语言模型或查询向量存储等耗时操作：

```py
response = ratelimit.limit()
if response.allowed:
    execute_costly_operation()
```

`UpstashRatelimitHandler` 允许您在几分钟内将速率限制逻辑集成到您的链中。

首先，您需要访问 [Upstash 控制台](https://console.upstash.com/login) 并创建一个 Redis 数据库 ([查看我们的文档](https://upstash.com/docs/redis/overall/getstarted))。创建数据库后，您需要设置环境变量：

```
UPSTASH_REDIS_REST_URL="****"
UPSTASH_REDIS_REST_TOKEN="****"
```

接下来，您需要使用以下命令安装 Upstash Ratelimit 和 Redis 库：

```
pip install upstash-ratelimit upstash-redis
```

您现在可以为您的链添加速率限制了！

## 每个请求的速率限制

假设我们希望允许用户每分钟调用我们的链 10 次。实现这一点非常简单：


```python
<!--IMPORTS:[{"imported": "UpstashRatelimitError", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitError.html", "title": "Upstash Ratelimit Callback"}, {"imported": "UpstashRatelimitHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitHandler.html", "title": "Upstash Ratelimit Callback"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "Upstash Ratelimit Callback"}]-->
# set env variables
import os

os.environ["UPSTASH_REDIS_REST_URL"] = "****"
os.environ["UPSTASH_REDIS_REST_TOKEN"] = "****"

from langchain_community.callbacks import UpstashRatelimitError, UpstashRatelimitHandler
from langchain_core.runnables import RunnableLambda
from upstash_ratelimit import FixedWindow, Ratelimit
from upstash_redis import Redis

# create ratelimit
ratelimit = Ratelimit(
    redis=Redis.from_env(),
    # 10 requests per window, where window size is 60 seconds:
    limiter=FixedWindow(max_requests=10, window=60),
)

# create handler
user_id = "user_id"  # should be a method which gets the user id
handler = UpstashRatelimitHandler(identifier=user_id, request_ratelimit=ratelimit)

# create mock chain
chain = RunnableLambda(str)

# invoke chain with handler:
try:
    result = chain.invoke("Hello world!", config={"callbacks": [handler]})
except UpstashRatelimitError:
    print("Handling ratelimit.", UpstashRatelimitError)
```
```output
Error in UpstashRatelimitHandler.on_chain_start callback: UpstashRatelimitError('Request limit reached!')
``````output
Handling ratelimit. <class 'langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitError'>
```
请注意，我们将处理程序传递给 `invoke` 方法，而不是在定义链时传递处理程序。

有关除 `FixedWindow` 之外的速率限制算法，请参见 [upstash-ratelimit 文档](https://github.com/upstash/ratelimit-py?tab=readme-ov-file#ratelimiting-algorithms)。

在执行管道中的任何步骤之前，ratelimit 将检查用户是否超过请求限制。如果是，则会引发 `UpstashRatelimitError`。

## 每个令牌的速率限制

另一个选项是根据以下内容对链调用进行速率限制：
1. 提示中的令牌数量
2. 提示和 LLM 完成中的令牌数量

这仅在您的链中有 LLM 时有效。另一个要求是您使用的 LLM 应在其 `LLMOutput` 中返回令牌使用情况。

### 它是如何工作的

在调用 LLM 之前，处理程序将获取剩余的令牌。如果剩余的令牌大于 0，则将调用 LLM。否则，将引发 `UpstashRatelimitError`。

在调用大型语言模型后，令牌使用信息将从用户剩余的令牌中扣除。在链的这个阶段不会引发错误。

### 配置

对于第一个配置，只需像这样初始化处理程序：


```python
ratelimit = Ratelimit(
    redis=Redis.from_env(),
    # 1000 tokens per window, where window size is 60 seconds:
    limiter=FixedWindow(max_requests=1000, window=60),
)

handler = UpstashRatelimitHandler(identifier=user_id, token_ratelimit=ratelimit)
```

对于第二个配置，初始化处理程序的方法如下：


```python
ratelimit = Ratelimit(
    redis=Redis.from_env(),
    # 1000 tokens per window, where window size is 60 seconds:
    limiter=FixedWindow(max_requests=1000, window=60),
)

handler = UpstashRatelimitHandler(
    identifier=user_id,
    token_ratelimit=ratelimit,
    include_output_tokens=True,  # set to True
)
```

您还可以同时基于请求和令牌使用速率限制，只需传递 `request_ratelimit` 和 `token_ratelimit` 参数。

这是一个使用大型语言模型的链的示例：


```python
<!--IMPORTS:[{"imported": "UpstashRatelimitError", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitError.html", "title": "Upstash Ratelimit Callback"}, {"imported": "UpstashRatelimitHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitHandler.html", "title": "Upstash Ratelimit Callback"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "Upstash Ratelimit Callback"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Upstash Ratelimit Callback"}]-->
# set env variables
import os

os.environ["UPSTASH_REDIS_REST_URL"] = "****"
os.environ["UPSTASH_REDIS_REST_TOKEN"] = "****"
os.environ["OPENAI_API_KEY"] = "****"

from langchain_community.callbacks import UpstashRatelimitError, UpstashRatelimitHandler
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from upstash_ratelimit import FixedWindow, Ratelimit
from upstash_redis import Redis

# create ratelimit
ratelimit = Ratelimit(
    redis=Redis.from_env(),
    # 500 tokens per window, where window size is 60 seconds:
    limiter=FixedWindow(max_requests=500, window=60),
)

# create handler
user_id = "user_id"  # should be a method which gets the user id
handler = UpstashRatelimitHandler(identifier=user_id, token_ratelimit=ratelimit)

# create mock chain
as_str = RunnableLambda(str)
model = ChatOpenAI()

chain = as_str | model

# invoke chain with handler:
try:
    result = chain.invoke("Hello world!", config={"callbacks": [handler]})
except UpstashRatelimitError:
    print("Handling ratelimit.", UpstashRatelimitError)
```
```output
Error in UpstashRatelimitHandler.on_llm_start callback: UpstashRatelimitError('Token limit reached!')
``````output
Handling ratelimit. <class 'langchain_community.callbacks.upstash_ratelimit_callback.UpstashRatelimitError'>
```