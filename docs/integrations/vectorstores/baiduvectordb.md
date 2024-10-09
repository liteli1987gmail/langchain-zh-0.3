---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/baiduvectordb.ipynb
---
#  百度向量数据库

>[百度向量数据库](https://cloud.baidu.com/product/vdb.html) 是一个强大的企业级分布式数据库服务，由百度智能云精心开发并全面管理。它以卓越的多维向量数据存储、检索和分析能力而脱颖而出。VectorDB 的核心基于百度自主研发的 "Mochow" 向量数据库内核，确保高性能、高可用性和安全性，同时具备出色的可扩展性和用户友好性。

>该数据库服务支持多种索引类型和相似性计算方法，满足各种使用场景。VectorDB 的一大亮点是其管理高达 100 亿的巨大向量规模的能力，同时保持出色的查询性能，支持每秒数百万次查询 (QPS)，查询延迟在毫秒级别。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用与百度向量数据库相关的功能。

要运行，您应该拥有一个 [数据库实例。](https://cloud.baidu.com/doc/VDB/s/hlrsoazuf)。


```python
!pip3 install pymochow
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Baidu VectorDB"}, {"imported": "FakeEmbeddings", "source": "langchain_community.embeddings.fake", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "Baidu VectorDB"}, {"imported": "BaiduVectorDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.baiduvectordb.BaiduVectorDB.html", "title": "Baidu VectorDB"}, {"imported": "ConnectionParams", "source": "langchain_community.vectorstores.baiduvectordb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.baiduvectordb.ConnectionParams.html", "title": "Baidu VectorDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Baidu VectorDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import BaiduVectorDB
from langchain_community.vectorstores.baiduvectordb import ConnectionParams
from langchain_text_splitters import CharacterTextSplitter
```


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = FakeEmbeddings(size=128)
```


```python
conn_params = ConnectionParams(
    endpoint="http://192.168.xx.xx:xxxx", account="root", api_key="****"
)

vector_db = BaiduVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, drop_old=True
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```


```python
vector_db = BaiduVectorDB(embeddings, conn_params)
vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
