---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/query_analysis.ipynb
sidebar_position: 0
---
# 构建查询分析系统

:::info Prerequisites

本指南假设您熟悉以下概念：

- [文档加载器](/docs/concepts/#document-loaders)
- [聊天模型](/docs/concepts/#chat-models)
- [嵌入](/docs/concepts/#embedding-models)
- [向量存储](/docs/concepts/#vector-stores)
- [检索](/docs/concepts/#retrieval)

:::

本页面将展示如何在一个基本的端到端示例中使用查询分析。这将涵盖创建一个简单的搜索引擎，展示在将原始用户问题传递给该搜索时发生的失败模式，以及查询分析如何帮助解决该问题的示例。有许多不同的查询分析技术，而这个端到端示例不会展示所有这些技术。

为了这个示例，我们将对LangChain YouTube视频进行检索。

## 设置
#### 安装依赖


```python
%%capture --no-stderr
%pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma
```

#### 设置环境变量

在这个例子中我们将使用OpenAI：


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### 加载文档

我们可以使用`YouTubeLoader`来加载一些LangChain视频的转录文本：


```python
<!--IMPORTS:[{"imported": "YoutubeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.youtube.YoutubeLoader.html", "title": "Build a Query Analysis System"}]-->
from langchain_community.document_loaders import YoutubeLoader

urls = [
    "https://www.youtube.com/watch?v=HAn9vnJy6S4",
    "https://www.youtube.com/watch?v=dA1cHGACXCo",
    "https://www.youtube.com/watch?v=ZcEMLz27sL4",
    "https://www.youtube.com/watch?v=hvAPnpSfSGo",
    "https://www.youtube.com/watch?v=EhlPDL4QrWY",
    "https://www.youtube.com/watch?v=mmBo8nlu2j0",
    "https://www.youtube.com/watch?v=rQdibOsL1ps",
    "https://www.youtube.com/watch?v=28lC4fqukoc",
    "https://www.youtube.com/watch?v=es-9MgxB-uc",
    "https://www.youtube.com/watch?v=wLRHwKuKvOE",
    "https://www.youtube.com/watch?v=ObIltMaRJvY",
    "https://www.youtube.com/watch?v=DjuXACWYkkU",
    "https://www.youtube.com/watch?v=o7C9ld6Ln-M",
]
docs = []
for url in urls:
    docs.extend(YoutubeLoader.from_youtube_url(url, add_video_info=True).load())
```


```python
import datetime

# Add some additional metadata: what year the video was published
for doc in docs:
    doc.metadata["publish_year"] = int(
        datetime.datetime.strptime(
            doc.metadata["publish_date"], "%Y-%m-%d %H:%M:%S"
        ).strftime("%Y")
    )
```

以下是我们加载的视频的标题：


```python
[doc.metadata["title"] for doc in docs]
```



```output
['OpenGPTs',
 'Building a web RAG chatbot: using LangChain, Exa (prev. Metaphor), LangSmith, and Hosted Langserve',
 'Streaming Events: Introducing a new `stream_events` method',
 'LangGraph: Multi-Agent Workflows',
 'Build and Deploy a RAG app with Pinecone Serverless',
 'Auto-Prompt Builder (with Hosted LangServe)',
 'Build a Full Stack RAG App With TypeScript',
 'Getting Started with Multi-Modal LLMs',
 'SQL Research Assistant',
 'Skeleton-of-Thought: Building a New Template from Scratch',
 'Benchmarking RAG over LangChain Docs',
 'Building a Research Assistant from Scratch',
 'LangServe and LangChain Templates Webinar']
```


这是与每个视频相关的元数据。我们可以看到每个文档也有一个标题、观看次数、发布日期和时长：


```python
docs[0].metadata
```



```output
{'source': 'HAn9vnJy6S4',
 'title': 'OpenGPTs',
 'description': 'Unknown',
 'view_count': 7210,
 'thumbnail_url': 'https://i.ytimg.com/vi/HAn9vnJy6S4/hq720.jpg',
 'publish_date': '2024-01-31 00:00:00',
 'length': 1530,
 'author': 'LangChain',
 'publish_year': 2024}
```


这是文档内容的一个示例：


```python
docs[0].page_content[:500]
```



```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```


### 索引文档

每当我们进行检索时，我们需要创建一个可以查询的文档索引。我们将使用向量存储来索引我们的文档，并且我们会先对它们进行分块，以使我们的检索更加简洁和准确：


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Build a Query Analysis System"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Build a Query Analysis System"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Build a Query Analysis System"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
chunked_docs = text_splitter.split_documents(docs)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    chunked_docs,
    embeddings,
)
```

## 无查询分析的检索

我们可以直接对用户问题执行相似性搜索，以找到与问题相关的内容块：


```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```
```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```
这效果很好！我们的第一个结果与问题非常相关。


如果我们想要搜索特定时间段的结果呢？


```python
search_results = vectorstore.similarity_search("videos on RAG published in 2023")
print(search_results[0].metadata["title"])
print(search_results[0].metadata["publish_date"])
print(search_results[0].page_content[:500])
```
```output
OpenGPTs
2024-01-31
hardcoded that it will always do a retrieval step here the assistant decides whether to do a retrieval step or not sometimes this is good sometimes this is bad sometimes it you don't need to do a retrieval step when I said hi it didn't need to call it tool um but other times you know the the llm might mess up and not realize that it needs to do a retrieval step and so the rag bot will always do a retrieval step so it's more focused there because this is also a simpler architecture so it's always
```
我们的第一个结果来自2024年（尽管我们请求的是2023年的视频），并且与输入不太相关。由于我们只是针对文档内容进行搜索，因此无法根据任何文档属性过滤结果。

这只是可能出现的一种失败模式。现在让我们看看基本的查询分析如何解决这个问题！

## 查询分析

我们可以使用查询分析来改善检索结果。这将涉及定义一个包含一些日期过滤器的**查询模式**，并使用函数调用模型将用户问题转换为结构化查询。

### 查询模式
在这种情况下，我们将有明确的最小和最大出版日期属性，以便进行过滤。


```python
from typing import Optional

from pydantic import BaseModel, Field


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

### 查询生成

为了将用户问题转换为结构化查询，我们将利用OpenAI的工具调用API。具体来说，我们将使用新的[ChatModel.with_structured_output()](/docs/how_to/structured_output)构造函数来处理将模式传递给模型并解析输出。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a Query Analysis System"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Build a Query Analysis System"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Build a Query Analysis System"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
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
```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```
让我们看看我们的分析器为之前搜索的问题生成了什么查询：


```python
query_analyzer.invoke("how do I build a RAG agent")
```



```output
Search(query='build RAG agent', publish_year=None)
```



```python
query_analyzer.invoke("videos on RAG published in 2023")
```



```output
Search(query='RAG', publish_year=2023)
```


## 使用查询分析进行检索

我们的查询分析看起来相当不错；现在让我们尝试使用生成的查询来实际执行检索。

**注意：**在我们的示例中，我们指定了`tool_choice="Search"`。这将强制LLM调用一个 - 仅一个 - 工具，这意味着我们将始终有一个优化的查询来查找。请注意，这并不总是如此 - 请参阅其他指南以了解如何处理没有 - 或多个 - 优化查询返回的情况。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Build a Query Analysis System"}]-->
from typing import List

from langchain_core.documents import Document
```


```python
def retrieval(search: Search) -> List[Document]:
    if search.publish_year is not None:
        # This is syntax specific to Chroma,
        # the vector database we are using.
        _filter = {"publish_year": {"$eq": search.publish_year}}
    else:
        _filter = None
    return vectorstore.similarity_search(search.query, filter=_filter)
```


```python
retrieval_chain = query_analyzer | retrieval
```

我们现在可以在之前的问题输入上运行这个链，并看到它仅返回该年的结果！


```python
results = retrieval_chain.invoke("RAG tutorial published in 2023")
```


```python
[(doc.metadata["title"], doc.metadata["publish_date"]) for doc in results]
```



```output
[('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('LangServe and LangChain Templates Webinar', '2023-11-02 00:00:00'),
 ('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('Building a Research Assistant from Scratch', '2023-11-16 00:00:00')]
```

