---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/stores/redis.ipynb
sidebar_label: Redis
---
# RedisStore

这将帮助您开始使用 Redis [键值存储](/docs/concepts/#key-value-stores)。有关所有 `RedisStore` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/storage/langchain_community.storage.redis.RedisStore.html)。

## 概述

`RedisStore` 是 `ByteStore` 的一种实现，它将所有内容存储在您的 Redis 实例中。

### 集成细节

| 类 | 包名 | 本地 | [JS 支持](https://js.langchain.com/docs/integrations/stores/ioredis_storage) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [RedisStore](https://python.langchain.com/api_reference/community/storage/langchain_community.storage.redis.RedisStore.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ✅ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain_community?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_community?style=flat-square&label=%20) |

## 设置

要创建一个 Redis 字节存储，您需要设置一个 Redis 实例。您可以在本地或通过提供商进行此操作 - 请参阅我们的 [Redis 指南](/docs/integrations/providers/redis) 以获取选项概述。

### 安装

LangChain `RedisStore` 集成位于 `langchain_community` 包中:


```python
%pip install -qU langchain_community redis
```

## 实例化

现在我们可以实例化我们的字节存储：


```python
<!--IMPORTS:[{"imported": "RedisStore", "source": "langchain_community.storage", "docs": "https://python.langchain.com/api_reference/community/storage/langchain_community.storage.redis.RedisStore.html", "title": "RedisStore"}]-->
from langchain_community.storage import RedisStore

kv_store = RedisStore(redis_url="redis://localhost:6379")
```

## 用法

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

有关所有 `RedisStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/storage/langchain_community.storage.redis.RedisStore.html


## 相关

- [键值存储概念指南](/docs/concepts/#key-value-stores)
