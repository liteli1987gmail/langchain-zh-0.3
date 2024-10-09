---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/scann.ipynb
---
# ScaNN

ScaNN（可扩展最近邻）是一种用于大规模高效向量相似性搜索的方法。

ScaNN包括搜索空间剪枝和量化以进行最大内积搜索，并且还支持其他距离函数，如欧几里得距离。该实现针对支持AVX2的x86处理器进行了优化。有关更多详细信息，请参见其[Google Research github](https://github.com/google-research/google-research/tree/master/scann)。

您需要使用`pip install -qU langchain-community`安装`langchain-community`以使用此集成。

## 安装
通过pip安装ScaNN。或者，您可以按照[ScaNN网站](https://github.com/google-research/google-research/tree/master/scann#building-from-source)上的说明从源代码安装。


```python
%pip install --upgrade --quiet  scann
```

## 检索演示

下面我们展示如何将 ScaNN 与 Huggingface 嵌入结合使用。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "ScaNN"}, {"imported": "ScaNN", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.scann.ScaNN.html", "title": "ScaNN"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "ScaNN"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "ScaNN"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import ScaNN
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)


model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(model_name=model_name)

db = ScaNN.from_documents(docs, embeddings)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

docs[0]
```

## 检索问答演示

接下来，我们演示如何将 ScaNN 与 Google PaLM API 结合使用。

您可以从 https://developers.generativeai.google/tutorials/setup 获取 API 密钥。


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "ScaNN"}, {"imported": "ChatGooglePalm", "source": "langchain_community.chat_models.google_palm", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.google_palm.ChatGooglePalm.html", "title": "ScaNN"}]-->
from langchain.chains import RetrievalQA
from langchain_community.chat_models.google_palm import ChatGooglePalm

palm_client = ChatGooglePalm(google_api_key="YOUR_GOOGLE_PALM_API_KEY")

qa = RetrievalQA.from_chain_type(
    llm=palm_client,
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 10}),
)
```


```python
print(qa.run("What did the president say about Ketanji Brown Jackson?"))
```
```output
The president said that Ketanji Brown Jackson is one of our nation's top legal minds, who will continue Justice Breyer's legacy of excellence.
```

```python
print(qa.run("What did the president say about Michael Phelps?"))
```
```output
The president did not mention Michael Phelps in his speech.
```
## 保存和加载本地检索索引


```python
db.save_local("/tmp/db", "state_of_union")
restored_db = ScaNN.load_local("/tmp/db", embeddings, index_name="state_of_union")
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
