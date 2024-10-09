---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/myscale_self_query.ipynb
---
# MyScale

>[MyScale](https://docs.myscale.com/en/) 是一个集成的向量数据库。您可以通过 SQL 访问您的数据库，也可以从这里访问，LangChain。
>`MyScale` 可以利用 [各种数据类型和过滤器函数](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints)。无论您是扩展数据还是将系统扩展到更广泛的应用，它都将提升您的 LLM 应用。

在笔记本中，我们将演示围绕 `MyScale` 向量存储的 `SelfQueryRetriever`，并展示我们为 LangChain 贡献的一些额外功能。

简而言之，可以浓缩为 4 点：
1. 添加 `contain` 比较器以匹配任何列表，如果匹配的元素超过一个
2. 添加 `timestamp` 数据类型以进行日期时间匹配（ISO 格式或 YYYY-MM-DD）
3. 添加 `like` 比较器以进行字符串模式搜索
4. 添加任意函数能力

## 创建 MyScale 向量存储
MyScale 已经与 LangChain 集成了一段时间。因此，您可以按照 [这个笔记本](/docs/integrations/vectorstores/myscale) 创建自己的向量存储以进行自查询检索。

**注意：** 所有自查询检索器都需要您安装 `lark` (`pip install lark`)。我们使用 `lark` 进行语法定义。在您继续下一步之前，我们还想提醒您，`clickhouse-connect` 也需要与您的 MyScale 后端进行交互。


```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

在本教程中，我们遵循其他示例的设置并使用 `OpenAIEmbeddings`。请记得获取一个有效访问LLMs的OpenAI API密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
if "MYSCALE_HOST" not in os.environ:
    os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
if "MYSCALE_PORT" not in os.environ:
    os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
if "MYSCALE_USERNAME" not in os.environ:
    os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
if "MYSCALE_PASSWORD" not in os.environ:
    os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```


```python
<!--IMPORTS:[{"imported": "MyScale", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.myscale.MyScale.html", "title": "MyScale"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "MyScale"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "MyScale"}]-->
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## 创建一些示例数据
正如您所看到的，我们创建的数据与其他自查询检索器相比有一些不同。我们将关键字 `year` 替换为 `date`，这使您可以更精细地控制时间戳。我们还将关键字 `gerne` 的类型更改为字符串列表，LLM可以使用新的 `contain` 比较器来构建过滤器。我们还为过滤器提供了 `like` 比较器和任意函数支持，这将在接下来的几个单元中介绍。

现在让我们先看看数据。


```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## 创建我们的自查询检索器
就像其他检索器一样……简单而美好。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "MyScale"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "MyScale"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "MyScale"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie. "
        "It only supports equal and contain comparisons. "
        "Here are some examples: genre = [' A '], genre = [' A ', 'B'], contain (genre, 'A')",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
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
llm = ChatOpenAI(temperature=0, model_name="gpt-4o")
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 测试自查询检索器的现有功能
现在我们可以尝试实际使用我们的检索器了！


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

# 等一下……还有什么？

使用MyScale的自查询检索器可以做更多！让我们来看看。


```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```


```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```


```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```


```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
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
