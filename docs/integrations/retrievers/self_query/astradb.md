---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/astradb.ipynb
---
# Astra DB (Cassandra)

>[DataStax Astra DB](https://docs.datastax.com/en/astra/home/astra.html) 是一个无服务器的向量数据库，基于 `Cassandra` 构建，并通过易于使用的 JSON API 方便地提供。

在本演示中，我们将使用 `Astra DB` 向量存储演示 `SelfQueryRetriever`。

## 创建 Astra DB 向量存储
首先，我们需要创建一个 Astra DB 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

注意：自查询检索器需要您安装 `lark`（`pip install lark`）。我们还需要 `astrapy` 包。


```python
%pip install --upgrade --quiet lark astrapy langchain-openai
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai.embeddings", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Astra DB (Cassandra)"}]-->
import os
from getpass import getpass

from langchain_openai.embeddings import OpenAIEmbeddings

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

创建 Astra DB 向量存储：

- API 端点看起来像 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
- 令牌看起来像 `AstraCS:6gBhNmsk135....`


```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```


```python
<!--IMPORTS:[{"imported": "AstraDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.astradb.AstraDB.html", "title": "Astra DB (Cassandra)"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Astra DB (Cassandra)"}]-->
from langchain_community.vectorstores import AstraDB
from langchain_core.documents import Document

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

vectorstore = AstraDB.from_documents(
    docs,
    embeddings,
    collection_name="astra_self_query_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)
```

## 创建我们的自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Astra DB (Cassandra)"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Astra DB (Cassandra)"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Astra DB (Cassandra)"}]-->
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

## 测试一下
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs?")
```


```python
# This example specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```


```python
# This example only specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```


```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5), science fiction movie ?")
```


```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie about toys after 1990 but before 2005, and is animated"
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
    verbose=True,
    enable_limit=True,
)
```


```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```

## 清理

如果您想完全从您的 Astra DB 实例中删除集合，请运行此命令。

_(您将丢失存储在其中的数据。)_


```python
vectorstore.delete_collection()
```
