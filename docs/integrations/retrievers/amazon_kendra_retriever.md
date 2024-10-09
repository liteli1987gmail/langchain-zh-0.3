---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/amazon_kendra_retriever.ipynb
---
# 亚马逊 Kendra

> [亚马逊 Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html) 是由 `亚马逊网络服务` (`AWS`) 提供的智能搜索服务。它利用先进的自然语言处理 (NLP) 和机器学习算法，使组织内的各种数据源具备强大的搜索能力。`Kendra` 旨在帮助用户快速准确地找到所需信息，提高生产力和决策能力。

> 使用 `Kendra`，用户可以搜索各种内容类型，包括文档、常见问题解答、知识库、手册和网站。它支持多种语言，能够理解复杂查询、同义词和上下文含义，以提供高度相关的搜索结果。

## 使用亚马逊 Kendra 索引检索器


```python
%pip install --upgrade --quiet  boto3
```


```python
<!--IMPORTS:[{"imported": "AmazonKendraRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.kendra.AmazonKendraRetriever.html", "title": "Amazon Kendra"}]-->
from langchain_community.retrievers import AmazonKendraRetriever
```

创建新检索器


```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

现在您可以使用来自Kendra索引的检索文档


```python
retriever.invoke("what is langchain")
```


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
