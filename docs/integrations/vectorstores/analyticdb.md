---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/analyticdb.ipynb
---
# AnalyticDB

>[AnalyticDB for PostgreSQL](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) 是一款大规模并行处理 (MPP) 数据仓库服务，旨在在线分析大量数据。

>`AnalyticDB for PostgreSQL` 基于开源的 `Greenplum Database` 项目开发，并由 `Alibaba Cloud` 进行了深入扩展。AnalyticDB for PostgreSQL 兼容 ANSI SQL 2003 语法以及 PostgreSQL 和 Oracle 数据库生态系统。AnalyticDB for PostgreSQL 还支持行存储和列存储。AnalyticDB for PostgreSQL 以高性能水平处理 PB 级数据，并支持高并发的在线查询。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用与 `AnalyticDB` 向量数据库相关的功能。
要运行，您应该有一个 [AnalyticDB](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) 实例正在运行：

- 使用 [AnalyticDB Cloud Vector Database](https://www.alibabacloud.com/product/hybriddb-postgresql)。点击这里快速部署。


```python
<!--IMPORTS:[{"imported": "AnalyticDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.analyticdb.AnalyticDB.html", "title": "AnalyticDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "AnalyticDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "AnalyticDB"}]-->
from langchain_community.vectorstores import AnalyticDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

通过调用 OpenAI API 分割文档并获取嵌入


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "AnalyticDB"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

通过设置相关环境变量连接到 AnalyticDB。
```
export PG_HOST={your_analyticdb_hostname}
export PG_PORT={your_analyticdb_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

然后将您的嵌入和文档存储到 AnalyticDB


```python
import os

connection_string = AnalyticDB.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = AnalyticDB.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

查询和检索数据


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
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

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
