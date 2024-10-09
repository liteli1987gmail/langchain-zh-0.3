---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/meilisearch.ipynb
---
# Meilisearch

> [Meilisearch](https://meilisearch.com) 是一个开源、快速且高度相关的搜索引擎。它提供了很好的默认设置，帮助开发者构建流畅的搜索体验。
>
> 你可以 [自托管 Meilisearch](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) 或在 [Meilisearch Cloud](https://www.meilisearch.com/pricing) 上运行。

Meilisearch v1.3 支持向量搜索。此页面指导您如何将 Meilisearch 集成作为向量存储并使用它进行向量搜索。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 设置

### 启动 Meilisearch 实例

您需要一个正在运行的 Meilisearch 实例作为您的向量存储。您可以在 [本地运行 Meilisearch](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) 或创建一个 [Meilisearch Cloud](https://cloud.meilisearch.com/) 账户。

截至 Meilisearch v1.3，向量存储是一个实验性功能。在启动您的 Meilisearch 实例后，您需要 **启用向量存储**。对于自托管的 Meilisearch，请阅读关于 [启用实验性功能](https://www.meilisearch.com/docs/learn/experimental/overview) 的文档。在 **Meilisearch Cloud** 上，通过您的项目 _设置_ 页面启用 _向量存储_。

您现在应该有一个运行中的 Meilisearch 实例，并启用了向量存储。🎉

### 凭证

要与您的 Meilisearch 实例交互，Meilisearch SDK 需要一个主机（您实例的 URL）和一个 API 密钥。

**主机**

- 在 **本地**，默认主机是 `localhost:7700`
- 在 **Meilisearch Cloud** 上，您可以在项目的 _设置_ 页面找到主机

**API 密钥**

Meilisearch 实例为您提供了三个默认的 API 密钥：
- 一个 `MASTER KEY` — 仅应用于创建您的 Meilisearch 实例
- 一个 `ADMIN KEY` — 仅在服务器端使用，以更新您的数据库及其设置
- 一个 `搜索密钥` — 一个可以安全地在前端应用程序中共享的密钥

您可以根据需要创建 [额外的 API 密钥](https://www.meilisearch.com/docs/learn/security/master_api_keys)。

### 安装依赖

本指南使用 [Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)。您可以通过运行以下命令来安装它：


```python
%pip install --upgrade --quiet  meilisearch
```

有关更多信息，请参阅 [Meilisearch Python SDK 文档](https://meilisearch.github.io/meilisearch-python/)。

## 示例

初始化 Meilisearch 向量存储有多种方法：根据需要提供 Meilisearch 客户端或 _URL_ 和 _API 密钥_。在我们的示例中，凭据将从环境中加载。

您可以通过使用 `os` 和 `getpass` 在 Notebook 环境中使用环境变量。您可以对以下所有示例使用此技术。


```python
import getpass
import os

if "MEILI_HTTP_ADDR" not in os.environ:
    os.environ["MEILI_HTTP_ADDR"] = getpass.getpass(
        "Meilisearch HTTP address and port:"
    )
if "MEILI_MASTER_KEY" not in os.environ:
    os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### 添加文本和嵌入

此示例将文本添加到 Meilisearch 向量数据库，而无需初始化 Meilisearch 向量存储。


```python
<!--IMPORTS:[{"imported": "Meilisearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.meilisearch.Meilisearch.html", "title": "Meilisearch"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Meilisearch"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Meilisearch"}]-->
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```


```python
with open("../../how_to/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```


```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

在后台，Meilisearch 将文本转换为多个向量。这将使我们得到与以下示例相同的结果。

### 添加文档和嵌入

在此示例中，我们将使用 Langchain TextSplitter 将文本拆分为多个文档。然后，我们将存储这些文档及其嵌入。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Meilisearch"}]-->
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## 通过创建 Meilisearch 向量存储添加文档

在这种方法中，我们创建一个向量存储对象并向其中添加文档。


```python
<!--IMPORTS:[{"imported": "Meilisearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.meilisearch.Meilisearch.html", "title": "Meilisearch"}]-->
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## 带分数的相似性搜索

此特定方法允许您返回文档及查询与它们之间的距离分数。`embedder_name` 是用于语义搜索的嵌入器名称，默认为 "default"。


```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## 通过向量进行相似性搜索
`embedder_name` 是用于语义搜索的嵌入器名称，默认为 "default"。


```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## 其他资源

文档
- [Meilisearch](https://www.meilisearch.com/docs/)
- [Meilisearch Python SDK](https://python-sdk.meilisearch.com)

开源代码库
- [Meilisearch 代码库](https://github.com/meilisearch/meilisearch)
- [Meilisearch Python SDK](https://github.com/meilisearch/meilisearch-python)


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
