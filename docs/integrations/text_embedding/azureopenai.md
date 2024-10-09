---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/azureopenai.ipynb
sidebar_label: AzureOpenAI
---
# AzureOpenAI嵌入模型

这将帮助您使用LangChain开始使用AzureOpenAI嵌入模型。有关`AzureOpenAIEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.azure.AzureOpenAIEmbeddings.html)。

## 概述
### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="AzureOpenAI" />

## 设置

要访问AzureOpenAI嵌入模型，您需要创建一个Azure帐户，获取API密钥，并安装`langchain-openai`集成包。

### 凭据

您需要有一个已部署的Azure OpenAI实例。您可以按照此[指南](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource?pivots=web-portal)在Azure门户上部署一个版本。

一旦您的实例运行，确保您有实例的名称和密钥。您可以在Azure门户的“密钥和端点”部分找到密钥。

```bash
AZURE_OPENAI_ENDPOINT=<YOUR API ENDPOINT>
AZURE_OPENAI_API_KEY=<YOUR_KEY>
AZURE_OPENAI_API_VERSION="2024-02-01"
```


```python
import getpass
import os

if not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your AzureOpenAI API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain AzureOpenAI 集成位于 `langchain-openai` 包中：


```python
%pip install -qU langchain-openai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "AzureOpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.azure.AzureOpenAIEmbeddings.html", "title": "AzureOpenAIEmbeddings"}]-->
from langchain_openai import AzureOpenAIEmbeddings

embeddings = AzureOpenAIEmbeddings(
    model="text-embedding-3-large",
    # dimensions: Optional[int] = None, # Can specify dimensions with new text-embedding-3 models
    # azure_endpoint="https://<your-endpoint>.openai.azure.com/", If not provided, will read env variable AZURE_OPENAI_ENDPOINT
    # api_key=... # Can provide an API key directly. If missing read env variable AZURE_OPENAI_API_KEY
    # openai_api_version=..., # If not provided, will read env variable AZURE_OPENAI_API_VERSION
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [使用外部知识的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在这个例子中，我们将索引并检索 `InMemoryVectorStore` 中的一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "AzureOpenAIEmbeddings"}]-->
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

在底层，向量存储和检索器实现调用 `embeddings.embed_documents(...)` 和 `embeddings.embed_query(...)` 来为 `from_texts` 中使用的文本和检索 `invoke` 操作创建嵌入。

您可以直接调用这些方法以获取适合您自己用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[-0.0011676070280373096, 0.007125577889382839, -0.014674457721412182, -0.034061674028635025, 0.01128
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
[-0.0011966148158535361, 0.007160289213061333, -0.014659193344414234, -0.03403077274560928, 0.011280
[-0.005595256108790636, 0.016757294535636902, -0.011055258102715015, -0.031094247475266457, -0.00363
```
## API 参考

有关 `AzureOpenAIEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.azure.AzureOpenAIEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
