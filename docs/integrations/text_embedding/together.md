---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/together.ipynb
sidebar_label: Together AI
---
# TogetherEmbeddings

这将帮助您开始使用LangChain的Together嵌入模型。有关`TogetherEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/together/embeddings/langchain_together.embeddings.TogetherEmbeddings.html)。

## 概述
### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="Together" />

## 设置

要访问Together嵌入模型，您需要创建一个Together账户，获取API密钥，并安装`langchain-together`集成包。

### 凭证

前往[https://api.together.xyz/](https://api.together.xyz/)注册Together并生成API密钥。完成后设置TOGETHER_API_KEY环境变量：


```python
import getpass
import os

if not os.getenv("TOGETHER_API_KEY"):
    os.environ["TOGETHER_API_KEY"] = getpass.getpass("Enter your Together API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain Together 集成位于 `langchain-together` 包中：


```python
%pip install -qU langchain-together
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m24.0[0m[39;49m -> [0m[32;49m24.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpython -m pip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
from langchain_together import TogetherEmbeddings

embeddings = TogetherEmbeddings(
    model="togethercomputer/m2-bert-80M-8k-retrieval",
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [与外部知识合作的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在此示例中，我们将在 `InMemoryVectorStore` 中索引和检索一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "TogetherEmbeddings"}]-->
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

您可以直接调用这些方法以获取适合您用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[0.3812227, -0.052848946, -0.10564975, 0.03480297, 0.2878488, 0.0084609175, 0.11605915, 0.05303011,
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
[0.3812227, -0.052848946, -0.10564975, 0.03480297, 0.2878488, 0.0084609175, 0.11605915, 0.05303011, 
[0.066308185, -0.032866564, 0.115751594, 0.19082588, 0.14017, -0.26976448, -0.056340694, -0.26923394
```
## API 参考

有关 `TogetherEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/together/embeddings/langchain_together.embeddings.TogetherEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
