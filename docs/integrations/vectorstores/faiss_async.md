---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/faiss_async.ipynb
---
# Faiss (异步)

>[Facebook AI 相似性搜索 (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) 是一个用于高效相似性搜索和密集向量聚类的库。它包含在任意大小的向量集合中进行搜索的算法，甚至可以处理可能不适合 RAM 的向量。它还包括用于评估和参数调优的支持代码。
>
>请参见 [FAISS 库](https://arxiv.org/pdf/2401.08281) 论文。

[Faiss 文档](https://faiss.ai/)。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用与 `FAISS` 向量数据库相关的功能，使用 `asyncio`。
LangChain 实现了同步和异步向量存储功能。

请参见 `同步` 版本 [这里](/docs/integrations/vectorstores/faiss)。


```python
%pip install --upgrade --quiet  faiss-gpu # For CUDA 7.5+ Supported GPU's.
# OR
%pip install --upgrade --quiet  faiss-cpu # For CPU Installation
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Faiss (Async)"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Faiss (Async)"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Faiss (Async)"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Faiss (Async)"}]-->
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = await FAISS.afrom_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)

print(docs[0].page_content)
```

## 带分数的相似性搜索
有一些特定于 FAISS 的方法。其中之一是 `similarity_search_with_score`，它允许您返回不仅是文档，还有查询与它们之间的距离分数。返回的距离分数是 L2 距离。因此，分数越低越好。


```python
docs_and_scores = await db.asimilarity_search_with_score(query)

docs_and_scores[0]
```

还可以使用 `similarity_search_by_vector` 搜索与给定嵌入向量相似的文档，该方法接受嵌入向量作为参数，而不是字符串。


```python
embedding_vector = await embeddings.aembed_query(query)
docs_and_scores = await db.asimilarity_search_by_vector(embedding_vector)
```

## 保存和加载
您还可以保存和加载 FAISS 索引。这很有用，这样您就不必每次使用时都重新创建它。


```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings, asynchronous=True)

docs = await new_db.asimilarity_search(query)

docs[0]
```

# 序列化和反序列化为字节

您可以通过这些函数对 FAISS 索引进行序列化。如果您使用的嵌入模型大小为 90 mb（sentence-transformers/all-MiniLM-L6-v2 或其他任何模型），则生成的 pickle 大小将超过 90 mb。模型的大小也包含在整体大小中。为了解决这个问题，请使用下面的函数。这些函数仅序列化 FAISS 索引，大小会小得多。如果您希望将索引存储在像 SQL 这样的数据库中，这将很有帮助。


```python
<!--IMPORTS:[{"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Faiss (Async)"}]-->
from langchain_huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl, asynchronous=True
)  # Load the index
```

## 合并
您还可以合并两个 FAISS 向量存储


```python
db1 = await FAISS.afrom_texts(["foo"], embeddings)
db2 = await FAISS.afrom_texts(["bar"], embeddings)
```


```python
db1.docstore._dict
```



```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo')}
```



```python
db2.docstore._dict
```



```output
{'4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```



```python
db1.merge_from(db2)
```


```python
db1.docstore._dict
```



```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo'),
 '4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```


## 带过滤的相似性搜索
FAISS 向量存储也支持过滤，由于 FAISS 本身不支持过滤，我们必须手动进行。这是通过首先获取比 `k` 更多的结果，然后进行过滤来完成的。您可以根据元数据过滤文档。您还可以在调用任何搜索方法时设置 `fetch_k` 参数，以设置在过滤之前要获取的文档数量。以下是一个小示例：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Faiss (Async)"}]-->
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```
```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```
现在我们进行相同的查询调用，但我们只过滤 `page = 1`


```python
results_with_scores = await db.asimilarity_search_with_score("foo", filter=dict(page=1))
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```
```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```
同样的事情也可以在 `max_marginal_relevance_search` 中完成。


```python
results = await db.amax_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```
```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```
以下是如何在调用 `similarity_search` 时设置 `fetch_k` 参数的示例。通常，您希望 `fetch_k` 参数 >> `k` 参数。这是因为 `fetch_k` 参数是过滤之前将要获取的文档数量。如果您将 `fetch_k` 设置为一个较小的数字，您可能无法获得足够的文档进行过滤。


```python
results = await db.asimilarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```
```output
Content: foo, Metadata: {'page': 1}
```
## 删除

您还可以删除 ID。请注意，要删除的 ID 应该是文档存储中的 ID。


```python
db.delete([db.index_to_docstore_id[0]])
```



```output
True
```



```python
# Is now missing
0 in db.index_to_docstore_id
```



```output
False
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
