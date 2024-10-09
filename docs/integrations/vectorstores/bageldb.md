---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/bageldb.ipynb
---
# BagelDB

> [BagelDB](https://www.bageldb.ai/) (`人工智能开放向量数据库`)，就像是人工智能数据的GitHub。
这是一个协作平台，用户可以创建、
分享和管理向量数据集。它可以支持独立开发者的私人项目，
企业的内部协作，以及数据DAO的公共贡献。

### 安装和设置

```bash
pip install betabageldb langchain-community
```



## 从文本创建向量存储


```python
<!--IMPORTS:[{"imported": "Bagel", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.bagel.Bagel.html", "title": "BagelDB"}]-->
from langchain_community.vectorstores import Bagel

texts = ["hello bagel", "hello langchain", "I love salad", "my car", "a dog"]
# create cluster and add texts
cluster = Bagel.from_texts(cluster_name="testing", texts=texts)
```


```python
# similarity search
cluster.similarity_search("bagel", k=3)
```



```output
[Document(page_content='hello bagel', metadata={}),
 Document(page_content='my car', metadata={}),
 Document(page_content='I love salad', metadata={})]
```



```python
# the score is a distance metric, so lower is better
cluster.similarity_search_with_score("bagel", k=3)
```



```output
[(Document(page_content='hello bagel', metadata={}), 0.27392977476119995),
 (Document(page_content='my car', metadata={}), 1.4783176183700562),
 (Document(page_content='I love salad', metadata={}), 1.5342965126037598)]
```



```python
# delete the cluster
cluster.delete_cluster()
```

## 从文档创建向量存储


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "BagelDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "BagelDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)[:10]
```


```python
# create cluster with docs
cluster = Bagel.from_documents(cluster_name="testing_with_docs", documents=docs)
```


```python
# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = cluster.similarity_search(query)
print(docs[0].page_content[:102])
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the
```
## 从集群获取所有文本/文档


```python
texts = ["hello bagel", "this is langchain"]
cluster = Bagel.from_texts(cluster_name="testing", texts=texts)
cluster_data = cluster.get()
```


```python
# all keys
cluster_data.keys()
```



```output
dict_keys(['ids', 'embeddings', 'metadatas', 'documents'])
```



```python
# all values and keys
cluster_data
```



```output
{'ids': ['578c6d24-3763-11ee-a8ab-b7b7b34f99ba',
  '578c6d25-3763-11ee-a8ab-b7b7b34f99ba',
  'fb2fc7d8-3762-11ee-a8ab-b7b7b34f99ba',
  'fb2fc7d9-3762-11ee-a8ab-b7b7b34f99ba',
  '6b40881a-3762-11ee-a8ab-b7b7b34f99ba',
  '6b40881b-3762-11ee-a8ab-b7b7b34f99ba',
  '581e691e-3762-11ee-a8ab-b7b7b34f99ba',
  '581e691f-3762-11ee-a8ab-b7b7b34f99ba'],
 'embeddings': None,
 'metadatas': [{}, {}, {}, {}, {}, {}, {}, {}],
 'documents': ['hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain']}
```



```python
cluster.delete_cluster()
```

## 使用元数据创建集群并通过元数据过滤


```python
texts = ["hello bagel", "this is langchain"]
metadatas = [{"source": "notion"}, {"source": "google"}]

cluster = Bagel.from_texts(cluster_name="testing", texts=texts, metadatas=metadatas)
cluster.similarity_search_with_score("hello bagel", where={"source": "notion"})
```



```output
[(Document(page_content='hello bagel', metadata={'source': 'notion'}), 0.0)]
```



```python
# delete the cluster
cluster.delete_cluster()
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
