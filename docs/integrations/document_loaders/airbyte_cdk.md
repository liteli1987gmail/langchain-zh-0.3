---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/airbyte_cdk.ipynb
sidebar_class_name: hidden
---
# Airbyte CDK (已弃用)

注意：`AirbyteCDKLoader` 已弃用。请改用 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)。

>[Airbyte](https://github.com/airbytehq/airbyte) 是一个用于从 API、数据库和文件到数据仓库和数据湖的 ELT 管道的数据集成平台。它拥有最大的 ELT 连接器目录，支持数据仓库和数据库。

许多源连接器是使用 [Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/) 实现的。此加载器允许运行这些连接器中的任何一个，并将数据作为文档返回。

## 安装

首先，您需要安装 `airbyte-cdk` Python 包。


```python
%pip install --upgrade --quiet  airbyte-cdk
```

然后，您可以从 [Airbyte Github 仓库](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors) 安装现有的连接器，或者使用 [Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development) 创建自己的连接器。

例如，要安装 Github 连接器，请运行


```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

一些数据源也作为常规包发布在 PyPI 上

## 示例

现在您可以基于导入的数据源创建一个 `AirbyteCDKLoader`。它需要一个传递给连接器的 `config` 对象。您还必须通过名称 (`stream_name`) 选择要从中检索记录的流。有关配置对象和可用流的更多信息，请查看连接器文档页面和规范定义。对于 Github 连接器，这些是：

* [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json)。
* [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)


```python
<!--IMPORTS:[{"imported": "AirbyteCDKLoader", "source": "langchain_community.document_loaders.airbyte", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.airbyte.AirbyteCDKLoader.html", "title": "Airbyte CDK (Deprecated)"}]-->
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # plug in your own source here

config = {
    # your github configuration
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

现在您可以以通常的方式加载文档


```python
docs = issues_loader.load()
```

由于 `load` 返回一个列表，它将在所有文档加载完成之前阻塞。为了更好地控制此过程，您还可以使用 `lazy_load` 方法，它返回一个迭代器：


```python
docs_iterator = issues_loader.lazy_load()
```

请记住，默认情况下页面内容是空的，元数据对象包含记录中的所有信息。要以不同的方式创建文档，请在创建加载器时传入一个 record_handler 函数：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Airbyte CDK (Deprecated)"}]-->
from langchain_core.documents import Document


def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )


issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## 增量加载

某些流允许增量加载，这意味着源会跟踪已同步的记录，并且不会再次加载它们。这对于数据量大且频繁更新的源非常有用。

为了利用这一点，存储加载器的 `last_state` 属性，并在再次创建加载器时传入。这将确保只加载新记录。


```python
last_state = issues_loader.last_state  # store safely

incremental_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
