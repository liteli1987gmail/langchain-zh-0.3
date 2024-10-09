---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/pgvector.ipynb
---
# PGVector

> 使用 `postgres` 作为后端并利用 `pgvector` 扩展的 LangChain 向量存储抽象实现。

代码位于一个名为: [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/) 的集成包中。

## 状态

这段代码已从 `langchain_community` 移植到一个名为 `langchain-postgres` 的专用包中。已做出以下更改：

* langchain_postgres 仅与 psycopg3 一起使用。请将您的连接字符串从 `postgresql+psycopg2://...` 更新为 `postgresql+psycopg://langchain:langchain@...`（是的，驱动程序名称是 `psycopg` 而不是 `psycopg3`，但它将使用 `psycopg3`）。
* 嵌入存储和集合的架构已更改，以使 add_documents 能够正确处理用户指定的 ID。
* 现在必须传递一个显式的连接对象。


目前，**没有机制**支持在架构更改时轻松迁移数据。因此，向量存储中的任何架构更改都将要求用户重新创建表并重新添加文档。
如果这让您担忧，请使用其他向量存储。如果没有，这个实现应该适合您的用例。

## 设置

首先下载第三方库:


```python
pip install -qU langchain_postgres
```

您可以运行以下命令来启动一个带有 `pgvector` 扩展的 postgres 容器：


```python
%docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

### 凭证

运行此笔记本不需要任何凭证，只需确保您已下载 `langchain_postgres` 包并正确启动了 postgres 容器。

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 实例化

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "PGVector"}]-->
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"


vector_store = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## 管理向量存储

### 向向量存储添加项目

请注意，通过 ID 添加文档将覆盖任何匹配该 ID 的现有文档。


```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]

vector_store.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```



```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```


### 从向量存储删除项目


```python
vector_store.delete(ids=["3"])
```

## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 过滤支持

向量存储支持一组可以应用于文档元数据字段的过滤器。

| 操作符 | 意义/类别              |
|----------|-------------------------|
| \$eq      | 等于 (==)               |
| \$ne      | 不等于 (!=)             |
| \$lt      | 小于 (&lt;)             |
| \$lte     | 小于或等于 (&lt;=)     |
| \$gt      | 大于 (>)                |
| \$gte     | 大于或等于 (>=) |
| \$in      | 特殊情况 (in)      |
| \$nin     | 特殊情况 (not in)  |
| \$between | 特殊情况 (between) |
| \$like    | 文本 (like)             |
| \$ilike   | 文本 (不区分大小写 like) |
| \$and     | 逻辑 (and)           |
| \$or      | 逻辑 (or)            |

### 直接查询

执行简单的相似性搜索可以如下进行：


```python
results = vector_store.similarity_search(
    "kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}}
)
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```
```output
* there are cats in the pond [{'id': 1, 'topic': 'animals', 'location': 'pond'}]
* the library hosts a weekly story time for kids [{'id': 9, 'topic': 'reading', 'location': 'library'}]
* ducks are also found in the pond [{'id': 2, 'topic': 'animals', 'location': 'pond'}]
* the new art exhibit is fascinating [{'id': 5, 'topic': 'art', 'location': 'museum'}]
```
如果您提供一个包含多个字段的字典，但没有操作符，顶层将被解释为逻辑 **AND** 过滤器


```python
vector_store.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```



```output
[Document(metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}, page_content='there are cats in the pond'),
 Document(metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}, page_content='ducks are also found in the pond')]
```



```python
vector_store.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```



```output
[Document(metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}, page_content='there are cats in the pond'),
 Document(metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}, page_content='ducks are also found in the pond')]
```


如果您想执行相似性搜索并接收相应的分数，可以运行：


```python
results = vector_store.similarity_search_with_score(query="cats", k=1)
for doc, score in results:
    print(f"* [SIM={score:3f}] {doc.page_content} [{doc.metadata}]")
```
```output
* [SIM=0.763449] there are cats in the pond [{'id': 1, 'topic': 'animals', 'location': 'pond'}]
```
有关您可以在 `PGVector` 向量存储上执行的不同搜索的完整列表，请参阅 [API 参考](https://python.langchain.com/api_reference/postgres/vectorstores/langchain_postgres.vectorstores.PGVector.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 1})
retriever.invoke("kitty")
```



```output
[Document(metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}, page_content='there are cats in the pond')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## API 参考

有关所有 __ModuleName__VectorStore 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/postgres/vectorstores/langchain_postgres.vectorstores.PGVector.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
