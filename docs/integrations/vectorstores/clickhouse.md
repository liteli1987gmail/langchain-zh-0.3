---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/clickhouse.ipynb
---
# ClickHouse

> [ClickHouse](https://clickhouse.com/) 是最快且资源效率最高的开源数据库，适用于实时应用和分析，支持完整的SQL以及广泛的功能，帮助用户编写分析查询。最近添加的数据结构和距离搜索功能（如 `L2Distance`）以及 [近似最近邻搜索索引](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes) 使得ClickHouse可以作为高性能和可扩展的向量数据库，用于存储和搜索向量，支持SQL。

本笔记本展示了如何使用与 `ClickHouse` 向量存储相关的功能。

## 设置

首先使用docker设置一个本地的ClickHouse服务器：


```python
! docker run -d -p 8123:8123 -p9000:9000 --name langchain-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server:23.4.2.11
```

您需要安装 `langchain-community` 和 `clickhouse-connect` 才能使用此集成


```python
pip install -qU langchain-community clickhouse-connect
```

### 凭证

此笔记本没有凭证，只需确保您已按照上述说明安装了软件包。

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 实例化

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "Clickhouse", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.clickhouse.Clickhouse.html", "title": "ClickHouse"}, {"imported": "ClickhouseSettings", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.clickhouse.ClickhouseSettings.html", "title": "ClickHouse"}]-->
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings

settings = ClickhouseSettings(table="clickhouse_example")
vector_store = Clickhouse(embeddings, config=settings)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 向向量存储添加项目

我们可以通过使用 `add_documents` 函数向我们的向量存储添加项目。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "ClickHouse"}]-->
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

### 从向量存储删除项目

我们可以通过使用 `delete` 函数按 ID 从我们的向量存储中删除项目。


```python
vector_store.delete(ids=uuids[-1])
```

## 查询向量存储

一旦您的向量存储被创建并且相关文档已添加，您很可能希望在运行链或代理时查询它。

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

#### 带分数的相似性搜索

您还可以按分数进行搜索：


```python
results = vector_store.similarity_search_with_score("Will it be hot tomorrow?", k=1)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

## 过滤

您可以直接访问 ClickHouse SQL 的 WHERE 语句。您可以按照标准 SQL 编写 `WHERE` 子句。

**注意**：请注意SQL注入，此接口不得直接由最终用户调用。

如果您在设置中自定义了`column_map`，可以使用如下过滤器进行搜索：


```python
meta = vector_store.metadata_column
results = vector_store.similarity_search_with_relevance_scores(
    "What did I eat for breakfast?",
    k=4,
    where_str=f"{meta}.source = 'tweet'",
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

#### 其他搜索方法

还有多种其他搜索方法未在此笔记本中涵盖，例如MMR搜索或按向量搜索。有关`Clickhouse`向量存储可用搜索能力的完整列表，请查看[API参考](https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.clickhouse.Clickhouse.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。

以下是如何将您的向量存储转换为检索器，然后使用简单的查询和过滤器调用检索器。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 1, "score_threshold": 0.5},
)
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```

## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成（RAG）的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何使用RAG进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

更多信息，请查看使用Astra DB的完整RAG模板[这里](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb)。

## API参考

有关所有`Clickhouse`功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.clickhouse.Clickhouse.html


## 相关

- 向量存储[概念指南](/docs/concepts/#vector-stores)
- 向量存储[使用指南](/docs/how_to/#vector-stores)
