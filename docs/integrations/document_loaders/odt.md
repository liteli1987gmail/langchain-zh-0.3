---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/odt.ipynb
---
# 开放文档格式 (ODT)

> [办公应用程序开放文档格式 (ODF)](https://en.wikipedia.org/wiki/OpenDocument)，也称为 `OpenDocument`，是一种用于文字处理文档、电子表格、演示文稿和图形的开放文件格式，使用 ZIP 压缩的 XML 文件。它的开发旨在为办公应用程序提供一个开放的、基于 XML 的文件格式规范。

> 该标准由结构化信息标准促进组织 (`OASIS`) 的一个技术委员会开发和维护。它基于 Sun Microsystems 为 OpenOffice.org XML 提供的规范，这是 `OpenOffice.org` 和 `LibreOffice` 的默认格式。最初是为 `StarOffice` 开发的，目的是“为办公文档提供一个开放标准”。

`UnstructuredODTLoader` 用于加载 `Open Office ODT` 文件。


```python
<!--IMPORTS:[{"imported": "UnstructuredODTLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.odt.UnstructuredODTLoader.html", "title": "Open Document Format (ODT)"}]-->
from langchain_community.document_loaders import UnstructuredODTLoader

loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```



```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'category_depth': 0, 'file_directory': 'example_data', 'filename': 'fake.odt', 'last_modified': '2023-12-19T13:42:18', 'languages': ['por', 'cat'], 'filetype': 'application/vnd.oasis.opendocument.text', 'category': 'Title'})
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
