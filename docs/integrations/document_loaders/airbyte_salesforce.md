---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/airbyte_salesforce.ipynb
sidebar_class_name: hidden
---
# Airbyte Salesforce (已弃用)

注意：此连接器特定的加载器已弃用。请改用 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)。

>[Airbyte](https://github.com/airbytehq/airbyte) 是一个用于从API、数据库和文件到数据仓库和数据湖的ELT管道的数据集成平台。它拥有最大的ELT连接器目录，支持数据仓库和数据库。

此加载器将Salesforce连接器暴露为文档加载器，允许您将各种Salesforce对象加载为文档。

## 安装

首先，您需要安装 `airbyte-source-salesforce` Python包。


```python
%pip install --upgrade --quiet  airbyte-source-salesforce
```

## 示例

请查看 [Airbyte 文档页面](https://docs.airbyte.com/integrations/sources/salesforce/) 以获取有关如何配置读取器的详细信息。
配置对象应遵循的 JSON 架构可以在 Github 上找到：[https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml)。

一般结构如下所示：
```python
{
  "client_id": "<oauth client id>",
  "client_secret": "<oauth client secret>",
  "refresh_token": "<oauth refresh token>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "is_sandbox": False, # set to True if you're using a sandbox environment
  "streams_criteria": [ # Array of filters for salesforce objects that should be loadable
    {"criteria": "exacts", "value": "Account"}, # Exact name of salesforce object
    {"criteria": "starts with", "value": "Asset"}, # Prefix of the name
    # Other allowed criteria: ends with, contains, starts not with, ends not with, not contains, not exacts
  ],
}
```

默认情况下，所有字段都作为元数据存储在文档中，文本设置为空字符串。通过转换读取器返回的文档来构建文档的文本。


```python
<!--IMPORTS:[{"imported": "AirbyteSalesforceLoader", "source": "langchain_community.document_loaders.airbyte", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.airbyte.AirbyteSalesforceLoader.html", "title": "Airbyte Salesforce (Deprecated)"}]-->
from langchain_community.document_loaders.airbyte import AirbyteSalesforceLoader

config = {
    # your salesforce configuration
}

loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset"
)  # check the documentation linked above for a list of all streams
```

现在您可以以常规方式加载文档


```python
docs = loader.load()
```

由于 `load` 返回一个列表，它将在所有文档加载完成之前阻塞。为了更好地控制此过程，您还可以使用 `lazy_load` 方法，它返回一个迭代器：


```python
docs_iterator = loader.lazy_load()
```

请记住，默认情况下页面内容为空，元数据对象包含记录中的所有信息。要以不同的方式创建文档，请在创建加载器时传入一个 record_handler 函数：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Airbyte Salesforce (Deprecated)"}]-->
from langchain_core.documents import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteSalesforceLoader(
    config=config, record_handler=handle_record, stream_name="asset"
)
docs = loader.load()
```

## 增量加载

某些流允许增量加载，这意味着源会跟踪已同步的记录，并且不会再次加载它们。这对于数据量大且频繁更新的源非常有用。

为了利用这一点，请存储加载器的 `last_state` 属性，并在再次创建加载器时传入。这将确保仅加载新记录。


```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset", state=last_state
)

new_docs = incremental_loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)