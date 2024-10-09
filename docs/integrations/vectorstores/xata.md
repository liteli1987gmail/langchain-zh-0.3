---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/xata.ipynb
---
# Xata

> [Xata](https://xata.io) 是一个基于 PostgreSQL 的无服务器数据平台。它提供了一个用于与数据库交互的 Python SDK，以及一个用于管理数据的用户界面。
> Xata 具有原生向量类型，可以添加到任何表中，并支持相似性搜索。LangChain 直接将向量插入到 Xata，并查询给定向量的最近邻，以便您可以使用所有 LangChain 嵌入集成与 Xata。

本笔记本指导您如何将 Xata 用作向量存储。

## 设置

### 创建一个数据库以用作向量存储

在 [Xata UI](https://app.xata.io) 中创建一个新数据库。您可以随意命名，在本笔记本中我们将使用 `langchain`。
创建一个表，您可以随意命名，但我们将使用 `vectors`。通过用户界面添加以下列：

* `content` 类型为 "Text"。用于存储 `Document.pageContent` 值。
* `embedding` 类型为 "Vector"。使用您计划使用的模型所用的维度。在本笔记本中，我们使用 OpenAI 嵌入，具有 1536 维度。
* `source` 类型为 "文本"。这个字段被用作该示例的元数据列。
* 任何其他你想用作元数据的列。它们从 `Document.metadata` 对象中填充。例如，如果在 `Document.metadata` 对象中你有一个 `title` 属性，你可以在表中创建一个 `title` 列，它将被填充。


让我们首先安装我们的依赖项：


```python
%pip install --upgrade --quiet  xata langchain-openai langchain-community tiktoken langchain
```

让我们将OpenAI密钥加载到环境中。如果你没有密钥，可以在这个[页面](https://platform.openai.com/account/api-keys)上创建一个OpenAI账户并生成密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

同样，我们需要获取Xata的环境变量。你可以通过访问你的[账户设置](https://app.xata.io/settings)来创建一个新的API密钥。要找到数据库URL，请转到你创建的数据库的设置页面。数据库URL应该类似于：`https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`。


```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Xata"}, {"imported": "XataVectorStore", "source": "langchain_community.vectorstores.xata", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.xata.XataVectorStore.html", "title": "Xata"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Xata"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Xata"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### 创建Xata向量存储
让我们导入我们的测试数据集：


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

现在创建实际的向量存储，基于Xata表。


```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

运行上述命令后，如果你去Xata UI，你应该会看到加载的文档及其嵌入。
要使用已经包含向量内容的现有Xata表，请初始化XataVectorStore构造函数：


```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
```

### 相似性搜索


```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### 带分数的相似性搜索（向量距离）


```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
