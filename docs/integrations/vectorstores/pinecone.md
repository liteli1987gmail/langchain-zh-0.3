---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/pinecone.ipynb
---
# Pinecone

>[Pinecone](https://docs.pinecone.io/docs/overview) 是一个功能广泛的向量数据库。

本笔记本展示了如何使用与 `Pinecone` 向量数据库相关的功能。

## 设置

要使用 `PineconeVectorStore`，您首先需要安装第三方库，以及本笔记本中使用的其他库。


```python
%pip install -qU langchain-pinecone pinecone-notebooks
```

迁移说明：如果您正在从 `langchain_community.vectorstores` 实现的 Pinecone 迁移，您可能需要在安装 `langchain-pinecone` 之前移除 `pinecone-client` v2 依赖，因为它依赖于 `pinecone-client` v3。

### 凭证

创建一个新的 Pinecone 账户，或登录到您现有的账户，并创建一个 API 密钥以在此笔记本中使用。


```python
import getpass
import os
import time

from pinecone import Pinecone, ServerlessSpec

if not os.getenv("PINECONE_API_KEY"):
    os.environ["PINECONE_API_KEY"] = getpass.getpass("Enter your Pinecone API key: ")

pinecone_api_key = os.environ.get("PINECONE_API_KEY")

pc = Pinecone(api_key=pinecone_api_key)
```

如果您想要自动跟踪您的模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

在初始化我们的向量存储之前，让我们连接到一个 Pinecone 索引。如果名为 `index_name` 的索引不存在，它将被创建。


```python
import time

index_name = "langchain-test-index"  # change if desired

existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if index_name not in existing_indexes:
    pc.create_index(
        name=index_name,
        dimension=3072,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    while not pc.describe_index(index_name).status["ready"]:
        time.sleep(1)

index = pc.Index(index_name)
```

现在我们的 Pinecone 索引已设置，我们可以初始化我们的向量存储。

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "PineconeVectorStore", "source": "langchain_pinecone", "docs": "https://python.langchain.com/api_reference/pinecone/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html", "title": "Pinecone"}]-->
from langchain_pinecone import PineconeVectorStore

vector_store = PineconeVectorStore(index=index, embedding=embeddings)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 向向量存储添加项目

我们可以通过使用 `add_documents` 函数将项目添加到我们的向量存储中。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Pinecone"}]-->
from uuid import uuid4

from langchain_core.documents import Document

document_1 = Document(
    page_content="I had chocalate chip pancakes and scrambled eggs for breakfast this morning.",
    metadata={"source": "tweet"},
)

document_2 = Document(
    page_content="The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees.",
    metadata={"source": "news"},
)

document_3 = Document(
    page_content="Building an exciting new project with LangChain - come check it out!",
    metadata={"source": "tweet"},
)

document_4 = Document(
    page_content="Robbers broke into the city bank and stole $1 million in cash.",
    metadata={"source": "news"},
)

document_5 = Document(
    page_content="Wow! That was an amazing movie. I can't wait to see it again.",
    metadata={"source": "tweet"},
)

document_6 = Document(
    page_content="Is the new iPhone worth the price? Read this review to find out.",
    metadata={"source": "website"},
)

document_7 = Document(
    page_content="The top 10 soccer players in the world right now.",
    metadata={"source": "website"},
)

document_8 = Document(
    page_content="LangGraph is the best framework for building stateful, agentic applications!",
    metadata={"source": "tweet"},
)

document_9 = Document(
    page_content="The stock market is down 500 points today due to fears of a recession.",
    metadata={"source": "news"},
)

document_10 = Document(
    page_content="I have a bad feeling I am going to get deleted :(",
    metadata={"source": "tweet"},
)

documents = [
    document_1,
    document_2,
    document_3,
    document_4,
    document_5,
    document_6,
    document_7,
    document_8,
    document_9,
    document_10,
]
uuids = [str(uuid4()) for _ in range(len(documents))]

vector_store.add_documents(documents=documents, ids=uuids)
```



```output
['167b8681-5974-467f-adcb-6e987a18df01',
 'd16010fd-41f8-4d49-9c22-c66d5555a3fe',
 'ffcacfb3-2bc2-44c3-a039-c2256a905c0e',
 'cf3bfc9f-5dc7-4f5e-bb41-edb957394126',
 'e99b07eb-fdff-4cb9-baa8-619fd8efeed3',
 '68c93033-a24f-40bd-8492-92fa26b631a4',
 'b27a4ecb-b505-4c5d-89ff-526e3d103558',
 '4868a9e6-e6fb-4079-b400-4a1dfbf0d4c4',
 '921c0e9c-0550-4eb5-9a6c-ed44410788b2',
 'c446fc23-64e8-47e7-8c19-ecf985e9411e']
```


### 从向量存储中删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```

## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

执行简单的相似性搜索可以如下进行：


```python
results = vector_store.similarity_search(
    "LangChain provides abstractions to make working with LLMs easy",
    k=2,
    filter={"source": "tweet"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```
```output
* Building an exciting new project with LangChain - come check it out! [{'source': 'tweet'}]
* LangGraph is the best framework for building stateful, agentic applications! [{'source': 'tweet'}]
```
#### 带分数的相似性搜索

您也可以使用分数进行搜索：


```python
results = vector_store.similarity_search_with_score(
    "Will it be hot tomorrow?", k=1, filter={"source": "news"}
)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```
```output
* [SIM=0.553187] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'source': 'news'}]
```
#### 其他搜索方法

还有更多未在此笔记本中列出的搜索方法（如MMR），要找到所有方法，请务必阅读 [API参考](https://python.langchain.com/api_reference/pinecone/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 1, "score_threshold": 0.5},
)
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```



```output
[Document(metadata={'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## API 参考

有关所有 __ModuleName__VectorStore 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/pinecone/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
