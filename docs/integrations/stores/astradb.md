---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/stores/astradb.ipynb
sidebar_label: AstraDB
---
# AstraDBByteStore

这将帮助您开始使用 Astra DB [键值存储](/docs/concepts/#key-value-stores)。有关所有 `AstraDBByteStore` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/astradb/storage/langchain_astradb.storage.AstraDBByteStore.html)。

## 概述

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 是一个无服务器的向量数据库，基于 Cassandra 构建，并通过易于使用的 JSON API 方便地提供。

### 集成细节

| 类别 | 包名 | 本地 | JS 支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [AstraDBByteStore](https://python.langchain.com/api_reference/astradb/storage/langchain_astradb.storage.AstraDBByteStore.html) | [langchain_astradb](https://python.langchain.com/api_reference/astradb/index.html) | ❌ | ❌ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain_astradb?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_astradb?style=flat-square&label=%20) |

## 设置

要创建一个 `AstraDBByteStore` 字节存储，您需要 [创建一个 DataStax 账户](https://www.datastax.com/products/datastax-astra)。

### 凭证

注册后，设置以下凭证：


```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = getpass("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

### 安装

LangChain AstraDB 集成位于 `langchain_astradb` 包中：


```python
%pip install -qU langchain_astradb
```

## 实例化

现在我们可以实例化我们的字节存储：


```python
from langchain_astradb import AstraDBByteStore

kv_store = AstraDBByteStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
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


您可以在任何需要使用其他字节存储的地方使用 `AstraDBByteStore`，包括作为 [嵌入的缓存](/docs/how_to/caching_embeddings)。

## API 参考

有关所有 `AstraDBByteStore` 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/astradb/storage/langchain_astradb.storage.AstraDBByteStore.html


## 相关

- [键值存储概念指南](/docs/concepts/#key-value-stores)
