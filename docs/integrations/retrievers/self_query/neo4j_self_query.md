---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/neo4j_self_query.ipynb
---
# Neo4j

>[Neo4j](https://neo4j.com/docs/) 是一个图数据库，存储节点和关系，并支持原生向量搜索。

在笔记本中，我们将演示围绕 `Neo4j` 向量存储的 `SelfQueryRetriever`。

## 创建一个 Neo4j 向量存储
首先，我们需要创建一个 Neo4j 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

我们想使用 `OpenAIEmbeddings`，所以我们需要获取 OpenAI API 密钥。


```python
%pip install --upgrade neo4j
```
```output
Requirement already satisfied: neo4j in /Users/moyi/git/langchain/env/lib/python3.11/site-packages (5.24.0)
Requirement already satisfied: pytz in /Users/moyi/git/langchain/env/lib/python3.11/site-packages (from neo4j) (2024.1)
Note: you may need to restart the kernel to use updated packages.
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
# To run this notebook, you can set up a free neo4j account on neo4j.com and input the following information.
# (If you are having trouble connecting to the database, try using neo4j+ssc: instead of neo4j+s)

if "NEO4J_URI" not in os.environ:
    os.environ["NEO4J_URI"] = getpass.getpass("Neo4j URL:")
if "NEO4J_USERNAME" not in os.environ:
    os.environ["NEO4J_USERNAME"] = getpass.getpass("Neo4j User Name:")
if "NEO4J_PASSWORD" not in os.environ:
    os.environ["NEO4J_PASSWORD"] = getpass.getpass("Neo4j Password:")
```
```output
Neo4j URL: ········
Neo4j User Name: ········
Neo4j Password: ········
```

```python
<!--IMPORTS:[{"imported": "Neo4jVector", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.neo4j_vector.Neo4jVector.html", "title": "Neo4j"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Neo4j"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Neo4j"}]-->
from langchain_community.vectorstores import Neo4jVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

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
vectorstore = Neo4jVector.from_documents(docs, embeddings)
```
```output
Received notification from DBMS server: {severity: WARNING} {code: Neo.ClientNotification.Statement.FeatureDeprecationWarning} {category: DEPRECATION} {title: This feature is deprecated and will be removed in future versions.} {description: CALL subquery without a variable scope clause is now deprecated. Use CALL (row) { ... }} {position: line: 1, column: 21, offset: 20} for query: "UNWIND $data AS row CALL { WITH row MERGE (c:`Chunk` {id: row.id}) WITH c, row CALL db.create.setNodeVectorProperty(c, 'embedding', row.embedding) SET c.`text` = row.text SET c += row.metadata } IN TRANSACTIONS OF 1000 ROWS "
```
## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Neo4j"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Neo4j"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Neo4j"}]-->
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

## 测试
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```



```output
[Document(metadata={'genre': 'science fiction', 'year': 1993, 'rating': 7.7}, page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose'),
 Document(metadata={'genre': 'animated', 'year': 1995}, page_content='Toys come alive and have a blast doing so'),
 Document(metadata={'genre': 'science fiction', 'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky'}, page_content='Three men walk into the Zone, three men walk out of the Zone'),
 Document(metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}, page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea')]
```



```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```



```output
[Document(metadata={'genre': 'science fiction', 'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky'}, page_content='Three men walk into the Zone, three men walk out of the Zone'),
 Document(metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}, page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea')]
```



```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```



```output
[Document(metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}, page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them')]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```



```output
[Document(metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}, page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea'),
 Document(metadata={'genre': 'science fiction', 'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky'}, page_content='Three men walk into the Zone, three men walk out of the Zone')]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```



```output
[Document(metadata={'genre': 'animated', 'year': 1995}, page_content='Toys come alive and have a blast doing so')]
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



```output
[Document(metadata={'genre': 'science fiction', 'year': 1993, 'rating': 7.7}, page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose'),
 Document(metadata={'genre': 'animated', 'year': 1995}, page_content='Toys come alive and have a blast doing so')]
```

