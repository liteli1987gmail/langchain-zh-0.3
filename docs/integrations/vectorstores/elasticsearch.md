---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/elasticsearch.ipynb
---
# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) 是一个分布式的、RESTful的搜索和分析引擎，能够执行向量和词汇搜索。它建立在 Apache Lucene 库之上。

本笔记本展示了如何使用与 `Elasticsearch` 向量存储相关的功能。

## 设置

为了使用 `Elasticsearch` 向量搜索，您必须安装 `langchain-elasticsearch` 包。


```python
%pip install -qU langchain-elasticsearch
```

### 凭证

有两种主要方式可以设置Elasticsearch实例以供使用：

1. Elastic Cloud：Elastic Cloud是一个托管的Elasticsearch服务。注册[免费试用](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation)。

要连接到不需要
登录凭证的Elasticsearch实例（以安全模式启动docker实例），请将Elasticsearch URL和索引名称与
嵌入对象一起传递给构造函数。

2. 本地安装Elasticsearch：通过本地运行Elasticsearch开始使用。最简单的方法是使用官方的Elasticsearch Docker镜像。有关更多信息，请参见[Elasticsearch Docker文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)。


### 通过Docker运行Elasticsearch
示例：运行一个单节点的Elasticsearch实例，安全性禁用。这不推荐用于生产环境。


```python
%docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```


### 使用身份验证运行
对于生产环境，我们建议您启用安全性运行。要使用登录凭据连接，您可以使用参数 `es_api_key` 或 `es_user` 和 `es_password`。

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
from langchain_elasticsearch import ElasticsearchStore

elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="langchain_index",
    embedding=embeddings,
    es_user="elastic",
    es_password="changeme",
)
```

#### 如何获取默认 "elastic" 用户的密码？

要获取默认 "elastic" 用户的 Elastic Cloud 密码：
1. 登录到 Elastic Cloud 控制台 https://cloud.elastic.co
2. 转到 "安全" > "用户"
3. 找到 "elastic" 用户并点击 "编辑"
4. 点击 "重置密码"
5. 按照提示重置密码

#### 如何获取 API 密钥？

要获取 API 密钥：
1. 登录到 Elastic Cloud 控制台，网址为 https://cloud.elastic.co
2. 打开 Kibana，前往 Stack Management > API Keys
3. 点击 "创建 API 密钥"
4. 输入 API 密钥的名称，然后点击 "创建"
5. 复制 API 密钥并粘贴到 `api_key` 参数中

### Elastic Cloud

要连接到 Elastic Cloud 上的 Elasticsearch 实例，您可以使用 `es_cloud_id` 参数或 `es_url`。


```python
elastic_vector_search = ElasticsearchStore(
    es_cloud_id="<cloud_id>",
    index_name="test_index",
    embedding=embeddings,
    es_user="elastic",
    es_password="changeme",
)
```

如果您希望获得最佳的自动追踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

Elasticsearch 正在本地的 localhost:9200 上运行，使用 [docker](#running-elasticsearch-via-docker)。有关如何从 Elastic Cloud 连接到 Elasticsearch 的更多详细信息，请参见上面的 [使用身份验证连接](#running-with-authentication)。



```python
from langchain_elasticsearch import ElasticsearchStore

vector_store = ElasticsearchStore(
    "langchain-demo", embedding=embeddings, es_url="http://localhost:9201"
)
```

## 管理向量存储

### 向向量存储添加项目


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Elasticsearch"}]-->
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
['21cca03c-9089-42d2-b41c-3d156be2b519',
 'a6ceb967-b552-4802-bb06-c0e95fce386e',
 '3a35fac4-e5f0-493b-bee0-9143b41aedae',
 '176da099-66b1-4d6a-811b-dfdfe0808d30',
 'ecfa1a30-3c97-408b-80c0-5c43d68bf5ff',
 'c0f08baa-e70b-4f83-b387-c6e0a0f36f73',
 '489b2c9c-1925-43e1-bcf0-0fa94cf1cbc4',
 '408c6503-9ba4-49fd-b1cc-95584cd914c5',
 '5248c899-16d5-4377-a9e9-736ca443ad4f',
 'ca182769-c4fc-4e25-8f0a-8dd0a525955c']
```


### 从向量存储删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。这些示例还展示了在搜索时如何使用过滤。

### 直接查询

#### 相似性搜索

执行简单的相似性搜索并对元数据进行过滤可以如下进行：


```python
results = vector_store.similarity_search(
    query="LangChain provides abstractions to make working with LLMs easy",
    k=2,
    filter=[{"term": {"metadata.source.keyword": "tweet"}}],
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```
```output
* Building an exciting new project with LangChain - come check it out! [{'source': 'tweet'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'source': 'tweet'}]
```
#### 带分数的相似性搜索

如果您想执行相似性搜索并接收相应的分数，可以运行：


```python
results = vector_store.similarity_search_with_score(
    query="Will it be hot tomorrow",
    k=1,
    filter=[{"term": {"metadata.source.keyword": "news"}}],
)
for doc, score in results:
    print(f"* [SIM={score:3f}] {doc.page_content} [{doc.metadata}]")
```
```output
* [SIM=0.765887] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'source': 'news'}]
```
### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.2}
)
retriever.invoke("Stealing from the bank is a crime")
```



```output
[Document(metadata={'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.'),
 Document(metadata={'source': 'news'}, page_content='The stock market is down 500 points today due to fears of a recession.'),
 Document(metadata={'source': 'website'}, page_content='Is the new iPhone worth the price? Read this review to find out.'),
 Document(metadata={'source': 'tweet'}, page_content='Building an exciting new project with LangChain - come check it out!')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

# 常见问题

## 问题：我在将文档索引到 Elasticsearch 时遇到超时错误。我该如何解决？
一个可能的问题是您的文档可能需要更长时间才能索引到 Elasticsearch。ElasticsearchStore 使用 Elasticsearch 批量 API，该 API 有一些默认设置，您可以调整这些设置以减少超时错误的可能性。

当您使用SparseVectorRetrievalStrategy时，这也是一个好主意。

默认值为：
- `chunk_size`: 500
- `max_chunk_bytes`: 100MB

要调整这些，您可以将`chunk_size`和`max_chunk_bytes`参数传递给ElasticsearchStore的`add_texts`方法。

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# 升级到ElasticsearchStore

如果您已经在基于LangChain的项目中使用Elasticsearch，您可能正在使用旧的实现：`ElasticVectorSearch`和`ElasticKNNSearch`，这两个现在已被弃用。我们引入了一个新的实现，称为`ElasticsearchStore`，它更灵活且更易于使用。本笔记本将指导您完成升级到新实现的过程。

## 新的内容是什么？

新的实现现在是一个名为`ElasticsearchStore`的类，可以通过策略用于近似稠密向量、精确稠密向量、稀疏向量（ELSER）、BM25检索和混合检索。

## 我正在使用ElasticKNNSearch

旧实现：

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

新实现：

```python

from langchain_elasticsearch import ElasticsearchStore, DenseVectorStrategy

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  # if you use the model_id
  # strategy=DenseVectorStrategy(model_id="test_model")
  # if you use hybrid search
  # strategy=DenseVectorStrategy(hybrid=True)
)

```

## 我正在使用 ElasticVectorSearch

旧实现：

```python
<!--IMPORTS:[{"imported": "ElasticVectorSearch", "source": "langchain_community.vectorstores.elastic_vector_search", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.elastic_vector_search.ElasticVectorSearch.html", "title": "Elasticsearch"}]-->

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

新实现：

```python

from langchain_elasticsearch import ElasticsearchStore, DenseVectorScriptScoreStrategy

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  strategy=DenseVectorScriptScoreStrategy()
)

```

```python
db.client.indices.delete(
    index="test-metadata, test-elser, test-basic",
    ignore_unavailable=True,
    allow_no_indices=True,
)
```

## API 参考

有关所有 `ElasticSearchStore` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/elasticsearch/vectorstores/langchain_elasticsearch.vectorstores.ElasticsearchStore.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
