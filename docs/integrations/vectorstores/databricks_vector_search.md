---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/databricks_vector_search.ipynb
sidebar_label: Databricks
---
# Databricks向量搜索

[Databricks 向量搜索](https://docs.databricks.com/en/generative-ai/vector-search.html) 是一个无服务器相似性搜索引擎，允许您在向量数据库中存储数据的向量表示，包括元数据。使用向量搜索，您可以从由Unity Catalog管理的Delta表创建自动更新的向量搜索索引，并通过简单的API查询它们以返回最相似的向量。

本笔记本展示了如何将LangChain与Databricks向量搜索结合使用。

## 设置

要访问Databricks模型，您需要创建一个Databricks账户，设置凭据（仅当您在Databricks工作区外时），并安装所需的包。

### 凭据（仅当您在Databricks工作区外时）

如果您在Databricks内部运行LangChain应用程序，可以跳过此步骤。

否则，您需要手动将Databricks工作区主机名和个人访问令牌分别设置为`DATABRICKS_HOST`和`DATABRICKS_TOKEN`环境变量。有关如何获取访问令牌，请参见[身份验证文档](https://docs.databricks.com/en/dev-tools/auth/index.html#databricks-personal-access-tokens)。


```python
import getpass
import os

os.environ["DATABRICKS_HOST"] = "https://your-databricks-workspace"
if "DATABRICKS_TOKEN" not in os.environ:
    os.environ["DATABRICKS_TOKEN"] = getpass.getpass(
        "Enter your Databricks access token: "
    )
```

### 安装

LangChain Databricks 集成位于 `langchain-databricks` 包中。


```python
%pip install -qU langchain-databricks
```

### 创建一个向量搜索端点和索引（如果您还没有的话）

在本节中，我们将使用客户端 SDK 创建一个 Databricks 向量搜索端点和一个索引。

如果您已经有一个端点和一个索引，可以跳过本节，直接进入“实例化”部分。

首先，实例化 Databricks VectorSearch 客户端：


```python
from databricks.vector_search.client import VectorSearchClient

client = VectorSearchClient()
```

接下来，我们将创建一个新的 VectorSearch 端点。


```python
endpoint_name = "<your-endpoint-name>"

client.create_endpoint(name=endpoint_name, endpoint_type="STANDARD")
```

最后，我们将创建一个可以在端点上查询的索引。Databricks 向量搜索中有两种类型的索引，`DatabricksVectorSearch` 类支持这两种用例。

* **Delta 同步索引** 会自动与源 Delta 表同步，随着 Delta 表中基础数据的变化，自动和增量地更新索引。

* **直接向量访问索引** 支持向量和元数据的直接读写。用户负责使用 REST API 或 Python SDK 更新此表。

对于增量同步索引，您可以选择使用Databricks管理的嵌入或自管理的嵌入（通过LangChain嵌入类）。

以下代码创建一个**直接访问**索引。请参阅[Databricks文档](https://docs.databricks.com/en/generative-ai/create-query-vector-search.html)以获取创建其他类型索引的说明。


```python
index_name = "<your-index-name>"  # Format: "<catalog>.<schema>.<index-name>"

index = client.create_direct_access_index(
    endpoint_name=endpoint_name,
    index_name=index_name,
    primary_key="id",
    # Dimension of the embeddings. Please change according to the embedding model you are using.
    embedding_dimension=3072,
    # A column to store the embedding vectors for the text data
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        # Optional metadata columns
        "source": "string",
    },
)

index.describe()
```

## 实例化

`DatabricksVectorSearch`的实例化方式略有不同，具体取决于您的索引是使用Databricks管理的嵌入还是自管理的嵌入，即您选择的LangChain嵌入对象。

如果您使用的是带有Databricks管理嵌入的增量同步索引：


```python
from langchain_databricks.vectorstores import DatabricksVectorSearch

vector_store = DatabricksVectorSearch(
    endpoint=endpoint_name,
    index_name=index_name,
)
```

如果您使用的是直接访问索引或带有自管理嵌入的增量同步索引，
您还需要在源表中提供嵌入模型和文本列，以
用于嵌入：

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
vector_store = DatabricksVectorSearch(
    endpoint=endpoint_name,
    index_name=index_name,
    embedding=embeddings,
    # The column name in the index that contains the text data to be embedded
    text_column="document_content",
)
```

## 管理向量存储

### 向向量存储添加项目

注意：通过 `add_documents` 方法将项目添加到向量存储仅支持 **直接访问** 索引。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "DatabricksVectorSearch"}]-->
from langchain_core.documents import Document

document_1 = Document(page_content="foo", metadata={"source": "https://example.com"})

document_2 = Document(page_content="bar", metadata={"source": "https://example.com"})

document_3 = Document(page_content="baz", metadata={"source": "https://example.com"})

documents = [document_1, document_2, document_3]

vector_store.add_documents(documents=documents, ids=["1", "2", "3"])
```



```output
['1', '2', '3']
```


### 从向量存储中删除项目

注意：通过 `delete` 方法从向量存储中删除项目仅支持 **直接访问** 索引。


```python
vector_store.delete(ids=["3"])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

执行简单的相似性搜索可以如下进行：


```python
results = vector_store.similarity_search(
    query="thud", k=1, filter={"source": "https://example.com"}
)
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```
```output
* foo [{'id': '1'}]
```
注意：默认情况下，相似性搜索仅返回主键和文本列。如果您想检索与文档相关的自定义元数据，请在初始化向量存储时在 `columns` 参数中传递附加列。


```python
vector_store = DatabricksVectorSearch(
    endpoint=endpoint_name,
    index_name=index_name,
    embedding=embeddings,
    text_column="text",
    columns=["source"],
)

results = vector_store.similarity_search(query="thud", k=1)
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```
```output
* foo [{'source': 'https://example.com', 'id': '1'}]
```
如果您想执行相似性搜索并接收相应的分数，可以运行：


```python
results = vector_store.similarity_search_with_score(
    query="thud", k=1, filter={"source": "https://example.com"}
)
for doc, score in results:
    print(f"* [SIM={score:3f}] {doc.page_content} [{doc.metadata}]")
```
```output
* [SIM=0.414035] foo [{'source': 'https://example.com', 'id': '1'}]
```
### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 1})
retriever.invoke("thud")
```



```output
[Document(metadata={'source': 'https://example.com', 'id': '1'}, page_content='foo')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## API 参考

有关所有 DatabricksVectorSearch 功能和配置的详细文档，请访问 API 参考： https://api.python.langchain.com/en/latest/vectorstores/langchain_databricks.vectorstores.DatabricksVectorSearch.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
