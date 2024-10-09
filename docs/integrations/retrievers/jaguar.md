---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/jaguar.ipynb
---
# JaguarDB 向量数据库

>[JaguarDB 向量数据库](http://www.jaguardb.com/windex.html
>
>1. 它是一个分布式向量数据库
>2. JaguarDB 的“ZeroMove”功能实现了即时的横向扩展
>3. 多模态：嵌入、文本、图像、视频、PDF、音频、时间序列和地理空间
>4. 全主节点：允许并行读取和写入
>5. 异常检测能力
>6. RAG 支持：将大型语言模型与专有和实时数据结合
>7. 共享元数据：在多个向量索引之间共享元数据
>8. 距离度量：欧几里得，余弦，内积，曼哈顿，切比雪夫，汉明，杰卡德，闵可夫斯基

## 前提条件

运行本文件中的示例有两个要求。
1. 您必须安装并设置JaguarDB服务器及其HTTP网关服务器。
请参阅以下说明：
[www.jaguardb.com](http://www.jaguardb.com)

2. 您必须安装JaguarDB的HTTP客户端包：
   ```
       pip install -U jaguardb-http-client
   ```


## 使用LangChain的RAG

本节演示了如何在LangChain软件栈中与大型语言模型和Jaguar进行聊天。



```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "JaguarDB Vector Database"}, {"imported": "Jaguar", "source": "langchain_community.vectorstores.jaguar", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.jaguar.Jaguar.html", "title": "JaguarDB Vector Database"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "JaguarDB Vector Database"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "JaguarDB Vector Database"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

""" 
Load a text file into a set of documents 
"""
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=300)
docs = text_splitter.split_documents(documents)

"""
Instantiate a Jaguar vector store
"""
### Jaguar HTTP endpoint
url = "http://192.168.5.88:8080/fwww/"

### Use OpenAI embedding model
embeddings = OpenAIEmbeddings()

### Pod is a database for vectors
pod = "vdb"

### Vector store name
store = "langchain_rag_store"

### Vector index name
vector_index = "v"

### Type of the vector index
# cosine: distance metric
# fraction: embedding vectors are decimal numbers
# float: values stored with floating-point numbers
vector_type = "cosine_fraction_float"

### Dimension of each embedding vector
vector_dimension = 1536

### Instantiate a Jaguar store object
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

"""
Login must be performed to authorize the client.
The environment variable JAGUAR_API_KEY or file $HOME/.jagrc
should contain the API key for accessing JaguarDB servers.
"""
vectorstore.login()


"""
Create vector store on the JaguarDB database server.
This should be done only once.
"""
# Extra metadata fields for the vector store
metadata = "category char(16)"

# Number of characters for the text field of the store
text_size = 4096

#  Create a vector store on the server
vectorstore.create(metadata, text_size)

"""
Add the texts from the text splitter to our vectorstore
"""
vectorstore.add_documents(docs)

""" Get the retriever object """
retriever = vectorstore.as_retriever()
# retriever = vectorstore.as_retriever(search_kwargs={"where": "m1='123' and m2='abc'"})

""" The retriever object can be used with LangChain and LLM """
```

## 与Jaguar向量存储的交互

用户可以直接与Jaguar向量存储进行相似性搜索和异常检测。



```python
<!--IMPORTS:[{"imported": "Jaguar", "source": "langchain_community.vectorstores.jaguar", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.jaguar.Jaguar.html", "title": "JaguarDB Vector Database"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "JaguarDB Vector Database"}]-->
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings

# Instantiate a Jaguar vector store object
url = "http://192.168.3.88:8080/fwww/"
pod = "vdb"
store = "langchain_test_store"
vector_index = "v"
vector_type = "cosine_fraction_float"
vector_dimension = 10
embeddings = OpenAIEmbeddings()
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

# Login for authorization
vectorstore.login()

# Create the vector store with two metadata fields
# This needs to be run only once.
metadata_str = "author char(32), category char(16)"
vectorstore.create(metadata_str, 1024)

# Add a list of texts
texts = ["foo", "bar", "baz"]
metadatas = [
    {"author": "Adam", "category": "Music"},
    {"author": "Eve", "category": "Music"},
    {"author": "John", "category": "History"},
]
ids = vectorstore.add_texts(texts=texts, metadatas=metadatas)

#  Search similar text
output = vectorstore.similarity_search(
    query="foo",
    k=1,
    metadatas=["author", "category"],
)
assert output[0].page_content == "foo"
assert output[0].metadata["author"] == "Adam"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Search with filtering (where)
where = "author='Eve'"
output = vectorstore.similarity_search(
    query="foo",
    k=3,
    fetch_k=9,
    where=where,
    metadatas=["author", "category"],
)
assert output[0].page_content == "bar"
assert output[0].metadata["author"] == "Eve"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Anomaly detection
result = vectorstore.is_anomalous(
    query="dogs can jump high",
)
assert result is False

# Remove all data in the store
vectorstore.clear()
assert vectorstore.count() == 0

# Remove the store completely
vectorstore.drop()

# Logout
vectorstore.logout()
```


## 相关内容

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
