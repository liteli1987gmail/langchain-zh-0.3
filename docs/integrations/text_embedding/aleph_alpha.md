---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/aleph_alpha.ipynb
---
# Aleph Alpha

使用 Aleph Alpha 的语义嵌入有两种可能的方法。如果您有结构不相似的文本（例如文档和查询），您可能希望使用非对称嵌入。相反，对于结构相似的文本，建议使用对称嵌入。

## 非对称


```python
<!--IMPORTS:[{"imported": "AlephAlphaAsymmetricSemanticEmbedding", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.aleph_alpha.AlephAlphaAsymmetricSemanticEmbedding.html", "title": "Aleph Alpha"}]-->
from langchain_community.embeddings import AlephAlphaAsymmetricSemanticEmbedding
```


```python
document = "This is a content of the document"
query = "What is the content of the document?"
```


```python
embeddings = AlephAlphaAsymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```


```python
doc_result = embeddings.embed_documents([document])
```


```python
query_result = embeddings.embed_query(query)
```

## 对称


```python
<!--IMPORTS:[{"imported": "AlephAlphaSymmetricSemanticEmbedding", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.aleph_alpha.AlephAlphaSymmetricSemanticEmbedding.html", "title": "Aleph Alpha"}]-->
from langchain_community.embeddings import AlephAlphaSymmetricSemanticEmbedding
```


```python
text = "This is a test text"
```


```python
embeddings = AlephAlphaSymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```


```python
doc_result = embeddings.embed_documents([text])
```


```python
query_result = embeddings.embed_query(text)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
