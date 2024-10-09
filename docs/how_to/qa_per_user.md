---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/qa_per_user.ipynb
---
# 如何进行按用户检索

本指南演示如何配置检索链的运行时属性。一个示例应用是根据用户限制可供检索器使用的文档。

在构建检索应用时，您通常需要考虑多个用户。这意味着您可能不仅为一个用户存储数据，而是为许多不同的用户存储数据，并且他们不应该能够看到彼此的数据。这意味着您需要能够配置您的检索链，以仅检索特定信息。这通常涉及两个步骤。

**步骤 1：确保您使用的检索器支持多个用户**

目前，在LangChain中没有统一的标志或过滤器。相反，每个向量存储和检索器可能都有自己的标志，并且可能被称为不同的名称（命名空间、多租户等）。对于向量存储，这通常作为一个关键字参数在`similarity_search`期间传入。通过阅读文档或源代码，确定您使用的检索器是否支持多个用户，如果支持，如何使用它。

注意：为不支持（或未记录）多个用户的检索器添加文档和/或支持是对LangChain的一个很好的贡献方式。

**步骤 2：将该参数添加为链的可配置字段**

这将使您能够轻松调用链并在运行时配置任何相关标志。有关配置的更多信息，请参见[此文档](/docs/how_to/configure)。

现在，在运行时您可以使用可配置字段调用此链。

## 代码示例

让我们看看这在代码中是什么样的具体示例。我们将使用Pinecone作为这个示例。

要配置Pinecone，请设置以下环境变量：

- `PINECONE_API_KEY`: 您的Pinecone API密钥


```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to do per-user retrieval"}, {"imported": "PineconeVectorStore", "source": "langchain_pinecone", "docs": "https://python.langchain.com/api_reference/pinecone/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html", "title": "How to do per-user retrieval"}]-->
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```



```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```


用于 `namespace` 的 pinecone 关键字参数可以用来分隔文档


```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).get_relevant_documents(
    "where did i work?"
)
```



```output
[Document(page_content='i worked at facebook')]
```



```python
# This will only get documents for Harrison
vectorstore.as_retriever(
    search_kwargs={"namespace": "harrison"}
).get_relevant_documents("where did i work?")
```



```output
[Document(page_content='i worked at kensho')]
```


我们现在可以创建将用于问答的链。

让我们首先选择一个大型语言模型。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />


这是基本的问答链设置。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to do per-user retrieval"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to do per-user retrieval"}, {"imported": "ConfigurableField", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html", "title": "How to do per-user retrieval"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to do per-user retrieval"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)

template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

retriever = vectorstore.as_retriever()
```

在这里，我们标记检索器为具有可配置字段。所有向量存储检索器都有 `search_kwargs` 作为字段。这只是一个字典，包含特定于向量存储的字段。

这将允许我们在调用链时传入 `search_kwargs` 的值。


```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

我们现在可以使用我们的可配置检索器创建链。


```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

我们现在可以使用可配置选项调用链。`search_kwargs` 是可配置字段的 ID。值是用于 Pinecone 的搜索关键字参数。


```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```



```output
'The user worked at Kensho.'
```



```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```



```output
'The user worked at Facebook.'
```


有关多用户的更多向量存储实现，请参考特定页面，例如 [Milvus](/docs/integrations/vectorstores/milvus)。
