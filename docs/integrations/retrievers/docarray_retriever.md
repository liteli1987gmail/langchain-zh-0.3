---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/docarray_retriever.ipynb
---
# DocArray

>[DocArray](https://github.com/docarray/docarray) 是一个多功能的开源工具，用于管理您的多模态数据。它允许您以任何您想要的方式塑造数据，并提供灵活性以使用各种文档索引后端进行存储和搜索。此外，它更进一步 - 您可以利用您的 `DocArray` 文档索引创建一个 `DocArrayRetriever`，并构建出色的 LangChain 应用程序！

本笔记本分为两个部分。[第一部分](#document-index-backends) 介绍了所有五个支持的文档索引后端。它提供了关于如何设置和索引每个后端的指导，并指导您如何构建一个 `DocArrayRetriever` 来查找相关文档。
在[第二部分](#movie-retrieval-using-hnswdocumentindex)，我们将选择其中一个后端，并通过一个基本示例说明如何使用它。


## 文档索引后端


```python
<!--IMPORTS:[{"imported": "FakeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "DocArray"}, {"imported": "DocArrayRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.docarray.DocArrayRetriever.html", "title": "DocArray"}]-->
import random

from docarray import BaseDoc
from docarray.typing import NdArray
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.retrievers import DocArrayRetriever

embeddings = FakeEmbeddings(size=32)
```

在开始构建索引之前，定义文档架构是很重要的。这决定了您的文档将具有哪些字段以及每个字段将保存什么类型的数据。

在本演示中，我们将创建一个包含 'title' (字符串), 'title_embedding' (numpy 数组), 'year' (整数) 和 'color' (字符串) 的随机架构。


```python
class MyDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32]
    year: int
    color: str
```

### 内存精确最近邻索引

`InMemoryExactNNIndex` 将所有文档存储在内存中。对于小型数据集，这是一个很好的起点，您可能不想启动数据库服务器。

在这里了解更多信息: https://docs.docarray.org/user_guide/storing/index_in_memory/


```python
from docarray.index import InMemoryExactNNIndex

# initialize the index
db = InMemoryExactNNIndex[MyDoc]()
# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"year": {"$lte": 90}}
```


```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```
```output
[Document(page_content='My document 56', metadata={'id': '1f33e58b6468ab722f3786b96b20afe6', 'year': 56, 'color': 'red'})]
```
### HnswDocumentIndex

`HnswDocumentIndex` 是一个轻量级的文档索引实现，完全在本地运行，最适合小型到中型数据集。它在 [hnswlib](https://github.com/nmslib/hnswlib) 中将向量存储在磁盘上，并在 [SQLite](https://www.sqlite.org/index.html) 中存储所有其他数据。

在这里了解更多信息: https://docs.docarray.org/user_guide/storing/index_hnswlib/


```python
from docarray.index import HnswDocumentIndex

# initialize the index
db = HnswDocumentIndex[MyDoc](work_dir="hnsw_index")

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"year": {"$lte": 90}}
```


```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```
```output
[Document(page_content='My document 28', metadata={'id': 'ca9f3f4268eec7c97a7d6e77f541cb82', 'year': 28, 'color': 'red'})]
```
### WeaviateDocumentIndex

`WeaviateDocumentIndex` 是一个基于 [Weaviate](https://weaviate.io/) 向量数据库构建的文档索引。

在这里了解更多： https://docs.docarray.org/user_guide/storing/index_weaviate/


```python
# There's a small difference with the Weaviate backend compared to the others.
# Here, you need to 'mark' the field used for vector search with 'is_embedding=True'.
# So, let's create a new schema for Weaviate that takes care of this requirement.

from pydantic import Field


class WeaviateDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32] = Field(is_embedding=True)
    year: int
    color: str
```


```python
from docarray.index import WeaviateDocumentIndex

# initialize the index
dbconfig = WeaviateDocumentIndex.DBConfig(host="http://localhost:8080")
db = WeaviateDocumentIndex[WeaviateDoc](db_config=dbconfig)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"path": ["year"], "operator": "LessThanEqual", "valueInt": "90"}
```


```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```
```output
[Document(page_content='My document 17', metadata={'id': '3a5b76e85f0d0a01785dc8f9d965ce40', 'year': 17, 'color': 'red'})]
```
### ElasticDocIndex

`ElasticDocIndex` 是一个基于 [ElasticSearch](https://github.com/elastic/elasticsearch) 构建的文档索引

在这里了解更多 [here](https://docs.docarray.org/user_guide/storing/index_elastic/)


```python
from docarray.index import ElasticDocIndex

# initialize the index
db = ElasticDocIndex[MyDoc](
    hosts="http://localhost:9200", index_name="docarray_retriever"
)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"range": {"year": {"lte": 90}}}
```


```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```
```output
[Document(page_content='My document 46', metadata={'id': 'edbc721bac1c2ad323414ad1301528a4', 'year': 46, 'color': 'green'})]
```
### QdrantDocumentIndex

`QdrantDocumentIndex` 是一个基于 [Qdrant](https://qdrant.tech/) 向量数据库构建的文档索引

在这里了解更多 [here](https://docs.docarray.org/user_guide/storing/index_qdrant/)


```python
from docarray.index import QdrantDocumentIndex
from qdrant_client.http import models as rest

# initialize the index
qdrant_config = QdrantDocumentIndex.DBConfig(path=":memory:")
db = QdrantDocumentIndex[MyDoc](qdrant_config)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = rest.Filter(
    must=[
        rest.FieldCondition(
            key="year",
            range=rest.Range(
                gte=10,
                lt=90,
            ),
        )
    ]
)
```
```output
WARNING:root:Payload indexes have no effect in the local Qdrant. Please use server Qdrant if you need payload indexes.
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```
```output
[Document(page_content='My document 80', metadata={'id': '97465f98d0810f1f330e4ecc29b13d20', 'year': 80, 'color': 'blue'})]
```
## 使用 HnswDocumentIndex 进行电影检索


```python
movies = [
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.",
        "director": "Christopher Nolan",
        "rating": 8.8,
    },
    {
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "director": "Christopher Nolan",
        "rating": 9.0,
    },
    {
        "title": "Interstellar",
        "description": "Interstellar explores the boundaries of human exploration as a group of astronauts venture through a wormhole in space. In their quest to ensure the survival of humanity, they confront the vastness of space-time and grapple with love and sacrifice.",
        "director": "Christopher Nolan",
        "rating": 8.6,
    },
    {
        "title": "Pulp Fiction",
        "description": "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "director": "Quentin Tarantino",
        "rating": 8.9,
    },
    {
        "title": "Reservoir Dogs",
        "description": "When a simple jewelry heist goes horribly wrong, the surviving criminals begin to suspect that one of them is a police informant.",
        "director": "Quentin Tarantino",
        "rating": 8.3,
    },
    {
        "title": "The Godfather",
        "description": "An aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.",
        "director": "Francis Ford Coppola",
        "rating": 9.2,
    },
]
```


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```
```output
OpenAI API Key: ········
```

```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "DocArray"}]-->
from docarray import BaseDoc, DocList
from docarray.typing import NdArray
from langchain_openai import OpenAIEmbeddings


# define schema for your movie documents
class MyDoc(BaseDoc):
    title: str
    description: str
    description_embedding: NdArray[1536]
    rating: float
    director: str


embeddings = OpenAIEmbeddings()


# get "description" embeddings, and create documents
docs = DocList[MyDoc](
    [
        MyDoc(
            description_embedding=embeddings.embed_query(movie["description"]), **movie
        )
        for movie in movies
    ]
)
```


```python
from docarray.index import HnswDocumentIndex

# initialize the index
db = HnswDocumentIndex[MyDoc](work_dir="movie_search")

# add data
db.index(docs)
```

### 普通检索器


```python
<!--IMPORTS:[{"imported": "DocArrayRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.docarray.DocArrayRetriever.html", "title": "DocArray"}]-->
from langchain_community.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
)

# find the relevant document
doc = retriever.invoke("movie about dreams")
print(doc)
```
```output
[Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'})]
```
### 带过滤器的检索器


```python
<!--IMPORTS:[{"imported": "DocArrayRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.docarray.DocArrayRetriever.html", "title": "DocArray"}]-->
from langchain_community.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
    filters={"director": {"$eq": "Christopher Nolan"}},
    top_k=2,
)

# find relevant documents
docs = retriever.invoke("space travel")
print(docs)
```
```output
[Document(page_content='Interstellar explores the boundaries of human exploration as a group of astronauts venture through a wormhole in space. In their quest to ensure the survival of humanity, they confront the vastness of space-time and grapple with love and sacrifice.', metadata={'id': 'ab704cc7ae8573dc617f9a5e25df022a', 'title': 'Interstellar', 'rating': 8.6, 'director': 'Christopher Nolan'}), Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'})]
```
### 使用MMR搜索的检索器


```python
<!--IMPORTS:[{"imported": "DocArrayRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.docarray.DocArrayRetriever.html", "title": "DocArray"}]-->
from langchain_community.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
    filters={"rating": {"$gte": 8.7}},
    search_type="mmr",
    top_k=3,
)

# find relevant documents
docs = retriever.invoke("action movies")
print(docs)
```
```output
[Document(page_content="The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", metadata={'id': 'e6aa313bbde514e23fbc80ab34511afd', 'title': 'Pulp Fiction', 'rating': 8.9, 'director': 'Quentin Tarantino'}), Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'}), Document(page_content='When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', metadata={'id': '91dec17d4272041b669fd113333a65f7', 'title': 'The Dark Knight', 'rating': 9.0, 'director': 'Christopher Nolan'})]
```

## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
