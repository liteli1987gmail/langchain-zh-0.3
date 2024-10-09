---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/email.ipynb
---
# 邮件

本笔记本展示了如何加载电子邮件（`.eml`）或 `Microsoft Outlook`（`.msg`）文件。

有关在本地设置 Unstructured 的更多说明，包括设置所需的系统依赖项，请参见 [本指南](/docs/integrations/providers/unstructured/)。

## 使用 Unstructured


```python
%pip install --upgrade --quiet unstructured
```


```python
<!--IMPORTS:[{"imported": "UnstructuredEmailLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.email.UnstructuredEmailLoader.html", "title": "Email"}]-->
from langchain_community.document_loaders import UnstructuredEmailLoader

loader = UnstructuredEmailLoader("./example_data/fake-email.eml")

data = loader.load()

data
```



```output
[Document(page_content='This is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': './example_data/fake-email.eml'})]
```


### 保留元素

在底层，Unstructured 为不同的文本块创建不同的“元素”。默认情况下，我们将这些元素组合在一起，但您可以通过指定 `mode="elements"` 来轻松保持这种分离。


```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml", mode="elements")

data = loader.load()

data[0]
```



```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'file_directory': 'example_data', 'filename': 'fake-email.eml', 'last_modified': '2022-12-16T17:04:16-05:00', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'languages': ['eng'], 'filetype': 'message/rfc822', 'category': 'NarrativeText'})
```


### 处理附件

您可以通过在构造函数中设置 `process_attachments=True` 来使用 `UnstructuredEmailLoader` 处理附件。默认情况下，附件将使用 `unstructured` 中的 `partition` 函数进行分区。您可以通过将函数传递给 `attachment_partitioner` 关键字参数来使用不同的分区函数。


```python
loader = UnstructuredEmailLoader(
    "example_data/fake-email.eml",
    mode="elements",
    process_attachments=True,
)

data = loader.load()

data[0]
```



```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'file_directory': 'example_data', 'filename': 'fake-email.eml', 'last_modified': '2022-12-16T17:04:16-05:00', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'languages': ['eng'], 'filetype': 'message/rfc822', 'category': 'NarrativeText'})
```


## 使用 OutlookMessageLoader


```python
%pip install --upgrade --quiet extract_msg
```


```python
<!--IMPORTS:[{"imported": "OutlookMessageLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.email.OutlookMessageLoader.html", "title": "Email"}]-->
from langchain_community.document_loaders import OutlookMessageLoader

loader = OutlookMessageLoader("example_data/fake-email.msg")

data = loader.load()

data[0]
```



```output
Document(page_content='This is a test email to experiment with the MS Outlook MSG Extractor\r\n\r\n\r\n-- \r\n\r\n\r\nKind regards\r\n\r\n\r\n\r\n\r\nBrian Zhou\r\n\r\n', metadata={'source': 'example_data/fake-email.msg', 'subject': 'Test for TIF files', 'sender': 'Brian Zhou <brizhou@gmail.com>', 'date': datetime.datetime(2013, 11, 18, 0, 26, 24, tzinfo=zoneinfo.ZoneInfo(key='America/Los_Angeles'))})
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
