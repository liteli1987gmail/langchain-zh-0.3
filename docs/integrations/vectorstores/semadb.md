---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/semadb.ipynb
---
# SemaDB

> [SemaDB](https://www.semafind.com/products/semadb) 来自 [SemaFind](https://www.semafind.com) 是一个简单易用的向量相似度数据库，用于构建AI应用程序。托管的 `SemaDB Cloud` 提供了一个简单易用的开发者体验，便于入门。

API的完整文档以及示例和交互式演示可在 [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb) 上找到。

本笔记本演示了 `SemaDB Cloud` 向量存储的使用。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 加载文档嵌入

为了在本地运行，我们使用 [Sentence Transformers](https://www.sbert.net/)，它们通常用于嵌入句子。您可以使用LangChain提供的任何嵌入模型。


```python
%pip install --upgrade --quiet  sentence_transformers
```


```python
<!--IMPORTS:[{"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "SemaDB"}]-->
from langchain_huggingface import HuggingFaceEmbeddings

model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "SemaDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "SemaDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
print(len(docs))
```
```output
114
```
## 连接到 SemaDB

SemaDB Cloud 使用 [RapidAPI 密钥](https://rapidapi.com/semafind-semadb/api/semadb) 进行身份验证。您可以通过创建一个免费的 RapidAPI 账户来获取您的密钥。


```python
import getpass
import os

if "SEMADB_API_KEY" not in os.environ:
    os.environ["SEMADB_API_KEY"] = getpass.getpass("SemaDB API Key:")
```
```output
SemaDB API Key: ········
```

```python
<!--IMPORTS:[{"imported": "SemaDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.semadb.SemaDB.html", "title": "SemaDB"}, {"imported": "DistanceStrategy", "source": "langchain_community.vectorstores.utils", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.utils.DistanceStrategy.html", "title": "SemaDB"}]-->
from langchain_community.vectorstores import SemaDB
from langchain_community.vectorstores.utils import DistanceStrategy
```

SemaDB 向量存储的参数直接反映了 API：

- "mycollection": 是我们将存储这些向量的集合名称。
- 768: 是向量的维度。在我们的案例中，句子变换器嵌入产生 768 维的向量。
- API_KEY: 是您的 RapidAPI 密钥。
- embeddings: 对应于文档、文本和查询的嵌入将如何生成。
- DistanceStrategy: 是使用的距离度量。如果使用 COSINE，包装器会自动对向量进行归一化。


```python
db = SemaDB("mycollection", 768, embeddings, DistanceStrategy.COSINE)

# Create collection if running for the first time. If the collection
# already exists this will fail.
db.create_collection()
```



```output
True
```


SemaDB 向量存储包装器将文档文本作为点元数据添加以便后续收集。存储大块文本*不推荐*。如果您正在索引一个大型集合，我们建议存储对文档的引用，例如外部 ID。


```python
db.add_documents(docs)[:2]
```



```output
['813c7ef3-9797-466b-8afa-587115592c6c',
 'fc392f7f-082b-4932-bfcc-06800db5e017']
```


## 相似性搜索

我们使用默认的 LangChain 相似性搜索接口来搜索最相似的句子。


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```
```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
docs = db.similarity_search_with_score(query)
docs[0]
```



```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt', 'text': 'And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'}),
 0.42369342)
```


## 清理

您可以删除集合以移除所有数据。


```python
db.delete_collection()
```



```output
True
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
