---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/zhipuai.ipynb
sidebar_label: ZhipuAI
keywords: [zhipuaiembeddings]
---
# ZhipuAI嵌入模型

这将帮助您使用LangChain开始使用ZhipuAI嵌入模型。有关`ZhipuAIEmbeddings`功能和配置选项的详细文档，请参阅[API参考](https://bigmodel.cn/dev/api#vector)。

## 概述
### 集成细节

| 大模型供应商 | 包名 |
|:--------:|:-------:|
| [ZhipuAI](/docs/integrations/providers/zhipuai/) | [langchain-community](https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.zhipuai.ZhipuAIEmbeddings.html) |

## 设置

要访问ZhipuAI嵌入模型，您需要创建一个ZhipuAI账户，获取API密钥，并安装`zhipuai`集成包。

### 凭证

前往 [https://bigmodel.cn/](https://bigmodel.cn/usercenter/apikeys) 注册 ZhipuAI 并生成 API 密钥。完成后设置 ZHIPUAI_API_KEY 环境变量:


```python
import getpass
import os

if not os.getenv("ZHIPUAI_API_KEY"):
    os.environ["ZHIPUAI_API_KEY"] = getpass.getpass("Enter your ZhipuAI API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain ZhipuAI 集成位于 `zhipuai` 包中：


```python
%pip install -qU zhipuai
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "ZhipuAIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.zhipuai.ZhipuAIEmbeddings.html", "title": "ZhipuAIEmbeddings"}]-->
from langchain_community.embeddings import ZhipuAIEmbeddings

embeddings = ZhipuAIEmbeddings(
    model="embedding-3",
    # With the `embedding-3` class
    # of models, you can specify the size
    # of the embeddings you want returned.
    # dimensions=1024
)
```

## 索引和检索

嵌入模型通常用于检索增强生成 (RAG) 流程，既作为索引数据的一部分，也用于后续的检索。有关更详细的说明，请参见我们在 [与外部知识合作的教程](/docs/tutorials/#working-with-external-knowledge) 下的 RAG 教程。

下面，查看如何使用我们上面初始化的 `embeddings` 对象来索引和检索数据。在此示例中，我们将索引并检索 `InMemoryVectorStore` 中的示例文档。


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "ZhipuAIEmbeddings"}]-->
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
[-0.022979736, 0.007785797, 0.04598999, 0.012741089, -0.01689148, 0.008277893, 0.016464233, 0.009246
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
[-0.022979736, 0.007785797, 0.04598999, 0.012741089, -0.01689148, 0.008277893, 0.016464233, 0.009246
[-0.02330017, -0.013916016, 0.00022411346, 0.017196655, -0.034240723, 0.011131287, 0.011497498, -0.0
```
## API 参考

有关 `ZhipuAIEmbeddings` 功能和配置选项的详细文档，请参阅 [API 参考](https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.zhipuai.ZhipuAIEmbeddings.html)。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
