---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/bookend.ipynb
---
# Bookend AI

让我们加载 Bookend AI 嵌入模型类。


```python
<!--IMPORTS:[{"imported": "BookendEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.bookend.BookendEmbeddings.html", "title": "Bookend AI"}]-->
from langchain_community.embeddings import BookendEmbeddings
```


```python
embeddings = BookendEmbeddings(
    domain="your_domain",
    api_token="your_api_token",
    model_id="your_embeddings_model_id",
)
```


```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


```python
doc_result = embeddings.embed_documents([text])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
