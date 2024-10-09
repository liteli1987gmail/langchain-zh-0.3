---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/databricks.ipynb
sidebar_label: Databricks
---
# Databricks嵌入模型

> [Databricks](https://www.databricks.com/) 湖仓平台将数据、分析和人工智能统一在一个平台上。

本笔记本提供了一个快速概述，帮助您开始使用 Databricks [嵌入模型](/docs/concepts/#embedding-models)。有关所有 `Databricks嵌入模型` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html)。



## 概述
### 集成细节

| 类 | 包名 |
| :--- | :--- |
| [Databricks嵌入模型](https://api.python.langchain.com/en/latest/embeddings/langchain_databricks.embeddings.DatabricksEmbeddings.html) | [langchain-databricks](https://api.python.langchain.com/en/latest/databricks_api_reference.html) |

### 支持的方法

`Databricks嵌入模型` 支持 `嵌入模型` 类的所有方法，包括异步 API。


### 端点要求

服务端点 `DatabricksEmbeddings` 的包装必须具有与 OpenAI 兼容的嵌入输入/输出格式 ([参考](https://mlflow.org/docs/latest/llms/deployments/index.html#embeddings))。只要输入格式兼容，`DatabricksEmbeddings` 可以用于托管在 [Databricks 模型服务](https://docs.databricks.com/en/machine-learning/model-serving/index.html) 上的任何端点类型：

1. 基础模型 - 精心挑选的最先进基础模型列表，如 BAAI 通用嵌入 (BGE)。这些端点可以在您的 Databricks 工作区中直接使用，无需任何设置。
2. 自定义模型 - 您还可以通过 MLflow 将自定义嵌入模型部署到服务端点，
使用您选择的框架，如 LangChain、Pytorch、Transformers 等。
3. 外部模型 - Databricks 端点可以作为代理服务托管在 Databricks 之外的模型，例如像 OpenAI text-embedding-3 这样的专有模型服务。


## 设置

要访问 Databricks 模型，您需要创建一个 Databricks 账户，设置凭据（仅当您在 Databricks 工作区外时），并安装所需的包。

### 凭据（仅当您在 Databricks 工作区外时）

如果您在 Databricks 内部运行 LangChain 应用程序，可以跳过此步骤。

否则，您需要手动将 Databricks 工作区主机名和个人访问令牌分别设置为 `DATABRICKS_HOST` 和 `DATABRICKS_TOKEN` 环境变量。有关如何获取访问令牌的信息，请参见 [身份验证文档](https://docs.databricks.com/en/dev-tools/auth/index.html#databricks-personal-access-tokens)。


```python
import getpass
import os

os.environ["DATABRICKS_HOST"] = "https://your-workspace.cloud.databricks.com"
if "DATABRICKS_TOKEN" not in os.environ:
    os.environ["DATABRICKS_TOKEN"] = getpass.getpass(
        "Enter your Databricks access token: "
    )
```

### 安装

LangChain Databricks 集成位于 `langchain-databricks` 包中：


```python
%pip install -qU langchain-databricks
```

## 实例化


```python
from langchain_databricks import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(
    endpoint="databricks-bge-large-en",
    # Specify parameters for embedding queries and documents if needed
    # query_params={...},
    # document_params={...},
)
```

## 索引和检索

嵌入模型通常用于增强检索生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [使用外部知识的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在这个示例中，我们将索引并检索 `InMemoryVectorStore` 中的一个示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "DatabricksEmbeddings"}]-->
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
retrieved_document = retriever.invoke("What is LangChain?")

# show the retrieved document's content
retrieved_document[0].page_content
```

## 直接使用

在底层，向量存储和检索器实现调用 `embeddings.embed_documents(...)` 和 `embeddings.embed_query(...)` 来为 `from_texts` 中使用的文本和检索 `invoke` 操作创建嵌入。

您可以直接调用这些方法以获取您自己用例的嵌入。

### 嵌入单个文本

您可以使用 `embed_query` 嵌入单个文本或文档：


```python
single_vector = embeddings.embed_query(text)
print(str(single_vector)[:100])  # Show the first 100 characters of the vector
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

### 异步使用

您还可以使用 `aembed_query` 和 `aembed_documents` 异步生成嵌入：



```python
import asyncio


async def async_example():
    single_vector = await embeddings.aembed_query(text)
    print(str(single_vector)[:100])  # Show the first 100 characters of the vector


asyncio.run(async_example())
```

## API 参考

有关 `DatabricksEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
