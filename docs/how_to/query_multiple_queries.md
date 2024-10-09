---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_multiple_queries.ipynb
sidebar_position: 4
---
# 如何处理查询分析中的多个查询

有时，查询分析技术可能允许生成多个查询。在这些情况下，我们需要记住运行所有查询，然后合并结果。我们将展示一个简单的示例（使用模拟数据）来说明如何做到这一点。

## 设置
#### 安装依赖


```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```
```output
Note: you may need to restart the kernel to use updated packages.
```
#### 设置环境变量

在这个例子中，我们将使用OpenAI：


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### 创建索引

我们将基于虚假信息创建一个向量存储。


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to handle multiple queries when doing query analysis"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to handle multiple queries when doing query analysis"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to handle multiple queries when doing query analysis"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

texts = ["Harrison worked at Kensho", "Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## 查询分析

我们将使用函数调用来结构化输出。我们将让它返回多个查询。


```python
from typing import List, Optional

from pydantic import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    queries: List[str] = Field(
        ...,
        description="Distinct queries to search for",
    )
```


```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to handle multiple queries when doing query analysis"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to handle multiple queries when doing query analysis"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to handle multiple queries when doing query analysis"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to handle multiple queries when doing query analysis"}]-->
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information.

If you need to look up two distinct pieces of information, you are allowed to do that!"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

我们可以看到这允许创建多个查询


```python
query_analyzer.invoke("where did Harrison Work")
```



```output
Search(queries=['Harrison Work', 'Harrison employment history'])
```



```python
query_analyzer.invoke("where did Harrison and ankush Work")
```



```output
Search(queries=['Harrison work history', 'Ankush work history'])
```


## 带查询分析的检索

那么我们如何将其包含在链中呢？一个让这变得更简单的事情是，如果我们异步调用检索器 - 这将让我们循环遍历查询，而不会被响应时间阻塞。


```python
<!--IMPORTS:[{"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to handle multiple queries when doing query analysis"}]-->
from langchain_core.runnables import chain
```


```python
@chain
async def custom_chain(question):
    response = await query_analyzer.ainvoke(question)
    docs = []
    for query in response.queries:
        new_docs = await retriever.ainvoke(query)
        docs.extend(new_docs)
    # You probably want to think about reranking or deduplicating documents here
    # But that is a separate topic
    return docs
```


```python
await custom_chain.ainvoke("where did Harrison Work")
```



```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Harrison worked at Kensho')]
```



```python
await custom_chain.ainvoke("where did Harrison and ankush Work")
```



```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Ankush worked at Facebook')]
```

