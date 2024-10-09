---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/stores/in_memory.ipynb
sidebar_label: In-memory
---
# 内存字节存储

本指南将帮助您开始使用内存 [键值存储](/docs/concepts/#key-value-stores)。有关所有 `InMemoryByteStore` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html)。

## 概述

`InMemoryByteStore` 是 `ByteStore` 的一种非持久性实现，它将所有内容存储在 Python 字典中。它适用于演示和不需要在 Python 进程生命周期之外持久化的情况。

### 集成细节

| 类 | 包名 | 本地 | [JS 支持](https://js.langchain.com/docs/integrations/stores/in_memory/) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [InMemoryByteStore](https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html) | [langchain_core](https://python.langchain.com/api_reference/core/index.html) | ✅ | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain_core?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_core?style=flat-square&label=%20) |

### 安装

LangChain `InMemoryByteStore` 集成位于 `langchain_core` 包中：


```python
%pip install -qU langchain_core
```

## 实例化

现在您可以实例化您的字节存储：


```python
<!--IMPORTS:[{"imported": "InMemoryByteStore", "source": "langchain_core.stores", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html", "title": "InMemoryByteStore"}]-->
from langchain_core.stores import InMemoryByteStore

kv_store = InMemoryByteStore()
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

有关所有 `InMemoryByteStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html


## 相关

- [键值存储概念指南](/docs/concepts/#key-value-stores)
