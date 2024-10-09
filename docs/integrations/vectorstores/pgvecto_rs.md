---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/pgvecto_rs.ipynb
---
# PGVecto.rs

本笔记本展示了如何使用与Postgres向量数据库（[pgvecto.rs](https://github.com/tensorchord/pgvecto.rs)）相关的功能。


```python
%pip install "pgvecto_rs[sdk]" langchain-community
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "PGVecto.rs"}, {"imported": "FakeEmbeddings", "source": "langchain_community.embeddings.fake", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "PGVecto.rs"}, {"imported": "PGVecto_rs", "source": "langchain_community.vectorstores.pgvecto_rs", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.pgvecto_rs.PGVecto_rs.html", "title": "PGVecto.rs"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "PGVecto.rs"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "PGVecto.rs"}]-->
from typing import List

from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores.pgvecto_rs import PGVecto_rs
from langchain_core.documents import Document
from langchain_text_splitters import CharacterTextSplitter
```


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=3)
```

使用[官方演示Docker镜像](https://github.com/tensorchord/pgvecto.rs#installation)启动数据库。


```python
! docker run --name pgvecto-rs-demo -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d tensorchord/pgvecto-rs:latest
```

然后构建数据库URL。


```python
## PGVecto.rs needs the connection string to the database.
## We will load it from the environment variables.
import os

PORT = os.getenv("DB_PORT", 5432)
HOST = os.getenv("DB_HOST", "localhost")
USER = os.getenv("DB_USER", "postgres")
PASS = os.getenv("DB_PASS", "mysecretpassword")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Run tests with shell:
URL = "postgresql+psycopg://{username}:{password}@{host}:{port}/{db_name}".format(
    port=PORT,
    host=HOST,
    username=USER,
    password=PASS,
    db_name=DB_NAME,
)
```

最后，从文档中创建VectorStore：


```python
db1 = PGVecto_rs.from_documents(
    documents=docs,
    embedding=embeddings,
    db_url=URL,
    # The table name is f"collection_{collection_name}", so that it should be unique.
    collection_name="state_of_the_union",
)
```

您可以稍后通过以下方式连接到表：


```python
# Create new empty vectorstore with collection_name.
# Or connect to an existing vectorstore in database if exists.
# Arguments should be the same as when the vectorstore was created.
db1 = PGVecto_rs.from_collection_name(
    embedding=embeddings,
    db_url=URL,
    collection_name="state_of_the_union",
)
```

确保用户被允许创建表。

## 带分数的相似性搜索

### 使用欧几里得距离的相似性搜索（默认）


```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(query, k=4)
for doc in docs:
    print(doc.page_content)
    print("======================")
```

### 带过滤器的相似性搜索


```python
from pgvecto_rs.sdk.filters import meta_contains

query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter=meta_contains({"source": "../../how_to/state_of_the_union.txt"})
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```

或者：


```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter={"source": "../../how_to/state_of_the_union.txt"}
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
