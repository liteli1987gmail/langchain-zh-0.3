---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/nomic.ipynb
sidebar_label: Nomic
---
# NomicEmbeddings

这将帮助您使用LangChain开始使用Nomic嵌入模型。有关`NomicEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/nomic/embeddings/langchain_nomic.embeddings.NomicEmbeddings.html)。

## 概述
### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="Nomic" />

## 设置

要访问Nomic嵌入模型，您需要创建一个Nomic账户，获取API密钥，并安装`langchain-nomic`集成包。

### 凭证

前往[https://atlas.nomic.ai/](https://atlas.nomic.ai/)注册Nomic并生成API密钥。完成后设置`NOMIC_API_KEY`环境变量：


```python
import getpass
import os

if not os.getenv("NOMIC_API_KEY"):
    os.environ["NOMIC_API_KEY"] = getpass.getpass("Enter your Nomic API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain Nomic 集成位于 `langchain-nomic` 包中：


```python
%pip install -qU langchain-nomic
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "NomicEmbeddings", "source": "langchain_nomic", "docs": "https://python.langchain.com/api_reference/nomic/embeddings/langchain_nomic.embeddings.NomicEmbeddings.html", "title": "NomicEmbeddings"}]-->
from langchain_nomic import NomicEmbeddings

embeddings = NomicEmbeddings(
    model="nomic-embed-text-v1.5",
    # dimensionality=256,
    # Nomic's `nomic-embed-text-v1.5` model was [trained with Matryoshka learning](https://blog.nomic.ai/posts/nomic-embed-matryoshka)
    # to enable variable-length embeddings with a single model.
    # This means that you can specify the dimensionality of the embeddings at inference time.
    # The model supports dimensionality from 64 to 768.
    # inference_mode="remote",
    # One of `remote`, `local` (Embed4All), or `dynamic` (automatic). Defaults to `remote`.
    # api_key=... , # if using remote inference,
    # device="cpu",
    # The device to use for local embeddings. Choices include
    # `cpu`, `gpu`, `nvidia`, `amd`, or a specific device name. See
    # the docstring for `GPT4All.__init__` for more info. Typically
    # defaults to CPU. Do not use on macOS.
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [使用外部知识的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在这个例子中，我们将索引并检索 `InMemoryVectorStore` 中的一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "NomicEmbeddings"}]-->
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
[0.024642944, 0.029083252, -0.14013672, -0.09082031, 0.058898926, -0.07489014, -0.0138168335, 0.0037
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
[0.012771606, 0.023727417, -0.12365723, -0.083740234, 0.06530762, -0.07110596, -0.021896362, -0.0068
[-0.019058228, 0.04058838, -0.15222168, -0.06842041, -0.012130737, -0.07128906, -0.04534912, 0.00522
```
## API 参考

有关 `NomicEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/nomic/embeddings/langchain_nomic.embeddings.NomicEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
