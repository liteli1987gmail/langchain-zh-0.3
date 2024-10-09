---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/surrealdb.ipynb
---
# SurrealDB

>[SurrealDB](https://surrealdb.com/) 是一个端到端的云原生数据库，专为现代应用程序设计，包括网页、移动、无服务器、Jamstack、后端和传统应用程序。使用 SurrealDB，您可以简化数据库和 API 基础设施，减少开发时间，并快速且经济高效地构建安全、高性能的应用程序。
>
>**SurrealDB 的主要特点包括：**
>
>* **减少开发时间：** SurrealDB 通过消除大多数服务器端组件的需求，简化您的数据库和 API 堆栈，使您能够更快、更便宜地构建安全、高性能的应用程序。
>* **实时协作 API 后端服务：** SurrealDB 既可以作为数据库，也可以作为 API 后端服务，支持实时协作。
>* **支持多种查询语言：** SurrealDB 支持来自客户端设备的 SQL 查询、GraphQL、ACID 事务、WebSocket 连接、结构化和非结构化数据、图查询、全文索引和地理空间查询。
>* **细粒度访问控制：** SurrealDB 提供基于行级权限的访问控制，使您能够精确管理数据访问。
>
>查看[功能](https://surrealdb.com/features)、最新[版本](https://surrealdb.com/releases)和[文档](https://surrealdb.com/docs)。

本笔记本展示了如何使用与`SurrealDBStore`相关的功能。

## 设置

取消注释下面的单元格以安装surrealdb。


```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

## 使用 SurrealDBStore


```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "SurrealDB"}, {"imported": "SurrealDBStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.surrealdb.SurrealDBStore.html", "title": "SurrealDB"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "SurrealDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "SurrealDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import SurrealDBStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)
```

### 创建 SurrealDBStore 对象


```python
db = SurrealDBStore(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding_function=embeddings,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)

# this is needed to initialize the underlying async library for SurrealDB
await db.initialize()

# delete all existing documents from the vectorstore collection
await db.adelete()

# add documents to the vectorstore
ids = await db.aadd_documents(docs)

# document ids of the added documents
ids[:5]
```



```output
['documents:38hz49bv1p58f5lrvrdc',
 'documents:niayw63vzwm2vcbh6w2s',
 'documents:it1fa3ktplbuye43n0ch',
 'documents:il8f7vgbbp9tywmsn98c',
 'documents:vza4c6cqje0avqd58gal']
```


### （可选）创建 SurrealDBStore 对象并添加文档


```python
await db.adelete()

db = await SurrealDBStore.afrom_documents(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding=embeddings,
    documents=docs,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)
```

### 相似性搜索


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)
```


```python
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
### 带分数的相似性搜索

返回的距离分数是余弦距离。因此，分数越低越好。


```python
docs = await db.asimilarity_search_with_score(query)
```


```python
docs[0]
```



```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'id': 'documents:slgdlhjkfknhqo15xz0w', 'source': '../../how_to/state_of_the_union.txt'}),
 0.39839531721941895)
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
