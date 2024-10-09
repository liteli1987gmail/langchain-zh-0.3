---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/dashvector.ipynb
---
# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html) 是一个完全托管的向量数据库服务，支持高维稠密和稀疏向量、实时插入和过滤搜索。它能够自动扩展，并可以适应不同的应用需求。

本笔记本展示了如何使用与 `DashVector` 向量数据库相关的功能。

要使用 DashVector，您必须拥有一个 API 密钥。
以下是 [安装说明](https://help.aliyun.com/document_detail/2510223.html)。

## 安装


```python
%pip install --upgrade --quiet  langchain-community dashvector dashscope
```

我们想使用 `DashScopeEmbeddings`，所以我们还需要获取 Dashscope API 密钥。


```python
import getpass
import os

if "DASHVECTOR_API_KEY" not in os.environ:
    os.environ["DASHVECTOR_API_KEY"] = getpass.getpass("DashVector API Key:")
if "DASHSCOPE_API_KEY" not in os.environ:
    os.environ["DASHSCOPE_API_KEY"] = getpass.getpass("DashScope API Key:")
```

## 示例


```python
<!--IMPORTS:[{"imported": "DashScopeEmbeddings", "source": "langchain_community.embeddings.dashscope", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.dashscope.DashScopeEmbeddings.html", "title": "DashVector"}, {"imported": "DashVector", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.dashvector.DashVector.html", "title": "DashVector"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "DashVector"}]-->
from langchain_community.embeddings.dashscope import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_text_splitters import CharacterTextSplitter
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "DashVector"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = DashScopeEmbeddings()
```

我们可以从文档创建 DashVector。


```python
dashvector = DashVector.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query)
print(docs)
```

我们可以添加带有元数据和 ID 的文本，并使用元过滤器进行搜索。


```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]

dashvector.add_texts(texts, metadatas=metadatas, ids=ids)

docs = dashvector.similarity_search("foo", filter="key = 2")
print(docs)
```
```output
[Document(page_content='baz', metadata={'key': 2})]
```
### 操作带 `partition` 参数

`partition` 参数默认为默认值，如果传入一个不存在的 `partition` 参数，将自动创建 `partition`。


```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]
partition = "langchain"

# add texts
dashvector.add_texts(texts, metadatas=metadatas, ids=ids, partition=partition)

# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query, partition=partition)

# delete
dashvector.delete(ids=ids, partition=partition)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
