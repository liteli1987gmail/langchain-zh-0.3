---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/document_loader_web.ipynb
---
# 如何加载网页

本指南涵盖如何将网页加载到我们下游使用的 LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 格式。网页包含文本、图像和其他多媒体元素，通常以 HTML 表示。它们可能包含指向其他页面或资源的链接。

LangChain 集成了一系列适合网页的解析器。合适的解析器将取决于您的需求。下面我们演示两种可能性：

- [简单快速](/docs/how_to/document_loader_web#simple-and-fast-text-extraction) 解析，我们为每个网页恢复一个 `Document`，其内容表示为“扁平化”字符串；
- [高级](/docs/how_to/document_loader_web#advanced-parsing) 解析，我们为每个页面恢复多个 `Document` 对象，允许识别和遍历部分、链接、表格和其他结构。

## 设置

对于“简单快速”解析，我们需要 `langchain-community` 和 `beautifulsoup4` 库：


```python
%pip install -qU langchain-community beautifulsoup4
```

对于高级解析，我们将使用 `langchain-unstructured`：


```python
%pip install -qU langchain-unstructured
```

## 简单快速的文本提取

如果您正在寻找嵌入在网页中的文本的简单字符串表示，下面的方法是合适的。它将返回一个 `Document` 对象的列表——每个页面一个——包含页面文本的单个字符串。在底层，它使用 `beautifulsoup4` Python 库。

LangChain 文档加载器实现了 `lazy_load` 及其异步变体 `alazy_load`，返回 `Document` 对象的迭代器。我们将在下面使用这些。


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "How to load web pages"}]-->
import bs4
from langchain_community.document_loaders import WebBaseLoader

page_url = "https://python.langchain.com/docs/how_to/chatbots_memory/"

loader = WebBaseLoader(web_paths=[page_url])
docs = []
async for doc in loader.alazy_load():
    docs.append(doc)

assert len(docs) == 1
doc = docs[0]
```
```output
USER_AGENT environment variable not set, consider setting it to identify your requests.
```

```python
print(f"{doc.metadata}\n")
print(doc.page_content[:500].strip())
```
```output
{'source': 'https://python.langchain.com/docs/how_to/chatbots_memory/', 'title': 'How to add memory to chatbots | \uf8ffü¶úÔ∏è\uf8ffüîó LangChain', 'description': 'A key feature of chatbots is their ability to use content of previous conversation turns as context. This state management can take several forms, including:', 'language': 'en'}

How to add memory to chatbots | ü¶úÔ∏èüîó LangChain







Skip to main contentShare your thoughts on AI agents. Take the 3-min survey.IntegrationsAPI ReferenceMoreContributingPeopleLangSmithLangGraphLangChain HubLangChain JS/TSv0.3v0.3v0.2v0.1üí¨SearchIntroductionTutorialsBuild a Question Answering application over a Graph DatabaseTutorialsBuild a Simple LLM Application with LCELBuild a Query Analysis SystemBuild a ChatbotConversational RAGBuild an Extraction ChainBuild an AgentTaggingd
```
这基本上是页面 HTML 中文本的转储。它可能包含多余的信息，如标题和导航栏。如果您熟悉预期的 HTML，您可以通过 BeautifulSoup 指定所需的 `<div>` 类和其他参数。下面我们仅解析文章的主体文本：


```python
loader = WebBaseLoader(
    web_paths=[page_url],
    bs_kwargs={
        "parse_only": bs4.SoupStrainer(class_="theme-doc-markdown markdown"),
    },
    bs_get_text_kwargs={"separator": " | ", "strip": True},
)

docs = []
async for doc in loader.alazy_load():
    docs.append(doc)

assert len(docs) == 1
doc = docs[0]
```


```python
print(f"{doc.metadata}\n")
print(doc.page_content[:500])
```
```output
{'source': 'https://python.langchain.com/docs/how_to/chatbots_memory/'}

How to add memory to chatbots | A key feature of chatbots is their ability to use content of previous conversation turns as context. This state management can take several forms, including: | Simply stuffing previous messages into a chat model prompt. | The above, but trimming old messages to reduce the amount of distracting information the model has to deal with. | More complex modifications like synthesizing summaries for long running conversations. | We'll go into more detail on a few techniq
```

```python
print(doc.page_content[-500:])
```
```output
a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'), | HumanMessage(content='What did I say my name was?'), | AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')] | Note that invoking the chain again will generate another summary generated from the initial summary plus new messages and so on. You could also design a hybrid approach where a certain number of messages are retained in chat history while others are summarized.
```
请注意，这需要对底层 HTML 中主体文本的表示有提前的技术知识。

我们可以使用各种设置对 `WebBaseLoader` 进行参数化，允许指定请求头、速率限制、解析器和其他 BeautifulSoup 的关键字参数。有关详细信息，请参见其 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html)。

## 高级解析

如果我们想对页面内容进行更细粒度的控制或处理，这种方法是合适的。下面，我们不是为每个页面生成一个 `Document` 并通过 BeautifulSoup 控制其内容，而是生成多个 `Document` 对象，表示页面上的不同结构。这些结构可以包括章节标题及其对应的主体文本、列表或枚举、表格等。

在底层，它使用 `langchain-unstructured` 库。有关如何将 [Unstructured](https://docs.unstructured.io/welcome) 与 LangChain 一起使用的更多信息，请参见 [集成文档](/docs/integrations/document_loaders/unstructured_file/)。


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "How to load web pages"}]-->
from langchain_unstructured import UnstructuredLoader

page_url = "https://python.langchain.com/docs/how_to/chatbots_memory/"
loader = UnstructuredLoader(web_url=page_url)

docs = []
async for doc in loader.alazy_load():
    docs.append(doc)
```
```output
INFO: Note: NumExpr detected 12 cores but "NUMEXPR_MAX_THREADS" not set, so enforcing safe limit of 8.
INFO: NumExpr defaulting to 8 threads.
```
请注意，在没有提前了解页面HTML结构的情况下，我们恢复了正文文本的自然组织：


```python
for doc in docs[:5]:
    print(doc.page_content)
```
```output
How to add memory to chatbots
A key feature of chatbots is their ability to use content of previous conversation turns as context. This state management can take several forms, including:
Simply stuffing previous messages into a chat model prompt.
The above, but trimming old messages to reduce the amount of distracting information the model has to deal with.
More complex modifications like synthesizing summaries for long running conversations.
ERROR! Session/line number was not unique in database. History logging moved to new session 2747
```
### 从特定部分提取内容

每个 `Document` 对象代表页面的一个元素。其元数据包含有用的信息，例如其类别：


```python
for doc in docs[:5]:
    print(f'{doc.metadata["category"]}: {doc.page_content}')
```
```output
Title: How to add memory to chatbots
NarrativeText: A key feature of chatbots is their ability to use content of previous conversation turns as context. This state management can take several forms, including:
ListItem: Simply stuffing previous messages into a chat model prompt.
ListItem: The above, but trimming old messages to reduce the amount of distracting information the model has to deal with.
ListItem: More complex modifications like synthesizing summaries for long running conversations.
```
元素之间也可能存在父子关系——例如，一个段落可能属于一个有标题的部分。如果某个部分特别重要（例如，用于索引），我们可以隔离相应的 `Document` 对象。

作为示例，下面我们加载两个网页的“设置”部分的内容：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to load web pages"}]-->
from typing import List

from langchain_core.documents import Document


async def _get_setup_docs_from_url(url: str) -> List[Document]:
    loader = UnstructuredLoader(web_url=url)

    setup_docs = []
    parent_id = -1
    async for doc in loader.alazy_load():
        if doc.metadata["category"] == "Title" and doc.page_content.startswith("Setup"):
            parent_id = doc.metadata["element_id"]
        if doc.metadata.get("parent_id") == parent_id:
            setup_docs.append(doc)

    return setup_docs


page_urls = [
    "https://python.langchain.com/docs/how_to/chatbots_memory/",
    "https://python.langchain.com/docs/how_to/chatbots_tools/",
]
setup_docs = []
for url in page_urls:
    page_setup_docs = await _get_setup_docs_from_url(url)
    setup_docs.extend(page_setup_docs)
```


```python
from collections import defaultdict

setup_text = defaultdict(str)

for doc in setup_docs:
    url = doc.metadata["url"]
    setup_text[url] += f"{doc.page_content}\n"

dict(setup_text)
```



```output
{'https://python.langchain.com/docs/how_to/chatbots_memory/': "You'll need to install a few packages, and have your OpenAI API key set as an environment variable named OPENAI_API_KEY:\n%pip install --upgrade --quiet langchain langchain-openai\n\n# Set env var OPENAI_API_KEY or load from a .env file:\nimport dotenv\n\ndotenv.load_dotenv()\n[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.\nYou should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m\n[0mNote: you may need to restart the kernel to use updated packages.\n",
 'https://python.langchain.com/docs/how_to/chatbots_tools/': "For this guide, we'll be using a tool calling agent with a single tool for searching the web. The default will be powered by Tavily, but you can switch it out for any similar tool. The rest of this section will assume you're using Tavily.\nYou'll need to sign up for an account on the Tavily website, and install the following packages:\n%pip install --upgrade --quiet langchain-community langchain-openai tavily-python\n\n# Set env var OPENAI_API_KEY or load from a .env file:\nimport dotenv\n\ndotenv.load_dotenv()\nYou will also need your OpenAI key set as OPENAI_API_KEY and your Tavily API key set as TAVILY_API_KEY.\n"}
```


### 对页面内容进行向量搜索

一旦我们将页面内容加载到LangChain `Document` 对象中，我们可以以通常的方式对其进行索引（例如，用于RAG应用）。下面我们使用OpenAI [嵌入](/docs/concepts/#embedding-models)，尽管任何LangChain嵌入模型都可以。


```python
%pip install -qU langchain-openai
```


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
<!--IMPORTS:[{"imported": "InMemoryVectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.in_memory.InMemoryVectorStore.html", "title": "How to load web pages"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to load web pages"}]-->
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings

vector_store = InMemoryVectorStore.from_documents(setup_docs, OpenAIEmbeddings())
retrieved_docs = vector_store.similarity_search("Install Tavily", k=2)
for doc in retrieved_docs:
    print(f'Page {doc.metadata["url"]}: {doc.page_content[:300]}\n')
```
```output
INFO: HTTP Request: POST https://api.openai.com/v1/embeddings "HTTP/1.1 200 OK"
INFO: HTTP Request: POST https://api.openai.com/v1/embeddings "HTTP/1.1 200 OK"
``````output
Page https://python.langchain.com/docs/how_to/chatbots_tools/: You'll need to sign up for an account on the Tavily website, and install the following packages:

Page https://python.langchain.com/docs/how_to/chatbots_tools/: For this guide, we'll be using a tool calling agent with a single tool for searching the web. The default will be powered by Tavily, but you can switch it out for any similar tool. The rest of this section will assume you're using Tavily.
```
## 其他网页加载器

有关可用的 LangChain 网页加载器的列表，请参见 [此表](/docs/integrations/document_loaders/#webpages)。
