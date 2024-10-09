---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/redis.ipynb
sidebar_label: Redis
---
# Redis 向量存储

本笔记本介绍如何开始使用 Redis 向量存储。

>[Redis](https://redis.io/docs/stack/vectorsearch/) 是一个流行的开源内存数据结构存储，可以用作数据库、缓存、消息代理和队列。它现在包括向量相似性搜索功能，使其适合用作向量存储。

### 什么是 Redis？

大多数开发人员都熟悉 `Redis`。从本质上讲，`Redis` 是一个属于键值家族的 NoSQL 数据库，可以用作缓存、消息代理、流处理和主数据库。开发人员选择 `Redis` 是因为它速度快，拥有庞大的客户端库生态系统，并且多年来已被主要企业部署。

在这些传统用例的基础上，`Redis` 提供了额外的功能，如搜索和查询能力，允许用户在 `Redis` 中创建二级索引结构。这使得 `Redis` 能够以缓存的速度成为一个向量数据库。


### Redis 作为向量数据库

`Redis` 使用压缩的倒排索引进行快速索引，内存占用低。它还支持许多高级功能，例如：

* 在 Redis 哈希和 `JSON` 中索引多个字段
* 向量相似性搜索（使用 `HNSW`（近似最近邻）或 `FLAT`（KNN））
* 向量范围搜索（例如，查找查询向量半径内的所有向量）
* 增量索引，无性能损失
* 文档排名（使用 [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)，可选用户提供的权重）
* 字段加权
* 复杂布尔查询，使用 `AND`、`OR` 和 `NOT` 操作符
* 前缀匹配、模糊匹配和精确短语查询
* 支持 [双重隐喻音匹配](https://redis.io/docs/stack/search/reference/phonetic_matching/)
* 自动完成建议（带模糊前缀建议）
* 基于词干的查询扩展，支持 [多种语言](https://redis.io/docs/stack/search/reference/stemming/)（使用 [Snowball](http://snowballstem.org/)）
* 支持中文分词和查询（使用 [Friso](https://github.com/lionsoul2014/friso)）
* 数值过滤和范围
* 使用 Redis 地理空间索引的地理空间搜索
* 强大的聚合引擎
* 支持所有 `utf-8` 编码的文本
* 检索完整文档、选定字段或仅文档 ID
* 排序结果（例如，按创建日期）

### 客户端

由于 `Redis` 不仅仅是一个向量数据库，因此通常会有使用 `Redis` 客户端的用例，除了 `LangChain` 集成。您可以使用任何标准的 `Redis` 客户端库来运行搜索和查询命令，但使用一个封装了搜索和查询 API 的库是最简单的。以下是一些示例，但您可以在 [这里](https://redis.io/resources/clients/) 找到更多客户端库。

| 项目 | 语言 | 许可证 | 作者 | 星标 |
|----------|---------|--------|---------|-------|
| [jedis][jedis-url] | Java | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | Python | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | Python | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/redis/redis-vl-python
[redisvl-stars]: https://img.shields.io/github/stars/redis/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=星标&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=星标&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=星标&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=星标&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000


### 部署选项

有多种方式可以部署Redis与RediSearch。最简单的入门方法是使用Docker，但还有许多潜在的部署选项，例如

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- 云市场: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa), [Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1), 或 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- 本地部署: [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- Kubernetes: [Redis Enterprise Software on Kubernetes](https://docs.redis.com/latest/kubernetes/)
  
### Redis连接Url模式

有效的Redis Url模式有：
1. `redis://`  - 连接到Redis独立版，未加密
2. `rediss://` - 连接到独立的Redis，使用TLS加密
3. `redis+sentinel://` - 通过Redis Sentinel连接到Redis服务器，不加密
4. `rediss+sentinel://` - 通过Redis Sentinel连接到Redis服务器，两个连接均使用TLS加密

有关其他连接参数的更多信息，请参阅[redis-py文档](https://redis-py.readthedocs.io/en/stable/connections.html)。

## 设置

要使用RedisVectorStore，您需要安装`langchain-redis`第三方库，以及本笔记本中使用的其他库。


```python
%pip install -qU langchain-redis langchain-huggingface sentence-transformers scikit-learn
```
```output
Note: you may need to restart the kernel to use updated packages.
```
### 凭证

Redis 连接凭证作为 Redis 连接 URL 的一部分传递。Redis 连接 URL 是多功能的，可以适应各种 Redis 服务器拓扑和认证方法。这些 URL 遵循特定格式，包括连接协议、认证细节、主机、端口和数据库信息。
Redis 连接 URL 的基本结构是：

```
[protocol]://[auth]@[host]:[port]/[database]
```

其中：

* 协议可以是 redis（标准连接）、rediss（SSL/TLS 连接）或 redis+sentinel（哨兵连接）。
* auth 包括用户名和密码（如果适用）。
* host 是 Redis 服务器的主机名或 IP 地址。
* port 是 Redis 服务器的端口。
* database 是 Redis 数据库编号。

Redis 连接 URL 支持各种配置，包括：

* 独立的 Redis 服务器（有或没有认证）
* Redis Sentinel 设置
* SSL/TLS 加密连接
* 不同的认证方法（仅密码或用户名-密码）

以下是不同配置的 Redis 连接 URL 示例：


```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### 使用 Docker 启动 Redis 实例

要在 LangChain 中使用 Redis，您需要一个正在运行的 Redis 实例。您可以使用 Docker 启动一个：

```bash
docker run -d -p 6379:6379 redis/redis-stack:latest
```

在这个示例中，我们将使用本地 Redis 实例。如果您使用的是远程实例，您需要相应地修改 Redis URL。


```python
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
print(f"Connecting to Redis at: {REDIS_URL}")
```
```output
Connecting to Redis at: redis://redis:6379
```
如果您想自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

让我们通过 ping 它来检查 Redis 是否正常运行：


```python
import redis

redis_client = redis.from_url(REDIS_URL)
redis_client.ping()
```



```output
True
```


### 示例数据

20个新闻组数据集包含大约18000条关于20个主题的新闻组帖子。我们将使用一个子集进行演示，并专注于两个类别：'alt.atheism' 和 'sci.space'：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain.docstore.document", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Redis Vector Store"}]-->
from langchain.docstore.document import Document
from sklearn.datasets import fetch_20newsgroups

categories = ["alt.atheism", "sci.space"]
newsgroups = fetch_20newsgroups(
    subset="train", categories=categories, shuffle=True, random_state=42
)

# Use only the first 250 documents
texts = newsgroups.data[:250]
metadata = [
    {"category": newsgroups.target_names[target]} for target in newsgroups.target[:250]
]

len(texts)
```



```output
250
```


## 初始化

RedisVectorStore 实例可以通过几种方式初始化：

- `RedisVectorStore.__init__` - 直接初始化
- `RedisVectorStore.from_texts` - 从文本列表初始化（可选带元数据）
- `RedisVectorStore.from_documents` - 从一组 `langchain_core.documents.Document` 对象初始化
- `RedisVectorStore.from_existing_index` - 从现有的 Redis 索引初始化

下面我们将使用 `RedisVectorStore.__init__` 方法，使用一个 `RedisConfig` 实例。

import EmbeddingTabs from "@theme/EmbeddingTabs";

<EmbeddingTabs/>


我们将使用 SentenceTransformer 模型来创建嵌入。该模型在本地运行，不需要 API 密钥。


```python
from langchain_redis import RedisConfig, RedisVectorStore

config = RedisConfig(
    index_name="newsgroups",
    redis_url=REDIS_URL,
    metadata_schema=[
        {"name": "category", "type": "tag"},
    ],
)

vector_store = RedisVectorStore(embeddings, config=config)
```

## 管理向量存储

### 向向量存储添加项目


```python
ids = vector_store.add_texts(texts, metadata)

print(ids[0:10])
```
```output
['newsgroups:f1e788ee61fe410daa8ef941dd166223', 'newsgroups:80b39032181f4299a359a9aaed6e2401', 'newsgroups:99a3efc1883647afba53d115b49e6e92', 'newsgroups:503a6c07cd71418eb71e11b42589efd7', 'newsgroups:7351210e32d1427bbb3c7426cf93a44f', 'newsgroups:4e79fdf67abe471b8ee98ba0e8a1a055', 'newsgroups:03559a1d574e4f9ca0479d7b3891402e', 'newsgroups:9a1c2a7879b8409a805db72feac03580', 'newsgroups:3578a1e129f5435f9743cf803413f37a', 'newsgroups:9f68baf4d6b04f1683d6b871ce8ad92d']
```
让我们检查第一个文档：


```python
texts[0], metadata[0]
```



```output
('From: bil@okcforum.osrhe.edu (Bill Conner)\nSubject: Re: Not the Omni!\nNntp-Posting-Host: okcforum.osrhe.edu\nOrganization: Okcforum Unix Users Group\nX-Newsreader: TIN [version 1.1 PL6]\nLines: 18\n\nCharley Wingate (mangoe@cs.umd.edu) wrote:\n: \n: >> Please enlighten me.  How is omnipotence contradictory?\n: \n: >By definition, all that can occur in the universe is governed by the rules\n: >of nature. Thus god cannot break them. Anything that god does must be allowed\n: >in the rules somewhere. Therefore, omnipotence CANNOT exist! It contradicts\n: >the rules of nature.\n: \n: Obviously, an omnipotent god can change the rules.\n\nWhen you say, "By definition", what exactly is being defined;\ncertainly not omnipotence. You seem to be saying that the "rules of\nnature" are pre-existant somehow, that they not only define nature but\nactually cause it. If that\'s what you mean I\'d like to hear your\nfurther thoughts on the question.\n\nBill\n',
 {'category': 'alt.atheism'})
```


### 从向量存储删除项目


```python
# Delete documents by passing one or more keys/ids
vector_store.index.drop_keys(ids[0])
```



```output
1
```


### 检查创建的索引

一旦构建了 ``Redis`` VectorStore 对象，如果索引尚不存在，则将在 Redis 中创建一个索引。可以使用 ``rvl`` 和 ``redis-cli`` 命令行工具检查该索引。如果您在上面安装了 ``redisvl``，可以使用 ``rvl`` 命令行工具检查索引。


```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall --port 6379
```
```output
[32m17:54:50[0m [34m[RedisVL][0m [1;30mINFO[0m   Using Redis address from environment variable, REDIS_URL
[32m17:54:50[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m17:54:50[0m [34m[RedisVL][0m [1;30mINFO[0m   1. newsgroups
```
``Redis`` VectorStore 实现将尝试为通过 ``from_texts``、``from_texts_return_keys`` 和 ``from_documents`` 方法传递的任何元数据生成索引架构（过滤字段）。这样，传递的任何元数据都将被索引到 Redis 搜索索引中，允许
对这些字段进行过滤。

下面我们展示了从我们上面定义的元数据创建的字段


```python
!rvl index info -i newsgroups --port 6379
```
```output
[32m17:54:50[0m [34m[RedisVL][0m [1;30mINFO[0m   Using Redis address from environment variable, REDIS_URL


Index Information:
╭──────────────┬────────────────┬────────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes       │ Index Options   │   Indexing │
├──────────────┼────────────────┼────────────────┼─────────────────┼────────────┤
│ newsgroups   │ HASH           │ ['newsgroups'] │ []              │          0 │
╰──────────────┴────────────────┴────────────────┴─────────────────┴────────────╯
Index Fields:
╭───────────┬─────────────┬────────┬────────────────┬────────────────┬────────────────┬────────────────┬────────────────┬────────────────┬─────────────────┬────────────────╮
│ Name      │ Attribute   │ Type   │ Field Option   │ Option Value   │ Field Option   │ Option Value   │ Field Option   │   Option Value │ Field Option    │ Option Value   │
├───────────┼─────────────┼────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┼─────────────────┼────────────────┤
│ text      │ text        │ TEXT   │ WEIGHT         │ 1              │                │                │                │                │                 │                │
│ embedding │ embedding   │ VECTOR │ algorithm      │ FLAT           │ data_type      │ FLOAT32        │ dim            │            768 │ distance_metric │ COSINE         │
│ category  │ category    │ TAG    │ SEPARATOR      │ |              │                │                │                │                │                 │                │
╰───────────┴─────────────┴────────┴────────────────┴────────────────┴────────────────┴────────────────┴────────────────┴────────────────┴─────────────────┴────────────────╯
```

```python
!rvl stats -i newsgroups --port 6379
```
```output
[32m17:54:51[0m [34m[RedisVL][0m [1;30mINFO[0m   Using Redis address from environment variable, REDIS_URL

Statistics:
╭─────────────────────────────┬────────────╮
│ Stat Key                    │ Value      │
├─────────────────────────────┼────────────┤
│ num_docs                    │ 249        │
│ num_terms                   │ 16178      │
│ max_doc_id                  │ 250        │
│ num_records                 │ 50394      │
│ percent_indexed             │ 1          │
│ hash_indexing_failures      │ 0          │
│ number_of_uses              │ 2          │
│ bytes_per_record_avg        │ 38.2743    │
│ doc_table_size_mb           │ 0.0263586  │
│ inverted_sz_mb              │ 1.83944    │
│ key_table_size_mb           │ 0.00932026 │
│ offset_bits_per_record_avg  │ 10.6699    │
│ offset_vectors_sz_mb        │ 0.089057   │
│ offsets_per_term_avg        │ 1.38937    │
│ records_per_doc_avg         │ 202.386    │
│ sortable_values_size_mb     │ 0          │
│ total_indexing_time         │ 72.444     │
│ total_inverted_index_blocks │ 16207      │
│ vector_index_sz_mb          │ 3.01776    │
╰─────────────────────────────┴────────────╯
```
## 查询向量存储

一旦您的向量存储创建完成并添加了相关文档，您很可能希望在运行链或代理时查询它。

### 直接查询

执行简单的相似性搜索可以如下进行：


```python
query = "Tell me about space exploration"
results = vector_store.similarity_search(query, k=2)

print("Simple Similarity Search Results:")
for doc in results:
    print(f"Content: {doc.page_content[:100]}...")
    print(f"Metadata: {doc.metadata}")
    print()
```
```output
Simple Similarity Search Results:
Content: From: aa429@freenet.carleton.ca (Terry Ford)
Subject: A flawed propulsion system: Space Shuttle
X-Ad...
Metadata: {'category': 'sci.space'}

Content: From: nsmca@aurora.alaska.edu
Subject: Space Design Movies?
Article-I.D.: aurora.1993Apr23.124722.1
...
Metadata: {'category': 'sci.space'}
```
如果您想执行相似性搜索并接收相应的分数，可以运行：


```python
# Similarity search with score and filter
scored_results = vector_store.similarity_search_with_score(query, k=2)

print("Similarity Search with Score Results:")
for doc, score in scored_results:
    print(f"Content: {doc.page_content[:100]}...")
    print(f"Metadata: {doc.metadata}")
    print(f"Score: {score}")
    print()
```
```output
Similarity Search with Score Results:
Content: From: aa429@freenet.carleton.ca (Terry Ford)
Subject: A flawed propulsion system: Space Shuttle
X-Ad...
Metadata: {'category': 'sci.space'}
Score: 0.569670975208

Content: From: nsmca@aurora.alaska.edu
Subject: Space Design Movies?
Article-I.D.: aurora.1993Apr23.124722.1
...
Metadata: {'category': 'sci.space'}
Score: 0.590400338173
```
### 通过转换为检索器查询

您还可以将向量存储转换为检索器，以便在您的链中更方便地使用。


```python
retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 2})
retriever.invoke("What planet in the solar system has the largest number of moons?")
```



```output
[Document(metadata={'category': 'sci.space'}, page_content='Subject: Re: Comet in Temporary Orbit Around Jupiter?\nFrom: Robert Coe <bob@1776.COM>\nDistribution: world\nOrganization: 1776 Enterprises, Sudbury MA\nLines: 23\n\njgarland@kean.ucs.mun.ca writes:\n\n> >> Also, perihelions of Gehrels3 were:\n> >> \n> >> April  1973     83 jupiter radii\n> >> August 1970     ~3 jupiter radii\n> > \n> > Where 1 Jupiter radius = 71,000 km = 44,000 mi = 0.0005 AU.  So the\n> > 1970 figure seems unlikely to actually be anything but a perijove.\n> > Is that the case for the 1973 figure as well?\n> > -- \n> Sorry, _perijoves_...I\'m not used to talking this language.\n\nHmmmm....  The prefix "peri-" is Greek, not Latin, so it\'s usually used\nwith the Greek form of the name of the body being orbited.  (That\'s why\nit\'s "perihelion" rather than "perisol", "perigee" rather than "periterr",\nand "pericynthion" rather than "perilune".)  So for Jupiter I\'d expect it\nto be something like "perizeon".)   :^)\n\n   ___            _                                           -  Bob\n   /__) _   /    / ) _   _\n(_/__) (_)_(_)  (___(_)_(/_______________________________________ bob@1776.COM\nRobert K. Coe ** 14 Churchill St, Sudbury, Massachusetts 01776 ** 508-443-3265\n'),
 Document(metadata={'category': 'sci.space'}, page_content='From: pyron@skndiv.dseg.ti.com (Dillon Pyron)\nSubject: Re: Why not give $1 billion to first year-long moon residents?\nLines: 42\nNntp-Posting-Host: skndiv.dseg.ti.com\nReply-To: pyron@skndiv.dseg.ti.com\nOrganization: TI/DSEG VAX Support\n\n\nIn article <1qve4kINNpas@sal-sun121.usc.edu>, schaefer@sal-sun121.usc.edu (Peter Schaefer) writes:\n>In article <1993Apr19.130503.1@aurora.alaska.edu>, nsmca@aurora.alaska.edu writes:\n>|> In article <6ZV82B2w165w@theporch.raider.net>, gene@theporch.raider.net (Gene Wright) writes:\n>|> > With the continuin talk about the "End of the Space Age" and complaints \n>|> > by government over the large cost, why not try something I read about \n>|> > that might just work.\n>|> > \n>|> > Announce that a reward of $1 billion would go to the first corporation \n>|> > who successfully keeps at least 1 person alive on the moon for a year. \n>|> > Then you\'d see some of the inexpensive but not popular technologies begin \n>|> > to be developed. THere\'d be a different kind of space race then!\n>|> > \n>|> > --\n>|> >   gene@theporch.raider.net (Gene Wright)\n>|> > theporch.raider.net  615/297-7951 The MacInteresteds of Nashville\n>|> ====\n>|> If that were true, I\'d go for it.. I have a few friends who we could pool our\n>|> resources and do it.. Maybe make it a prize kind of liek the "Solar Car Race"\n>|> in Australia..\n>|> Anybody game for a contest!\n>|> \n>|> ==\n>|> Michael Adams, nsmca@acad3.alaska.edu -- I\'m not high, just jacked\n>\n>\n>Oh gee, a billion dollars!  That\'d be just about enough to cover the cost of the\n>feasability study!  Happy, Happy, JOY! JOY!\n>\n\nFeasability study??  What a wimp!!  While you are studying, others would be\ndoing.  Too damn many engineers doing way too little engineering.\n\n"He who sits on his arse sits on his fortune"  - Sir Richard Francis Burton\n--\nDillon Pyron                      | The opinions expressed are those of the\nTI/DSEG Lewisville VAX Support    | sender unless otherwise stated.\n(214)462-3556 (when I\'m here)     |\n(214)492-4656 (when I\'m home)     |Texans: Vote NO on Robin Hood.  We need\npyron@skndiv.dseg.ti.com          |solutions, not gestures.\nPADI DM-54909                     |\n\n')]
```


## 用于检索增强生成的用法

有关如何使用此向量存储进行检索增强生成 (RAG) 的指南，请参见以下部分：

- [教程：使用外部知识](https://python.langchain.com/docs/tutorials/#working-with-external-knowledge)
- [如何：使用 RAG 进行问答](https://python.langchain.com/docs/how_to/#qa-with-rag)
- [检索概念文档](https://python.langchain.com/docs/concepts/#retrieval)

## Redis特定功能

Redis提供了一些独特的向量搜索功能：

### 带元数据过滤的相似性搜索
我们可以根据元数据过滤搜索结果：


```python
from redisvl.query.filter import Tag

query = "Tell me about space exploration"

# Create a RedisVL filter expression
filter_condition = Tag("category") == "sci.space"

filtered_results = vector_store.similarity_search(query, k=2, filter=filter_condition)

print("Filtered Similarity Search Results:")
for doc in filtered_results:
    print(f"Content: {doc.page_content[:100]}...")
    print(f"Metadata: {doc.metadata}")
    print()
```
```output
Filtered Similarity Search Results:
Content: From: aa429@freenet.carleton.ca (Terry Ford)
Subject: A flawed propulsion system: Space Shuttle
X-Ad...
Metadata: {'category': 'sci.space'}

Content: From: nsmca@aurora.alaska.edu
Subject: Space Design Movies?
Article-I.D.: aurora.1993Apr23.124722.1
...
Metadata: {'category': 'sci.space'}
```
### 最大边际相关性搜索
最大边际相关性搜索有助于获得多样化的结果：


```python
# Maximum marginal relevance search with filter
mmr_results = vector_store.max_marginal_relevance_search(
    query, k=2, fetch_k=10, filter=filter_condition
)

print("Maximum Marginal Relevance Search Results:")
for doc in mmr_results:
    print(f"Content: {doc.page_content[:100]}...")
    print(f"Metadata: {doc.metadata}")
    print()
```
```output
Maximum Marginal Relevance Search Results:
Content: From: aa429@freenet.carleton.ca (Terry Ford)
Subject: A flawed propulsion system: Space Shuttle
X-Ad...
Metadata: {'category': 'sci.space'}

Content: From: moroney@world.std.com (Michael Moroney)
Subject: Re: Vulcan? (No, not the guy with the ears!)
...
Metadata: {'category': 'sci.space'}
```
## 链的使用
下面的代码展示了如何在简单的RAG链中使用向量存储作为检索器：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Redis Vector Store"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Redis Vector Store"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Redis Vector Store"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context} 
Answer:""",
        ),
    ]
)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("Describe the Space Shuttle program?")
```



```output
'The Space Shuttle program was a NASA initiative that enabled reusable spacecraft to transport astronauts and cargo to and from low Earth orbit. It conducted a variety of missions, including satellite deployment, scientific research, and assembly of the International Space Station, and typically carried a crew of five astronauts. Although it achieved many successes, the program faced criticism for its safety concerns and the complexity of its propulsion system.'
```


## 连接到现有索引

为了在使用 ``Redis`` 向量存储时拥有相同的元数据索引，您需要将相同的 ``index_schema`` 作为 yaml 文件的路径或字典传递。以下显示了如何从索引获取模式并连接到现有索引。


```python
# write the schema to a yaml file
vector_store.index.schema.to_yaml("redis_schema.yaml")
```


```python
# now we can connect to our existing index as follows

new_rdvs = RedisVectorStore(
    embeddings,
    redis_url=REDIS_URL,
    schema_path="redis_schema.yaml",
)

results = new_rdvs.similarity_search("Space Shuttle Propulsion System", k=3)
print(results[0])
```
```output
18:19:58 redisvl.index.index INFO   Index already exists, not overwriting.
page_content='From: aa429@freenet.carleton.ca (Terry Ford)
Subject: A flawed propulsion system: Space Shuttle
X-Added: Forwarded by Space Digest
Organization: [via International Space University]
Original-Sender: isu@VACATION.VENARI.CS.CMU.EDU
Distribution: sci
Lines: 13



For an essay, I am writing about the space shuttle and a need for a better
propulsion system.  Through research, I have found that it is rather clumsy 
(i.e. all the checks/tests before launch), the safety hazards ("sitting
on a hydrogen bomb"), etc..  If you have any beefs about the current
space shuttle program Re: propulsion, please send me your ideas.

Thanks a lot.

--
Terry Ford [aa429@freenet.carleton.ca]
Nepean, Ontario, Canada.
' metadata={'category': 'sci.space'}
```

```python
# compare the two schemas to verify they are the same
new_rdvs.index.schema == vector_store.index.schema
```



```output
True
```


## 清理向量存储


```python
# Clear vector store
vector_store.index.delete(drop=True)
```

## API 参考

有关所有 RedisVectorStore 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/redis/vectorstores/langchain_redis.vectorstores.RedisVectorStore.html


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
