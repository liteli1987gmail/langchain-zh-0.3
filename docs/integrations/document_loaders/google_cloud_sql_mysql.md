---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_cloud_sql_mysql.ipynb
---
# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql) 是一个完全托管的关系数据库服务，提供高性能、无缝集成和令人印象深刻的可扩展性。它提供 [MySQL](https://cloud.google.com/sql/mysql)、[PostgreSQL](https://cloud.google.com/sql/postgresql) 和 [SQL Server](https://cloud.google.com/sql/sqlserver) 数据库引擎。扩展您的数据库应用程序，构建利用 Cloud SQL 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 [Cloud SQL for MySQL](https://cloud.google.com/sql/mysql) [保存、加载和删除 LangChain 文档](/docs/how_to#document-loaders)，使用 `MySQLLoader` 和 `MySQLDocumentSaver`。

在 [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/document_loader.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Cloud SQL 管理 API。](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [创建一个 Cloud SQL for MySQL 实例](https://cloud.google.com/sql/docs/mysql/create-instance)
* [创建一个 Cloud SQL 数据库](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [向数据库添加一个 IAM 数据库用户](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (可选)

在确认在此笔记本的运行环境中访问数据库后，填写以下值并在运行示例脚本之前运行该单元。


```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 库安装

集成在其自己的 `langchain-google-cloud-sql-mysql` 包中，因此我们需要安装它。


```python
%pip install -upgrade --quiet langchain-google-cloud-sql-mysql
```

**仅限 Colab**：取消注释以下单元以重启内核，或使用按钮重启内核。对于 Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ 设置您的 Google Cloud 项目
设置您的 Google Cloud 项目，以便您可以在此笔记本中利用 Google Cloud 资源。

如果您不知道您的项目 ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 查看支持页面：[查找项目 ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 认证

以当前登录此笔记本的IAM用户身份验证Google Cloud，以访问您的Google Cloud项目。

- 如果您使用Colab运行此笔记本，请使用下面的单元格并继续。
- 如果您使用Vertex AI Workbench，请查看[这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

## 基本用法

### MySQLEngine连接池

在从MySQL表中保存或加载文档之前，我们需要首先配置一个连接池到Cloud SQL数据库。`MySQLEngine`配置一个连接池到您的Cloud SQL数据库，使您的应用程序能够成功连接，并遵循行业最佳实践。

要使用`MySQLEngine.from_instance()`创建`MySQLEngine`，您只需提供4个信息：

1. `project_id` : Cloud SQL实例所在的Google Cloud项目的项目ID。
2. `region` : Cloud SQL实例所在的区域。
3. `instance` : Cloud SQL实例的名称。
4. `database` : 要连接的 Cloud SQL 实例上的数据库名称。

默认情况下，将使用 [IAM 数据库身份验证](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) 作为数据库身份验证的方法。该库使用来自环境的 [应用程序默认凭据 (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) 所属的 IAM 主体。

有关 IAM 数据库身份验证的更多信息，请参见：

* [为 IAM 数据库身份验证配置实例](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [使用 IAM 数据库身份验证管理用户](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

可选地，可以使用 [内置数据库身份验证](https://cloud.google.com/sql/docs/mysql/built-in-authentication) 通过用户名和密码访问 Cloud SQL 数据库。只需将可选的 `user` 和 `password` 参数提供给 `MySQLEngine.from_instance()`：

* `user` : 用于内置数据库身份验证和登录的数据库用户
* `password` : 用于内置数据库身份验证和登录的数据库密码。


```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### 初始化表

通过 `MySQLEngine.init_document_table(<table_name>)` 初始化默认模式的表。表列：

- page_content (类型: 文本)
- langchain_metadata (类型: JSON)

`overwrite_existing=True` 标志意味着新初始化的表将替换任何同名的现有表。


```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### 保存文档

使用 `MySQLDocumentSaver.add_documents(<documents>)` 保存 langchain 文档。要初始化 `MySQLDocumentSaver` 类，您需要提供两样东西：

1. `engine` - 一个 `MySQLEngine` 引擎的实例。
2. `table_name` - 在 Cloud SQL 数据库中存储 langchain 文档的表名。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Google Cloud SQL for MySQL"}]-->
from langchain_core.documents import Document
from langchain_google_cloud_sql_mysql import MySQLDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
saver = MySQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### 加载文档

使用 `MySQLLoader.load()` 或 `MySQLLoader.lazy_load()` 加载 langchain 文档。`lazy_load` 返回一个生成器，该生成器在迭代期间仅查询数据库。要初始化 `MySQLLoader` 类，您需要提供：

1. `engine` - 一个 `MySQLEngine` 引擎的实例。
2. `table_name` - Cloud SQL 数据库中用于存储 LangChain 文档的表名。


```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### 通过查询加载文档

除了从表中加载文档外，我们还可以选择从 SQL 查询生成的视图中加载文档。例如：


```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(
    engine=engine,
    query=f"select * from `{TABLE_NAME}` where JSON_EXTRACT(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

从 SQL 查询生成的视图可以具有与默认表不同的模式。在这种情况下，MySQLLoader 的行为与从具有非默认模式的表中加载相同。请参阅章节 [使用自定义文档页面内容和元数据加载文档](#Load-documents-with-customized-document-page-content-&-metadata)。

### 删除文档

使用 `MySQLDocumentSaver.delete(<documents>)` 从 MySQL 表中删除一组 LangChain 文档。

对于具有默认模式 (page_content, langchain_metadata) 的表，删除标准是：

如果列表中存在一个 `document`，则应删除该 `row`，满足以下条件：

- `document.page_content` 等于 `row[page_content]`
- `document.metadata` 等于 `row[langchain_metadata]`


```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 高级用法

### 使用自定义文档页面内容和元数据加载文档

首先，我们准备一个具有非默认模式的示例表，并用一些任意数据填充它。


```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS `{TABLE_NAME}`"))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            CREATE TABLE IF NOT EXISTS `{TABLE_NAME}`(
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(100) NOT NULL,
                variety VARCHAR(50),
                quantity_in_stock INT NOT NULL,
                price_per_unit DECIMAL(6,2) NOT NULL,
                organic TINYINT(1) NOT NULL
            )
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO `{TABLE_NAME}` (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

如果我们仍然使用此示例表的 `MySQLLoader` 默认参数加载 langchain 文档，则加载文档的 `page_content` 将是表的第一列，而 `metadata` 将由所有其他列的键值对组成。


```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

我们可以通过在初始化 `MySQLLoader` 时设置 `content_columns` 和 `metadata_columns` 来指定要加载的内容和元数据。

1. `content_columns`: 要写入文档的 `page_content` 的列。
2. `metadata_columns`: 要写入文档的 `metadata` 的列。

例如，在这里，`content_columns` 中列的值将被连接成一个以空格分隔的字符串，作为加载文档的 `page_content`，而加载文档的 `metadata` 将仅包含在 `metadata_columns` 中指定的列的键值对。


```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### 使用自定义页面内容和元数据保存文档

为了将 langchain 文档保存到具有自定义元数据字段的表中，我们需要首先通过 `MySQLEngine.init_document_table()` 创建这样一个表，并指定我们希望它具有的 `metadata_columns` 列表。在这个示例中，创建的表将具有以下表列：

- description (类型: 文本): 用于存储水果描述。
- fruit_name (类型: 文本): 用于存储水果名称。
- organic (类型: tinyint(1)): 用于指示水果是否为有机。
- other_metadata (类型: JSON): 用于存储水果的其他元数据信息。

我们可以使用以下参数与 `MySQLEngine.init_document_table()` 来创建表格：

1. `table_name`: 在 Cloud SQL 数据库中存储 langchain 文档的表名。
2. `metadata_columns`: 一个 `sqlalchemy.Column` 的列表，指示我们需要的元数据列列表。
3. `content_column`: 用于存储 langchain 文档的 `page_content` 的列名。默认: `page_content`。
4. `metadata_json_column`: 用于存储 langchain 文档额外 `metadata` 的 JSON 列名。默认: `langchain_metadata`。


```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

使用 `MySQLDocumentSaver.add_documents(<documents>)` 保存文档。正如您在此示例中所看到的，

- `document.page_content` 将被保存到 `description` 列中。
- `document.metadata.fruit_name` 将被保存到 `fruit_name` 列中。
- `document.metadata.organic` 将被保存到 `organic` 列中。
- `document.metadata.fruit_id` 将以 JSON 格式保存到 `other_metadata` 列中。


```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MySQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```


```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f"select * from `{TABLE_NAME}`;"))
    print(result.keys())
    print(result.fetchall())
```

### 删除具有自定义页面内容和元数据的文档

我们还可以通过 `MySQLDocumentSaver.delete(<documents>)` 从表中删除具有自定义元数据列的文档。删除标准是：

如果列表中存在一个 `document`，则应删除该 `row`，满足以下条件：

- `document.page_content` 等于 `row[page_content]`
- 对于 `document.metadata` 中的每个元数据字段 `k`
- `document.metadata[k]` 等于 `row[k]` 或 `document.metadata[k]` 等于 `row[langchain_metadata][k]`
- `row`中没有额外的元数据字段，但在`document.metadata`中存在。




```python
loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
