---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/quip.ipynb
---
# Quip

>[Quip](https://quip.com) 是一款用于移动和Web的协作生产力软件套件。它允许一组人共同创建和编辑文档和电子表格，通常用于商业目的。

用于加载 `Quip` 文档的加载器。

请参考 [这里](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs) 了解如何获取个人访问令牌。

指定一个 `folder_ids` 和/或 `thread_ids` 列表，以将相应的文档加载到文档对象中。如果同时指定了两者，加载器将根据 `folder_ids` 获取属于该文件夹的所有 `thread_ids`，并与传递的 `thread_ids` 结合，返回两个集合的并集。

* 如何知道 folder_id？
前往 quip 文件夹，右键点击文件夹并复制链接，从链接中提取后缀作为 folder_id。提示： `https://example.quip.com/`
* 如何知道 thread_id？
thread_id 是文档 ID。前往 quip 文档，右键点击文档并复制链接，从链接中提取后缀作为 thread_id。提示： `https://exmaple.quip.com/`
  
您还可以将 `include_all_folders` 设置为 `True`，将获取 group_folder_ids 和
您还可以指定一个布尔值 `include_attachments` 来包含附件，默认设置为 False，如果设置为 True，所有附件将被下载，QuipLoader 将从附件中提取文本并将其添加到文档对象中。目前支持的附件类型有：`PDF`、`PNG`、`JPEG/JPG`、`SVG`、`Word` 和 `Excel`。您还可以指定一个布尔值 `include_comments` 来在文档中包含评论，默认设置为 False，如果设置为 True，文档中的所有评论将被提取，QuipLoader 将把它们添加到文档对象中。


在使用 QuipLoader 之前，请确保您已安装最新版本的 quip-api 包：


```python
%pip install --upgrade --quiet  quip-api
```

## 示例

### 个人访问令牌


```python
<!--IMPORTS:[{"imported": "QuipLoader", "source": "langchain_community.document_loaders.quip", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.quip.QuipLoader.html", "title": "Quip"}]-->
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
