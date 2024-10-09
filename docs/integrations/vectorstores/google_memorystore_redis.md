---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/google_memorystore_redis.ipynb
---
# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) 是一个完全托管的服务，基于 Redis 内存数据存储构建应用程序缓存，提供亚毫秒级的数据访问。扩展您的数据库应用程序，利用 Memorystore for Redis 的 LangChain 集成构建 AI 驱动的体验。

本笔记本介绍如何使用 [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) 使用 `MemorystoreVectorStore` 类存储向量嵌入。

在 [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## 前提条件

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Memorystore for Redis API](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [创建一个 Redis 实例的 Memorystore](https://cloud.google.com/memorystore/docs/redis/create-instance-console)。确保版本大于或等于 7.2。

### 🦜🔗 库安装

集成存在于其自己的 `langchain-google-memorystore-redis` 包中，因此我们需要安装它。


```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
```

**仅限Colab:** 取消注释以下单元以重启内核或使用按钮重启内核。对于Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ 设置您的Google Cloud项目
设置您的Google Cloud项目，以便您可以在此笔记本中利用Google Cloud资源。

如果您不知道您的项目ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 查看支持页面：[查找项目ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 认证
以在此笔记本中登录的IAM用户身份对Google Cloud进行认证，以访问您的Google Cloud项目。

* 如果您使用Colab运行此笔记本，请使用下面的单元并继续。
* 如果您使用的是 Vertex AI Workbench，请查看 [这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) 的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

## 基本用法

### 初始化向量索引


```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### 准备文档

文本在与向量存储交互之前需要处理和数值表示。这包括：

* 加载文本：TextLoader 从文件中获取文本数据（例如，“state_of_the_union.txt”）。
* 文本分割：CharacterTextSplitter 将文本分割成更小的块以供嵌入模型使用。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Google Memorystore for Redis"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Google Memorystore for Redis"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 将文档添加到向量存储

在文本准备和嵌入生成之后，以下方法将它们插入到 Redis 向量存储中。

#### 方法 1：用于直接插入的类方法

该方法将嵌入创建和插入合并为一个步骤，使用 from_documents 类方法：


```python
<!--IMPORTS:[{"imported": "FakeEmbeddings", "source": "langchain_community.embeddings.fake", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "Google Memorystore for Redis"}]-->
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### 方法 2：基于实例的插入
该方法在处理新的或现有的 RedisVectorStore 时提供了灵活性：

* [可选] 创建 RedisVectorStore 实例：实例化一个 RedisVectorStore 对象以进行自定义。如果您已经有一个实例，请继续下一步。
* 添加带元数据的文本：向实例提供原始文本和元数据。嵌入生成和插入向量存储将自动处理。


```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### 执行相似性搜索 (KNN)

随着向量存储的填充，可以搜索与查询语义相似的文本。以下是如何使用默认设置的 KNN (K-最近邻) 的方法：

* 制定查询：自然语言问题表达搜索意图（例如，“总统对 Ketanji Brown Jackson 说了什么”）。
* 检索相似结果：`similarity_search` 方法查找在向量存储中与查询在意义上最接近的项目。


```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### 执行基于范围的相似性搜索

范围查询通过指定所需的相似性阈值和查询文本提供更多控制：

* 制定查询：自然语言问题定义了搜索意图。
* 设置相似性阈值：distance_threshold 参数决定了匹配项必须多接近才能被认为是相关的。
* 检索结果：`similarity_search_with_score` 方法从向量存储中找到符合指定相似性阈值的项目。


```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### 执行最大边际相关性 (MMR) 搜索

MMR 查询旨在找到与查询相关且彼此多样化的结果，从而减少搜索结果中的冗余。

* 制定查询：自然语言问题定义了搜索意图。
* 平衡相关性和多样性：lambda_mult 参数控制严格相关性与促进结果多样性之间的权衡。
* 检索 MMR 结果：`max_marginal_relevance_search` 方法返回基于 lambda 设置优化相关性和多样性的项目。


```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## 将向量存储用作检索器

为了与其他LangChain组件无缝集成，向量存储可以转换为检索器。这提供了几个优势：

* LangChain兼容性：许多LangChain工具和方法被设计为可以直接与检索器交互。
* 易用性：`as_retriever()`方法将向量存储转换为简化查询的格式。


```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## 清理

### 从向量存储中删除文档

有时，有必要从向量存储中删除文档（及其相关向量）。`delete`方法提供了此功能。


```python
rvs.delete(ids)
```

### 删除向量索引

在某些情况下，可能需要删除现有的向量索引。常见原因包括：

* 索引配置更改：如果需要修改索引参数，通常需要删除并重新创建索引。
* 存储管理：删除未使用的索引可以帮助释放Redis实例中的空间。

注意：向量索引删除是不可逆的操作。在继续之前，请确保不再需要存储的向量和搜索功能。


```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
