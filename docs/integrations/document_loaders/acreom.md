---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/acreom.ipynb
---
# acreom

[acreom](https://acreom.com) 是一个以开发为先的知识库，任务在本地 markdown 文件上运行。

以下是如何将本地 acreom 保管库加载到 LangChain 的示例。由于 acreom 中的本地保管库是一个纯文本 .md 文件的文件夹，加载器需要目录的路径。

保管库文件可能包含一些元数据，这些元数据存储为 YAML 头。如果 `collect_metadata` 设置为 true，这些值将被添加到文档的元数据中。


```python
<!--IMPORTS:[{"imported": "AcreomLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.acreom.AcreomLoader.html", "title": "acreom"}]-->
from langchain_community.document_loaders import AcreomLoader
```


```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```


```python
docs = loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
