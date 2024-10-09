---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/textembed.ipynb
---
# TextEmbed - 嵌入推理服务器

TextEmbed 是一个高吞吐量、低延迟的 REST API，旨在提供向量嵌入服务。它支持多种句子转换模型和框架，适用于自然语言处理中的各种应用。

## 特性

- **高吞吐量与低延迟：** 设计用于高效处理大量请求。
- **灵活的模型支持：** 兼容多种句子转换模型。
- **可扩展：** 容易集成到更大的系统中，并随需求扩展。
- **批处理：** 支持批处理以实现更好和更快的推理。
- **OpenAI 兼容的 REST API 端点：** 提供 OpenAI 兼容的 REST API 端点。
- **单行命令部署：** 通过单个命令部署多个模型，以实现高效部署。
- **支持嵌入格式：** 支持二进制、float16 和 float32 嵌入格式，以实现更快的检索。

## 开始使用

### 先决条件

确保您已安装 Python 3.10 或更高版本。您还需要安装所需的依赖项。

## 通过 PyPI 安装

1. **安装所需的依赖项：**

    ```bash
    pip install -U textembed
    ```

2. **使用您所需的模型启动TextEmbed服务器:**

    ```bash
    python -m textembed.server --models sentence-transformers/all-MiniLM-L12-v2 --workers 4 --api-key TextEmbed 
    ```

有关更多信息，请阅读[文档](https://github.com/kevaldekivadiya2415/textembed/blob/main/docs/setup.md)。

### 导入


```python
<!--IMPORTS:[{"imported": "TextEmbedEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.textembed.TextEmbedEmbeddings.html", "title": "TextEmbed - Embedding Inference Server"}]-->
from langchain_community.embeddings import TextEmbedEmbeddings
```


```python
embeddings = TextEmbedEmbeddings(
    model="sentence-transformers/all-MiniLM-L12-v2",
    api_url="http://0.0.0.0:8000/v1",
    api_key="TextEmbed",
)
```

### 嵌入您的文档


```python
# Define a list of documents
documents = [
    "Data science involves extracting insights from data.",
    "Artificial intelligence is transforming various industries.",
    "Cloud computing provides scalable computing resources over the internet.",
    "Big data analytics helps in understanding large datasets.",
    "India has a diverse cultural heritage.",
]

# Define a query
query = "What is the cultural heritage of India?"
```


```python
# Embed all documents
document_embeddings = embeddings.embed_documents(documents)

# Embed the query
query_embedding = embeddings.embed_query(query)
```


```python
# Compute Similarity
import numpy as np

scores = np.array(document_embeddings) @ np.array(query_embedding).T
dict(zip(documents, scores))
```



```output
{'Data science involves extracting insights from data.': 0.05121298956322118,
 'Artificial intelligence is transforming various industries.': -0.0060612142358469345,
 'Cloud computing provides scalable computing resources over the internet.': -0.04877402795301714,
 'Big data analytics helps in understanding large datasets.': 0.016582168576929422,
 'India has a diverse cultural heritage.': 0.7408992963028144}
```



## 相关

- 嵌入模型[概念指南](/docs/concepts/#embedding-models)
- 嵌入模型[操作指南](/docs/how_to/#embedding-models)
