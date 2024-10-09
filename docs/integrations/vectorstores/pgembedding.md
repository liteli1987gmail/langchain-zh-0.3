---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/pgembedding.ipynb
---
# Postgres 嵌入

> [Postgres 嵌入](https://github.com/neondatabase/pg_embedding) 是一个开源的向量相似性搜索工具，适用于 `Postgres`，使用 `层次可导航小世界 (HNSW)` 进行近似最近邻搜索。

> 它支持：
>- 使用 HNSW 进行精确和近似最近邻搜索
>- L2 距离

本笔记本展示了如何使用 Postgres 向量数据库 (`PGEmbedding`)。

> PGEmbedding 集成为您创建了 pg_embedding 扩展，但您需要运行以下 Postgres 查询来添加它：
```sql
CREATE EXTENSION embedding;
```


```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai langchain-community
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

将 OpenAI API 密钥添加到环境变量中以使用 `OpenAIEmbeddings`。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```
```output
OpenAI API Key:········
```

```python
## Loading Environment Variables
from typing import List, Tuple
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Postgres Embedding"}, {"imported": "PGEmbedding", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.pgembedding.PGEmbedding.html", "title": "Postgres Embedding"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Postgres Embedding"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Postgres Embedding"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Postgres Embedding"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import PGEmbedding
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = getpass.getpass("Database Url:")
```
```output
Database Url:········
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
connection_string = os.environ.get("DATABASE_URL")
collection_name = "state_of_the_union"
```


```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db.similarity_search_with_score(query)
```


```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

## 在 Postgres 中使用向量存储

### 在 PG 中上传向量存储


```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
    pre_delete_collection=False,
)
```

### 创建 HNSW 索引
默认情况下，该扩展执行顺序扫描搜索，召回率为 100%。您可能考虑为近似最近邻 (ANN) 搜索创建 HNSW 索引，以加快 `similarity_search_with_score` 的执行时间。要在您的向量列上创建 HNSW 索引，请使用 `create_hnsw_index` 函数：


```python
PGEmbedding.create_hnsw_index(
    max_elements=10000, dims=1536, m=8, ef_construction=16, ef_search=16
)
```

上述函数等同于运行以下 SQL 查询：
```sql
CREATE INDEX ON vectors USING hnsw(vec) WITH (maxelements=10000, dims=1536, m=3, efconstruction=16, efsearch=16);
```
上述语句中使用的 HNSW 索引选项包括：

- maxelements: 定义索引的最大元素数量。这是一个必需的参数。上面示例的值为 3。实际应用中的值会大得多，例如 1000000。一个“元素”指的是数据集中一个数据点（一个向量），在 HNSW 图中表示为一个节点。通常，您会将此选项设置为能够容纳数据集中行数的值。
- dims: 定义向量数据中的维度数量。这是一个必需的参数。上面示例中使用了一个较小的值。如果您存储的是使用 OpenAI 的 text-embedding-ada-002 模型生成的数据，该模型支持 1536 维度，则您可以定义值为 1536，例如。
- m: 定义在图构建过程中为每个节点创建的最大双向链接（也称为“边”）数量。
支持以下附加索引选项：

- efConstruction：定义在索引构建过程中考虑的最近邻居数量。默认值为32。
- efsearch：定义在索引搜索过程中考虑的最近邻居数量。默认值为32。
有关如何配置这些选项以影响HNSW算法的信息，请参阅[Tuning the HNSW algorithm](https://neon.tech/docs/extensions/pg_embedding#tuning-the-hnsw-algorithm)。

### 在PG中检索向量存储


```python
store = PGEmbedding(
    connection_string=connection_string,
    embedding_function=embeddings,
    collection_name=collection_name,
)

retriever = store.as_retriever()
```


```python
retriever
```



```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.pghnsw.HNSWVectoreStore object at 0x121d3c8b0>, search_type='similarity', search_kwargs={})
```



```python
db1 = PGEmbedding.from_existing_index(
    embedding=embeddings,
    collection_name=collection_name,
    pre_delete_collection=False,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db1.similarity_search_with_score(query)
```


```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```


## 相关

- 向量存储[概念指南](/docs/concepts/#vector-stores)
- 向量存储[操作指南](/docs/how_to/#vector-stores)
