---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/databricks_vector_search.ipynb
---
# Databricks 向量搜索

>[Databricks 向量搜索](https://docs.databricks.com/en/generative-ai/vector-search.html) 是一个无服务器的相似性搜索引擎，允许您在向量数据库中存储数据的向量表示，包括元数据。使用向量搜索，您可以从由 Unity Catalog 管理的 Delta 表创建自动更新的向量搜索索引，并通过简单的 API 查询它们以返回最相似的向量。


在演示中，我们将展示如何使用 Databricks 向量搜索的 `SelfQueryRetriever`。

## 创建 Databricks 向量存储索引
首先，我们需要创建一个 Databricks 向量存储索引，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

**注意：** 自查询检索器要求您安装 `lark`（`pip install lark`），以及特定于集成的其他要求。


```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```
```output
Note: you may need to restart the kernel to use updated packages.
```
我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
databricks_host = getpass.getpass("Databricks host:")
databricks_token = getpass.getpass("Databricks token:")
```
```output
OpenAI API Key: ········
Databricks host: ········
Databricks token: ········
```

```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Databricks Vector Search"}]-->
from databricks.vector_search.client import VectorSearchClient
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))

vector_search_endpoint_name = "vector_search_demo_endpoint"


vsc = VectorSearchClient(
    workspace_url=databricks_host, personal_access_token=databricks_token
)
vsc.create_endpoint(name=vector_search_endpoint_name, endpoint_type="STANDARD")
```
```output
[NOTICE] Using a Personal Authentication Token (PAT). Recommended for development only. For improved performance, please use Service Principal based authentication. To disable this message, pass disable_notice=True to VectorSearchClient().
```

```python
index_name = "udhay_demo.10x.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "page_content": "string",
        "year": "int",
        "rating": "float",
        "genre": "string",
        "text_vector": "array<float>",
    },
)

index.describe()
```


```python
index = vsc.get_index(endpoint_name=vector_search_endpoint_name, index_name=index_name)

index.describe()
```


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Databricks Vector Search"}]-->
from langchain_core.documents import Document

docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"id": 1, "year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"id": 2, "year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"id": 3, "year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"id": 4, "year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"id": 5, "year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"id": 6, "year": 1995, "genre": "animated", "rating": 9.3},
    ),
]
```


```python
<!--IMPORTS:[{"imported": "DatabricksVectorSearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.databricks_vector_search.DatabricksVectorSearch.html", "title": "Databricks Vector Search"}]-->
from langchain_community.vectorstores import DatabricksVectorSearch

vector_store = DatabricksVectorSearch(
    index,
    text_column="page_content",
    embedding=embeddings,
    columns=["year", "rating", "genre"],
)
```


```python
vector_store.add_documents(docs)
```

## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Databricks Vector Search"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Databricks Vector Search"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Databricks Vector Search"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

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
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_store, document_content_description, metadata_field_info, verbose=True
)
```

## 试试看
现在我们可以尝试实际使用我们的检索器！



```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```



```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0})]
```



```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```



```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0})]
```



```python
# This example specifies both a relevant query and a filter
retriever.invoke("What are the thriller movies that are highly rated?")
```



```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'year': 2010.0, 'rating': 8.2, 'genre': 'thriller', 'id': 2.0})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```



```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0})]
```


## 过滤 k

我们还可以使用自查询检索器来指定 `k`：要获取的文档数量。

我们可以通过将 `enable_limit=True` 传递给构造函数来实现这一点。

## 过滤 k

我们还可以使用自查询检索器来指定 `k`：要获取的文档数量。

我们可以通过将 `enable_limit=True` 传递给构造函数来实现这一点。


```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_store,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```


```python
retriever.invoke("What are two movies about dinosaurs?")
```
