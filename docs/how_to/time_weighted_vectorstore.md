---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/time_weighted_vectorstore.ipynb
---
# 如何使用时间加权向量存储检索器

该检索器使用语义相似性和时间衰减的组合。

评分算法为：

```
semantic_similarity + (1.0 - decay_rate) ^ hours_passed
```

值得注意的是，`hours_passed` 指的是自检索器中的对象**最后被访问**以来经过的小时数，而不是自创建以来的小时数。这意味着经常被访问的对象保持“新鲜”。



```python
<!--IMPORTS:[{"imported": "TimeWeightedVectorStoreRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.time_weighted_retriever.TimeWeightedVectorStoreRetriever.html", "title": "How to use a time-weighted vector store retriever"}, {"imported": "InMemoryDocstore", "source": "langchain_community.docstore", "docs": "https://python.langchain.com/api_reference/community/docstore/langchain_community.docstore.in_memory.InMemoryDocstore.html", "title": "How to use a time-weighted vector store retriever"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to use a time-weighted vector store retriever"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to use a time-weighted vector store retriever"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use a time-weighted vector store retriever"}]-->
from datetime import datetime, timedelta

import faiss
from langchain.retrievers import TimeWeightedVectorStoreRetriever
from langchain_community.docstore import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

## 低衰减率

低 `decay rate`（在这里，为了极端，我们将其设置得接近0）意味着记忆将被“记住”更长时间。`decay rate` 为0意味着记忆永远不会被遗忘，使得这个检索器等同于向量查找。



```python
# Define your embedding model
embeddings_model = OpenAIEmbeddings()
# Initialize the vectorstore as empty
embedding_size = 1536
index = faiss.IndexFlatL2(embedding_size)
vectorstore = FAISS(embeddings_model, index, InMemoryDocstore({}), {})
retriever = TimeWeightedVectorStoreRetriever(
    vectorstore=vectorstore, decay_rate=0.0000000000000000000000001, k=1
)
```


```python
yesterday = datetime.now() - timedelta(days=1)
retriever.add_documents(
    [Document(page_content="hello world", metadata={"last_accessed_at": yesterday})]
)
retriever.add_documents([Document(page_content="hello foo")])
```



```output
['c3dcf671-3c0a-4273-9334-c4a913076bfa']
```



```python
# "Hello World" is returned first because it is most salient, and the decay rate is close to 0., meaning it's still recent enough
retriever.get_relevant_documents("hello world")
```



```output
[Document(page_content='hello world', metadata={'last_accessed_at': datetime.datetime(2023, 12, 27, 15, 30, 18, 457125), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 8, 442662), 'buffer_idx': 0})]
```


## 高衰减率

使用高 `decay rate`（例如，几个9），`recency score` 很快就会降到0！如果你将其设置为1，所有对象的 `recency` 都为0，再次使其等同于向量查找。




```python
# Define your embedding model
embeddings_model = OpenAIEmbeddings()
# Initialize the vectorstore as empty
embedding_size = 1536
index = faiss.IndexFlatL2(embedding_size)
vectorstore = FAISS(embeddings_model, index, InMemoryDocstore({}), {})
retriever = TimeWeightedVectorStoreRetriever(
    vectorstore=vectorstore, decay_rate=0.999, k=1
)
```


```python
yesterday = datetime.now() - timedelta(days=1)
retriever.add_documents(
    [Document(page_content="hello world", metadata={"last_accessed_at": yesterday})]
)
retriever.add_documents([Document(page_content="hello foo")])
```



```output
['eb1c4c86-01a8-40e3-8393-9a927295a950']
```



```python
# "Hello Foo" is returned first because "hello world" is mostly forgotten
retriever.get_relevant_documents("hello world")
```



```output
[Document(page_content='hello foo', metadata={'last_accessed_at': datetime.datetime(2023, 12, 27, 15, 30, 50, 57185), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 44, 720490), 'buffer_idx': 1})]
```


## 虚拟时间

使用LangChain中的一些工具，你可以模拟时间组件。



```python
<!--IMPORTS:[{"imported": "mock_now", "source": "langchain_core.utils", "docs": "https://python.langchain.com/api_reference/core/utils/langchain_core.utils.utils.mock_now.html", "title": "How to use a time-weighted vector store retriever"}]-->
import datetime

from langchain_core.utils import mock_now
```


```python
# Notice the last access time is that date time
with mock_now(datetime.datetime(2024, 2, 3, 10, 11)):
    print(retriever.get_relevant_documents("hello world"))
```
```output
[Document(page_content='hello world', metadata={'last_accessed_at': MockDateTime(2024, 2, 3, 10, 11), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 44, 532941), 'buffer_idx': 0})]
```