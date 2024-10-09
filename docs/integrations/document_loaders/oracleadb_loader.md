---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/oracleadb_loader.ipynb
---
# Oracle 自主数据库

Oracle 自主数据库是一个云数据库，使用机器学习来自动化数据库调优、安全性、备份、更新和其他传统上由数据库管理员执行的日常管理任务。

本笔记本涵盖如何从 Oracle 自主数据库加载文档，加载器支持通过连接字符串或 TNS 配置进行连接。

## 前提条件
1. 数据库以 'Thin' 模式运行：
https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb`：
https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## 使用说明


```python
pip install oracledb
```


```python
<!--IMPORTS:[{"imported": "OracleAutonomousDatabaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.oracleadb_loader.OracleAutonomousDatabaseLoader.html", "title": "Oracle Autonomous Database"}]-->
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

使用双向TLS认证（mTLS）时，创建连接需要wallet_location和wallet_password，用户可以通过提供连接字符串或tns配置详细信息来创建连接。


```python
SQL_QUERY = "select prod_id, time_id from sh.costs fetch first 5 rows only"

doc_loader_1 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
    tns_name=s.TNS_NAME,
)
doc_1 = doc_loader_1.load()

doc_loader_2 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
)
doc_2 = doc_loader_2.load()
```

使用TLS认证时，不需要wallet_location和wallet_password。


```python
doc_loader_3 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    tns_name=s.TNS_NAME,
)
doc_3 = doc_loader_3.load()

doc_loader_4 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
)
doc_4 = doc_loader_4.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
