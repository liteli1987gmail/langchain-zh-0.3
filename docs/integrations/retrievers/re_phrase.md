---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/re_phrase.ipynb
---
# 重述查询

`重述查询` 是一个简单的检索器，它在用户输入和检索器传递的查询之间应用大型语言模型。

它可以以任何方式预处理用户输入。

## 示例

### 设置

创建一个向量存储。


```python
<!--IMPORTS:[{"imported": "RePhraseQueryRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.re_phraser.RePhraseQueryRetriever.html", "title": "RePhraseQuery"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "RePhraseQuery"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "RePhraseQuery"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "RePhraseQuery"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "RePhraseQuery"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "RePhraseQuery"}]-->
import logging

from langchain.retrievers import RePhraseQueryRetriever
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```


```python
logging.basicConfig()
logging.getLogger("langchain.retrievers.re_phraser").setLevel(logging.INFO)

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
```

### 使用默认提示

在 `from_llm` 类方法中使用的默认提示：

```
DEFAULT_TEMPLATE = """You are an assistant tasked with taking a natural language \
query from a user and converting it into a query for a vectorstore. \
In this process, you strip out information that is not relevant for \
the retrieval task. Here is the user query: {question}"""
```


```python
llm = ChatOpenAI(temperature=0)
retriever_from_llm = RePhraseQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(), llm=llm
)
```


```python
docs = retriever_from_llm.invoke(
    "Hi I'm Lance. What are the approaches to Task Decomposition?"
)
```
```output
INFO:langchain.retrievers.re_phraser:Re-phrased question: The user query can be converted into a query for a vectorstore as follows:

"approaches to Task Decomposition"
```

```python
docs = retriever_from_llm.invoke(
    "I live in San Francisco. What are the Types of Memory?"
)
```
```output
INFO:langchain.retrievers.re_phraser:Re-phrased question: Query for vectorstore: "Types of Memory"
```
### 自定义提示


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "RePhraseQuery"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "RePhraseQuery"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

QUERY_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an assistant tasked with taking a natural languge query from a user
    and converting it into a query for a vectorstore. In the process, strip out all 
    information that is not relevant for the retrieval task and return a new, simplified
    question for vectorstore retrieval. The new user query should be in pirate speech.
    Here is the user query: {question} """,
)
llm = ChatOpenAI(temperature=0)
llm_chain = LLMChain(llm=llm, prompt=QUERY_PROMPT)
```


```python
retriever_from_llm_chain = RePhraseQueryRetriever(
    retriever=vectorstore.as_retriever(), llm_chain=llm_chain
)
```


```python
docs = retriever_from_llm_chain.invoke(
    "Hi I'm Lance. What is Maximum Inner Product Search?"
)
```
```output
INFO:langchain.retrievers.re_phraser:Re-phrased question: Ahoy matey! What be Maximum Inner Product Search, ye scurvy dog?
```

## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
