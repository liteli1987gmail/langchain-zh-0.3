---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/fake.ipynb
---
# 假嵌入

LangChain 还提供了一个假嵌入类。您可以使用它来测试您的管道。


```python
<!--IMPORTS:[{"imported": "FakeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.fake.FakeEmbeddings.html", "title": "Fake Embeddings"}]-->
from langchain_community.embeddings import FakeEmbeddings
```


```python
embeddings = FakeEmbeddings(size=1352)
```


```python
query_result = embeddings.embed_query("foo")
```


```python
doc_results = embeddings.embed_documents(["foo"])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
