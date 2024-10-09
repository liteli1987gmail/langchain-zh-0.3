---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/stores/file_system.ipynb
sidebar_label: Local Filesystem
---
# 本地文件存储

这将帮助您开始使用本地文件系统 [键值存储](/docs/concepts/#key-value-stores)。有关所有 LocalFileStore 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/langchain/storage/langchain.storage.file_system.LocalFileStore.html)。

## 概述

`LocalFileStore` 是 `ByteStore` 的持久化实现，它将所有内容存储在您选择的文件夹中。如果您使用单台机器并且能够容忍文件的添加或删除，它非常有用。

### 集成细节

| 类 | 包名 | 本地 | [JS 支持](https://js.langchain.com/docs/integrations/stores/file_system) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [LocalFileStore](https://python.langchain.com/api_reference/langchain/storage/langchain.storage.file_system.LocalFileStore.html) | [langchain](https://python.langchain.com/api_reference/langchain/index.html) | ✅ | ✅ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain?style=flat-square&label=%20) |

### 安装

LangChain `LocalFileStore` 集成位于 `langchain` 包中：


```python
%pip install -qU langchain
```

## 实例化

现在我们可以实例化我们的字节存储：


```python
<!--IMPORTS:[{"imported": "LocalFileStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/langchain/storage/langchain.storage.file_system.LocalFileStore.html", "title": "LocalFileStore"}]-->
from pathlib import Path

from langchain.storage import LocalFileStore

root_path = Path.cwd() / "data"  # can also be a path set by a string

kv_store = LocalFileStore(root_path)
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


您可以在 `data` 文件夹中看到创建的文件：


```python
!ls {root_path}
```
```output
key1 key2
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

有关所有 `LocalFileStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/langchain/storage/langchain.storage.file_system.LocalFileStore.html


## 相关

- [键值存储概念指南](/docs/concepts/#key-value-stores)
