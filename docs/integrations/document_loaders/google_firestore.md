---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_firestore.ipynb
---
# Google Firestore (原生模式)

> [Firestore](https://cloud.google.com/firestore) 是一个无服务器的文档导向数据库，可以根据需求进行扩展。通过利用 Firestore 的 LangChain 集成，扩展您的数据库应用程序以构建 AI 驱动的体验。

本笔记本介绍了如何使用 [Firestore](https://cloud.google.com/firestore) [保存、加载和删除 LangChain 文档](/docs/how_to#document-loaders)，使用 `FirestoreLoader` 和 `FirestoreSaver`。

在 [GitHub](https://github.com/googleapis/langchain-google-firestore-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Firestore API](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [创建一个 Firestore 数据库](https://cloud.google.com/firestore/docs/manage-databases)

在确认可以访问此笔记本的运行时环境中的数据库后，请填写以下值并在运行示例脚本之前运行该单元。


```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 库安装

集成在其自己的 `langchain-google-firestore` 包中，因此我们需要安装它。


```python
%pip install -upgrade --quiet langchain-google-firestore
```

**仅限 Colab**：取消注释以下单元以重启内核，或使用按钮重启内核。对于 Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ 设置您的 Google Cloud 项目
设置您的 Google Cloud 项目，以便您可以在此笔记本中利用 Google Cloud 资源。

如果您不知道您的项目 ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 查看支持页面：[查找项目 ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 认证

以当前登录此笔记本的IAM用户身份验证Google Cloud，以访问您的Google Cloud项目。

- 如果您使用Colab运行此笔记本，请使用下面的单元格并继续。
- 如果您使用Vertex AI Workbench，请查看[此处](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

## 基本用法

### 保存文档

`FirestoreSaver`可以将文档存储到Firestore中。默认情况下，它将尝试从元数据中提取文档引用。

使用`FirestoreSaver.upsert_documents(<documents>)`保存langchain文档。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Google Firestore (Native Mode)"}]-->
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### 保存没有引用的文档

如果指定了集合，文档将使用自动生成的ID进行存储。


```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### 保存带有其他引用的文档


```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### 从集合或子集合加载

使用 `FirestoreLoader.load()` 或 `Firestore.lazy_load()` 加载 LangChain 文档。`lazy_load` 返回一个生成器，该生成器在迭代期间仅查询数据库。要初始化 `FirestoreLoader` 类，您需要提供：

1. `source` - 一个 Query、CollectionGroup、DocumentReference 的实例或指向 Firestore 集合的单个 `\` 分隔路径。


```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### 加载单个文档


```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### 从 CollectionGroup 或查询加载


```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### 删除文档

使用 `FirestoreSaver.delete_documents(<documents>)` 从 Firestore 集合中删除一组 LangChain 文档。

如果提供了文档 ID，则将忽略这些文档。


```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## 高级用法

### 加载具有自定义文档页面内容和元数据的文档

`page_content_fields` 和 `metadata_fields` 的参数将指定要写入 LangChain 文档 `page_content` 和 `metadata` 的 Firestore 文档字段。


```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### 自定义页面内容格式

当 `page_content` 仅包含一个字段时，信息将仅为该字段的值。否则，`page_content` 将采用 JSON 格式。

### 自定义连接与身份验证


```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
