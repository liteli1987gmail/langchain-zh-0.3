---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/stores/upstash_redis.ipynb
sidebar_label: Upstash Redis
---
# UpstashRedisByteStore

这将帮助您开始使用 Upstash redis [键值存储](/docs/concepts/#key-value-stores)。有关所有 `UpstashRedisByteStore` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/storage/langchain_community.storage.upstash_redis.UpstashRedisByteStore.html)。

## 概述

`UpstashRedisStore` 是 `ByteStore` 的一种实现，它将所有内容存储在您的 [Upstash](https://upstash.com/)-托管的 Redis 实例中。

要使用基础的 `RedisStore`，请参见 [本指南](/docs/integrations/stores/redis/)。

### 集成细节

| 类 | 包名 | 本地 | [JS 支持](https://js.langchain.com/docs/integrations/stores/upstash_redis_storage) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [UpstashRedisByteStore](https://python.langchain.com/api_reference/community/storage/langchain_community.storage.upstash_redis.UpstashRedisByteStore.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ❌ | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain_community?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_community?style=flat-square&label=%20) |

## 设置

您首先需要[注册一个Upstash账户](https://upstash.com/docs/redis/overall/getstarted)。接下来，您需要创建一个Redis数据库以进行连接。

### 凭证

创建数据库后，获取您的数据库URL（不要忘记`https://`！）和令牌：


```python
from getpass import getpass

URL = getpass("Enter your Upstash URL")
TOKEN = getpass("Enter your Upstash REST token")
```

### 安装

LangChain Upstash 集成位于 `langchain_community` 包中。您还需要安装 `upstash-redis` 包作为对等依赖：


```python
%pip install -qU langchain_community upstash-redis
```

## 实例化

现在我们可以实例化我们的字节存储：


```python
<!--IMPORTS:[{"imported": "UpstashRedisByteStore", "source": "langchain_community.storage", "docs": "https://python.langchain.com/api_reference/community/storage/langchain_community.storage.upstash_redis.UpstashRedisByteStore.html", "title": "UpstashRedisByteStore"}]-->
from langchain_community.storage import UpstashRedisByteStore
from upstash_redis import Redis

redis_client = Redis(url=URL, token=TOKEN)
kv_store = UpstashRedisByteStore(client=redis_client, ttl=None, namespace="test-ns")
```

## 使用

您可以使用 `mset` 方法在键下设置数据，如下所示：


```python
kv_store.mset(
    [
        ["key1", b"value1"],
        ["key2", b"value2"],
    ]
)

kv_store.mget(
    [
        "key1",
        "key2",
    ]
)
```



```output
[b'value1', b'value2']
```


您可以使用 `mdelete` 方法删除数据：


```python
kv_store.mdelete(
    [
        "key1",
        "key2",
    ]
)

kv_store.mget(
    [
        "key1",
        "key2",
    ]
)
```



```output
[None, None]
```


## API 参考

有关所有 `UpstashRedisByteStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/storage/langchain_community.storage.upstash_redis.UpstashRedisByteStore.html


## 相关

- [键值存储概念指南](/docs/concepts/#key-value-stores)
