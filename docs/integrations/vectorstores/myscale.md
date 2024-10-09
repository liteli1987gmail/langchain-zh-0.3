---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/myscale.ipynb
---
# MyScale

>[MyScale](https://docs.myscale.com/en/overview/) 是一个基于云的数据库，针对 AI 应用和解决方案进行了优化，构建于开源的 [ClickHouse](https://github.com/ClickHouse/ClickHouse) 之上。

本笔记本展示了如何使用与 `MyScale` 向量数据库相关的功能。

## 设置环境


```python
%pip install --upgrade --quiet  clickhouse-connect langchain-community
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
if "OPENAI_API_BASE" not in os.environ:
    os.environ["OPENAI_API_BASE"] = getpass.getpass("OpenAI Base:")
if "MYSCALE_HOST" not in os.environ:
    os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale Host:")
if "MYSCALE_PORT" not in os.environ:
    os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
if "MYSCALE_USERNAME" not in os.environ:
    os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
if "MYSCALE_PASSWORD" not in os.environ:
    os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

有两种方法可以为 myscale 索引设置参数。

1. 环境变量

在运行应用程序之前，请使用 `export` 设置环境变量：
`export MYSCALE_HOST='<your-endpoints-url>' MYSCALE_PORT=<your-endpoints-port> MYSCALE_USERNAME=<your-username> MYSCALE_PASSWORD=<your-password> ...`

您可以在我们的 SaaS 上轻松找到您的帐户、密码和其他信息。有关详细信息，请参阅 [此文档](https://docs.myscale.com/en/cluster-management/)

`MyScaleSettings` 下的每个属性都可以使用前缀 `MYSCALE_` 设置，并且不区分大小写。

2. 创建带参数的 `MyScaleSettings` 对象


    ```python
    from langchain_community.vectorstores import MyScale, MyScaleSettings
    config = MyScaleSetting(host="<your-backend-url>", port=8443, ...)
    index = MyScale(embedding_function, config)
    index.add_documents(...)
    ```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "MyScale"}, {"imported": "MyScale", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.myscale.MyScale.html", "title": "MyScale"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "MyScale"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "MyScale"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "MyScale"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```


```python
for d in docs:
    d.metadata = {"some": "metadata"}
docsearch = MyScale.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```
```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.66it/s]
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
## 获取连接信息和数据模式


```python
print(str(docsearch))
```

## 过滤

您可以直接访问 myscale SQL 的 WHERE 语句。您可以按照标准 SQL 编写 `WHERE` 子句。

**注意**：请注意 SQL 注入，此接口不得直接由最终用户调用。

如果您在设置中自定义了 `column_map`，您可以使用如下过滤进行搜索：


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "MyScale"}, {"imported": "MyScale", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.myscale.MyScale.html", "title": "MyScale"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = MyScale.from_documents(docs, embeddings)
```
```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.68it/s]
```
### 带分数的相似性搜索

返回的距离分数是余弦距离。因此，分数越低越好。


```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```
```output
0.229655921459198 {'doc_id': 0} Madam Speaker, Madam...
0.24506962299346924 {'doc_id': 8} And so many families...
0.24786919355392456 {'doc_id': 1} Groups of citizens b...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
```
## 删除您的数据

您可以使用 `.drop()` 方法删除表，或使用 `.delete()` 方法部分删除您的数据。


```python
# use directly a `where_str` to delete
docsearch.delete(where_str=f"{docsearch.metadata_column}.doc_id < 5")
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```
```output
0.24506962299346924 {'doc_id': 8} And so many families...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
0.26027143001556396 {'doc_id': 7} We see the unity amo...
0.26390212774276733 {'doc_id': 9} And unlike the $2 Tr...
```

```python
docsearch.drop()
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
