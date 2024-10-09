---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/mongodb_atlas.ipynb
---
# MongoDB Atlas

本笔记本介绍如何在LangChain中使用`langchain-mongodb`包进行MongoDB Atlas向量搜索。

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/) 是一个完全托管的云数据库，适用于AWS、Azure和GCP。它支持对MongoDB文档数据的原生向量搜索和全文搜索（BM25）。

>[MongoDB Atlas向量搜索](https://www.mongodb.com/products/platform/atlas-vector-search) 允许将嵌入存储在MongoDB文档中，创建向量搜索索引，并使用近似最近邻算法（`Hierarchical Navigable Small Worlds`）执行KNN搜索。它使用[$vectorSearch MQL阶段](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)。

## 设置

*一个运行MongoDB版本6.0.11、7.0.2或更高版本（包括RC）的Atlas集群。

要使用MongoDB Atlas，您必须首先部署一个集群。我们提供了一个永久免费层的集群可用。要开始，请访问Atlas：[快速入门](https://www.mongodb.com/docs/atlas/getting-started/)。

您需要安装`langchain-mongodb`和`pymongo`才能使用此集成。


```python
pip install -qU langchain-mongodb pymongo
```

### 凭证

在这个笔记本中，您需要找到您的MongoDB集群URI。

有关查找集群URI的信息，请阅读[本指南](https://www.mongodb.com/docs/manual/reference/connection-string/)。


```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的[LangSmith](https://docs.smith.langchain.com/) API密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "MongoDBAtlasVectorSearch", "source": "langchain_mongodb.vectorstores", "docs": "https://python.langchain.com/api_reference/mongodb/vectorstores/langchain_mongodb.vectorstores.MongoDBAtlasVectorSearch.html", "title": "MongoDB Atlas"}]-->
from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_test_db"
COLLECTION_NAME = "langchain_test_vectorstores"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "langchain-test-index-vectorstores"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=embeddings,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    relevance_score_fn="cosine",
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 向向量存储添加项目

我们可以通过使用`add_documents`函数向我们的向量存储添加项目。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "MongoDB Atlas"}]-->
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
['03ad81e8-32a0-46f0-b7d8-f5b977a6b52a',
 '8396a68d-f4a3-4176-a581-a1a8c303eea4',
 'e7d95150-67f6-499f-b611-84367c50fa60',
 '8c31b84e-2636-48b6-8b99-9fccb47f7051',
 'aa02e8a2-a811-446a-9785-8cea0faba7a9',
 '19bd72ff-9766-4c3b-b1fd-195c732c562b',
 '642d6f2f-3e34-4efa-a1ed-c4ba4ef0da8d',
 '7614bb54-4eb5-4b3b-990c-00e35cb31f99',
 '69e18c67-bf1b-43e5-8a6e-64fb3f240e52',
 '30d599a7-4a1a-47a9-bbf8-6ed393e2e33c']
```


### 从向量存储删除项目



```python
vector_store.delete(ids=[uuids[-1]])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

#### 相似性搜索

执行简单的相似性搜索可以如下进行：


```python
results = vector_store.similarity_search(
    "LangChain provides abstractions to make working with LLMs easy", k=2
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```
```output
* Building an exciting new project with LangChain - come check it out! [{'_id': 'e7d95150-67f6-499f-b611-84367c50fa60', 'source': 'tweet'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'_id': '7614bb54-4eb5-4b3b-990c-00e35cb31f99', 'source': 'tweet'}]
```
#### 带分数的相似性搜索

您也可以使用分数进行搜索：


```python
results = vector_store.similarity_search_with_score("Will it be hot tomorrow?", k=1)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```
```output
* [SIM=0.784560] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'_id': '8396a68d-f4a3-4176-a581-a1a8c303eea4', 'source': 'news'}]
```
### 使用相似性搜索进行预过滤

Atlas 向量搜索支持使用 MQL 操作符进行过滤的预过滤。以下是一个示例索引和查询，基于上面加载的相同数据，允许您对“页面”字段进行元数据过滤。您可以使用定义的过滤器更新现有索引，并使用向量搜索进行预过滤。

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "source"
    }
  ]
}
```

您还可以使用 `MongoDBAtlasVectorSearch.create_index` 方法以编程方式更新索引。

```python
vectorstore.create_index(
  dimensions=1536,
  filters=[{"type":"filter", "path":"source"}],
  update=True
)
```

然后您可以使用以下方式运行带过滤器的查询：

```python
results = vector_store.similarity_search(query="foo",k=1,pre_filter={"source": {"$eq": "https://example.com"}})
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```

#### 其他搜索方法

还有多种其他搜索方法未在此笔记本中涵盖，例如MMR搜索或按向量搜索。有关`AstraDBVectorStore`可用搜索功能的完整列表，请查看[API参考](https://python.langchain.com/api_reference/astradb/vectorstores/langchain_astradb.vectorstores.AstraDBVectorStore.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。

以下是如何将您的向量存储转换为检索器，然后使用简单的查询和过滤器调用检索器。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 1, "score_threshold": 0.2},
)
retriever.invoke("Stealing from the bank is a crime")
```



```output
[Document(metadata={'_id': '8c31b84e-2636-48b6-8b99-9fccb47f7051', 'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成（RAG）的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用RAG进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

# 其他说明
>* 更多文档可以在 [LangChain-MongoDB](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/) 网站找到
>* 此功能已普遍可用，准备好进行生产部署。
>* LangChain 版本 0.0.305 ([发布说明](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305)) 引入了对 $vectorSearch MQL 阶段的支持，该功能在 MongoDB Atlas 6.0.11 和 7.0.2 中可用。使用早期版本 MongoDB Atlas 的用户需要将其 LangChain 版本固定为 `<=0.0.304`
>

## API 参考

有关所有 `MongoDBAtlasVectorSearch` 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/mongodb/index.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
