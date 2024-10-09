---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/elasticsearch.ipynb
---
# Elasticsearch
如何使用Elasticsearch中的托管嵌入模型生成嵌入的操作指南

实例化`ElasticsearchEmbeddings`类的最简单方法是
- 如果您使用Elastic Cloud，则使用`from_credentials`构造函数
- 或者使用`from_es_connection`构造函数与任何Elasticsearch集群


```python
!pip -q install langchain-elasticsearch
```


```python
from langchain_elasticsearch import ElasticsearchEmbeddings
```


```python
# Define the model ID
model_id = "your_model_id"
```

## 使用 `from_credentials` 进行测试
这需要一个 Elastic Cloud `cloud_id`


```python
# Instantiate ElasticsearchEmbeddings using credentials
embeddings = ElasticsearchEmbeddings.from_credentials(
    model_id,
    es_cloud_id="your_cloud_id",
    es_user="your_user",
    es_password="your_password",
)
```


```python
# Create embeddings for multiple documents
documents = [
    "This is an example document.",
    "Another example document to generate embeddings for.",
]
document_embeddings = embeddings.embed_documents(documents)
```


```python
# Print document embeddings
for i, embedding in enumerate(document_embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```


```python
# Create an embedding for a single query
query = "This is a single query."
query_embedding = embeddings.embed_query(query)
```


```python
# Print query embedding
print(f"Embedding for query: {query_embedding}")
```

## 使用现有的 Elasticsearch 客户端连接进行测试
这可以与任何 Elasticsearch 部署一起使用


```python
# Create Elasticsearch connection
from elasticsearch import Elasticsearch

es_connection = Elasticsearch(
    hosts=["https://es_cluster_url:port"], basic_auth=("user", "password")
)
```


```python
# Instantiate ElasticsearchEmbeddings using es_connection
embeddings = ElasticsearchEmbeddings.from_es_connection(
    model_id,
    es_connection,
)
```


```python
# Create embeddings for multiple documents
documents = [
    "This is an example document.",
    "Another example document to generate embeddings for.",
]
document_embeddings = embeddings.embed_documents(documents)
```


```python
# Print document embeddings
for i, embedding in enumerate(document_embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```


```python
# Create an embedding for a single query
query = "This is a single query."
query_embedding = embeddings.embed_query(query)
```


```python
# Print query embedding
print(f"Embedding for query: {query_embedding}")
```


## 相关内容

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
