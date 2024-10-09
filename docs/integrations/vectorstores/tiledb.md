---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/tiledb.ipynb
---
# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB) 是一个强大的引擎，用于索引和查询稠密和稀疏的多维数组。

> TileDB 提供使用 [TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search) 模块的 ANN 搜索功能。它支持无服务器执行 ANN 查询，并在本地磁盘和云对象存储（即 AWS S3）上存储向量索引。

更多细节请参见：
-  [为什么选择 TileDB 作为向量数据库](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101：向量搜索](https://tiledb.com/blog/tiledb-101-vector-search)

本笔记本展示了如何使用 `TileDB` 向量数据库。


```python
%pip install --upgrade --quiet  tiledb-vector-search langchain-community
```

## 基本示例


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "TileDB"}, {"imported": "TileDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tiledb.TileDB.html", "title": "TileDB"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "TileDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "TileDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import TileDB
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)
db = TileDB.from_documents(
    documents, embeddings, index_uri="/tmp/tiledb_index", index_type="FLAT"
)
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


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
