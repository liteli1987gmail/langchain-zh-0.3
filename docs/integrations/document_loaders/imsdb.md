---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/imsdb.ipynb
---
# IMSDb

>[IMSDb](https://imsdb.com/) 是 `互联网电影剧本数据库`。

这涵盖了如何将 `IMSDb` 网页加载为我们可以在后续使用的文档格式。


```python
<!--IMPORTS:[{"imported": "IMSDbLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.imsdb.IMSDbLoader.html", "title": "IMSDb"}]-->
from langchain_community.document_loaders import IMSDbLoader
```


```python
loader = IMSDbLoader("https://imsdb.com/scripts/BlacKkKlansman.html")
```


```python
data = loader.load()
```


```python
data[0].page_content[:500]
```



```output
'\n\r\n\r\n\r\n\r\n                                    BLACKKKLANSMAN\r\n                         \r\n                         \r\n                         \r\n                         \r\n                                      Written by\r\n\r\n                          Charlie Wachtel & David Rabinowitz\r\n\r\n                                         and\r\n\r\n                              Kevin Willmott & Spike Lee\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n                         FADE IN:\r\n                         \r\n          SCENE FROM "GONE WITH'
```



```python
data[0].metadata
```



```output
{'source': 'https://imsdb.com/scripts/BlacKkKlansman.html'}
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
