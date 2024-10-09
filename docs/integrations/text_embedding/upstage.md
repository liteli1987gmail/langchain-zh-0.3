---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/upstage.ipynb
sidebar_label: Upstage
---
# UpstageEmbeddings

本笔记本介绍如何开始使用 Upstage 嵌入模型。

## 安装

安装 `langchain-upstage` 包。

```bash
pip install -U langchain-upstage
```

## 环境设置

确保设置以下环境变量：

- `UPSTAGE_API_KEY`：您的 Upstage API 密钥，来自 [Upstage 控制台](https://console.upstage.ai/)。


```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```


## 使用方法

初始化 `UpstageEmbeddings` 类。


```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings(model="solar-embedding-1-large")
```

使用 `embed_documents` 嵌入文本或文档列表。


```python
doc_result = embeddings.embed_documents(
    ["Sung is a professor.", "This is another document"]
)
print(doc_result)
```

使用 `embed_query` 嵌入查询字符串。


```python
query_result = embeddings.embed_query("What does Sung do?")
print(query_result)
```

使用 `aembed_documents` 和 `aembed_query` 进行异步操作。


```python
# async embed query
await embeddings.aembed_query("My query to look up")
```


```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```

## 与向量存储一起使用

您可以将 `UpstageEmbeddings` 与向量存储组件一起使用。以下演示了一个简单的示例。


```python
<!--IMPORTS:[{"imported": "DocArrayInMemorySearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.docarray.in_memory.DocArrayInMemorySearch.html", "title": "UpstageEmbeddings"}]-->
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(model="solar-embedding-1-large"),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
