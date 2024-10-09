---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/pgvector_self_query.ipynb
---
# PGVector (Postgres)

>[PGVector](https://github.com/pgvector/pgvector) 是一个用于 `Postgres` 数据库的向量相似性搜索包。

在笔记本中，我们将演示围绕 `PGVector` 向量存储的 `SelfQueryRetriever`。

## 创建一个 PGVector 向量存储
首先，我们需要创建一个 PGVector 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

**注意：** 自查询检索器需要您安装 `lark` (`pip install lark`)。我们还需要 `` 包。


```python
%pip install --upgrade --quiet  lark pgvector psycopg2-binary
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
<!--IMPORTS:[{"imported": "PGVector", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.pgvector.PGVector.html", "title": "PGVector (Postgres)"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "PGVector (Postgres)"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "PGVector (Postgres)"}]-->
from langchain_community.vectorstores import PGVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

collection = "Name of your collection"
embeddings = OpenAIEmbeddings()
```


```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
vectorstore = PGVector.from_documents(
    docs,
    embeddings,
    collection_name=collection,
)
```

## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "PGVector (Postgres)"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "PGVector (Postgres)"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "PGVector (Postgres)"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
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
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 测试它
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```


```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```


```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```


```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```


```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

## 过滤 k

我们还可以使用自查询检索器来指定 `k`：要获取的文档数量。

我们可以通过将 `enable_limit=True` 传递给构造函数来实现这一点。


```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```


```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
