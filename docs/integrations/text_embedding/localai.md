---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/localai.ipynb
---
# LocalAI

让我们加载 LocalAI 嵌入类。为了使用 LocalAI 嵌入类，您需要在某处托管 LocalAI 服务并配置嵌入模型。请参阅文档 https://localai.io/basics/getting_started/index.html 和 https://localai.io/features/embeddings/index.html。


```python
<!--IMPORTS:[{"imported": "LocalAIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.localai.LocalAIEmbeddings.html", "title": "LocalAI"}]-->
from langchain_community.embeddings import LocalAIEmbeddings
```


```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
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

让我们加载带有第一代模型的 LocalAI 嵌入类（例如 text-search-ada-doc-001/text-search-ada-query-001）。注意：这些模型不推荐使用 - 详见 [这里](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)


```python
<!--IMPORTS:[{"imported": "LocalAIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.localai.LocalAIEmbeddings.html", "title": "LocalAI"}]-->
from langchain_community.embeddings import LocalAIEmbeddings
```


```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
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


```python
import os

# if you are behind an explicit proxy, you can use the OPENAI_PROXY environment variable to pass through
os.environ["OPENAI_PROXY"] = "http://proxy.yourcompany.com:8080"
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
