---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/milvus_self_query.ipynb
---
# Milvus

>[Milvus](https://milvus.io/docs/overview.md) 是一个数据库，用于存储、索引和管理由深度神经网络和其他机器学习 (ML) 模型生成的大量嵌入向量。

在本演示中，我们将演示使用 `Milvus` 向量存储的 `SelfQueryRetriever`。

## 创建 Milvus 向量存储
首先，我们需要创建一个 Milvus 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

我使用了 Milvus 的云版本，因此我还需要 `uri` 和 `token`。

注意：自查询检索器要求您安装 `lark` (`pip install lark`)。我们还需要 `langchain_milvus` 包。


```python
%pip install --upgrade --quiet lark langchain_milvus
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import os

OPENAI_API_KEY = "Use your OpenAI key:)"

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Milvus"}, {"imported": "Milvus", "source": "langchain_milvus.vectorstores", "docs": "https://python.langchain.com/api_reference/milvus/vectorstores/langchain_milvus.vectorstores.milvus.Milvus.html", "title": "Milvus"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Milvus"}]-->
from langchain_core.documents import Document
from langchain_milvus.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings

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

vector_store = Milvus.from_documents(
    docs,
    embedding=embeddings,
    connection_args={"uri": "Use your uri:)", "token": "Use your token:)"},
)
```

## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Milvus"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Milvus"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Milvus"}]-->
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

## 测试它
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```
```output
query='dinosaur' filter=None limit=None
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 9.0, 'genre': 'thriller'})]
```



```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```
```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=9) limit=None
```


```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'})]
```



```python
# This example only specifies a query and a filter
retriever.invoke("I want to watch a movie about toys rated higher than 9")
```
```output
query='toys' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=9) limit=None
```


```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'})]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above or equal 9) thriller film?")
```
```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='thriller'), Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=9)]) limit=None
```


```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 9.0, 'genre': 'thriller'})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```
```output
query='dinosaur' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='action')]) limit=None
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'})]
```


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
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```
```output
query='dinosaur' filter=None limit=2
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'})]
```

