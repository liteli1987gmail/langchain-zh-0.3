---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/usearch.ipynb
---
# USearch
>[USearch](https://unum-cloud.github.io/usearch/) 是一个更小、更快的单文件向量搜索引擎

>USearch的基本功能与FAISS相同，如果您曾经研究过近似最近邻搜索，界面应该会很熟悉。FAISS是高性能向量搜索引擎的广泛认可标准。USearch和FAISS都采用相同的HNSW算法，但在设计原则上有显著差异。USearch紧凑且广泛兼容，性能没有妥协，主要关注用户定义的度量和更少的依赖。


```python
%pip install --upgrade --quiet  usearch langchain-community
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "USearch"}, {"imported": "USearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.usearch.USearch.html", "title": "USearch"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "USearch"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "USearch"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import USearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "USearch"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```


```python
db = USearch.from_documents(docs, embeddings)

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
## 相似性搜索与评分
`similarity_search_with_score` 方法允许您返回不仅是文档，还有查询与它们之间的距离评分。返回的距离评分是 L2 距离。因此，较低的评分更好。


```python
docs_and_scores = db.similarity_search_with_score(query)
```


```python
docs_and_scores[0]
```



```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../extras/modules/state_of_the_union.txt'}),
 0.1845687)
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
