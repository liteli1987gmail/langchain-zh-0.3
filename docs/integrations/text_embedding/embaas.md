---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/embaas.ipynb
---
# Embaas

[embaas](https://embaas.io) 是一个完全托管的自然语言处理 API 服务，提供嵌入生成、文档文本提取、文档到嵌入等功能。您可以选择 [多种预训练模型](https://embaas.io/docs/models/embeddings)。

在本教程中，我们将向您展示如何使用 embaas 嵌入 API 为给定文本生成嵌入。

### 先决条件
在 [https://embaas.io/register](https://embaas.io/register) 创建您的免费 embaas 账户，并生成一个 [API 密钥](https://embaas.io/dashboard/api-keys)。


```python
import os

# Set API key
embaas_api_key = "YOUR_API_KEY"
# or set environment variable
os.environ["EMBAAS_API_KEY"] = "YOUR_API_KEY"
```


```python
<!--IMPORTS:[{"imported": "EmbaasEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.embaas.EmbaasEmbeddings.html", "title": "Embaas"}]-->
from langchain_community.embeddings import EmbaasEmbeddings
```


```python
embeddings = EmbaasEmbeddings()
```


```python
# Create embeddings for a single document
doc_text = "This is a test document."
doc_text_embedding = embeddings.embed_query(doc_text)
```


```python
# Print created embedding
print(doc_text_embedding)
```


```python
# Create embeddings for multiple documents
doc_texts = ["This is a test document.", "This is another test document."]
doc_texts_embeddings = embeddings.embed_documents(doc_texts)
```


```python
# Print created embeddings
for i, doc_text_embedding in enumerate(doc_texts_embeddings):
    print(f"Embedding for document {i + 1}: {doc_text_embedding}")
```


```python
# Using a different model and/or custom instruction
embeddings = EmbaasEmbeddings(
    model="instructor-large",
    instruction="Represent the Wikipedia document for retrieval",
)
```

有关 embaas 嵌入 API 的更详细信息，请参阅 [官方 embaas API 文档](https://embaas.io/api-reference)。


## 相关内容

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
