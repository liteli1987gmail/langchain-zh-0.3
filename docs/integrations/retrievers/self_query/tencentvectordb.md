---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/tencentvectordb.ipynb
---
# 腾讯云 VectorDB

> [腾讯云 VectorDB](https://cloud.tencent.com/document/product/1709) 是一个完全托管、自主开发的企业级分布式数据库服务，旨在存储、检索和分析多维向量数据。

在本演示中，我们将使用腾讯云 VectorDB 演示 `SelfQueryRetriever`。

## 创建一个 TencentVectorDB 实例
首先，我们需要创建一个 TencentVectorDB 并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

**注意：** 自查询检索器要求您安装 `lark`（`pip install lark`），以及特定于集成的其他要求。


```python
%pip install --upgrade --quiet tcvectordb langchain-openai tiktoken lark
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```
我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

创建一个 TencentVectorDB 实例并用一些数据初始化它：


```python
<!--IMPORTS:[{"imported": "ConnectionParams", "source": "langchain_community.vectorstores.tencentvectordb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tencentvectordb.ConnectionParams.html", "title": "Tencent Cloud VectorDB"}, {"imported": "MetaField", "source": "langchain_community.vectorstores.tencentvectordb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tencentvectordb.MetaField.html", "title": "Tencent Cloud VectorDB"}, {"imported": "TencentVectorDB", "source": "langchain_community.vectorstores.tencentvectordb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tencentvectordb.TencentVectorDB.html", "title": "Tencent Cloud VectorDB"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Tencent Cloud VectorDB"}]-->
from langchain_community.vectorstores.tencentvectordb import (
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document
from tcvectordb.model.enum import FieldType

meta_fields = [
    MetaField(name="year", data_type="uint64", index=True),
    MetaField(name="rating", data_type="string", index=False),
    MetaField(name="genre", data_type=FieldType.String, index=True),
    MetaField(name="director", data_type=FieldType.String, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.",
        metadata={
            "year": 2012,
            "rating": "8.0",
            "genre": "science fiction",
            "director": "Joss Whedon",
        },
    ),
    Document(
        page_content="Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.",
        metadata={
            "year": 2018,
            "rating": "7.3",
            "genre": "science fiction",
            "director": "Ryan Coogler",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="self_query_movies",
    meta_fields=meta_fields,
    drop_old=True,
)
```

## 创建我们的自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于我们的文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Tencent Cloud VectorDB"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Tencent Cloud VectorDB"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Tencent Cloud VectorDB"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="string"
    ),
]
document_content_description = "Brief summary of a movie"
```


```python
llm = ChatOpenAI(temperature=0, model="gpt-4", max_tokens=4069)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_db, document_content_description, metadata_field_info, verbose=True
)
```

## 试试看
现在我们可以尝试实际使用我们的检索器！



```python
# This example only specifies a relevant query
retriever.invoke("movies about a superhero")
```



```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'}),
 Document(page_content='The Godfather is a 1972 American crime film directed by Francis Ford Coppola.', metadata={'year': 1972, 'rating': '9.2', 'genre': 'crime', 'director': 'Francis Ford Coppola'})]
```



```python
# This example only specifies a filter
retriever.invoke("movies that were released after 2010")
```



```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```



```python
# This example specifies both a relevant query and a filter
retriever.invoke("movies about a superhero which were released after 2010")
```



```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```


## 过滤 k

我们还可以使用自查询检索器来指定 `k`：要获取的文档数量。

我们可以通过将 `enable_limit=True` 传递给构造函数来实现这一点。


```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_db,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```


```python
retriever.invoke("what are two movies about a superhero")
```



```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'})]
```

