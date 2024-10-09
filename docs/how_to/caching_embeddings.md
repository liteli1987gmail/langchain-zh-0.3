---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/caching_embeddings.ipynb
---
# 缓存

嵌入可以存储或临时缓存，以避免需要重新计算它们。

缓存嵌入可以使用 `CacheBackedEmbeddings` 来完成。缓存支持的嵌入器是一个包装器，它在一个键值存储中缓存嵌入。
文本被哈希处理，哈希值用作缓存中的键。

初始化 `CacheBackedEmbeddings` 的主要支持方式是 `from_bytes_store`。它接受以下参数：

- underlying_embedder: 用于嵌入的嵌入器。
- document_embedding_cache: 用于缓存文档嵌入的任何 [`ByteStore`](/docs/integrations/stores/)。
- batch_size: （可选，默认为 `None`）在存储更新之间要嵌入的文档数量。
- namespace: （可选，默认为 ``）用于文档缓存的命名空间。此命名空间用于避免与其他缓存的冲突。例如，将其设置为所使用的嵌入模型的名称。
- query_embedding_cache: （可选，默认为 `None` 或不缓存）用于缓存查询嵌入的 [`ByteStore`](/docs/integrations/stores/)，或 `True` 以使用与 `document_embedding_cache` 相同的存储。

**注意**:

- 确保设置 `namespace` 参数，以避免使用不同嵌入模型嵌入相同文本时发生冲突。
- `CacheBackedEmbeddings` 默认不缓存查询嵌入。要启用查询缓存，需要指定 `query_embedding_cache`。


```python
<!--IMPORTS:[{"imported": "CacheBackedEmbeddings", "source": "langchain.embeddings", "docs": "https://python.langchain.com/api_reference/langchain/embeddings/langchain.embeddings.cache.CacheBackedEmbeddings.html", "title": "Caching"}]-->
from langchain.embeddings import CacheBackedEmbeddings
```

## 与向量存储一起使用

首先，让我们看一个使用本地文件系统存储嵌入并使用FAISS向量存储进行检索的示例。


```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```


```python
<!--IMPORTS:[{"imported": "LocalFileStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/langchain/storage/langchain.storage.file_system.LocalFileStore.html", "title": "Caching"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Caching"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Caching"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Caching"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Caching"}]-->
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

在嵌入之前缓存是空的：


```python
list(store.yield_keys())
```



```output
[]
```


加载文档，将其拆分为块，嵌入每个块并将其加载到向量存储中。


```python
raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

创建向量存储：


```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```
```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```
如果我们尝试再次创建向量存储，它会快得多，因为不需要重新计算任何嵌入。


```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```
```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```
这里是一些创建的嵌入：


```python
list(store.yield_keys())[:5]
```



```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```


# 交换 `ByteStore`

为了使用不同的 `ByteStore`，只需在创建 `CacheBackedEmbeddings` 时使用它。下面，我们创建一个等效的缓存嵌入对象，但使用非持久的 `InMemoryByteStore`：


```python
<!--IMPORTS:[{"imported": "CacheBackedEmbeddings", "source": "langchain.embeddings", "docs": "https://python.langchain.com/api_reference/langchain/embeddings/langchain.embeddings.cache.CacheBackedEmbeddings.html", "title": "Caching"}, {"imported": "InMemoryByteStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html", "title": "Caching"}]-->
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
