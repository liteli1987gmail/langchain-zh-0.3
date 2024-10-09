---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/vespa.ipynb
---
# Vespa

>[Vespa](https://vespa.ai/) 是一个功能齐全的搜索引擎和向量数据库。它支持向量搜索（ANN）、词汇搜索和结构化数据搜索，所有这些都可以在同一个查询中进行。

本笔记本展示了如何将 `Vespa.ai` 用作 LangChain 检索器。

为了创建一个检索器，我们使用 [pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) 来
创建与 `Vespa` 服务的连接。


```python
%pip install --upgrade --quiet  pyvespa
```


```python
from vespa.application import Vespa

vespa_app = Vespa(url="https://doc-search.vespa.oath.cloud")
```

这创建了与 `Vespa` 服务的连接，这里是 Vespa 文档搜索服务。
使用 `pyvespa` 包，您还可以连接到一个
[Vespa Cloud 实例](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
或一个本地的
[Docker 实例](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html)。


连接到服务后，您可以设置检索器：


```python
<!--IMPORTS:[{"imported": "VespaRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.vespa_retriever.VespaRetriever.html", "title": "Vespa"}]-->
from langchain_community.retrievers import VespaRetriever

vespa_query_body = {
    "yql": "select content from paragraph where userQuery()",
    "hits": 5,
    "ranking": "documentation",
    "locale": "en-us",
}
vespa_content_field = "content"
retriever = VespaRetriever(vespa_app, vespa_query_body, vespa_content_field)
```

这设置了一个从 Vespa 应用程序获取文档的 LangChain 检索器。
在这里，从 `paragraph` 文档类型的 `content` 字段中检索最多 5 个结果，
使用 `doumentation` 作为排名方法。`userQuery()` 被替换为实际的查询
从 LangChain 传递过来。

请参阅[pyvespa文档](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
以获取更多信息。

现在您可以返回结果并继续在LangChain中使用这些结果。


```python
retriever.invoke("what is vespa?")
```


## 相关

- 检索器[概念指南](/docs/concepts/#retrievers)
- 检索器[操作指南](/docs/how_to/#retrievers)
