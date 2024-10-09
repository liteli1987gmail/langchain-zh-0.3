---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/sqlitevss.ipynb
---
# SQLite-VSS

>[SQLite-VSS](https://alexgarcia.xyz/sqlite-vss/) 是一个为向量搜索设计的 `SQLite` 扩展，强调本地优先操作，并且可以轻松集成到没有外部服务器的应用程序中。利用 `Faiss` 库，它提供高效的相似性搜索和聚类能力。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用 `SQLiteVSS` 向量数据库。


```python
# You need to install sqlite-vss as a dependency.
%pip install --upgrade --quiet  sqlite-vss
```

## 快速入门


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "SQLite-VSS"}, {"imported": "SentenceTransformerEmbeddings", "source": "langchain_community.embeddings.sentence_transformer", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.SentenceTransformerEmbeddings.html", "title": "SQLite-VSS"}, {"imported": "SQLiteVSS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.sqlitevss.SQLiteVSS.html", "title": "SQLite-VSS"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "SQLite-VSS"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_community.vectorstores import SQLiteVSS
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
texts = [doc.page_content for doc in docs]


# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


# load it in sqlite-vss in a table named state_union.
# the db_file parameter is the name of the file you want
# as your sqlite database.
db = SQLiteVSS.from_texts(
    texts=texts,
    embedding=embedding_function,
    table="state_union",
    db_file="/tmp/vss.db",
)

# query it
query = "What did the president say about Ketanji Brown Jackson"
data = db.similarity_search(query)

# print results
data[0].page_content
```



```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```


## 使用现有的 SQLite 连接


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "SQLite-VSS"}, {"imported": "SentenceTransformerEmbeddings", "source": "langchain_community.embeddings.sentence_transformer", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.SentenceTransformerEmbeddings.html", "title": "SQLite-VSS"}, {"imported": "SQLiteVSS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.sqlitevss.SQLiteVSS.html", "title": "SQLite-VSS"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "SQLite-VSS"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_community.vectorstores import SQLiteVSS
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
texts = [doc.page_content for doc in docs]


# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
connection = SQLiteVSS.create_connection(db_file="/tmp/vss.db")

db1 = SQLiteVSS(
    table="state_union", embedding=embedding_function, connection=connection
)

db1.add_texts(["Ketanji Brown Jackson is awesome"])
# query it again
query = "What did the president say about Ketanji Brown Jackson"
data = db1.similarity_search(query)

# print results
data[0].page_content
```



```output
'Ketanji Brown Jackson is awesome'
```



```python
# Cleaning up
import os

os.remove("/tmp/vss.db")
```


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
