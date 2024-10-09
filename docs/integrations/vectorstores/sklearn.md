---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/sklearn.ipynb
---
# scikit-learn

>[scikit-learn](https://scikit-learn.org/stable/) 是一个开源的机器学习算法集合，包括一些 [k 最近邻](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.NearestNeighbors.html) 的实现。`SKLearnVectorStore` 封装了这个实现，并增加了将向量存储持久化为 json、bson（二进制 json）或 Apache Parquet 格式的可能性。

本笔记本展示了如何使用 `SKLearnVectorStore` 向量数据库。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。


```python
%pip install --upgrade --quiet  scikit-learn

# # if you plan to use bson serialization, install also:
%pip install --upgrade --quiet  bson

# # if you plan to use parquet serialization, install also:
%pip install --upgrade --quiet  pandas pyarrow
```

要使用OpenAI嵌入，您需要一个OpenAI密钥。您可以在https://platform.openai.com/account/api-keys获取一个，或者随意使用其他任何嵌入。


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass("Enter your OpenAI key:")
```

## 基本用法

### 加载示例文档语料库


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "scikit-learn"}, {"imported": "SKLearnVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.sklearn.SKLearnVectorStore.html", "title": "scikit-learn"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "scikit-learn"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "scikit-learn"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
```

### 创建SKLearnVectorStore，索引文档语料库并运行示例查询


```python
import tempfile

persist_path = os.path.join(tempfile.gettempdir(), "union.parquet")

vector_store = SKLearnVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_path=persist_path,  # persist_path and serializer are optional
    serializer="parquet",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 保存和加载向量存储


```python
vector_store.persist()
print("Vector store was persisted to", persist_path)
```
```output
Vector store was persisted to /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
vector_store2 = SKLearnVectorStore(
    embedding=embeddings, persist_path=persist_path, serializer="parquet"
)
print("A new instance of vector store was loaded from", persist_path)
```
```output
A new instance of vector store was loaded from /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
docs = vector_store2.similarity_search(query)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 清理


```python
os.remove(persist_path)
```


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
