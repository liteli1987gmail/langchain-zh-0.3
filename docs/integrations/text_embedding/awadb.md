---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/awadb.ipynb
---
# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) 是一个用于LLM应用程序的嵌入向量搜索和存储的AI原生数据库。

本笔记本解释了如何在LangChain中使用`AwaEmbeddings`。


```python
# pip install awadb
```

## 导入库


```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```


```python
Embedding = AwaEmbeddings()
```

# 设置嵌入模型
用户可以使用 `Embedding.set_model()` 来指定嵌入模型。\
该函数的输入是一个表示模型名称的字符串。\
当前支持的模型列表可以在 [这里](https://github.com/awa-ai/awadb) 获取。\ \

**默认模型**是 `all-mpnet-base-v2`，可以在不设置的情况下使用。


```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```


```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
