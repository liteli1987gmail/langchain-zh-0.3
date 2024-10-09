---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/fireworks.ipynb
sidebar_label: Fireworks
---
# FireworksEmbeddings

这将帮助您开始使用LangChain的Fireworks嵌入模型。有关`FireworksEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/fireworks/embeddings/langchain_fireworks.embeddings.FireworksEmbeddings.html)。

## 概述

### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="Fireworks" />

## 设置

要访问Fireworks嵌入模型，您需要创建一个Fireworks账户，获取API密钥，并安装`langchain-fireworks`集成包。

### 凭证

前往[fireworks.ai](https://fireworks.ai/)注册Fireworks并生成API密钥。完成后设置FIREWORKS_API_KEY环境变量：


```python
import getpass
import os

if not os.getenv("FIREWORKS_API_KEY"):
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Enter your Fireworks API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain Fireworks 集成位于 `langchain-fireworks` 包中：


```python
%pip install -qU langchain-fireworks
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "FireworksEmbeddings", "source": "langchain_fireworks", "docs": "https://python.langchain.com/api_reference/fireworks/embeddings/langchain_fireworks.embeddings.FireworksEmbeddings.html", "title": "FireworksEmbeddings"}]-->
from langchain_fireworks import FireworksEmbeddings

embeddings = FireworksEmbeddings(
    model="nomic-ai/nomic-embed-text-v1.5",
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [与外部知识合作的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在此示例中，我们将索引并检索 `InMemoryVectorStore` 中的示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "FireworksEmbeddings"}]-->
# Create a vector store with a sample text
from langchain_core.vectorstores import InMemoryVectorStore

text = "LangChain is the framework for building context-aware reasoning applications"

vectorstore = InMemoryVectorStore.from_texts(
    [text],
    embedding=embeddings,
)

# Use the vectorstore as a retriever
retriever = vectorstore.as_retriever()

# Retrieve the most similar text
retrieved_documents = retriever.invoke("What is LangChain?")

# show the retrieved document's content
retrieved_documents[0].page_content
```



```output
'LangChain is the framework for building context-aware reasoning applications'
```


## 直接使用

在底层，向量存储和检索器实现调用 `embeddings.embed_documents(...)` 和 `embeddings.embed_query(...)` 来为 `from_texts` 和检索 `invoke` 操作中使用的文本创建嵌入。

您可以直接调用这些方法以获取适合您用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[0.01666259765625, 0.011688232421875, -0.1181640625, -0.10205078125, 0.05438232421875, -0.0890502929
```
### 嵌入多个文本

您可以使用 `embed_documents` 嵌入多个文本：


```python
text2 = (
    "LangGraph is a library for building stateful, multi-actor applications with LLMs"
)
two_vectors = embeddings.embed_documents([text, text2])
for vector in two_vectors:
    print(str(vector)[:100])  # Show the first 100 characters of the vector
```
```output
[0.016632080078125, 0.01165008544921875, -0.1181640625, -0.10186767578125, 0.05438232421875, -0.0890
[-0.02667236328125, 0.036651611328125, -0.1630859375, -0.0904541015625, -0.022430419921875, -0.09545
```
## API 参考

有关所有 `FireworksEmbeddings` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/fireworks/embeddings/langchain_fireworks.embeddings.FireworksEmbeddings.html)。


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
