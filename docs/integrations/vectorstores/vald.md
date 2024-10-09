---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vald.ipynb
---
# Vald

> [Vald](https://github.com/vdaas/vald) 是一个高度可扩展的分布式快速近似最近邻 (ANN) 密集向量搜索引擎。

本笔记本展示了如何使用与 `Vald` 数据库相关的功能。

要运行此笔记本，您需要一个正在运行的 Vald 集群。
查看 [开始使用](https://github.com/vdaas/vald#get-started) 获取更多信息。

请参阅 [安装说明](https://github.com/vdaas/vald-client-python#install)。


```python
%pip install --upgrade --quiet  vald-client-python langchain-community
```

## 基本示例


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Vald"}, {"imported": "Vald", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vald.Vald.html", "title": "Vald"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Vald"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Vald"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Vald
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)
db = Vald.from_documents(documents, embeddings, host="localhost", port=8080)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
docs[0].page_content
```

### 基于向量的相似性搜索


```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### 带分数的相似性搜索


```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## 最大边际相关性搜索 (MMR)

除了在检索器对象中使用相似性搜索外，您还可以将 `mmr` 作为检索器使用。


```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

或者直接使用 `max_marginal_relevance_search`：


```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## 使用安全连接的示例
为了运行此笔记本，需要运行一个带有安全连接的 Vald 集群。

这是一个 Vald 集群的示例，配置如下，使用 [Athenz](https://github.com/AthenZ/athenz) 认证。

ingress(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(检查 grpc 元数据中的 athenz-role-auth) -> vald-lb-gateway


```python
import grpc

with open("test_root_cacert.crt", "rb") as root:
    credentials = grpc.ssl_channel_credentials(root_certificates=root.read())

# Refresh is required for server use
with open(".ztoken", "rb") as ztoken:
    token = ztoken.read().strip()

metadata = [(b"athenz-role-auth", token)]
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Vald"}, {"imported": "Vald", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vald.Vald.html", "title": "Vald"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Vald"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Vald"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Vald
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)

db = Vald.from_documents(
    documents,
    embeddings,
    host="localhost",
    port=443,
    grpc_use_secure=True,
    grpc_credentials=credentials,
    grpc_metadata=metadata,
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, grpc_metadata=metadata)
docs[0].page_content
```

### 基于向量的相似性搜索


```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### 带分数的相似性搜索


```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### 最大边际相关性搜索 (MMR)


```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

或：


```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
