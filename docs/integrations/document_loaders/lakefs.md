---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/lakefs.ipynb
---
# lakeFS

>[lakeFS](https://docs.lakefs.io/) 提供对数据湖的可扩展版本控制，并使用类似 Git 的语义来创建和访问这些版本。

本笔记本涵盖如何从 `lakeFS` 路径加载文档对象（无论是对象还是前缀）。


## 初始化 lakeFS 加载器

将 `ENDPOINT`、`LAKEFS_ACCESS_KEY` 和 `LAKEFS_SECRET_KEY` 的值替换为您自己的。


```python
<!--IMPORTS:[{"imported": "LakeFSLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.lakefs.LakeFSLoader.html", "title": "lakeFS"}]-->
from langchain_community.document_loaders import LakeFSLoader
```


```python
ENDPOINT = ""
LAKEFS_ACCESS_KEY = ""
LAKEFS_SECRET_KEY = ""

lakefs_loader = LakeFSLoader(
    lakefs_access_key=LAKEFS_ACCESS_KEY,
    lakefs_secret_key=LAKEFS_SECRET_KEY,
    lakefs_endpoint=ENDPOINT,
)
```

## 指定路径
您可以指定前缀或完整对象路径来控制加载哪些文件。

在相应的 `REPO`、`REF` 和 `PATH` 中指定仓库、引用（分支、提交 ID 或标签）和路径，以加载文档：


```python
REPO = ""
REF = ""
PATH = ""

lakefs_loader.set_repo(REPO)
lakefs_loader.set_ref(REF)
lakefs_loader.set_path(PATH)

docs = lakefs_loader.load()
docs
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
