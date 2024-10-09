---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/mongodb_atlas.ipynb
---
# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/) 是一个文档数据库，可以作为向量数据库使用。
在演示中，我们将使用 `MongoDB Atlas` 向量存储演示 `SelfQueryRetriever`。

## 创建 MongoDB Atlas 向量存储

## 创建 MongoDB Atlas 向量存储
首先，我们需要创建一个 MongoDB Atlas 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

注意：自查询检索器需要您安装 `lark`（`pip install lark`）。我们还需要 `pymongo` 包。


```python
%pip install --upgrade --quiet  lark pymongo
```

我们想使用 `OpenAIEmbeddings`，所以我们需要获取 OpenAI API 密钥。


```python
import os

OPENAI_API_KEY = "Use your OpenAI key"

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```


```python
<!--IMPORTS:[{"imported": "MongoDBAtlasVectorSearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.mongodb_atlas.MongoDBAtlasVectorSearch.html", "title": "MongoDB Atlas"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "MongoDB Atlas"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "MongoDB Atlas"}]-->
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from pymongo import MongoClient

CONNECTION_STRING = "Use your MongoDB Atlas connection string"
DB_NAME = "Name of your MongoDB Atlas database"
COLLECTION_NAME = "Name of your collection in the database"
INDEX_NAME = "Name of a search index defined on the collection"

MongoClient = MongoClient(CONNECTION_STRING)
collection = MongoClient[DB_NAME][COLLECTION_NAME]

embeddings = OpenAIEmbeddings()
```


```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated", "rating": 9.3},
    ),
]

vectorstore = MongoDBAtlasVectorSearch.from_documents(
    docs,
    embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)
```

现在，让我们在您的集群上创建一个向量搜索索引。在下面的示例中，`embedding` 是包含嵌入向量的字段名称。有关如何定义 Atlas 向量搜索索引的更多详细信息，请参阅 [文档](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector)。
您可以将索引命名为 `{COLLECTION_NAME}`，并在命名空间 `{DB_NAME}.{COLLECTION_NAME}` 上创建索引。最后，在 MongoDB Atlas 的 JSON 编辑器中写入以下定义：

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "genre": {
        "type": "token"
      },
      "ratings": {
        "type": "number"
      },
      "year": {
        "type": "number"
      }
    }
  }
}
```

## 创建我们的自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于我们的文档支持的元数据字段的信息，以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "MongoDB Atlas"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "MongoDB Atlas"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "MongoDB Atlas"}]-->
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
```


```python
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 测试一下
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```


```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```


```python
# This example only specifies a query and a filter
retriever.invoke("I want to watch a movie about toys rated higher than 9")
```


```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above or equal 9) thriller film?")
```


```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
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
