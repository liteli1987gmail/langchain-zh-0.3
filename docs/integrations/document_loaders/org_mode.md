---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/org_mode.ipynb
---
# Org-mode

>A [Org Mode 文档](https://en.wikipedia.org/wiki/Org-mode) 是一种文档编辑、格式化和组织模式，旨在用于在自由软件文本编辑器 Emacs 中进行笔记、规划和创作。

## `UnstructuredOrgModeLoader`

您可以使用 `UnstructuredOrgModeLoader` 从 Org-mode 文件加载数据，工作流程如下。


```python
<!--IMPORTS:[{"imported": "UnstructuredOrgModeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.org_mode.UnstructuredOrgModeLoader.html", "title": "Org-mode"}]-->
from langchain_community.document_loaders import UnstructuredOrgModeLoader

loader = UnstructuredOrgModeLoader(
    file_path="./example_data/README.org", mode="elements"
)
docs = loader.load()

print(docs[0])
```
```output
page_content='Example Docs' metadata={'source': './example_data/README.org', 'category_depth': 0, 'last_modified': '2023-12-19T13:42:18', 'languages': ['eng'], 'filetype': 'text/org', 'file_directory': './example_data', 'filename': 'README.org', 'category': 'Title'}
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
