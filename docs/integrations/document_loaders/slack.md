---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/slack.ipynb
---
# Slack

>[Slack](https://slack.com/) 是一个即时消息程序。

本笔记本介绍如何从 `Slack` 导出的 Zip 文件中加载文档。

为了获取此 `Slack` 导出，请按照以下说明操作：

## 🧑 导入您自己的数据集的说明

导出您的 Slack 数据。您可以通过访问您的工作区管理页面并点击导入/导出选项 (\.slack.com/services/export) 来完成此操作。然后，选择正确的日期范围并点击 `开始导出`。Slack 会在导出准备好时向您发送电子邮件和 DM。

下载将会在您的下载文件夹中生成一个 `.zip` 文件（或根据您的操作系统配置，下载文件可能在其他位置）。

复制 `.zip` 文件的路径，并将其分配为下面的 `LOCAL_ZIPFILE`。


```python
<!--IMPORTS:[{"imported": "SlackDirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.slack_directory.SlackDirectoryLoader.html", "title": "Slack"}]-->
from langchain_community.document_loaders import SlackDirectoryLoader
```


```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```


```python
docs = loader.load()
docs
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
