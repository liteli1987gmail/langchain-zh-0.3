---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/elasticsearch_retriever.ipynb
sidebar_label: Elasticsearch
---
# ElasticsearchRetriever

>[Elasticsearch](https://www.elastic.co/elasticsearch/) 是一个分布式的、RESTful 的搜索和分析引擎。它提供了一个分布式的、多租户的全文搜索引擎，具有 HTTP Web 接口和无模式的 JSON 文档。它支持关键词搜索、向量搜索、混合搜索和复杂过滤。

`ElasticsearchRetriever` 是一个通用的包装器，能够通过 [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) 灵活访问所有 `Elasticsearch` 功能。对于大多数用例，其他类（`ElasticsearchStore`、`ElasticsearchEmbeddings` 等）应该足够，但如果不够，您可以使用 `ElasticsearchRetriever`。

本指南将帮助您开始使用 Elasticsearch [检索器](/docs/concepts/#retrievers)。有关所有 `ElasticsearchRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/elasticsearch/retrievers/langchain_elasticsearch.retrievers.ElasticsearchRetriever.html)。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="document_retrievers" item="ElasticsearchRetriever" />


## 设置

设置 Elasticsearch 实例有两种主要方式：

- Elastic Cloud: [Elastic Cloud](https://cloud.elastic.co/) 是一个托管的 Elasticsearch 服务。注册 [免费试用](https://www.elastic.co/cloud/cloud-trial-overview)。
要连接到不需要登录凭据的 Elasticsearch 实例（以安全模式启动 docker 实例），请将 Elasticsearch URL 和索引名称与嵌入对象一起传递给构造函数。

- 本地安装 Elasticsearch: 通过本地运行 Elasticsearch 开始使用。最简单的方法是使用官方的 Elasticsearch Docker 镜像。有关更多信息，请参见 [Elasticsearch Docker 文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)。

如果您想从单个查询中获取自动化追踪，您还可以通过取消注释以下内容来设置您的[LangSmith](https://docs.smith.langchain.com/) API 密钥:


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

这个检索器位于 `langchain-elasticsearch` 包中。为了演示，我们还将安装 `langchain-community` 来生成文本 [嵌入](/docs/concepts/#embedding-models)。


```python
%pip install -qU langchain-community langchain-elasticsearch
```


```python
<!--IMPORTS:[{"imported": "DeterministicFakeEmbedding", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.DeterministicFakeEmbedding.html", "title": "ElasticsearchRetriever"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "ElasticsearchRetriever"}, {"imported": "Embeddings", "source": "langchain_core.embeddings", "docs": "https://python.langchain.com/api_reference/core/embeddings/langchain_core.embeddings.embeddings.Embeddings.html", "title": "ElasticsearchRetriever"}]-->
from typing import Any, Dict, Iterable

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from langchain_community.embeddings import DeterministicFakeEmbedding
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_elasticsearch import ElasticsearchRetriever
```

### 配置

在这里我们定义与 Elasticsearch 的连接。在这个例子中，我们使用一个本地运行的实例。或者，您可以在 [Elastic Cloud](https://cloud.elastic.co/) 上注册一个账户并开始 [免费试用](https://www.elastic.co/cloud/cloud-trial-overview)。


```python
es_url = "http://localhost:9200"
es_client = Elasticsearch(hosts=[es_url])
es_client.info()
```

对于向量搜索，我们将使用随机嵌入仅用于说明。对于实际用例，请选择可用的 LangChain [嵌入](/docs/integrations/text_embedding) 类之一。


```python
embeddings = DeterministicFakeEmbedding(size=3)
```

#### 定义示例数据


```python
index_name = "test-langchain-retriever"
text_field = "text"
dense_vector_field = "fake_embedding"
num_characters_field = "num_characters"
texts = [
    "foo",
    "bar",
    "world",
    "hello world",
    "hello",
    "foo bar",
    "bla bla foo",
]
```

#### 索引数据

通常，当用户已经在 Elasticsearch 索引中拥有数据时，会使用 `ElasticsearchRetriever`。在这里，我们索引一些示例文本文档。如果您使用 `ElasticsearchStore.from_documents` 创建了一个索引，那也没问题。


```python
def create_index(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    num_characters_field: str,
):
    es_client.indices.create(
        index=index_name,
        mappings={
            "properties": {
                text_field: {"type": "text"},
                dense_vector_field: {"type": "dense_vector"},
                num_characters_field: {"type": "integer"},
            }
        },
    )


def index_data(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    embeddings: Embeddings,
    texts: Iterable[str],
    refresh: bool = True,
) -> None:
    create_index(
        es_client, index_name, text_field, dense_vector_field, num_characters_field
    )

    vectors = embeddings.embed_documents(list(texts))
    requests = [
        {
            "_op_type": "index",
            "_index": index_name,
            "_id": i,
            text_field: text,
            dense_vector_field: vector,
            num_characters_field: len(text),
        }
        for i, (text, vector) in enumerate(zip(texts, vectors))
    ]

    bulk(es_client, requests)

    if refresh:
        es_client.indices.refresh(index=index_name)

    return len(requests)
```


```python
index_data(es_client, index_name, text_field, dense_vector_field, embeddings, texts)
```



```output
7
```


## 实例化

### 向量搜索

在此示例中使用假嵌入的密集向量检索。


```python
def vector_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "knn": {
            "field": dense_vector_field,
            "query_vector": vector,
            "k": 5,
            "num_candidates": 10,
        }
    }


vector_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=vector_query,
    content_field=text_field,
    url=es_url,
)

vector_retriever.invoke("foo")
```



```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 1.0, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 0.6770179, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 0.4816144, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 0.46853775, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.2086992, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}})]
```


### BM25

传统的关键词匹配。


```python
def bm25_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: search_query,
            },
        },
    }


bm25_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=bm25_query,
    content_field=text_field,
    url=es_url,
)

bm25_retriever.invoke("foo")
```



```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```


### 混合搜索

使用[倒排排名融合](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html) (RRF)结合向量搜索和BM25搜索的结果集。


```python
def hybrid_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "retriever": {
            "rrf": {
                "retrievers": [
                    {
                        "standard": {
                            "query": {
                                "match": {
                                    text_field: search_query,
                                }
                            }
                        }
                    },
                    {
                        "knn": {
                            "field": dense_vector_field,
                            "query_vector": vector,
                            "k": 5,
                            "num_candidates": 10,
                        }
                    },
                ]
            }
        }
    }


hybrid_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=hybrid_query,
    content_field=text_field,
    url=es_url,
)

hybrid_retriever.invoke("foo")
```



```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```


### 模糊匹配

具有错别字容忍的关键词匹配。


```python
def fuzzy_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: {
                    "query": search_query,
                    "fuzziness": "AUTO",
                }
            },
        },
    }


fuzzy_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=fuzzy_query,
    content_field=text_field,
    url=es_url,
)

fuzzy_retriever.invoke("fox")  # note the character tolernace
```



```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.6474311, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.49580228, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.40171927, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```


### 复杂过滤

对不同字段的过滤器组合。


```python
def filter_query_func(search_query: str) -> Dict:
    return {
        "query": {
            "bool": {
                "must": [
                    {"range": {num_characters_field: {"gte": 5}}},
                ],
                "must_not": [
                    {"prefix": {text_field: "bla"}},
                ],
                "should": [
                    {"match": {text_field: search_query}},
                ],
            }
        }
    }


filtering_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    content_field=text_field,
    url=es_url,
)

filtering_retriever.invoke("foo")
```



```output
[Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 1.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 1.0, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 1.0, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 1.0, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}})]
```


请注意，查询匹配在顶部。通过过滤器的其他文档也在结果集中，但它们的分数都是相同的。

### 自定义文档映射器

可以自定义将Elasticsearch结果（命中）映射到LangChain文档的函数。


```python
def num_characters_mapper(hit: Dict[str, Any]) -> Document:
    num_chars = hit["_source"][num_characters_field]
    content = hit["_source"][text_field]
    return Document(
        page_content=f"This document has {num_chars} characters",
        metadata={"text_content": content},
    )


custom_mapped_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    document_mapper=num_characters_mapper,
    url=es_url,
)

custom_mapped_retriever.invoke("foo")
```



```output
[Document(page_content='This document has 7 characters', metadata={'text_content': 'foo bar'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'world'}),
 Document(page_content='This document has 11 characters', metadata={'text_content': 'hello world'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'hello'})]
```


## 用法

根据上述示例，我们使用 `.invoke` 发出单个查询。由于检索器是可运行的，我们可以使用 [运行接口](/docs/concepts/#runnable-interface) 中的任何方法，例如 `.batch`。

## 在链中使用

我们还可以将检索器纳入 [链](/docs/how_to/sequence/) 中，以构建更大的应用程序，例如一个简单的 [RAG](/docs/tutorials/rag/) 应用程序。为了演示，我们还实例化了一个OpenAI聊天模型。


```python
%pip install -qU langchain-openai
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "ElasticsearchRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ElasticsearchRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "ElasticsearchRetriever"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "ElasticsearchRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

llm = ChatOpenAI(model="gpt-4o-mini")


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = (
    {"context": vector_retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke("what is foo?")
```

## API参考

有关所有 `ElasticsearchRetriever` 功能和配置的详细文档，请访问 [API参考](https://python.langchain.com/api_reference/elasticsearch/retrievers/langchain_elasticsearch.retrievers.ElasticsearchRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
