---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vikingdb.ipynb
---
# Viking DB

>[Viking DB](https://www.volcengine.com/docs/6459/1163946) 是一个存储、索引和管理由深度神经网络和其他机器学习 (ML) 模型生成的大量嵌入向量的数据库。

本笔记本展示了如何使用与 VikingDB 向量数据库相关的功能。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

要运行，您应该有一个 [Viking DB 实例正在运行](https://www.volcengine.com/docs/6459/1165058)。





```python
!pip install --upgrade volcengine
```

我们想使用 VikingDBEmbeddings，因此我们必须获取 VikingDB API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "viking DB"}, {"imported": "VikingDB", "source": "langchain_community.vectorstores.vikingdb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vikingdb.VikingDB.html", "title": "viking DB"}, {"imported": "VikingDBConfig", "source": "langchain_community.vectorstores.vikingdb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vikingdb.VikingDBConfig.html", "title": "viking DB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "viking DB"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "viking DB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```


```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```


```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```


```python
docs[0].page_content
```

### 使用 VikingDB 集合对数据进行分类

您可以在同一个 VikingDB 实例中将不同的无关文档存储在不同的集合中，以保持上下文。

以下是如何创建新集合的方法。


```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

这里是如何检索已存储的集合。


```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

检索后，您可以像往常一样对其进行查询。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
