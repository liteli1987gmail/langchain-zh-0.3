---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/astradb.ipynb
---
# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 是一个无服务器的支持向量的数据库，基于 Cassandra 构建，并通过易于使用的 JSON API 方便地提供。

## 概述

AstraDB 文档加载器从 AstraDB 数据库返回 LangChain 文档的列表。

加载器接受以下参数：

* `api_endpoint`: AstraDB API 端点。看起来像 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: AstraDB 令牌。看起来像 `AstraCS:6gBhNmsk135....`
* `collection_name` : AstraDB 集合名称
* `namespace`: (可选) AstraDB 命名空间
* `filter_criteria`: (可选) 在查找查询中使用的过滤条件
* `projection`: （可选）在查找查询中使用的投影
* `find_options`: （可选）在查找查询中使用的选项
* `nb_prefetched`: （可选）加载器预取的文档数量
* `extraction_function`: （可选）将AstraDB文档转换为LangChain `page_content`字符串的函数。默认为`json.dumps`

以下元数据被设置为LangChain文档的元数据输出：

```python
{
    metadata : {
        "namespace": "...", 
        "api_endpoint": "...", 
        "collection": "..."
    }
}
```

## 使用文档加载器加载文档


```python
<!--IMPORTS:[{"imported": "AstraDBLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.astradb.AstraDBLoader.html", "title": "AstraDB"}]-->
from langchain_community.document_loaders import AstraDBLoader
```


```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```


```python
loader = AstraDBLoader(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="movie_reviews",
    projection={"title": 1, "reviewtext": 1},
    find_options={"limit": 10},
)
```


```python
docs = loader.load()
```


```python
docs[0]
```



```output
Document(page_content='{"_id": "659bdffa16cbc4586b11a423", "title": "Dangerous Men", "reviewtext": "\\"Dangerous Men,\\" the picture\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?"}', metadata={'namespace': 'default_keyspace', 'api_endpoint': 'https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com', 'collection': 'movie_reviews'})
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用手册](/docs/how_to/#document-loaders)
