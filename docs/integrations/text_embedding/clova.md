---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/clova.ipynb
---
# Clova 嵌入
[Clova](https://api.ncloud-docs.com/docs/ai-naver-clovastudio-summary) 提供嵌入服务

本示例介绍如何使用 LangChain 与 Clova 推理进行文本嵌入的交互。



```python
import os

os.environ["CLOVA_EMB_API_KEY"] = ""
os.environ["CLOVA_EMB_APIGW_API_KEY"] = ""
os.environ["CLOVA_EMB_APP_ID"] = ""
```


```python
<!--IMPORTS:[{"imported": "ClovaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.clova.ClovaEmbeddings.html", "title": "Clova Embeddings"}]-->
from langchain_community.embeddings import ClovaEmbeddings
```


```python
embeddings = ClovaEmbeddings()
```


```python
query_text = "This is a test query."
query_result = embeddings.embed_query(query_text)
```


```python
document_text = ["This is a test doc1.", "This is a test doc2."]
document_result = embeddings.embed_documents(document_text)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
