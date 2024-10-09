---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/couchbase.ipynb
---
# Couchbase
[Couchbase](http://couchbase.com/) 是一个屡获殊荣的分布式 NoSQL 云数据库，为您的所有云、移动、人工智能和边缘计算应用程序提供无与伦比的多功能性、性能、可扩展性和经济价值。Couchbase 通过为开发人员提供编码辅助和为其应用程序提供向量搜索来拥抱人工智能。

向量搜索是 Couchbase 中 [全文搜索服务](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html)（搜索服务）的一部分。

本教程解释了如何在 Couchbase 中使用向量搜索。您可以使用 [Couchbase Capella](https://www.couchbase.com/products/capella/) 或您自管理的 Couchbase 服务器。

## 设置

要访问 `CouchbaseVectorStore`，您首先需要安装 `langchain-couchbase` 第三方库：


```python
pip install -qU langchain-couchbase
```

### 凭证

前往 Couchbase [网站](https://cloud.couchbase.com) 创建一个新的连接，确保保存您的数据库用户名和密码：


```python
import getpass

COUCHBASE_CONNECTION_STRING = getpass.getpass(
    "Enter the connection string for the Couchbase cluster: "
)
DB_USERNAME = getpass.getpass("Enter the username for the Couchbase cluster: ")
DB_PASSWORD = getpass.getpass("Enter the password for the Couchbase cluster: ")
```

如果您想获得最佳的自动追踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 初始化

在实例化之前，我们需要创建一个连接。

### 创建 Couchbase 连接对象

我们最初创建一个与 Couchbase 集群的连接，然后将集群对象传递给向量存储。

在这里，我们使用上面的用户名和密码进行连接。您也可以使用任何其他支持的方式连接到您的集群。

有关连接到 Couchbase 集群的更多信息，请查看 [文档](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect)。


```python
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

auth = PasswordAuthenticator(DB_USERNAME, DB_PASSWORD)
options = ClusterOptions(auth)
cluster = Cluster(COUCHBASE_CONNECTION_STRING, options)

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

我们现在将在 Couchbase 集群中设置要用于向量搜索的桶、范围和集合名称。

在这个示例中，我们使用默认的范围和集合。


```python
BUCKET_NAME = "langchain_bucket"
SCOPE_NAME = "_default"
COLLECTION_NAME = "default"
SEARCH_INDEX_NAME = "langchain-test-index"
```

有关如何创建支持向量字段的搜索索引的详细信息，请参阅文档。

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)
  
- [Couchbase Server](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

### 简单实例化

下面，我们使用集群信息和搜索索引名称创建向量存储对象。

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
from langchain_couchbase.vectorstores import CouchbaseVectorStore

vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
)
```

### 指定文本和嵌入字段

您可以选择使用 `text_key` 和 `embedding_key` 字段为文档指定文本和嵌入字段。


```python
vector_store_specific = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
    text_key="text",
    embedding_key="embedding",
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 将项目添加到向量存储

我们可以通过使用 `add_documents` 函数将项目添加到我们的向量存储。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Couchbase "}]-->
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

### 从向量存储中删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```

## 查询向量存储

一旦您的向量存储被创建并且相关文档已被添加，您很可能希望在运行链或代理时查询它。

### 直接查询

#### 相似性搜索

执行简单的相似性搜索可以如下进行：


```python
results = vector_store.similarity_search(
    "LangChain provides abstractions to make working with LLMs easy",
    k=2,
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

#### 带分数的相似性搜索

您还可以通过调用 `similarity_search_with_score` 方法来获取结果的分数。


```python
results = vector_store.similarity_search_with_score("Will it be hot tomorrow?", k=1)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### 指定返回字段

您可以使用 `fields` 参数在搜索中指定要从文档中返回的字段。这些字段作为返回文档的 `metadata` 对象的一部分返回。您可以获取存储在搜索索引中的任何字段。文档的 `text_key` 作为文档的 `page_content` 的一部分返回。

如果您不指定要获取的字段，则返回索引中存储的所有字段。

如果您想获取元数据中的某个字段，则需要使用 `.` 指定它。

例如，要获取元数据中的 `source` 字段，您需要指定 `metadata.source`。



```python
query = "What did I eat for breakfast today?"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

### 混合查询

Couchbase 允许您通过将向量搜索结果与文档的非向量字段（如 `metadata` 对象）上的搜索结合来进行混合搜索。

结果将基于向量搜索和搜索服务支持的搜索结果的组合。每个组件搜索的分数相加以获得结果的总分。

要执行混合搜索，可以传递一个可选参数 `search_options`，该参数可以传递给所有相似性搜索。
有关 `search_options` 的不同搜索/查询选项，请参见 [这里](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)。

#### 创建多样化的元数据以进行混合搜索
为了模拟混合搜索，让我们从现有文档中创建一些随机元数据。
我们均匀地向元数据添加三个字段，`date` 在2010年到2020年之间，`rating` 在1到5之间，`author` 设置为 John Doe 或 Jane Doe。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Couchbase "}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Couchbase "}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

vector_store.add_documents(docs)

query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0].metadata)
```

### 按确切值查询
我们可以在 `metadata` 对象中的文本字段（如作者）上搜索确切匹配。


```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={"query": {"field": "metadata.author", "match": "John Doe"}},
    fields=["metadata.author"],
)
print(results[0])
```

### 按部分匹配查询
我们可以通过指定搜索的模糊度来搜索部分匹配。当您想要搜索搜索查询的轻微变体或拼写错误时，这非常有用。

在这里，“Jae”与“Jane”接近（模糊度为1）。


```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {"field": "metadata.author", "match": "Jae", "fuzziness": 1}
    },
    fields=["metadata.author"],
)
print(results[0])
```

### 按日期范围查询
我们可以在日期字段（如 `metadata.date`）上搜索在日期范围查询内的文档。


```python
query = "Any mention about independence?"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {
            "start": "2016-12-31",
            "end": "2017-01-02",
            "inclusive_start": True,
            "inclusive_end": False,
            "field": "metadata.date",
        }
    },
)
print(results[0])
```

### 按数值范围查询
我们可以搜索在 `metadata.rating` 这样的数值字段范围内的文档。


```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "min": 3,
            "max": 5,
            "inclusive_min": True,
            "inclusive_max": True,
            "field": "metadata.rating",
        }
    },
)
print(results[0])
```

### 组合多个搜索查询
不同的搜索查询可以使用 AND（合取）或 OR（析取）运算符组合。

在这个例子中，我们检查评分在 3 到 4 之间且日期在 2015 到 2018 之间的文档。


```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "conjuncts": [
                {"min": 3, "max": 4, "inclusive_max": True, "field": "metadata.rating"},
                {"start": "2016-12-31", "end": "2017-01-02", "field": "metadata.date"},
            ]
        }
    },
)
print(results[0])
```

### 其他查询
同样，您可以在 `search_options` 参数中使用任何支持的查询方法，如地理距离、区域搜索、通配符、正则表达式等。有关可用查询方法及其语法的更多详细信息，请参阅文档。

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

### 通过转换为检索器查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。

以下是如何将您的向量存储转换为检索器，然后使用简单查询和过滤器调用检索器。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 1, "score_threshold": 0.5},
)
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```

## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

# 常见问题

## 问题：我应该在创建 CouchbaseVectorStore 对象之前创建搜索索引吗？
是的，目前您需要在创建 `CouchbaseVectorStore` 对象之前创建搜索索引。


## 问题：我在搜索结果中没有看到我指定的所有字段。

在Couchbase中，我们只能返回存储在搜索索引中的字段。请确保您尝试在搜索结果中访问的字段是搜索索引的一部分。

处理此问题的一种方法是动态地在索引中索引和存储文档的字段。

- 在Capella中，您需要进入“高级模式”，然后在“常规设置”下的下拉菜单中，您可以勾选“[X] 存储动态字段”或“[X] 索引动态字段”。
- 在Couchbase Server中，在索引编辑器（而不是快速编辑器）下的“高级”下拉菜单中，您可以勾选“[X] 存储动态字段”或“[X] 索引动态字段”。

请注意，这些选项会增加索引的大小。

有关动态映射的更多详细信息，请参阅[文档](https://docs.couchbase.com/cloud/search/customize-index.html)。


## 问题：我无法在搜索结果中看到元数据对象。
这很可能是由于文档中的`metadata`字段未被Couchbase搜索索引索引和/或存储。为了在文档中索引`metadata`字段，您需要将其作为子映射添加到索引中。

如果您选择在映射中映射所有字段，您将能够通过所有元数据字段进行搜索。或者，为了优化索引，您可以选择要索引的`metadata`对象中的特定字段。您可以参考[文档](https://docs.couchbase.com/cloud/search/customize-index.html)以了解有关索引子映射的更多信息。

创建子映射

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)

## API 参考

有关所有 `CouchbaseVectorStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/couchbase/vectorstores/langchain_couchbase.vectorstores.CouchbaseVectorStore.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
