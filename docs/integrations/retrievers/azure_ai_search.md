---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/azure_ai_search.ipynb
sidebar_label: Azure AI Search
---
# AzureAISearchRetriever

[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search)（前称为 `Azure Cognitive Search`）是微软的云搜索服务，为开发者提供基础设施、API和工具，以便在大规模下进行向量、关键词和混合查询的信息检索。

`AzureAISearchRetriever` 是一个集成模块，能够从非结构化查询中返回文档。它基于 BaseRetriever 类，并针对 Azure AI Search 的 2023-11-01 稳定 REST API 版本，这意味着它支持向量索引和查询。

本指南将帮助您开始使用 Azure AI Search [检索器](/docs/concepts/#retrievers)。有关所有 `AzureAISearchRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.azure_ai_search.AzureAISearchRetriever.html)。

`AzureAISearchRetriever` 替代了 `AzureCognitiveSearchRetriever`，后者将很快被弃用。我们建议切换到基于最新稳定版本搜索 API 的新版本。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="document_retrievers" item="AzureAISearchRetriever" />


## 设置

要使用此模块，您需要：

+ 一个 Azure AI Search 服务。如果您注册 Azure 试用版，可以 [免费创建一个](https://learn.microsoft.com/azure/search/search-create-service-portal)。免费服务的配额较低，但足以在此笔记本中运行代码。

+ 一个具有向量字段的现有索引。有几种方法可以创建一个，包括使用 [向量存储模块](../vectorstores/azuresearch.md)。或者， [尝试 Azure AI Search REST API](https://learn.microsoft.com/azure/search/search-get-started-vector)。

+ 一个API密钥。API密钥在您创建搜索服务时生成。如果您只是查询索引，可以使用查询API密钥，否则请使用管理员API密钥。有关详细信息，请参见[查找您的API密钥](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys)。

然后我们可以将搜索服务名称、索引名称和API密钥设置为环境变量（或者，您可以将它们作为参数传递给`AzureAISearchRetriever`）。搜索索引提供可搜索的内容。


```python
import os

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

如果您想从单个查询中获取自动追踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

此检索器位于 `langchain-community` 包中。我们还需要一些额外的依赖项：


```python
%pip install --upgrade --quiet langchain-community
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents>=11.4
%pip install --upgrade --quiet  azure-identity
```

## 实例化

对于 `AzureAISearchRetriever`，提供 `index_name`、`content_key` 和 `top_k`，设置为您希望检索的结果数量。将 `top_k` 设置为零（默认值）将返回所有结果。


```python
<!--IMPORTS:[{"imported": "AzureAISearchRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.azure_ai_search.AzureAISearchRetriever.html", "title": "AzureAISearchRetriever"}]-->
from langchain_community.retrievers import AzureAISearchRetriever

retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

## 使用

现在您可以使用它从 Azure AI Search 中检索文档。
这是您调用的方法。它将返回与查询相关的所有文档。


```python
retriever.invoke("here is my unstructured query string")
```

## 示例

本节演示了如何在内置示例数据上使用检索器。如果您已经在搜索服务上有一个向量索引，可以跳过此步骤。

首先提供端点和密钥。由于我们在此步骤中创建一个向量索引，请指定一个文本嵌入模型以获取文本的向量表示。此示例假设使用 Azure OpenAI 的 text-embedding-ada-002 部署。因为此步骤创建了一个索引，请确保为您的搜索服务使用管理员 API 密钥。


```python
<!--IMPORTS:[{"imported": "DirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.directory.DirectoryLoader.html", "title": "AzureAISearchRetriever"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "AzureAISearchRetriever"}, {"imported": "AzureAISearchRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.azure_ai_search.AzureAISearchRetriever.html", "title": "AzureAISearchRetriever"}, {"imported": "AzureSearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.azuresearch.AzureSearch.html", "title": "AzureAISearchRetriever"}, {"imported": "AzureOpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.azure.AzureOpenAIEmbeddings.html", "title": "AzureAISearchRetriever"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "AzureAISearchRetriever"}, {"imported": "TokenTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.TokenTextSplitter.html", "title": "AzureAISearchRetriever"}]-->
import os

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_community.vectorstores import AzureSearch
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

我们将使用 Azure OpenAI 的嵌入模型将我们的文档转换为存储在 Azure AI Search 向量存储中的嵌入。我们还将索引名称设置为 `langchain-vector-demo`。这将创建一个与该索引名称相关的新向量存储。


```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

接下来，我们将数据加载到新创建的向量存储中。对于此示例，我们加载 `state_of_the_union.txt` 文件。我们将文本分割为 400 个标记的块，且不重叠。最后，文档作为嵌入添加到我们的向量存储中。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "AzureAISearchRetriever"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "AzureAISearchRetriever"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

接下来，我们将创建一个检索器。当前的 `index_name` 变量是来自上一步的 `langchain-vector-demo`。如果您跳过了向量存储的创建，请在参数中提供您的索引名称。在此查询中，将返回顶部结果。


```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

现在我们可以从上传的文档中检索与我们的查询相关的数据。


```python
retriever.invoke("does the president have a plan for covid-19?")
```

## 在链中使用


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "AzureAISearchRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "AzureAISearchRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "AzureAISearchRetriever"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "AzureAISearchRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

llm = ChatOpenAI(model="gpt-4o-mini")


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke("does the president have a plan for covid-19?")
```

## API 参考

有关所有 `AzureAISearchRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.azure_ai_search.AzureAISearchRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
