---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/timescalevector_self_query.ipynb
---
# Timescale 向量 (Postgres)

>[Timescale 向量](https://www.timescale.com/ai) 是 `PostgreSQL++` 用于 AI 应用程序。它使您能够高效地存储和查询数十亿个向量嵌入在 `PostgreSQL` 中。
>
>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) 也称为 `Postgres`，
> 是一个免费的开源关系数据库管理系统 (RDBMS)
> 强调可扩展性和 `SQL` 兼容性。

本笔记本展示了如何使用 Postgres 向量数据库 (`TimescaleVector`) 进行自查询。在笔记本中，我们将演示围绕 TimescaleVector 向量存储的 `SelfQueryRetriever`。

## 什么是 Timescale 向量？
**[Timescale 向量](https://www.timescale.com/ai) 是用于 AI 应用程序的 PostgreSQL++。**

Timescale 向量使您能够高效地存储和查询数百万个向量嵌入在 `PostgreSQL` 中。
- 通过受DiskANN启发的索引算法，增强`pgvector`在超过10亿个向量上的更快和更准确的相似性搜索。
- 通过自动的基于时间的分区和索引，实现快速的基于时间的向量搜索。
- 提供熟悉的SQL接口，用于查询向量嵌入和关系数据。

Timescale Vector是为AI设计的云PostgreSQL，能够从POC扩展到生产环境：
- 通过允许您在单一数据库中存储关系元数据、向量嵌入和时间序列数据，简化操作。
- 受益于坚如磐石的PostgreSQL基础，具备企业级功能，如流式备份和复制、高可用性和行级安全性。
- 提供无忧体验，具备企业级安全性和合规性。

## 如何访问Timescale Vector
Timescale Vector可在[Timescale](https://www.timescale.com/ai)云PostgreSQL平台上获取。（目前没有自托管版本。）

LangChain用户可获得Timescale Vector的90天免费试用。
- 要开始，请[注册](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) Timescale，创建一个新数据库并按照此笔记本操作！
- 查看[Timescale Vector 解释博客](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)以获取更多详细信息和性能基准。
- 查看[安装说明](https://github.com/timescale/python-vector)以获取有关在Python中使用Timescale Vector的更多详细信息。


## 创建一个TimescaleVector向量存储
首先，我们需要创建一个Timescale Vector向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

注意：自查询检索器需要您安装`lark`（`pip install lark`）。我们还需要`timescale-vector`包。


```python
%pip install --upgrade --quiet  lark
```


```python
%pip install --upgrade --quiet  timescale-vector
```

在这个示例中，我们将使用 `OpenAIEmbeddings`，所以让我们加载您的 OpenAI API 密钥。


```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

要连接到您的 PostgreSQL 数据库，您需要服务 URI，该 URI 可以在您创建新数据库后下载的备忘单或 `.env` 文件中找到。

如果您还没有，请 [注册 Timescale](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)，并创建一个新数据库。

URI 看起来像这样： `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`


```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```


```python
<!--IMPORTS:[{"imported": "TimescaleVector", "source": "langchain_community.vectorstores.timescalevector", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.timescalevector.TimescaleVector.html", "title": "Timescale Vector (Postgres) "}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Timescale Vector (Postgres) "}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Timescale Vector (Postgres) "}]-->
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

这是我们将在此演示中使用的示例文档。数据关于电影，并包含有关特定电影的内容和元数据字段。


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
```

最后，我们将创建我们的 Timescale Vector 向量存储。请注意，集合名称将是存储文档的 PostgreSQL 表的名称。


```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## 创建我们的自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Timescale Vector (Postgres) "}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Timescale Vector (Postgres) "}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Timescale Vector (Postgres) "}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
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

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 使用 Timescale Vector 进行自查询检索
现在我们可以尝试实际使用我们的检索器！

运行下面的查询，并注意如何用自然语言指定查询、过滤器、复合过滤器（带有 AND、OR 的过滤器），自查询检索器将把该查询转换为 SQL，并在 Timescale Vector（Postgres）向量存储上执行搜索。

这展示了自查询检索器的强大功能。您可以使用它在您的向量存储上执行复杂搜索，而无需您或您的用户直接编写任何 SQL！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```
```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
``````output
query='dinosaur' filter=None limit=None
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```



```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```
```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```


```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```



```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```
```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```


```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```
```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```


```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```
```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```


```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```


### 过滤 k

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
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```
```output
query='dinosaur' filter=None limit=2
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```

