---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/memorydb.ipynb
---
# Amazon MemoryDB

>[向量搜索](https://docs.aws.amazon.com/memorydb/latest/devguide/vector-search.html/) 介绍和 LangChain 集成指南。

## 什么是 Amazon MemoryDB？

MemoryDB 兼容 Redis OSS，这是一种流行的开源数据存储，使您能够快速构建应用程序，使用他们今天已经使用的相同灵活友好的 Redis OSS 数据结构、API 和命令。使用 MemoryDB，您的所有数据都存储在内存中，这使您能够实现微秒级读取和个位数毫秒级写入延迟以及高吞吐量。MemoryDB 还通过使用多可用区 (Multi-AZ) 事务日志在多个可用区 (AZs) 中持久存储数据，以实现快速故障转移、数据库恢复和节点重启。


## MemoryDB 的向量搜索

MemoryDB 的向量搜索扩展了 MemoryDB 的功能。向量搜索可以与现有的 MemoryDB 功能结合使用。未使用向量搜索的应用程序不会受到其存在的影响。向量搜索在所有可用的 MemoryDB 区域中均可用。您可以使用现有的 MemoryDB 数据或 Redis OSS API 来构建机器学习和生成 AI 用例，例如检索增强生成、异常检测、文档检索和实时推荐。

* 在 Redis 哈希和 `JSON` 中对多个字段进行索引
* 向量相似性搜索 (使用 `HNSW` (ANN) 或 `FLAT` (KNN))
* 向量范围搜索 (例如，查找查询向量半径内的所有向量)
* 增量索引而不损失性能


## 设置


### 安装 Redis Python 客户端

`Redis-py` 是一个可以用来连接 MemoryDB 的 Python 客户端


```python
%pip install --upgrade --quiet  redis langchain-aws
```


```python
from langchain_aws.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings()
```

### MemoryDB 连接

有效的 Redis Url 模式有：
1. `redis://`  - 连接到 Redis 集群，未加密
2. `rediss://` - 连接到 Redis 集群，使用 TLS 加密

有关其他连接参数的更多信息，请参见 [redis-py 文档](https://redis-py.readthedocs.io/en/stable/connections.html)。

### 示例数据

首先，我们将描述一些示例数据，以便演示 Redis 向量存储的各种属性。


```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
index_name = "users"
```

### 创建 MemoryDB 向量存储

可以使用以下方法初始化 InMemoryVectorStore 实例
- ``InMemoryVectorStore.__init__`` - 直接初始化
- ``InMemoryVectorStore.from_documents`` - 从一组 ``Langchain.docstore.Document`` 对象初始化
- ``InMemoryVectorStore.from_texts`` - 从一组文本初始化（可选地带有元数据）
- ``InMemoryVectorStore.from_existing_index`` - 从现有的 MemoryDB 索引初始化



```python
from langchain_aws.vectorstores.inmemorydb import InMemoryVectorStore

vds = InMemoryVectorStore.from_texts(
    embeddings,
    redis_url="rediss://cluster_endpoint:6379/ssl=True ssl_cert_reqs=none",
)
```


```python
vds.index_name
```



```output
'users'
```


## 查询

根据您的用例，有多种方法可以查询 ``InMemoryVectorStore`` 实现：

- ``similarity_search``: 查找与给定向量最相似的向量。
- ``similarity_search_with_score``: 查找与给定向量最相似的向量并返回向量距离
- ``similarity_search_limit_score``: 查找与给定向量最相似的向量，并将结果数量限制为 ``score_threshold``
- ``similarity_search_with_relevance_scores``: 查找与给定向量最相似的向量并返回向量相似度
- ``max_marginal_relevance_search``: 查找与给定向量最相似的向量，同时优化多样性


```python
results = vds.similarity_search("foo")
print(results[0].page_content)
```
```output
foo
```

```python
# with scores (distances)
results = vds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```
```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = vds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```
```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = vds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```
```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
vds.add_texts(new_document, new_metadata)
```



```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```


## MemoryDB 作为检索器

在这里我们讨论使用向量存储作为检索器的不同选项。

我们可以使用三种不同的搜索方法进行检索。默认情况下，它将使用语义相似性。


```python
query = "foo"
results = vds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```
```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = vds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```


```python
docs = retriever.invoke(query)
docs
```



```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```


还有 `similarity_distance_threshold` 检索器，允许用户指定向量距离。


```python
retriever = vds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```


```python
docs = retriever.invoke(query)
docs
```



```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```


最后，``similarity_score_threshold`` 允许用户定义相似文档的最低分数。


```python
retriever = vds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```


```python
retriever.invoke("foo")
```



```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```



```python
retriever.invoke("foo")
```



```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```


## 删除索引

要删除您的条目，您必须通过它们的键来处理。


```python
# delete the indices too
InMemoryVectorStore.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
InMemoryVectorStore.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```



```output
True
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
