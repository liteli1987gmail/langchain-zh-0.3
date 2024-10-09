---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/google_alloydb.ipynb
---
# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) 是一个完全托管的关系数据库服务，提供高性能、无缝集成和令人印象深刻的可扩展性。AlloyDB 与 PostgreSQL 100% 兼容。扩展您的数据库应用程序，构建利用 AlloyDB 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 `AlloyDB for PostgreSQL` 通过 `AlloyDBVectorStore` 类存储向量嵌入。

在 [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/vector_store.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 AlloyDB API](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
* [创建一个 AlloyDB 集群和实例。](https://cloud.google.com/alloydb/docs/cluster-create)
* [创建一个 AlloyDB 数据库。](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
* [向数据库添加用户。](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 库安装
安装集成库 `langchain-google-alloydb-pg` 和嵌入服务库 `langchain-google-vertexai`。


```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg langchain-google-vertexai
```

**仅限Colab:** 取消注释以下单元以重启内核，或使用按钮重启内核。对于Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 认证
以登录此笔记本的IAM用户身份认证到Google Cloud，以便访问您的Google Cloud项目。

* 如果您使用Colab运行此笔记本，请使用下面的单元并继续。
* 如果您使用Vertex AI Workbench，请查看[这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ 设置您的Google Cloud项目
设置您的Google Cloud项目，以便您可以在此笔记本中利用Google Cloud资源。

如果您不知道您的项目ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 请参阅支持页面：[查找项目 ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## 基本用法

### 设置 AlloyDB 数据库值
在 [AlloyDB 实例页面](https://console.cloud.google.com/alloydb/clusters) 查找您的数据库值。


```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### AlloyDBEngine 连接池

将 AlloyDB 作为向量存储建立连接的要求和参数之一是 `AlloyDBEngine` 对象。`AlloyDBEngine` 配置了与您的 AlloyDB 数据库的连接池，使您的应用程序能够成功连接并遵循行业最佳实践。

要使用 `AlloyDBEngine.from_instance()` 创建 `AlloyDBEngine`，您只需提供 5 个信息：

1. `project_id` : AlloyDB 实例所在的 Google Cloud 项目的项目 ID。
1. `region` : AlloyDB 实例所在的区域。
1. `cluster`: AlloyDB 集群的名称。
1. `instance` : AlloyDB 实例的名称。
1. `database` : 要连接的 AlloyDB 实例上的数据库名称。

默认情况下，将使用 [IAM 数据库身份验证](https://cloud.google.com/alloydb/docs/connect-iam) 作为数据库身份验证的方法。该库使用来自环境的 [应用程序默认凭据 (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) 所属的 IAM 主体。

可选地，可以使用用户名和密码访问 AlloyDB 数据库的 [内置数据库身份验证](https://cloud.google.com/alloydb/docs/database-users/about)。只需向 `AlloyDBEngine.from_instance()` 提供可选的 `user` 和 `password` 参数：

* `user` : 用于内置数据库身份验证和登录的数据库用户。
* `password` : 用于内置数据库身份验证和登录的数据库密码。


**注意：** 本教程演示了异步接口。所有异步方法都有对应的同步方法。


```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### 初始化表
`AlloyDBVectorStore` 类需要一个数据库表。`AlloyDBEngine` 引擎有一个辅助方法 `init_vectorstore_table()`，可以用来为您创建具有正确模式的表。


```python
await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 创建嵌入类实例

您可以使用任何 [LangChain 嵌入模型](/docs/integrations/text_embedding/)。
您可能需要启用 Vertex AI API 才能使用 `VertexAIEmbeddings`。我们建议在生产环境中设置嵌入模型的版本，了解更多关于 [文本嵌入模型](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) 的信息。


```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```


```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### 初始化默认的 AlloyDBVectorStore


```python
from langchain_google_alloydb_pg import AlloyDBVectorStore

store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
)
```

### 添加文本


```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)
```

### 删除文本


```python
await store.adelete([ids[1]])
```

### 搜索文档


```python
query = "I'd like a fruit."
docs = await store.asimilarity_search(query)
print(docs)
```

### 按向量搜索文档


```python
query_vector = embedding.embed_query(query)
docs = await store.asimilarity_search_by_vector(query_vector, k=2)
print(docs)
```

## 添加索引
通过应用向量索引来加速向量搜索查询。了解更多关于 [向量索引](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes) 的信息。


```python
from langchain_google_alloydb_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### 重新索引


```python
await store.areindex()  # Re-index using default index name
```

### 移除索引


```python
await store.adrop_vector_index()  # Delete index using default name
```

## 创建自定义向量存储
向量存储可以利用关系数据来过滤相似性搜索。

创建一个带有自定义元数据列的表。


```python
from langchain_google_alloydb_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize AlloyDBVectorStore
custom_store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
    metadata_columns=["len"],
    # Connect to a existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### 使用元数据过滤搜索文档


```python
import uuid

# Add texts to the Vector Store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)

# Use filter on search
docs = await custom_store.asimilarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
