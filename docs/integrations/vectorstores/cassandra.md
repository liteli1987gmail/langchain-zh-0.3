---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/cassandra.ipynb
---
# Apache Cassandra

本页面提供了使用 [Apache Cassandra®](https://cassandra.apache.org/) 作为向量存储的快速入门。

> [Cassandra](https://cassandra.apache.org/) 是一个 NoSQL、行导向、高度可扩展和高度可用的数据库。从 5.0 版本开始，数据库提供了 [向量搜索功能](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html)。

_注意：除了访问数据库外，还需要一个 OpenAI API 密钥才能运行完整示例._

### 设置和一般依赖

使用该集成需要以下 Python 包。


```python
%pip install --upgrade --quiet langchain-community "cassio>=0.1.4"
```

_注意：根据您的 LangChain 设置，您可能需要安装/升级此演示所需的其他依赖项_
_（具体来说，需要最近版本的 `datasets`、`openai`、`pypdf` 和 `tiktoken`，以及 `langchain-community`）。_


```python
<!--IMPORTS:[{"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "Apache Cassandra"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Apache Cassandra"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Apache Cassandra"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Apache Cassandra"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Apache Cassandra"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Apache Cassandra"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Apache Cassandra"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Apache Cassandra"}]-->
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```


```python
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```


```python
embe = OpenAIEmbeddings()
```

## 导入向量存储


```python
<!--IMPORTS:[{"imported": "Cassandra", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.cassandra.Cassandra.html", "title": "Apache Cassandra"}]-->
from langchain_community.vectorstores import Cassandra
```

## 连接参数

本页面显示的向量存储集成可以与 Cassandra 以及其他派生数据库（如使用 CQL（Cassandra 查询语言）协议的 Astra DB）一起使用。

> DataStax [Astra DB](https://docs.datastax.com/en/astra-serverless/docs/vector-search/quickstart.html) 是一个基于 Cassandra 的托管无服务器数据库，提供相同的接口和优势。

根据您是通过 CQL 连接到 Cassandra 集群还是 Astra DB，您在创建向量存储对象时将提供不同的参数。

### 连接到 Cassandra 集群

您首先需要创建一个 `cassandra.cluster.Session` 对象，如 [Cassandra 驱动程序文档](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster) 中所述。具体细节会有所不同（例如，网络设置和身份验证），但这可能类似于：


```python
from cassandra.cluster import Cluster

cluster = Cluster(["127.0.0.1"])
session = cluster.connect()
```

您现在可以将会话以及您所需的键空间名称设置为全局 CassIO 参数：


```python
import cassio

CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")

cassio.init(session=session, keyspace=CASSANDRA_KEYSPACE)
```

现在您可以创建向量存储：


```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

_注意：您还可以在创建向量存储时直接将会话和键空间作为参数传递。然而，使用全局 `cassio.init` 设置会很方便，如果您的应用程序以多种方式使用 Cassandra（例如，用于向量存储、聊天记忆和大型语言模型响应缓存），因为它允许在一个地方集中管理凭证和数据库连接。_

### 通过 CQL 连接到 Astra DB

在这种情况下，您需要使用以下连接参数初始化 CassIO：

- 数据库 ID，例如 `01234567-89ab-cdef-0123-456789abcdef`
- 令牌，例如 `AstraCS:6gBhNmsk135....`（它必须是“数据库管理员”令牌）
- 可选的键空间名称（如果省略，将使用数据库的默认键空间）


```python
ASTRA_DB_ID = input("ASTRA_DB_ID = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_keyspace = input("ASTRA_DB_KEYSPACE (optional, can be left empty) = ")
if desired_keyspace:
    ASTRA_DB_KEYSPACE = desired_keyspace
else:
    ASTRA_DB_KEYSPACE = None
```


```python
import cassio

cassio.init(
    database_id=ASTRA_DB_ID,
    token=ASTRA_DB_APPLICATION_TOKEN,
    keyspace=ASTRA_DB_KEYSPACE,
)
```

现在您可以创建向量存储：


```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

## 加载数据集

将源数据集中的每个条目转换为 `文档`，然后将它们写入向量存储：


```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

在上面，`metadata` 字典是从源数据创建的，并且是 `Document` 的一部分。

添加更多条目，这次使用 `add_texts`：


```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_注意：您可能希望通过提高并发级别来加快 `add_texts` 和 `add_documents` 的执行速度_
_这些批量操作 - 查看方法的 `batch_size` 参数_
_以获取更多详细信息。根据网络和客户端机器的规格，您最佳的参数选择可能会有所不同。_

## 运行搜索

本节演示了元数据过滤和获取相似性分数：


```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```


```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```


```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### MMR（最大边际相关性）搜索


```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

## 删除存储的文档


```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```


```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## 一个最小的 RAG 链

接下来的单元将实现一个简单的RAG管道：
- 下载一个示例PDF文件并将其加载到存储中；
- 创建一个以LCEL（LangChain表达式语言）为基础的RAG链，向量存储是其核心；
- 运行问答链。


```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```


```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```


```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

欲了解更多，请查看使用Astra DB通过CQL的完整RAG模板[这里](https://github.com/langchain-ai/langchain/tree/master/templates/cassandra-entomology-rag)。

## 清理

以下内容基本上从CassIO检索`Session`对象并运行CQL `DROP TABLE`语句：

_(您将丢失存储在其中的数据。)_


```python
cassio.config.resolve_session().execute(
    f"DROP TABLE {cassio.config.resolve_keyspace()}.cassandra_vector_demo;"
)
```

### 了解更多

有关更多信息、扩展快速入门和其他使用示例，请访问[CassIO文档](https://cassio.org/frameworks/langchain/about/)，以获取有关使用LangChain `Cassandra`向量存储的更多信息。

#### 归属声明

> Apache Cassandra、Cassandra 和 Apache 是 [Apache 软件基金会](http://www.apache.org/) 在美国和/或其他国家的注册商标或商标。



## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
