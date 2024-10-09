---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/box.ipynb
sidebar_label: Box
---

# BoxLoader

本笔记本提供了关于如何使用 Box [文档加载器](/docs/integrations/document_loaders/) 的快速概述。有关所有 BoxLoader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/box/document_loaders/langchain_box.document_loaders.box.BoxLoader.html)。


## 概述

`BoxLoader` 类帮助您以 Langchain 的 `Document` 格式从 Box 获取非结构化内容。您可以使用包含 Box 文件 ID 的 `List[str]`，或使用包含 Box 文件夹 ID 的 `str` 来实现。

您必须提供包含 Box 文件 ID 的 `List[str]`，或包含文件夹 ID 的 `str`。如果要从具有文件夹 ID 的文件夹中获取文件，您还可以设置一个 `Bool` 来告诉加载器获取该文件夹中的所有子文件夹。

:::info
一个 Box 实例可以包含 PB 级别的文件，文件夹可以包含数百万个文件。选择要索引的文件夹时请谨慎。我们建议永远不要递归获取文件夹 0 中的所有文件。文件夹 ID 0 是您的根文件夹。
:::

没有文本表示的文件将被跳过。

### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [BoxLoader](https://python.langchain.com/api_reference/box/document_loaders/langchain_box.document_loaders.box.BoxLoader.html) | [langchain_box](https://python.langchain.com/api_reference/box/index.html) | ✅ | ❌ | ❌ |
### 加载器特性
| 来源 | 文档懒加载 | 异步支持
| :---: | :---: | :---: |
| BoxLoader | ✅ | ❌ |

## 设置

要使用 Box 包，您需要一些东西：

* 一个 Box 账户 — 如果您不是当前的 Box 客户或想在生产 Box 实例之外进行测试，您可以使用 [免费开发者账户](https://account.box.com/signup/n/developer#ty9l3)。
* [一个 Box 应用](https://developer.box.com/guides/getting-started/first-application/) — 这在 [开发者控制台](https://account.box.com/developers/console) 中配置，对于 Box AI，必须启用 `管理 AI` 范围。在这里，您还将选择您的认证方法。
* 应用必须由 [管理员启用](https://developer.box.com/guides/authorization/custom-app-approval/#manual-approval)。对于免费开发者账户，这就是注册账户的人。

### 凭证

在这些示例中，我们将使用 [令牌认证](https://developer.box.com/guides/authentication/tokens/developer-tokens)。这可以与任何 [认证方法](https://developer.box.com/guides/authentication/) 一起使用。只需使用任何方法获取令牌。如果您想了解更多关于如何使用其他认证类型与 `langchain-box` 的信息，请访问 [Box 大模型供应商](/docs/integrations/providers/box) 文档。



```python
import getpass
import os

box_developer_token = getpass.getpass("Enter your Box Developer Token: ")
```
```output
Enter your Box Developer Token:  ········
```
如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_box**。


```python
%pip install -qU langchain_box
```

## 初始化

### 加载文件

如果您希望加载文件，您必须在实例化时提供文件 ID 的 `List`。

这需要 1 个信息：

* **box_file_ids** (`List[str]`) - Box 文件 ID 的列表。


```python
<!--IMPORTS:[{"imported": "BoxLoader", "source": "langchain_box.document_loaders", "docs": "https://python.langchain.com/api_reference/box/document_loaders/langchain_box.document_loaders.box.BoxLoader.html", "title": "BoxLoader"}]-->
from langchain_box.document_loaders import BoxLoader

box_file_ids = ["1514555423624", "1514553902288"]

loader = BoxLoader(
    box_developer_token=box_developer_token,
    box_file_ids=box_file_ids,
    character_limit=10000,  # Optional. Defaults to no limit
)
```

### 从文件夹加载

如果您希望从文件夹加载文件，您必须在实例化时提供一个包含 Box 文件夹 ID 的 `str`。

这需要 1 条信息：

* **box_folder_id** (`str`) - 一个包含 Box 文件夹 ID 的字符串。


```python
<!--IMPORTS:[{"imported": "BoxLoader", "source": "langchain_box.document_loaders", "docs": "https://python.langchain.com/api_reference/box/document_loaders/langchain_box.document_loaders.box.BoxLoader.html", "title": "BoxLoader"}]-->
from langchain_box.document_loaders import BoxLoader

box_folder_id = "260932470532"

loader = BoxLoader(
    box_folder_id=box_folder_id,
    recursive=False,  # Optional. return entire tree, defaults to False
    character_limit=10000,  # Optional. Defaults to no limit
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': 'https://dl.boxcloud.com/api/2.0/internal_files/1514555423624/versions/1663171610024/representations/extracted_text/content/', 'title': 'Invoice-A5555_txt'}, page_content='Vendor: AstroTech Solutions\nInvoice Number: A5555\n\nLine Items:\n    - Gravitational Wave Detector Kit: $800\n    - Exoplanet Terrarium: $120\nTotal: $920')
```



```python
print(docs[0].metadata)
```
```output
{'source': 'https://dl.boxcloud.com/api/2.0/internal_files/1514555423624/versions/1663171610024/representations/extracted_text/content/', 'title': 'Invoice-A5555_txt'}
```
## 懒加载


```python
page = []
for doc in loader.lazy_load():
    page.append(doc)
    if len(page) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        page = []
```

## API 参考

有关所有 BoxLoader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/box/document_loaders/langchain_box.document_loaders.box.BoxLoader.html)


## 帮助

如果您有问题，可以查看我们的 [开发者文档](https://developer.box.com) 或在我们的 [开发者社区](https://community.box.com) 联系我们。


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
