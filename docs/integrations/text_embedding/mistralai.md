---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/mistralai.ipynb
sidebar_label: MistralAI
---
# MistralAI嵌入模型

这将帮助您使用LangChain开始使用MistralAI嵌入模型。有关`MistralAIEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/mistralai/embeddings/langchain_mistralai.embeddings.MistralAIEmbeddings.html)。

## 概述
### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="MistralAI" />

## 设置

要访问MistralAI嵌入模型，您需要创建一个MistralAI账户，获取API密钥，并安装`langchain-mistralai`集成包。

### 凭证

前往[https://console.mistral.ai/](https://console.mistral.ai/)注册MistralAI并生成API密钥。完成后设置MISTRALAI_API_KEY环境变量：


```python
import getpass
import os

if not os.getenv("MISTRALAI_API_KEY"):
    os.environ["MISTRALAI_API_KEY"] = getpass.getpass("Enter your MistralAI API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain MistralAI 集成位于 `langchain-mistralai` 包中：


```python
%pip install -qU langchain-mistralai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "MistralAIEmbeddings", "source": "langchain_mistralai", "docs": "https://python.langchain.com/api_reference/mistralai/embeddings/langchain_mistralai.embeddings.MistralAIEmbeddings.html", "title": "MistralAIEmbeddings"}]-->
from langchain_mistralai import MistralAIEmbeddings

embeddings = MistralAIEmbeddings(
    model="mistral-embed",
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [与外部知识合作的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在这个例子中，我们将索引并检索 `InMemoryVectorStore` 中的一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "MistralAIEmbeddings"}]-->
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

您可以直接调用这些方法以获取适合您自己用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[-0.04443359375, 0.01885986328125, 0.018035888671875, -0.00864410400390625, 0.049652099609375, -0.00
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
[-0.04443359375, 0.01885986328125, 0.0180511474609375, -0.0086517333984375, 0.049652099609375, -0.00
[-0.02032470703125, 0.02606201171875, 0.051605224609375, -0.0281982421875, 0.055755615234375, 0.0019
```
## API 参考

有关 `MistralAIEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/mistralai/embeddings/langchain_mistralai.embeddings.MistralAIEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
