---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/google_firestore.ipynb
sidebar_label: Firestore
---
# Google Firestore (原生模式)

> [Firestore](https://cloud.google.com/firestore) 是一个无服务器的文档导向数据库，能够根据需求进行扩展。通过利用 Firestore 的 LangChain 集成，扩展您的数据库应用程序以构建 AI 驱动的体验。

本笔记本介绍了如何使用 [Firestore](https://cloud.google.com/firestore) 存储向量并使用 `FirestoreVectorStore` 类查询它们。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Firestore API](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [创建一个 Firestore 数据库](https://cloud.google.com/firestore/docs/manage-databases)

在确认在此笔记本的运行环境中访问数据库后，填写以下值并在运行示例脚本之前运行该单元。


```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 库安装

集成在其自己的 `langchain-google-firestore` 包中，因此我们需要安装它。对于这个笔记本，我们还将安装 `langchain-google-genai` 以使用 Google 生成式 AI 嵌入。


```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
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

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 认证

以当前登录此笔记本的IAM用户身份认证到Google Cloud，以便访问您的Google Cloud项目。

- 如果您使用Colab运行此笔记本，请使用下面的单元格并继续。
- 如果您使用Vertex AI Workbench，请查看[这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

# 基本用法

### 初始化FirestoreVectorStore

`FirestoreVectorStore`允许您在Firestore数据库中存储新向量。您可以使用它来存储来自任何模型的嵌入，包括来自Google生成AI的嵌入。


```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

作为简写，您可以使用`from_texts`和`from_documents`方法在单个步骤中初始化并添加向量。


```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Google Firestore (Native Mode)"}]-->
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### 删除向量

您可以使用`delete`方法从数据库中删除带有向量的文档。您需要提供要删除的向量的文档ID。这将从数据库中删除整个文档，包括它可能具有的任何其他字段。


```python
vector_store.delete(ids)
```

### 更新向量

更新向量类似于添加向量。您可以使用 `add` 方法通过提供文档 ID 和新向量来更新文档的向量。


```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## 相似性搜索

您可以使用 `FirestoreVectorStore` 对存储的向量执行相似性搜索。这对于查找相似的文档或文本非常有用。


```python
vector_store.similarity_search("I like fuji apples", k=3)
```


```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

您可以通过使用 `filters` 参数为搜索添加预过滤器。这对于按特定字段或值进行过滤非常有用。


```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### 自定义连接和身份验证


```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
