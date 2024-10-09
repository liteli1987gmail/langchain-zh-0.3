---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/tf_idf.ipynb
---
# TF-IDF

>[TF-IDF](https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting) 指的是词频乘以逆文档频率。

本笔记本介绍了如何使用一个检索器，该检索器在底层使用 [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) 和 `scikit-learn` 包。

有关 TF-IDF 详细信息，请参见 [这篇博客文章](https://medium.com/data-science-bootcamp/tf-idf-basics-of-information-retrieval-48de122b2a4c)。


```python
%pip install --upgrade --quiet  scikit-learn
```


```python
<!--IMPORTS:[{"imported": "TFIDFRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.tfidf.TFIDFRetriever.html", "title": "TF-IDF"}]-->
from langchain_community.retrievers import TFIDFRetriever
```

## 创建新的检索器与文本


```python
retriever = TFIDFRetriever.from_texts(["foo", "bar", "world", "hello", "foo bar"])
```

## 创建一个新的检索器与文档

您现在可以使用您创建的文档来创建一个新的检索器。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "TF-IDF"}]-->
from langchain_core.documents import Document

retriever = TFIDFRetriever.from_documents(
    [
        Document(page_content="foo"),
        Document(page_content="bar"),
        Document(page_content="world"),
        Document(page_content="hello"),
        Document(page_content="foo bar"),
    ]
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
 Document(page_content='world', metadata={})]
```


## 保存和加载

您可以轻松保存和加载这个检索器，使其在本地开发中非常方便！


```python
retriever.save_local("testing.pkl")
```


```python
retriever_copy = TFIDFRetriever.load_local("testing.pkl")
```


```python
retriever_copy.invoke("foo")
```



```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='world', metadata={})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
