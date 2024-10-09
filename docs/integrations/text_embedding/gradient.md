---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/gradient.ipynb
---
# Gradient

`Gradient` 允许通过简单的 web API 创建 `嵌入模型`，并对大型语言模型进行微调和获取完成结果。

本笔记本介绍了如何使用 LangChain 与 [Gradient](https://gradient.ai/) 的嵌入模型。


## 导入


```python
<!--IMPORTS:[{"imported": "GradientEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.gradient_ai.GradientEmbeddings.html", "title": "Gradient"}]-->
from langchain_community.embeddings import GradientEmbeddings
```

## 设置环境 API 密钥
确保从 Gradient AI 获取您的 API 密钥。您将获得 10 美元的免费积分以测试和微调不同的模型。


```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

可选：验证您的环境变量 ```GRADIENT_ACCESS_TOKEN``` 和 ```GRADIENT_WORKSPACE_ID``` 以获取当前部署的模型。使用 `gradientai` Python 包。


```python
%pip install --upgrade --quiet  gradientai
```

## 创建 Gradient 实例


```python
documents = [
    "Pizza is a dish.",
    "Paris is the capital of France",
    "numpy is a lib for linear algebra",
]
query = "Where is Paris?"
```


```python
embeddings = GradientEmbeddings(model="bge-large")

documents_embedded = embeddings.embed_documents(documents)
query_result = embeddings.embed_query(query)
```


```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
