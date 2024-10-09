---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/modelscope_hub.ipynb
---
# ModelScope

>[ModelScope](https://www.modelscope.cn/home) 是一个大型模型和数据集的仓库。

让我们加载 ModelScope 嵌入类。


```python
<!--IMPORTS:[{"imported": "ModelScopeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.modelscope_hub.ModelScopeEmbeddings.html", "title": "ModelScope"}]-->
from langchain_community.embeddings import ModelScopeEmbeddings
```


```python
model_id = "damo/nlp_corom_sentence-embedding_english-base"
```


```python
embeddings = ModelScopeEmbeddings(model_id=model_id)
```


```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


```python
doc_results = embeddings.embed_documents(["foo"])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
