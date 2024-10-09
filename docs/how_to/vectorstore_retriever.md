---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/vectorstore_retriever.ipynb
sidebar_position: 0
---
# 如何使用向量存储作为检索器

向量存储检索器是一个使用向量存储来检索文档的检索器。它是一个轻量级的包装器，围绕向量存储类构建，使其符合检索器接口。
它使用向量存储实现的搜索方法，如相似性搜索和MMR，来查询向量存储中的文本。

在本指南中，我们将涵盖：

1. 如何从向量存储实例化一个检索器；
2. 如何为检索器指定搜索类型；
3. 如何指定其他搜索参数，如阈值分数和前k个结果。

## 从向量存储创建检索器

您可以使用其 [.as_retriever](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.as_retriever) 方法从向量存储构建检索器。让我们通过一个示例来演示。

首先，我们实例化一个向量存储。我们将使用一个内存中的 [FAISS](https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html) 向量存储：


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "How to use a vectorstore as a retriever"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to use a vectorstore as a retriever"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use a vectorstore as a retriever"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to use a vectorstore as a retriever"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("state_of_the_union.txt")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(texts, embeddings)
```

我们可以实例化一个检索器：


```python
retriever = vectorstore.as_retriever()
```

这将创建一个检索器（具体来说是一个 [VectorStoreRetriever](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStoreRetriever.html)），我们可以像往常一样使用它：


```python
docs = retriever.invoke("what did the president say about ketanji brown jackson?")
```

## 最大边际相关性检索
默认情况下，向量存储检索器使用相似性搜索。如果底层向量存储支持最大边际相关性搜索，您可以将其指定为搜索类型。

这有效地指定了在底层向量存储上使用的方法（例如，`similarity_search`、`max_marginal_relevance_search`等）。


```python
retriever = vectorstore.as_retriever(search_type="mmr")
```


```python
docs = retriever.invoke("what did the president say about ketanji brown jackson?")
```

## 传递搜索参数

我们可以使用 `search_kwargs` 将参数传递给底层向量存储的搜索方法。

### 相似性得分阈值检索

例如，我们可以设置一个相似性得分阈值，仅返回得分高于该阈值的文档。


```python
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```


```python
docs = retriever.invoke("what did the president say about ketanji brown jackson?")
```

### 指定前 k

我们还可以限制检索器返回的文档数量 `k`。


```python
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```


```python
docs = retriever.invoke("what did the president say about ketanji brown jackson?")
len(docs)
```



```output
1
```

