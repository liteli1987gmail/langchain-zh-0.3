---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/rst.ipynb
---
# RST

>A [reStructured Text (RST)](https://en.wikipedia.org/wiki/ReStructuredText) 文件是一种文本数据文件格式，主要用于Python编程语言社区的技术文档。

## `UnstructuredRSTLoader`

您可以使用 `UnstructuredRSTLoader` 从 RST 文件加载数据，工作流程如下。


```python
<!--IMPORTS:[{"imported": "UnstructuredRSTLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.rst.UnstructuredRSTLoader.html", "title": "RST"}]-->
from langchain_community.document_loaders import UnstructuredRSTLoader

loader = UnstructuredRSTLoader(file_path="./example_data/README.rst", mode="elements")
docs = loader.load()

print(docs[0])
```
```output
page_content='Example Docs' metadata={'source': './example_data/README.rst', 'category_depth': 0, 'last_modified': '2023-12-19T13:42:18', 'languages': ['eng'], 'filetype': 'text/x-rst', 'file_directory': './example_data', 'filename': 'README.rst', 'category': 'Title'}
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
