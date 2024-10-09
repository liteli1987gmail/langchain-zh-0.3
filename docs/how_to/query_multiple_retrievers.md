---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_multiple_retrievers.ipynb
sidebar_position: 5
---
# 如何在查询分析中处理多个检索器

有时，查询分析技术可能允许选择使用哪个检索器。要使用此功能，您需要添加一些逻辑来选择要使用的检索器。我们将展示一个简单的示例（使用模拟数据）来说明如何做到这一点。

## 设置
#### 安装依赖


```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```
```output
Note: you may need to restart the kernel to use updated packages.
```
#### 设置环境变量

我们将在这个例子中使用OpenAI：


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
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to handle multiple retrievers when doing query analysis"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to handle multiple retrievers when doing query analysis"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to handle multiple retrievers when doing query analysis"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="harrison")
retriever_harrison = vectorstore.as_retriever(search_kwargs={"k": 1})

texts = ["Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="ankush")
retriever_ankush = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## 查询分析

我们将使用函数调用来结构化输出。我们将让它返回多个查询。


```python
from typing import List, Optional

from pydantic import BaseModel, Field


class Search(BaseModel):
    """Search for information about a person."""

    query: str = Field(
        ...,
        description="Query to look up",
    )
    person: str = Field(
        ...,
        description="Person to look things up for. Should be `HARRISON` or `ANKUSH`.",
    )
```


```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to handle multiple retrievers when doing query analysis"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to handle multiple retrievers when doing query analysis"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to handle multiple retrievers when doing query analysis"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to handle multiple retrievers when doing query analysis"}]-->
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information."""
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

我们可以看到这允许在检索器之间进行路由


```python
query_analyzer.invoke("where did Harrison Work")
```



```output
Search(query='work history', person='HARRISON')
```



```python
query_analyzer.invoke("where did ankush Work")
```



```output
Search(query='work history', person='ANKUSH')
```


## 使用查询分析进行检索

那么我们如何将其包含在链中？我们只需要一些简单的逻辑来选择检索器并传入搜索查询


```python
<!--IMPORTS:[{"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to handle multiple retrievers when doing query analysis"}]-->
from langchain_core.runnables import chain
```


```python
retrievers = {
    "HARRISON": retriever_harrison,
    "ANKUSH": retriever_ankush,
}
```


```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    retriever = retrievers[response.person]
    return retriever.invoke(response.query)
```


```python
custom_chain.invoke("where did Harrison Work")
```



```output
[Document(page_content='Harrison worked at Kensho')]
```



```python
custom_chain.invoke("where did ankush Work")
```



```output
[Document(page_content='Ankush worked at Facebook')]
```

