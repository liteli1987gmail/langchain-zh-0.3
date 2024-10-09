---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/tidb.ipynb
---
# TiDB

> [TiDB Cloud](https://tidbcloud.com/)，是一个综合的数据库即服务 (DBaaS) 解决方案，提供专用和无服务器选项。TiDB Serverless 现在将内置向量搜索集成到 MySQL 生态中。通过此增强，您可以无缝地使用 TiDB Serverless 开发 AI 应用，而无需新的数据库或额外的技术栈。通过加入私有测试的候补名单，成为首批体验者之一，网址为 https://tidb.cloud/ai。

本笔记本介绍如何使用 `TiDBLoader` 从 TiDB 中加载数据到 LangChain。

## 前提条件

在使用 `TiDBLoader` 之前，我们将安装以下依赖：


```python
%pip install --upgrade --quiet langchain
```

然后，我们将配置与 TiDB 的连接。在这个笔记本中，我们将遵循 TiDB Cloud 提供的标准连接方法，以建立安全高效的数据库连接。


```python
import getpass

# copy from tidb cloud console，replace it with your own
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## 从 TiDB 加载数据

以下是一些关键参数的详细说明，您可以使用这些参数自定义 `TiDBLoader` 的行为：

- `query` (str)：这是要在 TiDB 数据库上执行的 SQL 查询。查询应选择您希望加载到 `Document` 对象中的数据。
例如，您可以使用类似于 "SELECT * FROM my_table" 的查询来获取 `my_table` 中的所有数据。

- `page_content_columns` (可选[List[str]]): 指定应包含在每个 `Document` 对象的 `page_content` 中的列名列表。
如果设置为 `None`（默认值），则查询返回的所有列都将包含在 `page_content` 中。这使您能够根据数据的特定列定制每个文档的内容。

- `metadata_columns` (可选[List[str]]): 指定应包含在每个 `Document` 对象的 `metadata` 中的列名列表。
默认情况下，此列表为空，这意味着除非明确指定，否则不会包含任何元数据。这对于包含有关每个文档的附加信息非常有用，这些信息并不构成主要内容，但对于处理或分析仍然有价值。


```python
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine

# Connect to the database
engine = create_engine(tidb_connection_string)
metadata = MetaData()
table_name = "test_tidb_loader"

# Create a table
test_table = Table(
    table_name,
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255)),
    Column("description", String(255)),
)
metadata.create_all(engine)


with engine.connect() as connection:
    transaction = connection.begin()
    try:
        connection.execute(
            test_table.insert(),
            [
                {"name": "Item 1", "description": "Description of Item 1"},
                {"name": "Item 2", "description": "Description of Item 2"},
                {"name": "Item 3", "description": "Description of Item 3"},
            ],
        )
        transaction.commit()
    except:
        transaction.rollback()
        raise
```


```python
<!--IMPORTS:[{"imported": "TiDBLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.tidb.TiDBLoader.html", "title": "TiDB"}]-->
from langchain_community.document_loaders import TiDBLoader

# Setup TiDBLoader to retrieve data
loader = TiDBLoader(
    connection_string=tidb_connection_string,
    query=f"SELECT * FROM {table_name};",
    page_content_columns=["name", "description"],
    metadata_columns=["id"],
)

# Load data
documents = loader.load()

# Display the loaded documents
for doc in documents:
    print("-" * 30)
    print(f"content: {doc.page_content}\nmetada: {doc.metadata}")
```
```output
------------------------------
content: name: Item 1
description: Description of Item 1
metada: {'id': 1}
------------------------------
content: name: Item 2
description: Description of Item 2
metada: {'id': 2}
------------------------------
content: name: Item 3
description: Description of Item 3
metada: {'id': 3}
```

```python
test_table.drop(bind=engine)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
