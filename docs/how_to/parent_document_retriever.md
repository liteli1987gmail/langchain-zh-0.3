---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/parent_document_retriever.ipynb
---
# 如何使用父文档检索器

在进行文档检索时，通常会有相互矛盾的需求：

1. 你可能希望文档较小，以便它们的嵌入能够最
准确地反映其含义。如果文档过长，嵌入可能会
失去意义。
2. 你希望文档足够长，以便每个块的上下文得以
保留。

`ParentDocumentRetriever`通过拆分和存储
小块数据来实现这种平衡。在检索过程中，它首先获取小块
数据，但随后查找这些块的父ID并返回更大的数据块。
文档。

请注意，“父文档”是指小块内容来源的文档。
这可以是整个原始文档或更大的块。
块。


```python
<!--IMPORTS:[{"imported": "ParentDocumentRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.parent_document_retriever.ParentDocumentRetriever.html", "title": "How to use the Parent Document Retriever"}]-->
from langchain.retrievers import ParentDocumentRetriever
```


```python
<!--IMPORTS:[{"imported": "InMemoryStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryStore.html", "title": "How to use the Parent Document Retriever"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to use the Parent Document Retriever"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "How to use the Parent Document Retriever"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use the Parent Document Retriever"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to use the Parent Document Retriever"}]-->
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```


```python
loaders = [
    TextLoader("paul_graham_essay.txt"),
    TextLoader("state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
```

## 检索完整文档

在此模式下，我们希望检索完整文档。因此，我们只指定一个子分割器。


```python
# This text splitter is used to create the child documents
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)
```


```python
retriever.add_documents(docs, ids=None)
```

这应该产生两个键，因为我们添加了两个文档。


```python
list(store.yield_keys())
```



```output
['9a63376c-58cc-42c9-b0f7-61f0e1a3a688',
 '40091598-e918-4a18-9be0-f46413a95ae4']
```


现在让我们调用向量存储搜索功能 - 我们应该看到它返回小块（因为我们存储的是小块）。


```python
sub_docs = vectorstore.similarity_search("justice breyer")
```


```python
print(sub_docs[0].page_content)
```
```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```
现在让我们从整体检索器中检索。这应该返回大文档 - 因为它返回的是小块所在的文档。


```python
retrieved_docs = retriever.invoke("justice breyer")
```


```python
len(retrieved_docs[0].page_content)
```



```output
38540
```


## 检索较大块

有时，完整文档可能太大，不想按原样检索。在这种情况下，我们真正想做的是首先将原始文档分割成较大块，然后再分割成较小块。我们然后对较小块进行索引，但在检索时我们检索较大块（但仍然不是完整文档）。


```python
# This text splitter is used to create the parent documents
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
# This text splitter is used to create the child documents
# It should create documents smaller than the parent
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="split_parents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
```


```python
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```


```python
retriever.add_documents(docs)
```

我们可以看到现在有比两个文档多得多 - 这些是较大块。


```python
len(list(store.yield_keys()))
```



```output
66
```


让我们确保底层的向量存储仍然检索小块。


```python
sub_docs = vectorstore.similarity_search("justice breyer")
```


```python
print(sub_docs[0].page_content)
```
```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```


```python
len(retrieved_docs[0].page_content)
```



```output
1849
```



```python
print(retrieved_docs[0].page_content)
```
```output
In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections. 

We cannot let this happen. 

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. 

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```