---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/concurrent.ipynb
---
# 并发加载器

与GenericLoader的工作方式相同，但为那些选择优化工作流程的人提供并发处理。



```python
<!--IMPORTS:[{"imported": "ConcurrentLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.concurrent.ConcurrentLoader.html", "title": "Concurrent Loader"}]-->
from langchain_community.document_loaders import ConcurrentLoader
```


```python
loader = ConcurrentLoader.from_filesystem("example_data/", glob="**/*.txt")
```


```python
files = loader.load()
```


```python
len(files)
```



```output
2
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
