---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/knn.ipynb
---
# kNN

>在统计学中，[k-最近邻算法 (k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) 是一种非参数监督学习方法，最早由 `Evelyn Fix` 和 `Joseph Hodges` 于1951年开发，后来由 `Thomas Cover` 扩展。它用于分类和回归。

本笔记本介绍了如何使用一个底层使用kNN的检索器。

主要基于[Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html)的代码。


```python
<!--IMPORTS:[{"imported": "KNNRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.knn.KNNRetriever.html", "title": "kNN"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "kNN"}]-->
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## 创建新的检索器与文本


```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
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
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='bar', metadata={})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
