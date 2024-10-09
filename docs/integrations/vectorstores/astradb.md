---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/astradb.ipynb
---
# Astra DB 向量存储

本页面提供了使用 [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 作为向量存储的快速入门。

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 是一个无服务器的向量数据库，基于 Apache Cassandra® 构建，并通过易于使用的 JSON API 方便地提供。

## 设置

使用该集成需要 `langchain-astradb` 第三方库：


```python
pip install -qU "langchain-astradb>=0.3.3"
```

### 凭证

要使用AstraDB向量存储，您必须首先访问[AstraDB网站](https://astra.datastax.com)，创建一个帐户，然后创建一个新数据库 - 初始化可能需要几分钟。

数据库初始化后，您应该[创建一个应用程序令牌](https://docs.datastax.com/en/astra-db-serverless/administration/manage-application-tokens.html#generate-application-token)并将其保存以备后用。

您还需要从`数据库详情`中复制`API端点`并将其存储在`ASTRA_DB_API_ENDPOINT`变量中。

您可以选择提供一个命名空间，您可以从数据库仪表板的`数据浏览器`选项卡中管理。如果您不想设置命名空间，可以将`ASTRA_DB_NAMESPACE`的`getpass`提示留空。


```python
import getpass

ASTRA_DB_API_ENDPOINT = getpass.getpass("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = getpass.getpass("ASTRA_DB_NAMESPACE = ")
if desired_namespace:
    ASTRA_DB_NAMESPACE = desired_namespace
else:
    ASTRA_DB_NAMESPACE = None
```

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的[LangSmith](https://docs.smith.langchain.com/) API密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

有两种方法可以创建Astra DB向量存储，它们在嵌入计算方式上有所不同。

#### 方法1：显式嵌入

您可以单独实例化`langchain_core.embeddings.Embeddings`类，并将其传递给`AstraDBVectorStore`构造函数，就像与大多数其他LangChain向量存储一样。

#### 方法 2：集成嵌入计算

或者，您可以使用[Astra DB](https://www.datastax.com/blog/simplifying-vector-embedding-generation-with-astra-vectorize)的[向量化](https://www.datastax.com/blog/simplifying-vector-embedding-generation-with-astra-vectorize)功能，并在创建存储时简单指定一个支持的嵌入模型的名称。嵌入计算完全在数据库内处理。（要使用此方法，您必须为您的数据库启用所需的嵌入集成，具体说明请参见[文档](https://docs.datastax.com/en/astra-db-serverless/databases/embedding-generation.html)。）

### 显式嵌入初始化

下面，我们使用显式嵌入类实例化我们的向量存储：

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
from langchain_astradb import AstraDBVectorStore

vector_store = AstraDBVectorStore(
    collection_name="astra_vector_langchain",
    embedding=embeddings,
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_NAMESPACE,
)
```

### 集成嵌入初始化

在这里假设您已经

- 在您的Astra DB组织中启用了OpenAI集成，
- 添加了一个名为`"OPENAI_API_KEY"`的API密钥到集成中，并将其作用域设置为您正在使用的数据库。

有关如何执行此操作的更多详细信息，请参阅[文档](https://docs.datastax.com/en/astra-db-serverless/integrations/embedding-providers/openai.html)。


```python
from astrapy.info import CollectionVectorServiceOptions

openai_vectorize_options = CollectionVectorServiceOptions(
    provider="openai",
    model_name="text-embedding-3-small",
    authentication={
        "providerKey": "OPENAI_API_KEY",
    },
)

vector_store_integrated = AstraDBVectorStore(
    collection_name="astra_vector_langchain_integrated",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_NAMESPACE,
    collection_vector_service_options=openai_vectorize_options,
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 向向量存储添加项目

我们可以使用 `add_documents` 函数向我们的向量存储添加项目。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Astra DB Vector Store"}]-->
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
[UUID('89a5cea1-5f3d-47c1-89dc-7e36e12cf4de'),
 UUID('d4e78c48-f954-4612-8a38-af22923ba23b'),
 UUID('058e4046-ded0-4fc1-b8ac-60e5a5f08ea0'),
 UUID('50ab2a9a-762c-4b78-b102-942a86d77288'),
 UUID('1da5a3c1-ba51-4f2f-aaaf-79a8f5011ce3'),
 UUID('f3055d9e-2eb1-4d25-838e-2c70548f91b5'),
 UUID('4bf0613d-08d0-4fbc-a43c-4955e4c9e616'),
 UUID('18008625-8fd4-45c2-a0d7-92a2cde23dbc'),
 UUID('c712e06f-790b-4fd4-9040-7ab3898965d0'),
 UUID('a9b84820-3445-4810-a46c-e77b76ab85bc')]
```


### 从向量存储删除项目

我们可以通过使用 `delete` 函数按 ID 从我们的向量存储中删除项目。


```python
vector_store.delete(ids=uuids[-1])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理期间查询它。

### 直接查询

#### 相似性搜索

可以通过以下方式执行简单的相似性搜索并对元数据进行过滤：


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
* Building an exciting new project with LangChain - come check it out! [{'source': 'tweet'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'source': 'tweet'}]
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
* [SIM=0.776585] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'source': 'news'}]
```
#### 其他搜索方法

还有多种其他搜索方法未在此笔记本中涵盖，例如MMR搜索或按向量搜索。有关`AstraDBVectorStore`可用搜索能力的完整列表，请查看[API参考](https://python.langchain.com/api_reference/astradb/vectorstores/langchain_astradb.vectorstores.AstraDBVectorStore.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。

以下是如何将您的向量存储转换为检索器，然后使用简单查询和过滤调用检索器的方法。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 1, "score_threshold": 0.5},
)
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```



```output
[Document(metadata={'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成（RAG）的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何使用RAG进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

更多信息，请查看使用Astra DB的完整RAG模板[这里](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb)。

## 清理向量存储

如果您想完全删除Astra DB实例中的集合，请运行此命令。

_(您将丢失存储在其中的数据。)_


```python
vector_store.delete_collection()
```

## API参考

有关所有`AstraDBVectorStore`功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/astradb/vectorstores/langchain_astradb.vectorstores.AstraDBVectorStore.html


## 相关

- 向量存储[概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
