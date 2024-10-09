---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/ollama.ipynb
sidebar_label: Ollama
---
# Ollama嵌入模型

这将帮助您使用LangChain开始使用Ollama嵌入模型。有关`OllamaEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://python.langchain.com/api_reference/ollama/embeddings/langchain_ollama.embeddings.OllamaEmbeddings.html)。

## 概述
### 集成细节

import { ItemTable } from "@theme/FeatureTables";

<ItemTable category="text_embedding" item="Ollama" />

## 设置

首先，请按照[这些说明](https://github.com/jmorganca/ollama)设置并运行本地Ollama实例：

* [下载](https://ollama.ai/download)并在可用的支持平台上安装Ollama（包括Windows子系统Linux）
* 通过`ollama pull`获取可用的LLM模型
* 通过[模型库](https://ollama.ai/library)查看可用模型的列表
* 例如，`ollama pull llama3`
* 这将下载模型的默认标记版本。通常，默认版本指向最新的、参数最小的模型。

> 在Mac上，模型将下载到 `~/.ollama/models`
>
> 在Linux（或WSL）上，模型将存储在 `/usr/share/ollama/.ollama/models`

* 指定感兴趣的模型的确切版本，如 `ollama pull vicuna:13b-v1.5-16k-q4_0`（在此实例中查看 [Vicuna 的各种标签](https://ollama.ai/library/vicuna/tags)）
* 要查看所有已拉取的模型，请使用 `ollama list`
* 要直接从命令行与模型聊天，请使用 `ollama run `
* 查看 [Ollama 文档](https://github.com/jmorganca/ollama)以获取更多命令。在终端中运行 `ollama help` 以查看可用命令。


### 凭证

Ollama没有内置的身份验证机制。

如果您想要自动跟踪您的模型调用，您还可以通过取消下面的注释来设置您的[LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain Ollama 集成位于 `langchain-ollama` 包中：


```python
%pip install -qU langchain-ollama
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成嵌入：


```python
<!--IMPORTS:[{"imported": "OllamaEmbeddings", "source": "langchain_ollama", "docs": "https://python.langchain.com/api_reference/ollama/embeddings/langchain_ollama.embeddings.OllamaEmbeddings.html", "title": "OllamaEmbeddings"}]-->
from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(
    model="llama3",
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [使用外部知识的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，看看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在这个例子中，我们将索引并检索 `InMemoryVectorStore` 中的一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "OllamaEmbeddings"}]-->
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

在底层，向量存储和检索器实现调用 `embeddings.embed_documents(...)` 和 `embeddings.embed_query(...)` 来为 `from_texts` 中使用的文本和检索 `invoke` 操作分别创建嵌入。

您可以直接调用这些方法以获取您自己用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[-0.001288981, 0.006547121, 0.018376578, 0.025603496, 0.009599175, -0.0042578303, -0.023250086, -0.0
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
[-0.0013138362, 0.006438795, 0.018304596, 0.025530428, 0.009717592, -0.004225636, -0.023363983, -0.0
[-0.010317663, 0.01632489, 0.0070348927, 0.017076202, 0.008924255, 0.007399284, -0.023064945, -0.003
```
## API 参考

有关 `OllamaEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/ollama/embeddings/langchain_ollama.embeddings.OllamaEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
