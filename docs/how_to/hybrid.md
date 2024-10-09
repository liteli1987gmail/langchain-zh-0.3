---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/hybrid.ipynb
---
# 混合搜索

LangChain中的标准搜索是通过向量相似度完成的。然而，一些向量存储实现（如Astra DB、ElasticSearch、Neo4J、AzureSearch、Qdrant等）也支持更高级的搜索，结合了向量相似度搜索和其他搜索技术（全文搜索、BM25等）。这通常被称为“混合”搜索。

**步骤 1：确保您使用的向量存储支持混合搜索**

目前，在LangChain中没有统一的方法来执行混合搜索。每个向量存储可能有自己实现的方法。通常，这作为一个关键字参数在`similarity_search`中传递。

通过阅读文档或源代码，确定您使用的向量存储是否支持混合搜索，如果支持，了解如何使用它。

**步骤 2：将该参数添加为链的可配置字段**

这将使您能够轻松调用链并在运行时配置任何相关标志。有关配置的更多信息，请参见[此文档](/docs/how_to/configure)。

**步骤 3：使用该可配置字段调用链**

现在，在运行时您可以使用可配置字段调用此链。

## 代码示例

让我们看看这在代码中是什么样的具体示例。我们将使用Astra DB的Cassandra/CQL接口作为这个例子。

安装以下Python包：


```python
!pip install "cassio>=0.1.7"
```

获取[连接密钥](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html)。

初始化 cassio：


```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

使用标准[索引分析器](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html)创建 Cassandra VectorStore。索引分析器用于启用术语匹配。


```python
<!--IMPORTS:[{"imported": "Cassandra", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.cassandra.Cassandra.html", "title": "Hybrid Search"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Hybrid Search"}]-->
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

如果我们进行标准相似性搜索，我们会得到所有文档：


```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```



```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2023, I visited Paris'),
Document(page_content='In 2021, I visited New Orleans')]
```


Astra DB vectorstore `body_search` 参数可用于根据术语 `new` 过滤搜索。


```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```



```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2021, I visited New Orleans')]
```


我们现在可以创建将用于问答的链。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Hybrid Search"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Hybrid Search"}, {"imported": "ConfigurableField", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html", "title": "Hybrid Search"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Hybrid Search"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Hybrid Search"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
```

这是基本的问答链设置。


```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

在这里，我们标记检索器为具有可配置字段。所有 vectorstore 检索器都有 `search_kwargs` 作为字段。这只是一个字典，包含 vectorstore 特定字段。


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
    | model
    | StrOutputParser()
)
```


```python
chain.invoke("What city did I visit last?")
```



```output
Paris
```


我们现在可以使用可配置选项调用链。`search_kwargs` 是可配置字段的 ID。该值是用于 Astra DB 的搜索 kwargs。


```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```



```output
New York
```

