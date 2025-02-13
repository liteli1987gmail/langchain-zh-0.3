---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/docarray_in_memory.ipynb
---
# DocArray 内存搜索

>[DocArrayInMemorySearch](https://docs.docarray.org/user_guide/storing/index_in_memory/) 是由 [Docarray](https://github.com/docarray/docarray) 提供的文档索引，能够将文档存储在内存中。对于小型数据集来说，这是一个很好的起点，因为您可能不想启动数据库服务器。

本笔记本展示了如何使用与 `DocArrayInMemorySearch` 相关的功能。

## 设置

取消注释下面的单元格以安装 docarray，并获取/设置您的 OpenAI API 密钥（如果您尚未这样做）。


```python
%pip install --upgrade --quiet  langchain-community "docarray"
```


```python
# Get an OpenAI token: https://platform.openai.com/account/api-keys

# import os
# from getpass import getpass

# OPENAI_API_KEY = getpass()

# os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## 使用 DocArrayInMemorySearch


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "DocArray InMemorySearch"}, {"imported": "DocArrayInMemorySearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.docarray.in_memory.DocArrayInMemorySearch.html", "title": "DocArray InMemorySearch"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "DocArray InMemorySearch"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "DocArray InMemorySearch"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import DocArrayInMemorySearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = DocArrayInMemorySearch.from_documents(docs, embeddings)
```

### 相似性搜索


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
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
### 带分数的相似性搜索

返回的距离分数是余弦距离。因此，分数越低越好。


```python
docs = db.similarity_search_with_score(query)
```


```python
docs[0]
```



```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={}),
 0.8154190158347903)
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
