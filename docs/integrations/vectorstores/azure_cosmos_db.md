---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/azure_cosmos_db.ipynb
---
# Azure Cosmos DB Mongo vCore

本笔记本展示了如何利用这个集成的[向量数据库](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database)来存储集合中的文档，创建索引，并使用近似最近邻算法（如COS（余弦距离）、L2（欧几里得距离）和IP（内积））执行向量搜索查询，以定位与查询向量接近的文档。
    
Azure Cosmos DB是支持OpenAI的ChatGPT服务的数据库。它提供单毫秒级的响应时间，自动和即时的可扩展性，以及在任何规模下保证的速度。

Azure Cosmos DB for MongoDB vCore(https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/)为开发者提供了一个完全托管的MongoDB兼容数据库服务，用于构建具有熟悉架构的现代应用程序。您可以应用您的MongoDB经验，并继续使用您喜欢的MongoDB驱动程序、SDK和工具，只需将您的应用程序指向MongoDB vCore账户的连接字符串的API。

[注册](https://azure.microsoft.com/en-us/free/)以获得终身免费访问，今天就开始吧。
        


```python
%pip install --upgrade --quiet  pymongo langchain-openai langchain-community
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

```python
import os

CONNECTION_STRING = "YOUR_CONNECTION_STRING"
INDEX_NAME = "izzy-test-index"
NAMESPACE = "izzy_test_db.izzy_test_collection"
DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")
```

我们想使用 `OpenAIEmbeddings`，因此需要设置我们的 Azure OpenAI API 密钥以及其他环境变量。


```python
# Set up the OpenAI Environment Variables
os.environ["OPENAI_API_TYPE"] = "azure"
os.environ["OPENAI_API_VERSION"] = "2023-05-15"
os.environ["OPENAI_API_BASE"] = (
    "YOUR_OPEN_AI_ENDPOINT"  # https://example.openai.azure.com/
)
os.environ["OPENAI_API_KEY"] = "YOUR_OPENAI_API_KEY"
os.environ["OPENAI_EMBEDDINGS_DEPLOYMENT"] = (
    "smart-agent-embedding-ada"  # the deployment name for the embedding model
)
os.environ["OPENAI_EMBEDDINGS_MODEL_NAME"] = "text-embedding-ada-002"  # the model name
```

现在，我们需要将文档加载到集合中，创建索引，然后针对索引运行查询以检索匹配项。

如果您对某些参数有疑问，请参考 [文档](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search)。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Azure Cosmos DB Mongo vCore"}, {"imported": "AzureCosmosDBVectorSearch", "source": "langchain_community.vectorstores.azure_cosmos_db", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.azure_cosmos_db.AzureCosmosDBVectorSearch.html", "title": "Azure Cosmos DB Mongo vCore"}, {"imported": "CosmosDBSimilarityType", "source": "langchain_community.vectorstores.azure_cosmos_db", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.azure_cosmos_db.CosmosDBSimilarityType.html", "title": "Azure Cosmos DB Mongo vCore"}, {"imported": "CosmosDBVectorSearchType", "source": "langchain_community.vectorstores.azure_cosmos_db", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.azure_cosmos_db.CosmosDBVectorSearchType.html", "title": "Azure Cosmos DB Mongo vCore"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Azure Cosmos DB Mongo vCore"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Azure Cosmos DB Mongo vCore"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.azure_cosmos_db import (
    AzureCosmosDBVectorSearch,
    CosmosDBSimilarityType,
    CosmosDBVectorSearchType,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

SOURCE_FILE_NAME = "../../how_to/state_of_the_union.txt"

loader = TextLoader(SOURCE_FILE_NAME)
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# OpenAI Settings
model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")


openai_embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    deployment=model_deployment, model=model_name, chunk_size=1
)
```


```python
from pymongo import MongoClient

# INDEX_NAME = "izzy-test-index-2"
# NAMESPACE = "izzy_test_db.izzy_test_collection"
# DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")

client: MongoClient = MongoClient(CONNECTION_STRING)
collection = client[DB_NAME][COLLECTION_NAME]

model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")

vectorstore = AzureCosmosDBVectorSearch.from_documents(
    docs,
    openai_embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)

# Read more about these variables in detail here. https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search
num_lists = 100
dimensions = 1536
similarity_algorithm = CosmosDBSimilarityType.COS
kind = CosmosDBVectorSearchType.VECTOR_IVF
m = 16
ef_construction = 64
ef_search = 40
score_threshold = 0.1

vectorstore.create_index(
    num_lists, dimensions, similarity_algorithm, kind, m, ef_construction
)
```



```output
{'raw': {'defaultShard': {'numIndexesBefore': 1,
   'numIndexesAfter': 2,
   'createdCollectionAutomatically': False,
   'ok': 1}},
 'ok': 1}
```



```python
# perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)
```


```python
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
一旦文档加载完毕并且索引创建完成，您现在可以直接实例化向量存储并针对索引运行查询。


```python
vectorstore = AzureCosmosDBVectorSearch.from_connection_string(
    CONNECTION_STRING, NAMESPACE, openai_embeddings, index_name=INDEX_NAME
)

# perform a similarity search between a query and the ingested documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)

print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
vectorstore = AzureCosmosDBVectorSearch(
    collection, openai_embeddings, index_name=INDEX_NAME
)

# perform a similarity search between a query and the ingested documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)

print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 过滤向量搜索（预览）
Azure Cosmos DB for MongoDB 支持使用 $lt、$lte、$eq、$neq、$gte、$gt、$in、$nin 和 $regex 进行预过滤。要使用此功能，请在您的 Azure 订阅的“预览功能”选项卡中启用“过滤向量搜索”。了解更多关于预览功能的信息 [这里](https://learn.microsoft.com/azure/cosmos-db/mongodb/vcore/vector-search#filtered-vector-search-preview)。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
