---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/edenai.ipynb
---
# EDEN AI

Eden AI 正在通过联合最佳的 AI 提供商来革新 AI 领域，使用户能够解锁无限可能，挖掘人工智能的真正潜力。通过一个全面且无忧的平台，它允许用户快速将 AI 功能部署到生产中，使用户能够通过单一 API 轻松访问全面的 AI 能力。(网站: https://edenai.co/)

本示例介绍了如何使用 LangChain 与 Eden AI 嵌入模型进行交互

-----------------------------------------------------------------------------------


访问 EDENAI 的 API 需要一个 API 密钥，

您可以通过创建一个账户 https://app.edenai.run/user/register 来获取，并前往这里 https://app.edenai.run/admin/account/settings

一旦我们有了密钥，我们将希望通过运行以下命令将其设置为环境变量：

```shell
export EDENAI_API_KEY="..."
```


如果您不想设置环境变量，可以通过名为 edenai_api_key 的参数直接传递密钥

在初始化 EdenAI 嵌入类时：




```python
<!--IMPORTS:[{"imported": "EdenAiEmbeddings", "source": "langchain_community.embeddings.edenai", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.edenai.EdenAiEmbeddings.html", "title": "EDEN AI"}]-->
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```


```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## 调用模型


EdenAI API 汇集了各种大模型供应商。

要访问特定模型，您可以在调用时简单地使用 "provider"。



```python
embeddings = EdenAiEmbeddings(provider="openai")
```


```python
docs = ["It's raining right now", "cats are cute"]
document_result = embeddings.embed_documents(docs)
```


```python
query = "my umbrella is broken"
query_result = embeddings.embed_query(query)
```


```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```
```output
Cosine similarity between "It's raining right now" and query: 0.849261496107252
Cosine similarity between "cats are cute" and query: 0.7525900655705218
```

## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
