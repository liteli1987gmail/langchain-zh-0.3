---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/vectara_self_query.ipynb
---
# Vectara 自查询

[Vectara](https://vectara.com/) 提供一个可信的生成式 AI 平台，使组织能够快速创建类似 ChatGPT 的体验（一个 AI 助手），该体验基于他们拥有的数据、文档和知识（从技术上讲，它是检索增强生成即服务）。

Vectara 无服务器 RAG 即服务提供了所有 RAG 组件，背后有一个易于使用的 API，包括：
1. 从文件中提取文本的方法（PDF、PPT、DOCX 等）
2. 基于机器学习的分块，提供最先进的性能。
3. [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 嵌入模型。
4. 自有的内部向量数据库，用于存储文本块和嵌入向量。
5. 一个查询服务，自动将查询编码为嵌入，并检索最相关的文本片段（包括对 [混合搜索](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) 和 [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/) 的支持）
7. 一个大型语言模型，用于基于检索到的文档（上下文）创建 [生成摘要](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)，包括引用。

有关如何使用 API 的更多信息，请参见 [Vectara API 文档](https://docs.vectara.com/docs/)。

本笔记本展示了如何使用 `SelfQueryRetriever` 与 Vectara。

# 开始使用

要开始使用，请按照以下步骤操作：
1. 如果您还没有，请[注册](https://www.vectara.com/integrations/langchain)一个免费的 Vectara 账户。完成注册后，您将获得一个 Vectara 客户 ID。您可以通过点击 Vectara 控制台窗口右上角的您的名字来找到您的客户 ID。
2. 在您的账户中，您可以创建一个或多个语料库。每个语料库代表一个存储文本数据的区域，这些数据来自输入文档的摄取。要创建一个语料库，请使用 **“创建语料库”** 按钮。然后为您的语料库提供一个名称和描述。您可以选择定义过滤属性并应用一些高级选项。如果您点击您创建的语料库，您可以在顶部看到其名称和语料库 ID。
3. 接下来，您需要创建 API 密钥以访问语料库。在语料库视图中点击 **“访问控制”** 标签，然后点击 **“创建 API 密钥”** 按钮。给您的密钥命名，并选择您希望使用查询仅或查询+索引。点击“创建”，您现在拥有一个有效的 API 密钥。请保密此密钥。

要将 LangChain 与 Vectara 一起使用，您需要这三个值：`customer ID`、`corpus ID` 和 `api_key`。
您可以通过两种方式将这些值提供给 LangChain：

1. 在您的环境中包含这三个变量：`VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID` 和 `VECTARA_API_KEY`。

例如，您可以使用 os.environ 和 getpass 设置这些变量，如下所示：

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. 将它们添加到 `Vectara` 向量存储构造函数中：

```python
vectara = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```
在这个笔记本中，我们假设它们在环境中提供。

**注意：** 自查询检索器需要您安装 `lark` （`pip install lark`）。

## 从 LangChain 连接到 Vectara

在这个示例中，我们假设您已经创建了一个账户和一个语料库，并将您的 `VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID` 和 `VECTARA_API_KEY`（创建时具有索引和查询权限）作为环境变量添加。

我们进一步假设语料库定义了 4 个可过滤的元数据属性：`year`、`director`、`rating` 和 `genre`。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Vectara self-querying "}, {"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Vectara self-querying "}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Vectara self-querying "}, {"imported": "Vectara", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vectara.Vectara.html", "title": "Vectara self-querying "}, {"imported": "ChatOpenAI", "source": "langchain_openai.chat_models", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Vectara self-querying "}]-->
import os

from langchain_core.documents import Document

os.environ["VECTARA_API_KEY"] = "<YOUR_VECTARA_API_KEY>"
os.environ["VECTARA_CORPUS_ID"] = "<YOUR_VECTARA_CORPUS_ID>"
os.environ["VECTARA_CUSTOMER_ID"] = "<YOUR_VECTARA_CUSTOMER_ID>"

from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.vectorstores import Vectara
from langchain_openai.chat_models import ChatOpenAI
```

## 数据集

我们首先定义一个电影示例数据集，并将其与元数据一起上传到语料库：


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
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts([doc.page_content], doc_metadata=doc.metadata)
```

## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。

然后我们提供一个大型语言模型（在这个例子中是OpenAI）和`vectara`向量存储作为参数：


```python
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
llm = ChatOpenAI(temperature=0, model="gpt-4o", max_tokens=4069)
retriever = SelfQueryRetriever.from_llm(
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## 自我检索查询
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are movies about scientists")
```



```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'})]
```



```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```



```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```



```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```



```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```



```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```



```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'})]
```


## 过滤k

我们还可以使用自我查询检索器来指定`k`：要获取的文档数量。

我们可以通过将`enable_limit=True`传递给构造函数来实现这一点。


```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

这很酷，我们可以在查询中包含我们希望看到的结果数量，自我检索器会正确理解。例如，让我们寻找


```python
# This example only specifies a relevant query
retriever.invoke("what are two movies with a rating above 8.5")
```



```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

