---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_no_queries.ipynb
sidebar_position: 3
---
# 如何处理未生成查询的情况

有时，查询分析技术可能允许生成任意数量的查询——包括没有查询！在这种情况下，我们的整体链需要检查查询分析的结果，然后决定是否调用检索器。

我们将使用模拟数据作为本示例。

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
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to handle cases where no queries are generated"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to handle cases where no queries are generated"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to handle cases where no queries are generated"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## 查询分析

我们将使用函数调用来结构化输出。然而，我们将配置大型语言模型，使其不需要调用表示搜索查询的函数（如果它决定不这样做）。然后，我们还将使用一个提示来进行查询分析，明确说明何时应该和不应该进行搜索。


```python
from typing import Optional

from pydantic import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    query: str = Field(
        ...,
        description="Similarity search query applied to job record.",
    )
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to handle cases where no queries are generated"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to handle cases where no queries are generated"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to handle cases where no queries are generated"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You have the ability to issue search queries to get information to help answer user information.

You do not NEED to look things up. If you don't need to, then just respond normally."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

我们可以看到，通过调用这个，我们得到一个消息，有时 - 但并不总是 - 返回一个工具调用。


```python
query_analyzer.invoke("where did Harrison Work")
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_korLZrh08PTRL94f4L7rFqdj', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 95, 'total_tokens': 109}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-ea94d376-37bf-4f80-abe6-e3b42b767ea0-0', tool_calls=[{'name': 'Search', 'args': {'query': 'Harrison'}, 'id': 'call_korLZrh08PTRL94f4L7rFqdj', 'type': 'tool_call'}], usage_metadata={'input_tokens': 95, 'output_tokens': 14, 'total_tokens': 109})
```



```python
query_analyzer.invoke("hi!")
```



```output
AIMessage(content='Hello! How can I assist you today?', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 10, 'prompt_tokens': 93, 'total_tokens': 103}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'stop', 'logprobs': None}, id='run-ebdfc44a-455a-4ca6-be85-84559886b1e1-0', usage_metadata={'input_tokens': 93, 'output_tokens': 10, 'total_tokens': 103})
```


## 带查询分析的检索

那么我们如何将其包含在链中呢？让我们看下面的一个例子。


```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to handle cases where no queries are generated"}, {"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to handle cases where no queries are generated"}]-->
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```


```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # Could add more logic - like another LLM call - here
        return docs
    else:
        return response
```


```python
custom_chain.invoke("where did Harrison Work")
```
```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```


```output
[Document(page_content='Harrison worked at Kensho')]
```



```python
custom_chain.invoke("hi!")
```



```output
AIMessage(content='Hello! How can I assist you today?', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 10, 'prompt_tokens': 93, 'total_tokens': 103}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'stop', 'logprobs': None}, id='run-e87f058d-30c0-4075-8a89-a01b982d557e-0', usage_metadata={'input_tokens': 93, 'output_tokens': 10, 'total_tokens': 103})
```

