---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/retrievers.ipynb
---
# 向量存储和检索器

本教程将使您熟悉LangChain的向量存储和检索器抽象。这些抽象旨在支持从（向量）数据库和其他来源检索数据，以便与大型语言模型工作流集成。它们对于获取数据以进行推理的应用程序非常重要，例如在检索增强生成（RAG）的情况下（请参见我们的RAG教程[这里](/docs/tutorials/rag)）。

## 概念

本指南重点介绍文本数据的检索。我们将涵盖以下概念：

- 文档；
- 向量存储；
- 检索器。

## 设置

### Jupyter Notebook

本教程和其他教程最方便的运行方式是使用Jupyter Notebook。有关安装说明，请参见[这里](https://jupyter.org/install)。

### 安装

本教程需要 `langchain`、`langchain-chroma` 和 `langchain-openai` 包：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from "@theme/CodeBlock";

<Tabs>
  <TabItem value="pip" label="Pip" default>
    <CodeBlock language="bash">pip install langchain langchain-chroma langchain-openai</CodeBlock>
  </TabItem>
  <TabItem value="conda" label="Conda">
    <CodeBlock language="bash">conda install langchain langchain-chroma langchain-openai -c conda-forge</CodeBlock>
  </TabItem>
</Tabs>


有关更多详细信息，请参阅我们的 [安装指南](/docs/how_to/installation)。

### LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用 LLM。
随着这些应用程序变得越来越复杂，能够检查您的链或代理内部到底发生了什么变得至关重要。
做到这一点的最佳方法是使用 [LangSmith](https://smith.langchain.com)。

在您在上述链接注册后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```


## 文档

LangChain 实现了一个 [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 抽象，旨在表示一个文本单元及其相关元数据。它有两个属性：

- `page_content`：一个表示内容的字符串；
- `metadata`：一个包含任意元数据的字典。

`metadata` 属性可以捕获有关文档来源、与其他文档的关系以及其他信息。请注意，单个 `Document` 对象通常表示一个较大文档的一部分。

让我们生成一些示例文档：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Vector stores and retrievers"}]-->
from langchain_core.documents import Document

documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"source": "mammal-pets-doc"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"source": "mammal-pets-doc"},
    ),
    Document(
        page_content="Goldfish are popular pets for beginners, requiring relatively simple care.",
        metadata={"source": "fish-pets-doc"},
    ),
    Document(
        page_content="Parrots are intelligent birds capable of mimicking human speech.",
        metadata={"source": "bird-pets-doc"},
    ),
    Document(
        page_content="Rabbits are social animals that need plenty of space to hop around.",
        metadata={"source": "mammal-pets-doc"},
    ),
]
```

在这里，我们生成了五个文档，包含指示三个不同“来源”的元数据。

## 向量存储

向量搜索是一种常见的存储和搜索非结构化数据（例如非结构化文本）的方法。其思想是存储与文本相关联的数值向量。给定一个查询，我们可以将其 [嵌入](/docs/concepts#embedding-models) 为相同维度的向量，并使用向量相似性度量来识别存储中的相关数据。

LangChain [向量存储](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html) 对象包含用于将文本和 `文档` 对象添加到存储中以及使用各种相似性度量进行查询的方法。它们通常使用 [嵌入](/docs/how_to/embed_text) 模型进行初始化，这决定了文本数据如何转换为数值向量。

LangChain 包含与不同向量存储技术的 [集成](/docs/integrations/vectorstores) 套件。一些向量存储由提供商（例如各种云提供商）托管，并需要特定的凭据才能使用；一些（如 [Postgres](/docs/integrations/vectorstores/pgvector)）在可以本地运行或通过第三方运行的独立基础设施中运行；其他可以在内存中运行以处理轻量级工作负载。这里我们将演示使用 [Chroma](/docs/integrations/vectorstores/chroma) 的 LangChain 向量存储，它包括一个内存实现。

要实例化一个向量存储，我们通常需要提供一个 [嵌入](/docs/how_to/embed_text) 模型，以指定文本应如何转换为数值向量。这里我们将使用 [OpenAI 嵌入](/docs/integrations/text_embedding/openai/)。


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Vector stores and retrievers"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Vector stores and retrievers"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma.from_documents(
    documents,
    embedding=OpenAIEmbeddings(),
)
```

在这里调用 `.from_documents` 将把文档添加到向量存储中。[向量存储](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html) 实现了可以在对象实例化后调用的添加文档的方法。大多数实现将允许您连接到现有的向量存储——例如，通过提供客户端、索引名称或其他信息。有关特定 [集成](/docs/integrations/vectorstores) 的更多详细信息，请参阅文档。

一旦我们实例化了一个包含文档的 `向量存储`，我们就可以对其进行查询。[向量存储](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html) 包含用于查询的方法：
- 同步和异步；
- 通过字符串查询和通过向量；
- 有和没有返回相似性分数；
- 通过相似性和 [最大边际相关性](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.max_marginal_relevance_search)（以平衡查询的相似性与检索结果的多样性）。

这些方法的输出通常会包含 [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象的列表。

### 示例

根据与字符串查询的相似性返回文档：


```python
vectorstore.similarity_search("cat")
```



```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Parrots are intelligent birds capable of mimicking human speech.', metadata={'source': 'bird-pets-doc'})]
```


异步查询：


```python
await vectorstore.asimilarity_search("cat")
```



```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Parrots are intelligent birds capable of mimicking human speech.', metadata={'source': 'bird-pets-doc'})]
```


返回分数：


```python
# Note that providers implement different scores; Chroma here
# returns a distance metric that should vary inversely with
# similarity.

vectorstore.similarity_search_with_score("cat")
```



```output
[(Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'}),
  0.3751849830150604),
 (Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'source': 'mammal-pets-doc'}),
  0.48316916823387146),
 (Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'source': 'mammal-pets-doc'}),
  0.49601367115974426),
 (Document(page_content='Parrots are intelligent birds capable of mimicking human speech.', metadata={'source': 'bird-pets-doc'}),
  0.4972994923591614)]
```


根据与嵌入查询的相似性返回文档：


```python
embedding = OpenAIEmbeddings().embed_query("cat")

vectorstore.similarity_search_by_vector(embedding)
```



```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'source': 'mammal-pets-doc'}),
 Document(page_content='Parrots are intelligent birds capable of mimicking human speech.', metadata={'source': 'bird-pets-doc'})]
```


了解更多：

- [API 参考](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html)
- [使用指南](/docs/how_to/vectorstores)
- [集成特定文档](/docs/integrations/vectorstores)

## 检索器

LangChain `VectorStore` 对象不继承 [Runnable](https://python.langchain.com/api_reference/core/index.html#module-langchain_core.runnables)，因此无法立即集成到 LangChain 表达式 [chains](/docs/concepts/#langchain-expression-language-lcel) 中。

LangChain [检索器](https://python.langchain.com/api_reference/core/index.html#module-langchain_core.retrievers) 是 Runnables，因此它们实现了一组标准方法（例如，同步和异步的 `invoke` 和 `batch` 操作），并设计为可以纳入 LCEL 链中。

我们可以自己创建一个简单版本，而无需继承 `Retriever`。如果我们选择希望用于检索文档的方法，我们可以轻松创建一个可运行的对象。下面我们将围绕 `similarity_search` 方法构建一个：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Vector stores and retrievers"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "Vector stores and retrievers"}]-->
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda

retriever = RunnableLambda(vectorstore.similarity_search).bind(k=1)  # select top result

retriever.batch(["cat", "shark"])
```



```output
[[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'})],
 [Document(page_content='Goldfish are popular pets for beginners, requiring relatively simple care.', metadata={'source': 'fish-pets-doc'})]]
```


向量存储实现了一个 `as_retriever` 方法，该方法将生成一个检索器，特别是一个 [VectorStoreRetriever](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStoreRetriever.html)。这些检索器包括特定的 `search_type` 和 `search_kwargs` 属性，用于识别调用底层向量存储的方法，以及如何对其进行参数化。例如，我们可以用以下方式复制上述内容：


```python
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 1},
)

retriever.batch(["cat", "shark"])
```



```output
[[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'source': 'mammal-pets-doc'})],
 [Document(page_content='Goldfish are popular pets for beginners, requiring relatively simple care.', metadata={'source': 'fish-pets-doc'})]]
```


`VectorStoreRetriever` 支持的搜索类型有 `

检索器可以轻松地纳入更复杂的应用程序，例如检索增强生成（RAG）应用程序，这些应用程序将给定问题与检索到的上下文结合成 LLM 的提示。下面我们展示一个最小示例。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Vector stores and retrievers"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Vector stores and retrievers"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

message = """
Answer this question using the provided context only.

{question}

Context:
{context}
"""

prompt = ChatPromptTemplate.from_messages([("human", message)])

rag_chain = {"context": retriever, "question": RunnablePassthrough()} | prompt | llm
```


```python
response = rag_chain.invoke("tell me about cats")

print(response.content)
```
```output
Cats are independent pets that often enjoy their own space.
```
## 了解更多：

检索策略可以丰富而复杂。例如：

- 我们可以从查询中 [推断硬规则和过滤器](/docs/how_to/self_query/)（例如，“使用 2020 年后发布的文档”）；
- 我们可以以某种方式 [返回与检索到的上下文相关联的文档](/docs/how_to/parent_document_retriever/)（例如，通过某些文档分类法）；
- 我们可以为每个上下文单元生成[多个嵌入](/docs/how_to/multi_vector);
- 我们可以从多个检索器中[集成结果](/docs/how_to/ensemble_retriever);
- 我们可以为文档分配权重，例如，为[最近的文档](/docs/how_to/time_weighted_vectorstore/)赋予更高的权重。

如何指南的[检索器](/docs/how_to#retrievers)部分涵盖了这些和其他内置检索策略。

扩展[BaseRetriever](https://python.langchain.com/api_reference/core/retrievers/langchain_core.retrievers.BaseRetriever.html)类以实现自定义检索器也很简单。请参阅我们的如何指南[这里](/docs/how_to/custom_retriever)。
