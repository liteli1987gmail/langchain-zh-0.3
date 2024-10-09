---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/mosaicml.ipynb
---
# MosaicML

>[MosaicML](https://docs.mosaicml.com/en/latest/inference.html) 提供了一个托管的推理服务。您可以使用各种开源模型，或部署您自己的模型。

本示例介绍了如何使用 LangChain 与 `MosaicML` 推理进行文本嵌入。


```python
# sign up for an account: https://forms.mosaicml.com/demo?utm_source=langchain

from getpass import getpass

MOSAICML_API_TOKEN = getpass()
```


```python
import os

os.environ["MOSAICML_API_TOKEN"] = MOSAICML_API_TOKEN
```


```python
<!--IMPORTS:[{"imported": "MosaicMLInstructorEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.mosaicml.MosaicMLInstructorEmbeddings.html", "title": "MosaicML"}]-->
from langchain_community.embeddings import MosaicMLInstructorEmbeddings
```


```python
embeddings = MosaicMLInstructorEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```


```python
query_text = "This is a test query."
query_result = embeddings.embed_query(query_text)
```


```python
document_text = "This is a test document."
document_result = embeddings.embed_documents([document_text])
```


```python
import numpy as np

query_numpy = np.array(query_result)
document_numpy = np.array(document_result[0])
similarity = np.dot(query_numpy, document_numpy) / (
    np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
)
print(f"Cosine similarity between document and query: {similarity}")
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
