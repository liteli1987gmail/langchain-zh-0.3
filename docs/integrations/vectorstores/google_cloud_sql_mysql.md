---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/google_cloud_sql_mysql.ipynb
---
# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql) 是一个完全托管的关系数据库服务，提供高性能、无缝集成和令人印象深刻的可扩展性。它提供 PostgreSQL、MySQL 和 SQL Server 数据库引擎。扩展您的数据库应用程序，构建利用 Cloud SQL 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 `Cloud SQL for MySQL` 通过 `MySQLVectorStore` 类存储向量嵌入。

在 [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Cloud SQL 管理 API。](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
* [创建一个 Cloud SQL 实例。](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance)（版本必须 >= **8.0.36**，并且 **cloudsql_vector** 数据库标志配置为“开启”）
* [创建一个 Cloud SQL 数据库。](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [向数据库添加用户。](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 库安装
安装集成库 `langchain-google-cloud-sql-mysql` 和嵌入服务库 `langchain-google-vertexai`。


```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
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

### 设置 Cloud SQL 数据库值
在 [Cloud SQL 实例页面](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) 中查找您的数据库值。

**注意：** MySQL 向量支持仅在版本 **>= 8.0.36** 的 MySQL 实例上可用。

对于现有实例，您可能需要执行 [自助维护更新](https://cloud.google.com/sql/docs/mysql/self-service-maintenance) 以将维护版本更新为 **MYSQL_8_0_36.R20240401.03_00** 或更高版本。更新后，[配置您的数据库标志](https://cloud.google.com/sql/docs/mysql/flags) 使新的 **cloudsql_vector** 标志为“开启”。


```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### MySQLEngine 连接池

将 Cloud SQL 作为向量存储的要求之一是一个 `MySQLEngine` 对象。`MySQLEngine` 配置一个连接池到您的 Cloud SQL 数据库，使您的应用程序能够成功连接并遵循行业最佳实践。

要使用 `MySQLEngine.from_instance()` 创建 `MySQLEngine`，您只需提供 4 个信息：

1. `project_id` : Cloud SQL 实例所在的 Google Cloud 项目的项目 ID。
1. `region` : Cloud SQL 实例所在的区域。
1. `instance` : Cloud SQL 实例的名称。
1. `database` : 要连接的 Cloud SQL 实例上的数据库名称。

默认情况下，将使用 [IAM 数据库身份验证](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) 作为数据库身份验证的方法。此库使用来自环境的 [应用程序默认凭据 (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) 所属的 IAM 主体。

有关 IAM 数据库身份验证的更多信息，请参见：

* [为 IAM 数据库身份验证配置实例](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [使用 IAM 数据库身份验证管理用户](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

可选地，可以使用 [内置数据库身份验证](https://cloud.google.com/sql/docs/mysql/built-in-authentication) 通过用户名和密码访问 Cloud SQL 数据库。只需向 `MySQLEngine.from_instance()` 提供可选的 `user` 和 `password` 参数：

* `user` : 用于内置数据库身份验证和登录的数据库用户。
* `password` : 用于内置数据库身份验证和登录的数据库密码。



```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### 初始化一个表
`MySQLVectorStore` 类需要一个数据库表。 `MySQLEngine` 类有一个辅助方法 `init_vectorstore_table()`，可以用来为您创建一个具有正确模式的表。


```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 创建一个嵌入类实例

您可以使用任何 [LangChain 嵌入模型](/docs/integrations/text_embedding/)。
您可能需要启用 Vertex AI API 才能使用 `VertexAIEmbeddings`。

我们建议在生产环境中固定嵌入模型的版本，了解更多关于 [文本嵌入模型](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings) 的信息。


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

### 初始化一个默认的 MySQLVectorStore

要初始化 `MySQLVectorStore` 类，您只需提供 3 个内容：

1. `engine` - 一个 `MySQLEngine` 引擎的实例。
1. `embedding_service` - 一个 LangChain 嵌入模型的实例。
1. `table_name` : 用作向量存储的Cloud SQL数据库中的表名。


```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### 添加文本


```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### 删除文本

通过ID从向量存储中删除向量。


```python
store.delete([ids[1]])
```

### 搜索文档


```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```
```output
Pineapple
```
### 按向量搜索文档

也可以使用`similarity_search_by_vector`进行与给定嵌入向量相似的文档搜索，该方法接受嵌入向量作为参数，而不是字符串。


```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```
```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```
### 添加索引
通过应用向量索引加速向量搜索查询。了解更多关于[MySQL向量索引](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py)的信息。

**注意：** 对于IAM数据库身份验证（默认使用），IAM数据库用户需要由特权数据库用户授予以下权限，以便完全控制向量索引。

```
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```


```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### 移除索引


```python
store.drop_vector_index()
```

## 高级用法

### 创建带有自定义元数据的 MySQLVectorStore

向量存储可以利用关系数据来过滤相似性搜索。

创建一个表和带有自定义元数据列的 `MySQLVectorStore` 实例。


```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### 使用元数据过滤搜索文档

在处理文档之前，缩小文档范围可能会很有帮助。

例如，可以使用 `filter` 参数根据元数据过滤文档。


```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```
```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
