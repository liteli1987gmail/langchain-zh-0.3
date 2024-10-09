---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/chroma.ipynb
---
# Chroma

本笔记本介绍如何开始使用 `Chroma` 向量存储。

>[Chroma](https://docs.trychroma.com/getting-started) 是一个以AI为原生的开源向量数据库，专注于开发者的生产力和幸福感。Chroma 采用 Apache 2.0 许可证。查看 `Chroma` 的完整文档 [此页面](https://docs.trychroma.com/reference/py-collection)，并在 [此页面](https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html) 找到 LangChain 集成的 API 参考。

## 设置

要访问 `Chroma` 向量存储，您需要安装 `langchain-chroma` 集成包。


```python
pip install -qU "langchain-chroma>=0.1.2"
```

### 凭证

您可以在没有任何凭证的情况下使用 `Chroma` 向量存储，只需安装上述软件包即可！

如果您想获得最佳的自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

## 初始化

### 基本初始化

以下是基本初始化，包括使用目录将数据本地保存。

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Chroma"}]-->
from langchain_chroma import Chroma

vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
)
```

### 从客户端初始化

您还可以从 `Chroma` 客户端初始化，这在您想更轻松地访问底层数据库时特别有用。


```python
import chromadb

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection("collection_name")
collection.add(ids=["1", "2", "3"], documents=["a", "b", "c"])

vector_store_from_client = Chroma(
    client=persistent_client,
    collection_name="collection_name",
    embedding_function=embeddings,
)
```

## 管理向量存储

一旦您创建了向量存储，我们可以通过添加和删除不同的项目与之交互。

### 将项目添加到向量存储

我们可以通过使用 `add_documents` 函数将项目添加到我们的向量存储。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Chroma"}]-->
from uuid import uuid4

from langchain_core.documents import Document

document_1 = Document(
    page_content="I had chocolate chip pancakes and scrambled eggs for breakfast this morning.",
    metadata={"source": "tweet"},
    id=1,
)

document_2 = Document(
    page_content="The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees.",
    metadata={"source": "news"},
    id=2,
)

document_3 = Document(
    page_content="Building an exciting new project with LangChain - come check it out!",
    metadata={"source": "tweet"},
    id=3,
)

document_4 = Document(
    page_content="Robbers broke into the city bank and stole $1 million in cash.",
    metadata={"source": "news"},
    id=4,
)

document_5 = Document(
    page_content="Wow! That was an amazing movie. I can't wait to see it again.",
    metadata={"source": "tweet"},
    id=5,
)

document_6 = Document(
    page_content="Is the new iPhone worth the price? Read this review to find out.",
    metadata={"source": "website"},
    id=6,
)

document_7 = Document(
    page_content="The top 10 soccer players in the world right now.",
    metadata={"source": "website"},
    id=7,
)

document_8 = Document(
    page_content="LangGraph is the best framework for building stateful, agentic applications!",
    metadata={"source": "tweet"},
    id=8,
)

document_9 = Document(
    page_content="The stock market is down 500 points today due to fears of a recession.",
    metadata={"source": "news"},
    id=9,
)

document_10 = Document(
    page_content="I have a bad feeling I am going to get deleted :(",
    metadata={"source": "tweet"},
    id=10,
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
['f22ed484-6db3-4b76-adb1-18a777426cd6',
 'e0d5bab4-6453-4511-9a37-023d9d288faa',
 '877d76b8-3580-4d9e-a13f-eed0fa3d134a',
 '26eaccab-81ce-4c0a-8e76-bf542647df18',
 'bcaa8239-7986-4050-bf40-e14fb7dab997',
 'cdc44b38-a83f-4e49-b249-7765b334e09d',
 'a7a35354-2687-4bc2-8242-3849a4d18d34',
 '8780caf1-d946-4f27-a707-67d037e9e1d8',
 'dec6af2a-7326-408f-893d-7d7d717dfda9',
 '3b18e210-bb59-47a0-8e17-c8e51176ea5e']
```


### 更新向量存储中的项目

现在我们已经将文档添加到我们的向量存储中，我们可以通过使用 `update_documents` 函数来更新现有文档。


```python
updated_document_1 = Document(
    page_content="I had chocolate chip pancakes and fried eggs for breakfast this morning.",
    metadata={"source": "tweet"},
    id=1,
)

updated_document_2 = Document(
    page_content="The weather forecast for tomorrow is sunny and warm, with a high of 82 degrees.",
    metadata={"source": "news"},
    id=2,
)

vector_store.update_document(document_id=uuids[0], document=updated_document_1)
# You can also update multiple documents at once
vector_store.update_documents(
    ids=uuids[:2], documents=[updated_document_1, updated_document_2]
)
```

### 从向量存储中删除项目

我们也可以按如下方式从我们的向量存储中删除项目：


```python
vector_store.delete(ids=uuids[-1])
```

## 查询向量存储

一旦您的向量存储被创建并且相关文档已被添加，您很可能希望在运行链或代理期间查询它。

### 直接查询

#### 相似性搜索

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

如果您想执行相似性搜索并接收相应的分数，可以运行：


```python
results = vector_store.similarity_search_with_score(
    "Will it be hot tomorrow?", k=1, filter={"source": "news"}
)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```
```output
* [SIM=1.726390] The stock market is down 500 points today due to fears of a recession. [{'source': 'news'}]
```
#### 按向量搜索

您也可以按向量搜索：


```python
results = vector_store.similarity_search_by_vector(
    embedding=embeddings.embed_query("I love green eggs and ham!"), k=1
)
for doc in results:
    print(f"* {doc.page_content} [{doc.metadata}]")
```
```output
* I had chocalate chip pancakes and fried eggs for breakfast this morning. [{'source': 'tweet'}]
```
#### 其他搜索方法

还有多种其他搜索方法未在此笔记本中涵盖，例如MMR搜索或按向量搜索。有关`AstraDBVectorStore`可用搜索能力的完整列表，请查看[API参考](https://python.langchain.com/api_reference/astradb/vectorstores/langchain_astradb.vectorstores.AstraDBVectorStore.html)。

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。有关不同搜索类型和您可以传递的kwargs的更多信息，请访问API参考[这里](https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html#langchain_chroma.vectorstores.Chroma.as_retriever)。


```python
retriever = vector_store.as_retriever(
    search_type="mmr", search_kwargs={"k": 1, "fetch_k": 5}
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

有关所有 `Chroma` 向量存储功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
