---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/copypaste.ipynb
---
# 复制粘贴

本笔记本介绍如何从您想要复制和粘贴的内容加载文档对象。在这种情况下，您甚至不需要使用文档加载器，而是可以直接构造文档。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Copy Paste"}]-->
from langchain_core.documents import Document
```


```python
text = "..... put the text you copy pasted here......"
```


```python
doc = Document(page_content=text)
```

## 元数据
如果您想添加关于您获取这段文本的元数据，可以通过元数据键轻松实现。


```python
metadata = {"source": "internet", "date": "Friday"}
```


```python
doc = Document(page_content=text, metadata=metadata)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
