---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/hologres.ipynb
---
# Hologres

>[Hologres](https://www.alibabacloud.com/help/en/hologres/latest/introduction) 是阿里云开发的统一实时数据仓库服务。您可以使用 Hologres 实时写入、更新、处理和分析大量数据。
>Hologres 支持标准 SQL 语法，与 PostgreSQL 兼容，并支持大多数 PostgreSQL 函数。Hologres 支持在线分析处理 (OLAP) 和针对多达 PB 级数据的临时分析，并提供高并发和低延迟的在线数据服务。

>Hologres 通过采用 [Proxima](https://www.alibabacloud.com/help/en/hologres/latest/vector-processing) 提供 **向量数据库** 功能。
>Proxima 是阿里巴巴达摩院开发的高性能软件库。它允许您搜索向量的最近邻。Proxima 提供比类似的开源软件（如 Faiss）更高的稳定性和性能。Proxima 允许您以高吞吐量和低延迟搜索相似的文本或图像嵌入。Hologres 与 Proxima 深度集成，以提供高性能的向量搜索服务。

本笔记本展示了如何使用与 `Hologres Proxima` 向量数据库相关的功能。
点击 [这里](https://www.alibabacloud.com/zh/product/hologres) 快速部署 Hologres 云实例。


```python
%pip install --upgrade --quiet  langchain_community hologres-vector
```


```python
<!--IMPORTS:[{"imported": "Hologres", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.hologres.Hologres.html", "title": "Hologres"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Hologres"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Hologres"}]-->
from langchain_community.vectorstores import Hologres
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

通过调用 OpenAI API 分割文档并获取嵌入


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Hologres"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

通过设置相关环境变量连接到 Hologres。
```
export PG_HOST={host}
export PG_PORT={port} # Optional, default is 80
export PG_DATABASE={db_name} # Optional, default is postgres
export PG_USER={username}
export PG_PASSWORD={password}
```

然后将您的嵌入和文档存储到 Hologres


```python
import os

connection_string = Hologres.connection_string_from_db_params(
    host=os.environ.get("PGHOST", "localhost"),
    port=int(os.environ.get("PGPORT", "80")),
    database=os.environ.get("PGDATABASE", "postgres"),
    user=os.environ.get("PGUSER", "postgres"),
    password=os.environ.get("PGPASSWORD", "postgres"),
)

vector_db = Hologres.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
    table_name="langchain_example_embeddings",
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
