---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/roam.ipynb
---
# Roam

>[ROAM](https://roamresearch.com/) 是一个用于网络思维的笔记工具，旨在创建个人知识库。

本笔记本涵盖了如何从 Roam 数据库加载文档。这从 [这里](https://github.com/JimmyLv/roam-qa) 的示例库中获得了很多灵感。

## 🧑 导入您自己的数据集的说明

从 Roam Research 导出您的数据集。您可以通过点击右上角的三个点，然后点击 `导出` 来完成此操作。

导出时，请确保选择 `Markdown & CSV` 格式选项。

这将在您的下载文件夹中生成一个 `.zip` 文件。将 `.zip` 文件移动到此存储库中。

运行以下命令以解压缩 zip 文件（根据需要将 `Export...` 替换为您自己的文件名）。

```shell
unzip Roam-Export-1675782732639.zip -d Roam_DB
```



```python
<!--IMPORTS:[{"imported": "RoamLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.roam.RoamLoader.html", "title": "Roam"}]-->
from langchain_community.document_loaders import RoamLoader
```


```python
loader = RoamLoader("Roam_DB")
```


```python
docs = loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
