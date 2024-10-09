---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/dashscope.ipynb
---
# DashScope

让我们加载 DashScope 嵌入类。


```python
<!--IMPORTS:[{"imported": "DashScopeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.dashscope.DashScopeEmbeddings.html", "title": "DashScope"}]-->
from langchain_community.embeddings import DashScopeEmbeddings
```


```python
embeddings = DashScopeEmbeddings(
    model="text-embedding-v1", dashscope_api_key="your-dashscope-api-key"
)
```


```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
print(query_result)
```


```python
doc_results = embeddings.embed_documents(["foo"])
print(doc_results)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
