---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/gutenberg.ipynb
---
# 古腾堡

>[古腾堡计划](https://www.gutenberg.org/about/) 是一个免费的电子书在线图书馆。

本笔记本介绍如何将 `古腾堡` 电子书的链接加载到我们可以在后续使用的文档格式中。


```python
<!--IMPORTS:[{"imported": "GutenbergLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.gutenberg.GutenbergLoader.html", "title": "Gutenberg"}]-->
from langchain_community.document_loaders import GutenbergLoader
```


```python
loader = GutenbergLoader("https://www.gutenberg.org/cache/epub/69972/pg69972.txt")
```


```python
data = loader.load()
```


```python
data[0].page_content[:300]
```



```output
'The Project Gutenberg eBook of The changed brides, by Emma Dorothy\r\n\n\nEliza Nevitte Southworth\r\n\n\n\r\n\n\nThis eBook is for the use of anyone anywhere in the United States and\r\n\n\nmost other parts of the world at no cost and with almost no restrictions\r\n\n\nwhatsoever. You may copy it, give it away or re-u'
```



```python
data[0].metadata
```



```output
{'source': 'https://www.gutenberg.org/cache/epub/69972/pg69972.txt'}
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
