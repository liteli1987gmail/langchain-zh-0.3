---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/surrealdb.ipynb
---
# SurrealDB

>[SurrealDB](https://surrealdb.com/) 是一个端到端的云原生数据库，专为现代应用程序设计，包括网页、移动、无服务器、Jamstack、后端和传统应用程序。使用 SurrealDB，您可以简化数据库和 API 基础设施，减少开发时间，并快速且经济高效地构建安全、高性能的应用程序。
>
>**SurrealDB 的主要特点包括：**
>
>* **减少开发时间：** SurrealDB 通过消除大多数服务器端组件的需求，简化您的数据库和 API 堆栈，使您能够更快、更便宜地构建安全、高性能的应用程序。
>* **实时协作 API 后端服务：** SurrealDB 既可以作为数据库，也可以作为 API 后端服务，支持实时协作。
>* **支持多种查询语言：** SurrealDB 支持来自客户端设备的 SQL 查询、GraphQL、ACID 事务、WebSocket 连接、结构化和非结构化数据、图查询、全文索引和地理空间查询。
>* **细粒度访问控制：** SurrealDB 提供基于行级权限的访问控制，使您能够精确管理数据访问。
>
>查看[功能](https://surrealdb.com/features)、最新[版本](https://surrealdb.com/releases)和[文档](https://surrealdb.com/docs)。

本笔记本展示了如何使用与`SurrealDBLoader`相关的功能。

## 概述

SurrealDB文档加载器从SurrealDB数据库返回LangChain文档的列表。

文档加载器接受以下可选参数：

* `dburl`: 连接到WebSocket端点的连接字符串。默认值：`ws://localhost:8000/rpc`
* `ns`: 命名空间的名称。默认值：`langchain`
* `db`: 数据库的名称。默认值：`database`
* `table`: 表的名称。默认值：`documents`
* `db_user`: 如果需要，SurrealDB凭据：数据库用户名。
* `db_pass`: SurrealDB 凭据（如果需要）：数据库密码。
* `filter_criteria`: 用于构建 `WHERE` 子句以过滤表中结果的字典。

输出的 `Document` 具有以下形状：
```
Document(
    page_content=<json encoded string containing the result document>,
    metadata={
        'id': <document id>,
        'ns': <namespace name>,
        'db': <database_name>,
        'table': <table name>,
        ... <additional fields from metadata property of the document>
    }
)
```

## 设置

取消注释以下单元以安装 surrealdb 和 LangChain。


```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```


```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```


```python
<!--IMPORTS:[{"imported": "SurrealDBLoader", "source": "langchain_community.document_loaders.surrealdb", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.surrealdb.SurrealDBLoader.html", "title": "SurrealDB"}]-->
import json

from langchain_community.document_loaders.surrealdb import SurrealDBLoader
```


```python
loader = SurrealDBLoader(
    dburl="ws://localhost:8000/rpc",
    ns="langchain",
    db="database",
    table="documents",
    db_user="root",
    db_pass="root",
    filter_criteria={},
)
docs = loader.load()
len(docs)
```



```output
42
```



```python
doc = docs[-1]
doc.metadata
```



```output
{'id': 'documents:zzz434sa584xl3b4ohvk',
 'source': '../../how_to/state_of_the_union.txt',
 'ns': 'langchain',
 'db': 'database',
 'table': 'documents'}
```



```python
len(doc.page_content)
```



```output
18078
```



```python
page_content = json.loads(doc.page_content)
```


```python
page_content["text"]
```



```output
'When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
