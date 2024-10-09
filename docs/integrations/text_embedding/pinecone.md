---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/pinecone.ipynb
---
# Pinecone 嵌入

Pinecone 的推理 API 可以通过 `PineconeEmbeddings` 访问。通过 Pinecone 服务提供文本嵌入。我们首先安装必要的库:


```python
!pip install -qU "langchain-pinecone>=0.2.0" 
```

接下来，我们 [注册 / 登录 Pinecone](https://app.pinecone.io) 以获取我们的 API 密钥：


```python
import os
from getpass import getpass

os.environ["PINECONE_API_KEY"] = os.getenv("PINECONE_API_KEY") or getpass(
    "Enter your Pinecone API key: "
)
```

查看文档以获取可用的 [模型](https://docs.pinecone.io/models/overview)。现在我们像这样初始化我们的嵌入模型：


```python
<!--IMPORTS:[{"imported": "PineconeEmbeddings", "source": "langchain_pinecone", "docs": "https://python.langchain.com/api_reference/pinecone/embeddings/langchain_pinecone.embeddings.PineconeEmbeddings.html", "title": "Pinecone Embeddings"}]-->
from langchain_pinecone import PineconeEmbeddings

embeddings = PineconeEmbeddings(model="multilingual-e5-large")
```

从这里我们可以创建同步或异步的嵌入，让我们从同步开始！我们使用 `embed_query` 将单个文本嵌入为查询嵌入（即我们在 RAG 中搜索的内容）：


```python
docs = [
    "Apple is a popular fruit known for its sweetness and crisp texture.",
    "The tech company Apple is known for its innovative products like the iPhone.",
    "Many people enjoy eating apples as a healthy snack.",
    "Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces.",
    "An apple a day keeps the doctor away, as the saying goes.",
]
```


```python
doc_embeds = embeddings.embed_documents(docs)
doc_embeds
```


```python
query = "Tell me about the tech company known as Apple"
query_embed = embeddings.embed_query(query)
query_embed
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
