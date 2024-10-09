---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/qdrant.ipynb
---
# Qdrant

> [Qdrant](https://qdrant.tech/documentation/)（读作：quadrant）是一个向量相似性搜索引擎。它提供了一个生产就绪的服务，具有方便的API来存储、搜索和管理向量，并支持额外的负载和扩展过滤。这使得它在各种神经网络或基于语义的匹配、分面搜索和其他应用中非常有用。

本文件演示了如何将Qdrant与LangChain结合使用，以进行密集/稀疏和混合检索。

> 本页面记录了支持通过Qdrant的新[查询API](https://qdrant.tech/blog/qdrant-1.10.x/)的`QdrantVectorStore`类，支持多种检索模式。它要求您运行Qdrant v1.10.0或更高版本。


## 设置

有多种运行`Qdrant`的模式，具体取决于选择的模式，会有一些细微的差别。选项包括：
- 本地模式，无需服务器
- Docker部署
- Qdrant云

请参阅[安装说明](https://qdrant.tech/documentation/install/)。


```python
%pip install -qU langchain-qdrant
```

### 凭证

在此笔记本中运行代码不需要任何凭证。

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

### 本地模式

Python 客户端允许您在本地模式下运行相同的代码，而无需运行 Qdrant 服务器。这对于测试和调试或仅存储少量向量非常有用。嵌入可以完全保存在内存中或持久化到磁盘上。

#### 内存中

对于某些测试场景和快速实验，您可能更喜欢将所有数据仅保存在内存中，因此在客户端被销毁时会丢失 - 通常是在脚本/笔记本结束时。


import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "QdrantVectorStore", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.QdrantVectorStore.html", "title": "Qdrant"}]-->
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

client = QdrantClient(":memory:")

client.create_collection(
    collection_name="demo_collection",
    vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="demo_collection",
    embedding=embeddings,
)
```

#### 磁盘存储

本地模式在不使用 Qdrant 服务器的情况下，也可以将您的向量存储在磁盘上，以便在运行之间持久化。


```python
client = QdrantClient(path="/tmp/langchain_qdrant")

client.create_collection(
    collection_name="demo_collection",
    vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="demo_collection",
    embedding=embeddings,
)
```

### 本地服务器部署

无论您选择使用 [Docker 容器](https://qdrant.tech/documentation/install/) 在本地启动 Qdrant，还是选择使用 [官方 Helm 图表](https://github.com/qdrant/qdrant-helm) 进行 Kubernetes 部署，连接到该实例的方式都是相同的。您需要提供一个指向服务的 URL。


```python
url = "<---qdrant url here --->"
docs = []  # put docs here
qdrant = QdrantVectorStore.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### Qdrant 云

如果您不想忙于管理基础设施，可以选择在 [Qdrant 云](https://cloud.qdrant.io/) 上设置一个完全托管的 Qdrant 集群。这里提供一个永久免费 1GB 的集群供您试用。使用托管版本的 Qdrant 的主要区别在于，您需要提供一个 API 密钥，以保护您的部署不被公开访问。该值也可以设置在 `QDRANT_API_KEY` 环境变量中。


```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = QdrantVectorStore.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## 使用现有集合

要获取一个 `langchain_qdrant.Qdrant` 实例而不加载任何新文档或文本，您可以使用 `Qdrant.from_existing_collection()` 方法。


```python
qdrant = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="my_documents",
    url="http://localhost:6333",
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 向向量存储添加项目

我们可以使用 `add_documents` 函数向我们的向量存储添加项目。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Qdrant"}]-->
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
['c04134c3-273d-4766-949a-eee46052ad32',
 '9e6ba50c-794f-4b88-94e5-411f15052a02',
 'd3202666-6f2b-4186-ac43-e35389de8166',
 '50d8d6ee-69bf-4173-a6a2-b254e9928965',
 'bd2eae02-74b5-43ec-9fcf-09e9d9db6fd3',
 '6dae6b37-826d-4f14-8376-da4603b35de3',
 'b0964ab5-5a14-47b4-a983-37fa5c5bd154',
 '91ed6c56-fe53-49e2-8199-c3bb3c33c3eb',
 '42a580cb-7469-4324-9927-0febab57ce92',
 'ff774e5c-f158-4d12-94e2-0a0162b22f27']
```


### 从向量存储中删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

使用Qdrant向量存储的最简单场景是执行相似性搜索。在后台，我们的查询将被编码为向量嵌入，并用于在Qdrant集合中查找相似文档。


```python
results = vector_store.similarity_search(
    "LangChain provides abstractions to make working with LLMs easy", k=2
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```
```output
* Building an exciting new project with LangChain - come check it out! [{'source': 'tweet', '_id': 'd3202666-6f2b-4186-ac43-e35389de8166', '_collection_name': 'demo_collection'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'source': 'tweet', '_id': '91ed6c56-fe53-49e2-8199-c3bb3c33c3eb', '_collection_name': 'demo_collection'}]
```
`QdrantVectorStore`支持3种相似性搜索模式。它们可以在设置类时使用`retrieval_mode`参数进行配置。

- 密集向量搜索（默认）
- 稀疏向量搜索
- 混合搜索

### 密集向量搜索

仅使用密集向量进行搜索，

- `retrieval_mode` 参数应设置为 `RetrievalMode.DENSE`（默认）。
- 应为 `embedding` 参数提供一个 [密集嵌入](https://python.langchain.com/docs/integrations/text_embedding/) 值。


```python
<!--IMPORTS:[{"imported": "RetrievalMode", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.RetrievalMode.html", "title": "Qdrant"}]-->
from langchain_qdrant import RetrievalMode

qdrant = QdrantVectorStore.from_documents(
    docs,
    embedding=embeddings,
    location=":memory:",
    collection_name="my_documents",
    retrieval_mode=RetrievalMode.DENSE,
)

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

### 稀疏向量搜索

仅使用稀疏向量进行搜索，

- `retrieval_mode` 参数应设置为 `RetrievalMode.SPARSE`。
- 必须提供一个使用任何稀疏嵌入大模型供应商实现的 [`SparseEmbeddings`](https://github.com/langchain-ai/langchain/blob/master/libs/partners/qdrant/langchain_qdrant/sparse_embeddings.py) 接口作为 `sparse_embedding` 参数的值。

`langchain-qdrant` 包提供了一个基于 [FastEmbed](https://github.com/qdrant/fastembed) 的开箱即用实现。

要使用它，请安装 FastEmbed 包。


```python
%pip install fastembed
```


```python
<!--IMPORTS:[{"imported": "FastEmbedSparse", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/fastembed_sparse/langchain_qdrant.fastembed_sparse.FastEmbedSparse.html", "title": "Qdrant"}, {"imported": "RetrievalMode", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.RetrievalMode.html", "title": "Qdrant"}]-->
from langchain_qdrant import FastEmbedSparse, RetrievalMode

sparse_embeddings = FastEmbedSparse(model_name="Qdrant/bm25")

qdrant = QdrantVectorStore.from_documents(
    docs,
    sparse_embedding=sparse_embeddings,
    location=":memory:",
    collection_name="my_documents",
    retrieval_mode=RetrievalMode.SPARSE,
)

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

### 混合向量搜索

要使用密集和稀疏向量进行混合搜索并进行得分融合，

- `retrieval_mode` 参数应设置为 `RetrievalMode.HYBRID`。
- 应为 `embedding` 参数提供一个 [密集嵌入](https://python.langchain.com/docs/integrations/text_embedding/) 值。
- 必须提供一个使用任何稀疏嵌入大模型供应商实现的 [`SparseEmbeddings`](https://github.com/langchain-ai/langchain/blob/master/libs/partners/qdrant/langchain_qdrant/sparse_embeddings.py) 接口作为 `sparse_embedding` 参数的值。

请注意，如果您已使用 `HYBRID` 模式添加文档，则在搜索时可以切换到任何检索模式。因为密集和稀疏向量都在集合中可用。


```python
<!--IMPORTS:[{"imported": "FastEmbedSparse", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/fastembed_sparse/langchain_qdrant.fastembed_sparse.FastEmbedSparse.html", "title": "Qdrant"}, {"imported": "RetrievalMode", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.RetrievalMode.html", "title": "Qdrant"}]-->
from langchain_qdrant import FastEmbedSparse, RetrievalMode

sparse_embeddings = FastEmbedSparse(model_name="Qdrant/bm25")

qdrant = QdrantVectorStore.from_documents(
    docs,
    embedding=embeddings,
    sparse_embedding=sparse_embeddings,
    location=":memory:",
    collection_name="my_documents",
    retrieval_mode=RetrievalMode.HYBRID,
)

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

如果您想执行相似性搜索并接收相应的得分，可以运行：


```python
results = vector_store.similarity_search_with_score(
    query="Will it be hot tomorrow", k=1
)
for doc, score in results:
    print(f"* [SIM={score:3f}] {doc.page_content} [{doc.metadata}]")
```
```output
* [SIM=0.531834] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'source': 'news', '_id': '9e6ba50c-794f-4b88-94e5-411f15052a02', '_collection_name': 'demo_collection'}]
```
有关 `QdrantVectorStore` 可用的所有搜索功能的完整列表，请阅读 [API 参考](https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.QdrantVectorStore.html)

### 元数据过滤

Qdrant 具有一个 [广泛的过滤系统](https://qdrant.tech/documentation/concepts/filtering/)，支持丰富的类型。通过向 `similarity_search_with_score` 和 `similarity_search` 方法传递额外参数，也可以在 Langchain 中使用过滤器。


```python
from qdrant_client.http import models

results = vector_store.similarity_search(
    query="Who are the best soccer players in the world?",
    k=1,
    filter=models.Filter(
        should=[
            models.FieldCondition(
                key="page_content",
                match=models.MatchValue(
                    value="The top 10 soccer players in the world right now."
                ),
            ),
        ]
    ),
)
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```
```output
* The top 10 soccer players in the world right now. [{'source': 'website', '_id': 'b0964ab5-5a14-47b4-a983-37fa5c5bd154', '_collection_name': 'demo_collection'}]
```
### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 1})
retriever.invoke("Stealing from the bank is a crime")
```



```output
[Document(metadata={'source': 'news', '_id': '50d8d6ee-69bf-4173-a6a2-b254e9928965', '_collection_name': 'demo_collection'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## 自定义 Qdrant

在您的 LangChain 应用程序中，有选项使用现有的 Qdrant 集合。在这种情况下，您可能需要定义如何将 Qdrant 点映射到 LangChain `Document`。

### 命名向量

Qdrant 支持通过命名向量 [每个点多个向量](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors)。如果您使用的是外部创建的集合或希望使用不同命名的向量，可以通过提供其名称进行配置。



```python
<!--IMPORTS:[{"imported": "RetrievalMode", "source": "langchain_qdrant", "docs": "https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.RetrievalMode.html", "title": "Qdrant"}]-->
from langchain_qdrant import RetrievalMode

QdrantVectorStore.from_documents(
    docs,
    embedding=embeddings,
    sparse_embedding=sparse_embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    retrieval_mode=RetrievalMode.HYBRID,
    vector_name="custom_vector",
    sparse_vector_name="custom_sparse_vector",
)
```

### 元数据

Qdrant 存储您的向量嵌入以及可选的类似 JSON 的有效负载。有效负载是可选的，但由于 LangChain 假设嵌入是从文档生成的，我们保留上下文数据，以便您可以提取原始文本。

默认情况下，您的文档将存储在以下有效负载结构中：

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

但是，您可以决定为页面内容和元数据使用不同的键。如果您已经有一个想要重用的集合，这将很有用。


```python
QdrantVectorStore.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

## API 参考

有关所有 `QdrantVectorStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/qdrant/qdrant/langchain_qdrant.qdrant.QdrantVectorStore.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
