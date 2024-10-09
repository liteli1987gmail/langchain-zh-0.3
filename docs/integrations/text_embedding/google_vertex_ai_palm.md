---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/google_vertex_ai_palm.ipynb
sidebar_label: Google Vertex AI 
keywords: [Vertex AI, vertexai , Google Cloud, embeddings]
---
# Google Vertex AI 嵌入模型

这将帮助您使用 LangChain 开始使用 Google Vertex AI 嵌入模型。有关 `Google Vertex AI 嵌入模型` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/google_vertexai/embeddings/langchain_google_vertexai.embeddings.VertexAIEmbeddings.html)。

## 概述
### 集成细节

| 大模型供应商 | 包名 |
|:--------:|:-------:|
| [Google](https://python.langchain.com/docs/integrations/platforms/google/) | [langchain-google-vertexai](https://python.langchain.com/api_reference/google_vertexai/embeddings/langchain_google_vertexai.embeddings.VertexAIEmbeddings.html) |

## 设置

要访问 Google Vertex AI 嵌入模型，您需要
- 创建一个 Google Cloud 账户
- 安装 `langchain-google-vertexai` 集成包。




### 凭据


前往 [Google Cloud](https://cloud.google.com/free/) 注册以创建一个账户。完成后设置 GOOGLE_APPLICATION_CREDENTIALS 环境变量：

有关更多信息，请参见：

https://cloud.google.com/docs/authentication/application-default-credentials#GAC
https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

**可选：验证您的笔记本环境（仅限 Colab）**

如果您在 Google Colab 上运行此笔记本，请运行下面的单元格以验证您的环境。


```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth

    auth.authenticate_user()
```

**设置 Google Cloud 项目信息并初始化 Vertex AI SDK**

要开始使用 Vertex AI，您必须拥有一个现有的 Google Cloud 项目并[启用 Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)。

了解更多关于[设置项目和开发环境](https://cloud.google.com/vertex-ai/docs/start/cloud-environment)的信息。


```python
PROJECT_ID = "[your-project-id]"  # @param {type:"string"}
LOCATION = "us-central1"  # @param {type:"string"}

import vertexai

vertexai.init(project=PROJECT_ID, location=LOCATION)
```

如果您想自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的[LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain Google Vertex AI 嵌入集成位于 `langchain-google-vertexai` 包中：


```python
%pip install -qU langchain-google-vertexai
```

## 实例化

现在我们可以实例化我们的模型对象并生成嵌入：
>查看[支持的模型](https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings#supported-models)列表


```python
from langchain_google_vertexai import VertexAIEmbeddings

# Initialize the a specific Embeddings Model version
embeddings = VertexAIEmbeddings(model_name="text-embedding-004")
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程中，既用于索引数据，也用于后续检索。有关更详细的说明，请参见我们在 [使用外部知识教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在此示例中，我们将在 `InMemoryVectorStore` 中索引和检索一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "Google Vertex AI Embeddings "}]-->
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

您可以直接调用这些方法以获取适用于您自己用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
```
```output
[-0.02831101417541504, 0.022063178941607475, -0.07454229146242142, 0.006448323838412762, 0.001955120
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
[-0.01092718355357647, 0.01213780976831913, -0.05650627985596657, 0.006737854331731796, 0.0085973171
[0.010135706514120102, 0.01234869472682476, -0.07284046709537506, 0.00027134662377648056, 0.01546290
```
## API 参考

有关 `Google Vertex AI Embeddings` 的详细文档，请参考 [API 参考](https://python.langchain.com/api_reference/google_vertexai/embeddings/langchain_google_vertexai.embeddings.VertexAIEmbeddings.html)。
` 的功能和配置选项。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
