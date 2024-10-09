---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/dingo.ipynb
---
# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) 是一个分布式多模态向量数据库，结合了数据湖和向量数据库的特点，可以存储任何类型和大小的数据（键值对、PDF、音频、视频等）。它具有实时低延迟处理能力，以实现快速洞察和响应，并能够高效地进行即时分析和处理多模态数据。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用与 DingoDB 向量数据库相关的功能。

要运行，您应该有一个 [DingoDB 实例正在运行](https://github.com/dingodb/dingo-deploy/blob/main/README.md)。


```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

我们想使用OpenAI嵌入模型，因此我们必须获取OpenAI API密钥。


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
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "DingoDB"}, {"imported": "Dingo", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.dingo.Dingo.html", "title": "DingoDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "DingoDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "DingoDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "DingoDB"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```


```python
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "DingoDB"}, {"imported": "Dingo", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.dingo.Dingo.html", "title": "DingoDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "DingoDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "DingoDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```


```python
print(docs[0].page_content)
```

### 向现有索引添加更多文本

可以使用`add_texts`函数将更多文本嵌入并更新到现有的Dingo索引中。


```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### 最大边际相关性搜索

除了在检索器对象中使用相似性搜索外，您还可以将`mmr`用作检索器。


```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

或者直接使用`max_marginal_relevance_search`：


```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
