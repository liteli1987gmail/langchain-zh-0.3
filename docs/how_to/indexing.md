---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/indexing.ipynb
---
# 如何使用 LangChain 索引 API

在这里，我们将查看使用 LangChain 索引 API 的基本索引工作流程。

索引 API 允许您从任何来源加载文档并保持与向量存储的同步。具体来说，它帮助：

* 避免将重复内容写入向量存储
* 避免重写未更改的内容
* 避免对未更改的内容重新计算嵌入

所有这些都应该为您节省时间和金钱，并改善您的向量搜索结果。

至关重要的是，索引 API 即使在文档经过多个
转换步骤（例如，通过文本分块）后，也能与原始源文档一起工作。

## 它是如何工作的

LangChain 索引使用记录管理器 (`RecordManager`)，该管理器跟踪文档写入向量存储的情况。

在索引内容时，会为每个文档计算哈希，并在记录管理器中存储以下信息：

- 文档哈希（页面内容和元数据的哈希）
- 写入时间
- 源 ID -- 每个文档应在其元数据中包含信息，以便我们确定该文档的最终来源

## 删除模式

在将文档索引到向量存储时，可能需要删除向量存储中某些现有文档。在某些情况下，您可能希望删除与正在索引的新文档来自相同来源的任何现有文档。在其他情况下，您可能希望整体删除所有现有文档。索引 API 删除模式让您选择所需的行为：

| 清理模式 | 去重内容 | 可并行化 | 清理已删除的源文档 | 清理源文档和/或派生文档的变更 | 清理时间 |
|-------------|-----------------------|---------------|----------------------------------|----------------------------------------------------|---------------------|
| 无         | ✅                    | ✅            | ❌                               | ❌                                                 | -                  |
| 增量      | ✅                    | ✅            | ❌                               | ✅                                                 | 持续进行       |
| 完整      | ✅                    | ❌            | ✅                               | ✅                                                 | 索引结束时     |


`无` 不会进行任何自动清理，允许用户手动清理旧内容。

`增量` 和 `完整` 提供以下自动清理：

* 如果源文档或派生文档的内容发生了 **变化**，`增量` 或 `完整` 模式都会清理（删除）内容的先前版本。
* 如果源文档已被 **删除**（意味着它不包含在当前正在索引的文档中），`完整` 清理模式将正确地从向量存储中删除它，但 `增量` 模式不会。

当内容被修改时（例如，源PDF文件被修订），在索引期间会有一段时间，用户可能会同时返回新旧版本。这发生在新内容被写入后，但在旧版本被删除之前。

* `增量` 索引最小化了这段时间，因为它能够在写入时持续进行清理。
* `完整` 模式在所有批次写入后进行清理。

## 需求

1. 不要与通过索引 API 独立预填充内容的存储一起使用，因为记录管理器将不知道记录之前已被插入。
2. 仅适用于支持以下功能的 LangChain `vectorstore`：
* 通过 ID 添加文档（`add_documents` 方法带 `ids` 参数）
* 通过 ID 删除（`delete` 方法带 `ids` 参数）

兼容的向量存储：`Aerospike`，`AnalyticDB`，`AstraDB`，`AwaDB`，`AzureCosmosDBNoSqlVectorSearch`，`AzureCosmosDBVectorSearch`，`Bagel`，`Cassandra`，`Chroma`，`CouchbaseVectorStore`，`DashVector`，`DatabricksVectorSearch`，`DeepLake`，`Dingo`，`ElasticVectorSearch`，`ElasticsearchStore`，`FAISS`，`HanaDB`，`Milvus`，`MongoDBAtlasVectorSearch`，`MyScale`，`OpenSearchVectorSearch`，`PGVector`，`Pinecone`，`Qdrant`，`Redis`，`Rockset`，`ScaNN`，`SingleStoreDB`，`SupabaseVectorStore`，`SurrealDBStore`，`TimescaleVector`，`Vald`，`VDMS`，`Vearch`，`VespaStore`，`Weaviate`，`Yellowbrick`，`ZepVectorStore`，`TencentVectorDB`，`OpenSearchVectorSearch`。
  
## 注意

记录管理器依赖基于时间的机制来确定可以清理哪些内容（在使用 `full` 或 `incremental` 清理模式时）。

如果两个任务连续运行，第一个任务在时钟时间变化之前完成，则第二个任务可能无法清理内容。

在实际设置中，这不太可能成为问题，原因如下：

1. 记录管理器使用更高分辨率的时间戳。
2. 数据在第一次和第二次任务运行之间需要发生变化，如果任务之间的时间间隔很小，这种情况变得不太可能。
3. 索引任务通常需要超过几毫秒的时间。

## 快速入门


```python
<!--IMPORTS:[{"imported": "SQLRecordManager", "source": "langchain.indexes", "docs": "https://python.langchain.com/api_reference/langchain/indexes/langchain.indexes._sql_record_manager.SQLRecordManager.html", "title": "How to use the LangChain indexing API"}, {"imported": "index", "source": "langchain.indexes", "docs": "https://python.langchain.com/api_reference/core/indexing/langchain_core.indexing.api.index.html", "title": "How to use the LangChain indexing API"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to use the LangChain indexing API"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use the LangChain indexing API"}]-->
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

初始化向量存储并设置嵌入：


```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

使用适当的命名空间初始化记录管理器。

**建议：** 使用一个考虑到向量存储和向量存储中集合名称的命名空间；例如，'redis/my_docs'，'chromadb/my_docs' 或 'postgres/my_docs'。


```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

在使用记录管理器之前创建一个模式。


```python
record_manager.create_schema()
```

让我们索引一些测试文档：


```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

索引到一个空的向量存储中：


```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### ``None`` 删除模式

此模式不会自动清理旧版本的内容；但是，它仍然会处理内容去重。


```python
_clear()
```


```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```



```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```



```python
_clear()
```


```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```



```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```


第二次所有内容将被跳过：


```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```



```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```


### ``"incremental"`` 删除模式


```python
_clear()
```


```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```



```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```


重新索引应该导致两个文档都被**跳过** -- 也跳过嵌入操作！


```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```



```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```


如果我们在增量索引模式下不提供任何文档，则不会发生任何变化。


```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```



```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```


如果我们修改了一个文档，新版本将被写入，所有共享相同源的旧版本将被删除。


```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```


```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```



```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```


### ``"full"`` 删除模式

在 `full` 模式下，用户应该将应该被索引的所有内容传递给索引函数。

任何未传递到索引函数且存在于向量存储中的文档将被删除！

这种行为对于处理源文档的删除非常有用。


```python
_clear()
```


```python
all_docs = [doc1, doc2]
```


```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```



```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```


假设有人删除了第一个文档：


```python
del all_docs[0]
```


```python
all_docs
```



```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```


使用全模式将清理已删除的内容。


```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```



```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```


## 源

元数据属性包含一个名为 `source` 的字段。该源应指向与给定文档相关的 *最终* 来源。

例如，如果这些文档表示某个父文档的片段，则这两个文档的 `source` 应相同，并引用父文档。

`source` 通常应始终指定。仅在您 **从不** 打算使用 `incremental` 模式，并且由于某种原因无法正确指定 `source` 字段时，才使用 `None`。


```python
<!--IMPORTS:[{"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to use the LangChain indexing API"}]-->
from langchain_text_splitters import CharacterTextSplitter
```


```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```


```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```



```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```



```python
_clear()
```


```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```



```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```



```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

这应该删除与 `doggy.txt` 源相关的旧版本文档，并用新版本替换它们。


```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```



```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```



```python
vectorstore.similarity_search("dog", k=30)
```



```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```


## 与加载器一起使用

索引可以接受文档的可迭代对象或任何加载器。

**注意：** 加载器 **必须** 正确设置源键。


```python
<!--IMPORTS:[{"imported": "BaseLoader", "source": "langchain_core.document_loaders", "docs": "https://python.langchain.com/api_reference/core/document_loaders/langchain_core.document_loaders.base.BaseLoader.html", "title": "How to use the LangChain indexing API"}]-->
from langchain_core.document_loaders import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```


```python
_clear()
```


```python
loader = MyCustomLoader()
```


```python
loader.load()
```



```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```



```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```



```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```



```python
vectorstore.similarity_search("dog", k=30)
```



```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

