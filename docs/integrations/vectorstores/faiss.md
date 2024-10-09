---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/faiss.ipynb
---
# Faiss

>[Facebook AI 相似性搜索 (FAISS)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) 是一个用于高效相似性搜索和密集向量聚类的库。它包含在任意大小的向量集合中进行搜索的算法，甚至可以处理可能不适合 RAM 的向量。它还包括用于评估和参数调优的支持代码。
>
>请参见 [FAISS 库](https://arxiv.org/pdf/2401.08281) 论文。

您可以在 [此页面](https://faiss.ai/) 找到 FAISS 文档。

本笔记本展示了如何使用与 `FAISS` 向量数据库相关的功能。它将展示与此集成特定的功能。完成后，探索 [相关用例页面](/docs/how_to#qa-with-rag) 可能会很有用，以了解如何将此向量存储作为更大链的一部分使用。

## 设置

集成位于 `langchain-community` 包中。我们还需要安装 `faiss` 包本身。我们可以通过以下方式安装这些：

请注意，如果您想使用启用 GPU 的版本，您也可以安装 `faiss-gpu`。


```python
pip install -qU langchain-community faiss-cpu
```

如果您想获得最佳的自动追踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 初始化

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>



```python
<!--IMPORTS:[{"imported": "InMemoryDocstore", "source": "langchain_community.docstore.in_memory", "docs": "https://python.langchain.com/api_reference/community/docstore/langchain_community.docstore.in_memory.InMemoryDocstore.html", "title": "Faiss"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Faiss"}]-->
import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS

index = faiss.IndexFlatL2(len(embeddings.embed_query("hello world")))

vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)
```

## 管理向量存储

### 向向量存储添加项目


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Faiss"}]-->
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
['22f5ce99-cd6f-4e0c-8dab-664128307c72',
 'dc3f061b-5f88-4fa1-a966-413550c51891',
 'd33d890b-baad-47f7-b7c1-175f5f7b4e59',
 '6e6c01d2-6020-4a7b-95da-ef43d43f01b5',
 'e677223d-ad75-4c1a-bef6-b5912bd1de03',
 '47e2a168-6462-4ed2-b1d9-d9edfd7391d6',
 '1e4d66d6-e155-4891-9212-f7be97f36c6a',
 'c0663096-e1a5-4665-b245-1c2e6c4fb653',
 '8297474a-7f7c-4006-9865-398c1781b1bc',
 '44e4be03-0a8d-4316-b3c4-f35f4bb2b532']
```


### 从向量存储删除项目


```python
vector_store.delete(ids=[uuids[-1]])
```



```output
True
```


## 查询向量存储

一旦您的向量存储创建完成并且相关文档已添加，您很可能希望在运行链或代理时查询它。

### 直接查询

#### 相似性搜索

执行简单的相似性搜索并对元数据进行过滤可以如下进行：


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

您还可以使用分数进行搜索：


```python
results = vector_store.similarity_search_with_score(
    "Will it be hot tomorrow?", k=1, filter={"source": "news"}
)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```
```output
* [SIM=0.893688] The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees. [{'source': 'news'}]
```
#### 其他搜索方法


还有多种其他方法可以搜索FAISS向量存储。有关这些方法的完整列表，请参阅[API参考](https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html)

### 通过转换为检索器进行查询

您还可以将向量存储转换为检索器，以便在您的链中更轻松地使用。


```python
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 1})
retriever.invoke("Stealing from the bank is a crime", filter={"source": "news"})
```



```output
[Document(metadata={'source': 'news'}, page_content='Robbers broke into the city bank and stole $1 million in cash.')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成（RAG）的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用RAG进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## 保存和加载
您还可以保存和加载FAISS索引。这很有用，这样您就不必每次使用时都重新创建它。


```python
vector_store.save_local("faiss_index")

new_vector_store = FAISS.load_local(
    "faiss_index", embeddings, allow_dangerous_deserialization=True
)

docs = new_vector_store.similarity_search("qux")
```


```python
docs[0]
```



```output
Document(metadata={'source': 'tweet'}, page_content='Building an exciting new project with LangChain - come check it out!')
```


## 合并
您还可以合并两个FAISS向量存储


```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```



```output
{'b752e805-350e-4cf5-ba54-0883d46a3a44': Document(page_content='foo')}
```



```python
db2.docstore._dict
```



```output
{'08192d92-746d-4cd1-b681-bdfba411f459': Document(page_content='bar')}
```



```python
db1.merge_from(db2)
```


```python
db1.docstore._dict
```



```output
{'b752e805-350e-4cf5-ba54-0883d46a3a44': Document(page_content='foo'),
 '08192d92-746d-4cd1-b681-bdfba411f459': Document(page_content='bar')}
```


## API参考

有关所有`FAISS`向量存储功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html


## 相关

- 向量存储[概念指南](/docs/concepts/#vector-stores)
- 向量存储[使用指南](/docs/how_to/#vector-stores)
