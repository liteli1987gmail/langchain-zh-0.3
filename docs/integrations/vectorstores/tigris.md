---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/tigris.ipynb
---
# Tigris

> [Tigris](https://tigrisdata.com) 是一个开源的无服务器 NoSQL 数据库和搜索平台，旨在简化构建高性能向量搜索应用程序的过程。
> `Tigris` 消除了管理、操作和同步多个工具的基础设施复杂性，让您可以专注于构建出色的应用程序。

本笔记本指导您如何将 Tigris 用作您的向量存储。

**前提条件**
1. 一个 OpenAI 账户。您可以在 [这里](https://platform.openai.com/) 注册账户。
2. [注册一个免费的 Tigris 账户](https://console.preview.tigrisdata.cloud)。注册 Tigris 账户后，创建一个名为 `vectordemo` 的新项目。接下来，记下您创建项目的区域的 *Uri*、**clientId** 和 **clientSecret**。您可以在项目的 **应用密钥** 部分获取所有这些信息。

让我们首先安装我们的依赖项：


```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai langchain-community tiktoken
```

我们将在环境中加载 `OpenAI` api 密钥和 `Tigris` 凭证


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
if "TIGRIS_PROJECT" not in os.environ:
    os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
if "TIGRIS_CLIENT_ID" not in os.environ:
    os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
if "TIGRIS_CLIENT_SECRET" not in os.environ:
    os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Tigris"}, {"imported": "Tigris", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tigris.Tigris.html", "title": "Tigris"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Tigris"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Tigris"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### 初始化 Tigris 向量存储
让我们导入我们的测试数据集：


```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```


```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### 相似性搜索


```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### 带分数的相似性搜索（向量距离）


```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
