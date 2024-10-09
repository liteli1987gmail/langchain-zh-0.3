---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/dingo.ipynb
---
# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) 是一个分布式多模态向量数据库，结合了数据湖和向量数据库的特点，可以存储任何类型和大小的数据（键值对、PDF、音频、视频等）。它具有实时低延迟处理能力，以实现快速洞察和响应，并能够高效地进行即时分析和处理多模态数据。

在本演示中，我们将演示带有 `DingoDB` 向量存储的 `SelfQueryRetriever`。

## 创建 DingoDB 索引
首先，我们需要创建一个 `DingoDB` 向量存储，并用一些数据进行初始化。我们创建了一小组包含电影摘要的文档作为演示集。

要使用 DingoDB，您应该有一个 [DingoDB 实例正在运行](https://github.com/dingodb/dingo-deploy/blob/main/README.md)。

**注意：** 自查询检索器要求您安装 `lark` 包。


```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import os

OPENAI_API_KEY = ""

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```


```python
<!--IMPORTS:[{"imported": "Dingo", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.dingo.Dingo.html", "title": "DingoDB"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "DingoDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "DingoDB"}]-->
from langchain_community.vectorstores import Dingo
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
# create new index
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["172.30.14.221:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )
```


```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": '"action", "science fiction"'},
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
            "genre": '"science fiction", "thriller"',
            "rating": 9.9,
        },
    ),
]
vectorstore = Dingo.from_documents(
    docs, embeddings, index_name=index_name, client=dingo_client
)
```


```python
dingo_client.get_index()
dingo_client.delete_index("langchain_demo")
```



```output
True
```



```python
dingo_client.vector_count("langchain_demo")
```



```output
9
```


## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "DingoDB"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "DingoDB"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "DingoDB"}]-->
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
retriever.invoke("What are some movies about dinosaurs")
```
```output
query='dinosaurs' filter=None limit=None
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 1183188982475, 'text': 'A bunch of scientists bring back dinosaurs and mayhem breaks loose', 'score': 0.13397777, 'year': {'value': 1993}, 'rating': {'value': 7.7}, 'genre': '"action", "science fiction"'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.18994397, 'year': {'value': 1995}, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.23288351, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'rating': {'value': 9.9}, 'genre': '"science fiction", "thriller"'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.24421334, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}})]
```



```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```
```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
comparator=<Comparator.GT: 'gt'> attribute='rating' value=8.5
```


```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.25033575, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'genre': '"science fiction", "thriller"', 'rating': {'value': 9.9}}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.26431882, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}})]
```



```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```
```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
comparator=<Comparator.EQ: 'eq'> attribute='director' value='Greta Gerwig'
```


```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'id': 1183189172623, 'text': 'A bunch of normal-sized women are supremely wholesome and some men pine after them', 'score': 0.19482517, 'year': {'value': 2019}, 'director': 'Greta Gerwig', 'rating': {'value': 8.3}})]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```
```output
query='science fiction' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
comparator=<Comparator.GT: 'gt'> attribute='rating' value=8.5
```


```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.19805312, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.225586, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'rating': {'value': 9.9}, 'genre': '"science fiction", "thriller"'})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```
```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005)]), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
operator=<Operator.AND: 'and'> arguments=[Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005)]), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]
```


```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.133829, 'year': {'value': 1995}, 'genre': 'animated'})]
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
retriever.invoke("What are two movies about dinosaurs")
```
```output
query='dinosaurs' filter=None limit=2
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 1183188982475, 'text': 'A bunch of scientists bring back dinosaurs and mayhem breaks loose', 'score': 0.13394928, 'year': {'value': 1993}, 'rating': {'value': 7.7}, 'genre': '"action", "science fiction"'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.1899159, 'year': {'value': 1995}, 'genre': 'animated'})]
```

