---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_cloud_sql_pg.ipynb
---
# Google Cloud SQL for PostgreSQL

> [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres) 是一个完全托管的数据库服务，帮助您在 Google Cloud Platform 上设置、维护、管理和管理您的 PostgreSQL 关系数据库。扩展您的数据库应用程序，构建利用 Cloud SQL for PostgreSQL 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 `Cloud SQL for PostgreSQL` 通过 `PostgresLoader` 类加载文档。

在 [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/document_loader.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Cloud SQL 管理 API。](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [创建一个 Cloud SQL for PostgreSQL 实例。](https://cloud.google.com/sql/docs/postgres/create-instance)
* [创建一个Cloud SQL for PostgreSQL数据库。](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
* [向数据库添加用户。](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 库安装
安装集成库 `langchain_google_cloud_sql_pg`。


```python
%pip install --upgrade --quiet  langchain_google_cloud_sql_pg
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
* 请查看支持页面：[查找项目 ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## 基本用法

### 设置 Cloud SQL 数据库值
在 [Cloud SQL 实例页面](https://console.cloud.google.com/sql/instances) 找到您的数据库变量。


```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Cloud SQL 引擎

将 PostgreSQL 作为文档加载器的要求和参数之一是一个 `PostgresEngine` 对象。`PostgresEngine` 配置了与您的 Cloud SQL for PostgreSQL 数据库的连接池，使您的应用程序能够成功连接并遵循行业最佳实践。

要使用 `PostgresEngine.from_instance()` 创建一个 `PostgresEngine`，您只需提供 4 个信息：

1. `project_id` : Cloud SQL 实例所在的 Google Cloud 项目的项目 ID。
1. `region` : Cloud SQL 实例所在的区域。
1. `instance` : Cloud SQL 实例的名称。
1. `database` : 要连接的Cloud SQL实例上的数据库名称。

默认情况下，将使用[IAM数据库身份验证](https://cloud.google.com/sql/docs/postgres/iam-authentication)作为数据库身份验证的方法。该库使用属于[应用程序默认凭据 (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)的IAM主体，该凭据来自环境。

可选地，也可以使用[内置数据库身份验证](https://cloud.google.com/sql/docs/postgres/users)，通过用户名和密码访问Cloud SQL数据库。只需向`PostgresEngine.from_instance()`提供可选的`user`和`password`参数：

* `user` : 用于内置数据库身份验证和登录的数据库用户
* `password` : 用于内置数据库身份验证和登录的数据库密码。


**注意**：本教程演示了异步接口。所有异步方法都有对应的同步方法。


```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
)
```

### 创建PostgresLoader


```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgreSQL object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)
```

### 通过默认表加载文档
加载器使用第一列作为page_content，所有其他列作为元数据，从表中返回文档列表。默认表的第一列将是
page_content，第二列作为元数据（JSON）。每一行成为一个文档。请注意，如果您希望文档具有ID，则需要将其添加进去。


```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgresLoader object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)

docs = await loader.aload()
print(docs)
```

### 通过自定义表/元数据或自定义页面内容列加载文档


```python
loader = await PostgresLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### 设置页面内容格式
加载器返回一个文档列表，每行一个文档，页面内容以指定的字符串格式呈现，即文本（空格分隔的连接）、JSON、YAML、CSV等。JSON和YAML格式包含标题，而文本和CSV不包含字段标题。



```python
loader = await PostgresLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
