---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/annoy.ipynb
---
# Annoy

> [Annoy](https://github.com/spotify/annoy) (`近似最近邻 Oh Yeah`) 是一个带有 Python 绑定的 C++ 库，用于搜索与给定查询点接近的空间中的点。它还创建了大型只读文件基础的数据结构，这些结构被映射到内存中，以便多个进程可以共享相同的数据。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成

本笔记本展示了如何使用与 `Annoy` 向量数据库相关的功能。

```{note}
NOTE: Annoy is read-only - once the index is built you cannot add any more embeddings!
If you want to progressively add new entries to your VectorStore then better choose an alternative!
```


```python
%pip install --upgrade --quiet  annoy
```

## 从文本创建向量存储


```python
<!--IMPORTS:[{"imported": "Annoy", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.annoy.Annoy.html", "title": "Annoy"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Annoy"}]-->
from langchain_community.vectorstores import Annoy
from langchain_huggingface import HuggingFaceEmbeddings

model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings_func = HuggingFaceEmbeddings(model_name=model_name)
```


```python
texts = ["pizza is great", "I love salad", "my car", "a dog"]

# default metric is angular
vector_store = Annoy.from_texts(texts, embeddings_func)
```


```python
# allows for custom annoy parameters, defaults are n_trees=100, n_jobs=-1, metric="angular"
vector_store_v2 = Annoy.from_texts(
    texts, embeddings_func, metric="dot", n_trees=100, n_jobs=1
)
```


```python
vector_store.similarity_search("food", k=3)
```



```output
[Document(page_content='pizza is great', metadata={}),
 Document(page_content='I love salad', metadata={}),
 Document(page_content='my car', metadata={})]
```



```python
# the score is a distance metric, so lower is better
vector_store.similarity_search_with_score("food", k=3)
```



```output
[(Document(page_content='pizza is great', metadata={}), 1.0944390296936035),
 (Document(page_content='I love salad', metadata={}), 1.1273186206817627),
 (Document(page_content='my car', metadata={}), 1.1580758094787598)]
```


## 从文档创建向量存储


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Annoy"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Annoy"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txtn.txtn.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```


```python
docs[:5]
```



```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.', metadata={'source': '../../../state_of_the_union.txt'}),
 Document(page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. \n\nIn this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. \n\nLet each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. \n\nPlease rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. \n\nThroughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   \n\nThey keep moving.   \n\nAnd the costs and the threats to America and the world keep rising.   \n\nThat’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. \n\nThe United States is a member along with 29 other nations. \n\nIt matters. American diplomacy matters. American resolve matters.', metadata={'source': '../../../state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': '../../../state_of_the_union.txt'}),
 Document(page_content='We are inflicting pain on Russia and supporting the people of Ukraine. Putin is now isolated from the world more than ever. \n\nTogether with our allies –we are right now enforcing powerful economic sanctions. \n\nWe are cutting off Russia’s largest banks from the international financial system.  \n\nPreventing Russia’s central bank from defending the Russian Ruble making Putin’s $630 Billion “war fund” worthless.   \n\nWe are choking off Russia’s access to technology that will sap its economic strength and weaken its military for years to come.  \n\nTonight I say to the Russian oligarchs and corrupt leaders who have bilked billions of dollars off this violent regime no more. \n\nThe U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs.  \n\nWe are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains.', metadata={'source': '../../../state_of_the_union.txt'}),
 Document(page_content='And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value. \n\nThe Russian stock market has lost 40% of its value and trading remains suspended. Russia’s economy is reeling and Putin alone is to blame. \n\nTogether with our allies we are providing support to the Ukrainians in their fight for freedom. Military assistance. Economic assistance. Humanitarian assistance. \n\nWe are giving more than $1 Billion in direct assistance to Ukraine. \n\nAnd we will continue to aid the Ukrainian people as they defend their country and to help ease their suffering.  \n\nLet me be clear, our forces are not engaged and will not engage in conflict with Russian forces in Ukraine.  \n\nOur forces are not going to Europe to fight in Ukraine, but to defend our NATO Allies – in the event that Putin decides to keep moving west.', metadata={'source': '../../../state_of_the_union.txt'})]
```



```python
vector_store_from_docs = Annoy.from_documents(docs, embeddings_func)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store_from_docs.similarity_search(query)
```


```python
print(docs[0].page_content[:100])
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac
```
## 通过现有嵌入创建向量存储


```python
embs = embeddings_func.embed_documents(texts)
```


```python
data = list(zip(texts, embs))

vector_store_from_embeddings = Annoy.from_embeddings(data, embeddings_func)
```


```python
vector_store_from_embeddings.similarity_search_with_score("food", k=3)
```



```output
[(Document(page_content='pizza is great', metadata={}), 1.0944390296936035),
 (Document(page_content='I love salad', metadata={}), 1.1273186206817627),
 (Document(page_content='my car', metadata={}), 1.1580758094787598)]
```


## 通过嵌入进行搜索


```python
motorbike_emb = embeddings_func.embed_query("motorbike")
```


```python
vector_store.similarity_search_by_vector(motorbike_emb, k=3)
```



```output
[Document(page_content='my car', metadata={}),
 Document(page_content='a dog', metadata={}),
 Document(page_content='pizza is great', metadata={})]
```



```python
vector_store.similarity_search_with_score_by_vector(motorbike_emb, k=3)
```



```output
[(Document(page_content='my car', metadata={}), 1.0870471000671387),
 (Document(page_content='a dog', metadata={}), 1.2095637321472168),
 (Document(page_content='pizza is great', metadata={}), 1.3254905939102173)]
```


## 通过文档存储 ID 进行搜索


```python
vector_store.index_to_docstore_id
```



```output
{0: '2d1498a8-a37c-4798-acb9-0016504ed798',
 1: '2d30aecc-88e0-4469-9d51-0ef7e9858e6d',
 2: '927f1120-985b-4691-b577-ad5cb42e011c',
 3: '3056ddcf-a62f-48c8-bd98-b9e57a3dfcae'}
```



```python
some_docstore_id = 0  # texts[0]

vector_store.docstore._dict[vector_store.index_to_docstore_id[some_docstore_id]]
```



```output
Document(page_content='pizza is great', metadata={})
```



```python
# same document has distance 0
vector_store.similarity_search_with_score_by_index(some_docstore_id, k=3)
```



```output
[(Document(page_content='pizza is great', metadata={}), 0.0),
 (Document(page_content='I love salad', metadata={}), 1.0734446048736572),
 (Document(page_content='my car', metadata={}), 1.2895267009735107)]
```


## 保存和加载


```python
vector_store.save_local("my_annoy_index_and_docstore")
```
```output
saving config
```

```python
loaded_vector_store = Annoy.load_local(
    "my_annoy_index_and_docstore", embeddings=embeddings_func
)
```


```python
# same document has distance 0
loaded_vector_store.similarity_search_with_score_by_index(some_docstore_id, k=3)
```



```output
[(Document(page_content='pizza is great', metadata={}), 0.0),
 (Document(page_content='I love salad', metadata={}), 1.0734446048736572),
 (Document(page_content='my car', metadata={}), 1.2895267009735107)]
```


## 从头开始构建


```python
<!--IMPORTS:[{"imported": "InMemoryDocstore", "source": "langchain_community.docstore.in_memory", "docs": "https://python.langchain.com/api_reference/community/docstore/langchain_community.docstore.in_memory.InMemoryDocstore.html", "title": "Annoy"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Annoy"}]-->
import uuid

from annoy import AnnoyIndex
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_core.documents import Document

metadatas = [{"x": "food"}, {"x": "food"}, {"x": "stuff"}, {"x": "animal"}]

# embeddings
embeddings = embeddings_func.embed_documents(texts)

# embedding dim
f = len(embeddings[0])

# index
metric = "angular"
index = AnnoyIndex(f, metric=metric)
for i, emb in enumerate(embeddings):
    index.add_item(i, emb)
index.build(10)

# docstore
documents = []
for i, text in enumerate(texts):
    metadata = metadatas[i] if metadatas else {}
    documents.append(Document(page_content=text, metadata=metadata))
index_to_docstore_id = {i: str(uuid.uuid4()) for i in range(len(documents))}
docstore = InMemoryDocstore(
    {index_to_docstore_id[i]: doc for i, doc in enumerate(documents)}
)

db_manually = Annoy(
    embeddings_func.embed_query, index, metric, docstore, index_to_docstore_id
)
```


```python
db_manually.similarity_search_with_score("eating!", k=3)
```



```output
[(Document(page_content='pizza is great', metadata={'x': 'food'}),
  1.1314140558242798),
 (Document(page_content='I love salad', metadata={'x': 'food'}),
  1.1668788194656372),
 (Document(page_content='my car', metadata={'x': 'stuff'}), 1.226445198059082)]
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
