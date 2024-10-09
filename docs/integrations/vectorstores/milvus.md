---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/milvus.ipynb
---
# Milvus

>[Milvus](https://milvus.io/docs/overview.md) 是一个数据库，用于存储、索引和管理由深度神经网络和其他机器学习 (ML) 模型生成的大量嵌入向量。

本笔记本展示了如何使用与 Milvus 向量数据库相关的功能。

## 设置

您需要使用 `pip install -qU langchain-milvus` 安装 `langchain-milvus` 才能使用此集成。



```python
%pip install -qU  langchain_milvus
```

最新版本的 pymilvus 附带一个本地向量数据库 Milvus Lite，适合原型设计。如果您有大量数据，例如超过一百万个文档，我们建议在 [docker 或 kubernetes](https://milvus.io/docs/install_standalone-docker.md#Start-Milvus) 上设置一个更高性能的 Milvus 服务器。

### 凭证

使用 `Milvus` 向量存储不需要凭证。

## 初始化

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "Milvus", "source": "langchain_milvus", "docs": "https://python.langchain.com/api_reference/milvus/vectorstores/langchain_milvus.vectorstores.milvus.Milvus.html", "title": "Milvus"}]-->
from langchain_milvus import Milvus

# The easiest way is to use Milvus Lite where everything is stored in a local file.
# If you have a Milvus server you can use the server URI such as "http://localhost:19530".
URI = "./milvus_example.db"

vector_store = Milvus(
    embedding_function=embeddings,
    connection_args={"uri": URI},
)
```

### 使用 Milvus Collections 对数据进行分区

您可以在同一个 Milvus 实例中将不同的无关文档存储在不同的集合中，以保持上下文。

以下是如何创建新集合的方法


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Milvus"}]-->
from langchain_core.documents import Document

vector_store_saved = Milvus.from_documents(
    [Document(page_content="foo!")],
    embeddings,
    collection_name="langchain_example",
    connection_args={"uri": URI},
)
```

这里是如何检索已存储集合的方法


```python
vector_store_loaded = Milvus(
    embeddings,
    connection_args={"uri": URI},
    collection_name="langchain_example",
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 将项目添加到向量存储

我们可以通过使用 `add_documents` 函数将项目添加到我们的向量存储。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Milvus"}]-->
from uuid import uuid4

from langchain_core.documents import Document

document_1 = Document(
    page_content="I had chocalate chip pancakes and scrambled eggs for breakfast this morning.",
    metadata={"source": "tweet"},
)

document_2 = Document(
    page_content="The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees.",
    metadata={"source": "news"},
)

document_3 = Document(
    page_content="Building an exciting new project with LangChain - come check it out!",
    metadata={"source": "tweet"},
)

document_4 = Document(
    page_content="Robbers broke into the city bank and stole $1 million in cash.",
    metadata={"source": "news"},
)

document_5 = Document(
    page_content="Wow! That was an amazing movie. I can't wait to see it again.",
    metadata={"source": "tweet"},
)

document_6 = Document(
    page_content="Is the new iPhone worth the price? Read this review to find out.",
    metadata={"source": "website"},
)

document_7 = Document(
    page_content="The top 10 soccer players in the world right now.",
    metadata={"source": "website"},
)

document_8 = Document(
    page_content="LangGraph is the best framework for building stateful, agentic applications!",
    metadata={"source": "tweet"},
)

document_9 = Document(
    page_content="The stock market is down 500 points today due to fears of a recession.",
    metadata={"source": "news"},
)

document_10 = Document(
    page_content="I have a bad feeling I am going to get deleted :(",
    metadata={"source": "tweet"},
)

documents = [
    document_1,
    document_2,
    document_3,
    document_4,
    document_5,
    document_6,
    document_7,
    document_8,
    document_9,
    document_10,
]
uuids = [str(uuid4()) for _ in range(len(documents))]

vector_store.add_documents(documents=documents, ids=uuids)
```



```output
['b0248595-2a41-4f6b-9c25-3a24c1278bb3',
 'fa642726-5329-4495-a072-187e948dd71f',
 '9905001c-a4a3-455e-ab94-72d0ed11b476',
 'eacc7256-d7fa-4036-b1f7-83d7a4bee0c5',
 '7508f7ff-c0c9-49ea-8189-634f8a0244d8',
 '2e179609-3ff7-4c6a-9e05-08978903fe26',
 'fab1f2ac-43e1-45f9-b81b-fc5d334c6508',
 '1206d237-ee3a-484f-baf2-b5ac38eeb314',
 'd43cbf9a-a772-4c40-993b-9439065fec01',
 '25e667bb-6f09-4574-a368-661069301906']
```


### 从向量存储中删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```



```output
(insert count: 0, delete count: 1, upsert count: 0, timestamp: 0, success count: 0, err count: 0, cost: 0)
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

#### 相似性搜索

执行简单的相似性搜索并对元数据进行过滤可以如下进行：


```python
results = vector_store.similarity_search(
    "LangChain provides abstractions to make working with LLMs easy",
    k=2,
    filter={"source": "tweet"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```
```output
* Building an exciting new project with LangChain - come check it out! [{'pk': '9905001c-a4a3-455e-ab94-72d0ed11b476', 'source': 'tweet'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'pk': '1206d237-ee3a-484f-baf2-b5ac38eeb314', 'source': 'tweet'}]
```
#### 带分数的相似性搜索

您还可以使用分数进行搜索：


```python
results = vector_store.similarity_search_with_score(
    "Will it be hot tomorrow?", k=1, filter={"source": "news"}
)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```
```output
* [SIM=21192.628906] bar [{'pk': '2', 'source': 'https://example.com'}]
```
有关使用 `Milvus` 向量存储时可用的所有搜索选项的完整列表，请访问 [API 参考](https://python.langchain.com/api_reference/milvus/vectorstores/langchain_milvus.vectorstores.milvus.Milvus.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 1})
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```



```output
[Document(metadata={'pk': 'eacc7256-d7fa-4036-b1f7-83d7a4bee0c5', 'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

### 每用户检索

在构建检索应用时，您通常需要考虑多个用户。这意味着您可能不仅为一个用户存储数据，而是为许多不同的用户存储数据，并且他们不应该能够看到彼此的数据。

Milvus建议使用[partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy)来实现多租户，这里是一个示例。
> Partition key的功能在Milvus Lite中目前不可用，如果您想使用它，您需要从[docker或kubernetes](https://milvus.io/docs/install_standalone-docker.md#Start-Milvus)启动Milvus服务器。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Milvus"}]-->
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"uri": URI},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

请将`<partition_key>`替换为指定为分区键的字段名称。

Milvus根据指定的分区键进行分区，按照分区键过滤实体，并在过滤后的实体中进行搜索。



```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": "namespace == 'ankush'"}).invoke(
    "where did i work?"
)
```



```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```



```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```



```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```


## API参考

有关所有__ModuleName__VectorStore功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/milvus/vectorstores/langchain_milvus.vectorstores.milvus.Milvus.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
