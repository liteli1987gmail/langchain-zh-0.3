---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/merge_doc.ipynb
---
# 合并文档加载器

合并从一组指定文档加载器返回的文档。


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Merge Documents Loader"}]-->
from langchain_community.document_loaders import WebBaseLoader

loader_web = WebBaseLoader(
    "https://github.com/basecamp/handbook/blob/master/37signals-is-you.md"
)
```


```python
<!--IMPORTS:[{"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "Merge Documents Loader"}]-->
from langchain_community.document_loaders import PyPDFLoader

loader_pdf = PyPDFLoader("../MachineLearning-Lecture01.pdf")
```


```python
<!--IMPORTS:[{"imported": "MergedDataLoader", "source": "langchain_community.document_loaders.merge", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.merge.MergedDataLoader.html", "title": "Merge Documents Loader"}]-->
from langchain_community.document_loaders.merge import MergedDataLoader

loader_all = MergedDataLoader(loaders=[loader_web, loader_pdf])
```


```python
docs_all = loader_all.load()
```


```python
len(docs_all)
```



```output
23
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
