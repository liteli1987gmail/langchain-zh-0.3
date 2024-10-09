---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/aperturedb.ipynb
---
# ApertureDB

[ApertureDB](https://docs.aperturedata.io) 是一个数据库，用于存储、索引和管理多模态数据，如文本、图像、视频、边界框和嵌入，以及它们相关的元数据。

本笔记本解释了如何使用 ApertureDB 的嵌入功能。

## 安装 ApertureDB Python SDK

这将安装用于编写 ApertureDB 客户端代码的 [Python SDK](https://docs.aperturedata.io/category/aperturedb-python-sdk)。


```python
%pip install --upgrade --quiet aperturedb
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 运行一个ApertureDB实例

要继续，您应该有一个[ApertureDB实例正在运行](https://docs.aperturedata.io/HowToGuides/start/Setup)并配置您的环境以使用它。
有多种方法可以做到这一点，例如：

```bash
docker run --publish 55555:55555 aperturedata/aperturedb-standalone
adb config create local --active --no-interactive
```

## 下载一些网页文档
我们将在这里对一个网页进行小规模爬取。


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "ApertureDB"}]-->
# For loading documents from web
from langchain_community.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://docs.aperturedata.io")
docs = loader.load()
```
```output
USER_AGENT environment variable not set, consider setting it to identify your requests.
```
## 选择嵌入模型

我们想使用OllamaEmbeddings，因此我们必须导入必要的模块。

Ollama可以按照[文档](https://hub.docker.com/r/ollama/ollama)中的描述设置为docker容器，例如：
```bash
# Run server
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
# Tell server to load a specific model
docker exec ollama ollama run llama2
```


```python
<!--IMPORTS:[{"imported": "OllamaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.ollama.OllamaEmbeddings.html", "title": "ApertureDB"}]-->
from langchain_community.embeddings import OllamaEmbeddings

embeddings = OllamaEmbeddings()
```

## 将文档分割成多个部分

我们想将我们的单个文档转换为多个部分。


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "ApertureDB"}]-->
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter()
documents = text_splitter.split_documents(docs)
```

## 从文档和嵌入创建向量存储

此代码在ApertureDB实例中创建一个向量存储。
在该实例中，这个向量存储被表示为一个"[描述符集](https://docs.aperturedata.io/category/descriptorset-commands)"。
默认情况下，描述符集被命名为`langchain`。以下代码将为每个文档生成嵌入并将其作为描述符存储在ApertureDB中。这将花费几秒钟，因为嵌入正在生成。


```python
<!--IMPORTS:[{"imported": "ApertureDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.aperturedb.ApertureDB.html", "title": "ApertureDB"}]-->
from langchain_community.vectorstores import ApertureDB

vector_db = ApertureDB.from_documents(documents, embeddings)
```

## 选择大型语言模型

同样，我们使用为本地处理设置的Ollama服务器。


```python
<!--IMPORTS:[{"imported": "Ollama", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ollama.Ollama.html", "title": "ApertureDB"}]-->
from langchain_community.llms import Ollama

llm = Ollama(model="llama2")
```

## 构建RAG链

现在我们拥有创建RAG（检索增强生成）链所需的所有组件。该链执行以下操作：
1. 为用户查询生成嵌入描述符
2. 使用向量存储查找与用户查询相似的文本片段
3. 使用提示词模板将用户查询和上下文文档传递给大型语言模型
4. 返回大型语言模型的答案


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ApertureDB"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "ApertureDB"}, {"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "ApertureDB"}]-->
# Create prompt
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}""")


# Create a chain that passes documents to an LLM
from langchain.chains.combine_documents import create_stuff_documents_chain

document_chain = create_stuff_documents_chain(llm, prompt)


# Treat the vectorstore as a document retriever
retriever = vector_db.as_retriever()


# Create a RAG chain that connects the retriever to the LLM
from langchain.chains import create_retrieval_chain

retrieval_chain = create_retrieval_chain(retriever, document_chain)
```
```output
Based on the provided context, ApertureDB can store images. In fact, it is specifically designed to manage multimodal data such as images, videos, documents, embeddings, and associated metadata including annotations. So, ApertureDB has the capability to store and manage images.
```
## 运行RAG链

最后，我们将一个问题传递给链并获得我们的答案。这将需要几秒钟的时间，因为大型语言模型从查询和上下文文档生成答案。


```python
user_query = "How can ApertureDB store images?"
response = retrieval_chain.invoke({"input": user_query})
print(response["answer"])
```
```output
Based on the provided context, ApertureDB can store images in several ways:

1. Multimodal data management: ApertureDB offers a unified interface to manage multimodal data such as images, videos, documents, embeddings, and associated metadata including annotations. This means that images can be stored along with other types of data in a single database instance.
2. Image storage: ApertureDB provides image storage capabilities through its integration with the public cloud providers or on-premise installations. This allows customers to host their own ApertureDB instances and store images on their preferred cloud provider or on-premise infrastructure.
3. Vector database: ApertureDB also offers a vector database that enables efficient similarity search and classification of images based on their semantic meaning. This can be useful for applications where image search and classification are important, such as in computer vision or machine learning workflows.

Overall, ApertureDB provides flexible and scalable storage options for images, allowing customers to choose the deployment model that best suits their needs.
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
