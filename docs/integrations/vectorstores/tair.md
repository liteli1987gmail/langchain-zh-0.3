---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/tair.ipynb
---
# Tair

>[Tair](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair) 是由 `Alibaba Cloud` 开发的云原生内存数据库服务。
它提供丰富的数据模型和企业级能力，以支持您的实时在线场景，同时保持与开源 `Redis` 的完全兼容。`Tair` 还引入了基于新型非易失性存储介质 (NVM) 的持久内存优化实例。

本笔记本展示了如何使用与 `Tair` 向量数据库相关的功能。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

要运行，您应该有一个正在运行的 `Tair` 实例。


```python
<!--IMPORTS:[{"imported": "FakeEmbeddings", "source": "langchain_community.embeddings.fake", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "Tair"}, {"imported": "Tair", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tair.Tair.html", "title": "Tair"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Tair"}]-->
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Tair
from langchain_text_splitters import CharacterTextSplitter
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Tair"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=128)
```

使用 `TAIR_URL` 环境变量连接到 Tair
```
export TAIR_URL="redis://{username}:{password}@{tair_address}:{tair_port}"
```

或关键字参数 `tair_url`。

然后将文档和嵌入存储到 Tair。


```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

查询相似文档。


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

Tair 混合搜索索引构建


```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

Tair 混合搜索


```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
