---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/cassandra.ipynb
---
# Cassandra

[Cassandra](https://cassandra.apache.org/) 是一个 NoSQL、行导向、高度可扩展和高度可用的数据库。从 5.0 版本开始，数据库提供了 [向量搜索功能](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html)。

## 概述

Cassandra 文档加载器从 Cassandra 数据库返回 LangChain 文档的列表。

您必须提供 CQL 查询或表名以检索文档。
加载器接受以下参数：

* 表： （可选）要加载数据的表。
* 会话： （可选）Cassandra 驱动程序会话。如果未提供，将使用 Cassio 解析的会话。
* 键空间： （可选）表的键空间。如果未提供，将使用 Cassio 解析的键空间。
* 查询： （可选）用于加载数据的查询。
* page_content_mapper: （可选）一个将行转换为字符串页面内容的函数。默认将行转换为JSON。
* metadata_mapper: （可选）一个将行转换为元数据字典的函数。
* query_parameters: （可选）调用session.execute时使用的查询参数。
* query_timeout: （可选）调用session.execute时使用的查询超时。
* query_custom_payload: （可选）调用`session.execute`时使用的查询自定义负载。
* query_execution_profile: （可选）调用`session.execute`时使用的查询执行配置文件。
* query_host: （可选）调用`session.execute`时使用的查询主机。
* query_execute_as: （可选）调用`session.execute`时使用的查询执行身份。

## 使用文档加载器加载文档


```python
<!--IMPORTS:[{"imported": "CassandraLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.cassandra.CassandraLoader.html", "title": "Cassandra"}]-->
from langchain_community.document_loaders import CassandraLoader
```

### 从Cassandra驱动程序会话初始化

您需要创建一个`cassandra.cluster.Session`对象，如[Cassandra驱动程序文档](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster)中所述。具体细节可能有所不同（例如网络设置和身份验证），但这可能类似于：


```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

您需要提供Cassandra实例中现有键空间的名称：


```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

正在创建文档加载器：


```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```


```python
docs = loader.load()
```


```python
docs[0]
```



```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```


### 从cassio初始化

也可以使用cassio来配置会话和键空间。


```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### 归属声明

> Apache Cassandra、Cassandra和Apache是[Apache软件基金会](http://www.apache.org/)在美国和/或其他国家的注册商标或商标。


## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
