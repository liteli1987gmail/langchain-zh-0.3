---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/elastic_search_bm25.ipynb
---
# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/) 是一个分布式的、RESTful的搜索和分析引擎。它提供了一个分布式的、多租户的全文本搜索引擎，具有HTTP网页接口和无模式的JSON文档。

>在信息检索中，[Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)（BM是最佳匹配的缩写）是搜索引擎用来估计文档与给定搜索查询相关性的排名函数。它基于1970年代和1980年代由Stephen E. Robertson、Karen Spärck Jones等人开发的概率检索框架。

>实际的排名函数名称是BM25。完整名称Okapi BM25包括第一个使用它的系统的名称，即在1980年代和1990年代在伦敦城市大学实施的Okapi信息检索系统。BM25及其更新的变体，例如BM25F（可以考虑文档结构和锚文本的BM25版本），代表了在文档检索中使用的类似TF-IDF的检索函数。

本笔记本展示了如何使用一个使用`ElasticSearch`和`BM25`的检索器。

有关BM25详细信息的更多信息，请参见[这篇博客文章](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)。


```python
%pip install --upgrade --quiet  elasticsearch
```


```python
<!--IMPORTS:[{"imported": "ElasticSearchBM25Retriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.elastic_search_bm25.ElasticSearchBM25Retriever.html", "title": "ElasticSearch BM25"}]-->
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## 创建新的检索器


```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```


```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## 添加文本（如果需要）

我们可以选择性地向检索器添加文本（如果它们尚未在其中）


```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```



```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```


## 使用检索器

我们现在可以使用检索器了！


```python
result = retriever.invoke("foo")
```


```python
result
```



```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
