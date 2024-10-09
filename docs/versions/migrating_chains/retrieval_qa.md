---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/retrieval_qa.ipynb
---
# 从RetrievalQA迁移

[`RetrievalQA`链](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html) 使用检索增强生成在数据源上执行自然语言问答。

切换到LCEL实现的一些优势包括：

- 更容易自定义。提示词和文档格式等细节仅通过`RetrievalQA`链中的特定参数进行配置。
- 更容易返回源文档。
- 支持可运行的方法，如流式处理和异步操作。

现在让我们并排查看它们。我们将使用以下摄取代码将[Lilian Weng的博客文章](https://lilianweng.github.io/posts/2023-06-23-agent/)关于自主代理加载到本地向量存储中：

## 共享设置

对于两个版本，我们需要使用`WebBaseLoader`文档加载器加载数据，使用`RecursiveCharacterTextSplitter`进行分割，并将其添加到内存中的`FAISS`向量存储中。

我们还将实例化一个聊天模型以供使用。


```python
%pip install --upgrade --quiet langchain-community langchain langchain-openai faiss-cpu beautifulsoup4
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Migrating from RetrievalQA"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Migrating from RetrievalQA"}, {"imported": "ChatOpenAI", "source": "langchain_openai.chat_models", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from RetrievalQA"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai.embeddings", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Migrating from RetrievalQA"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Migrating from RetrievalQA"}]-->
# Load docs
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain_openai.chat_models import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

# Split
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)

# Store splits
vectorstore = FAISS.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())

# LLM
llm = ChatOpenAI()
```

## 传统

<details open>


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Migrating from RetrievalQA"}]-->
from langchain import hub
from langchain.chains import RetrievalQA

# See full prompt at https://smith.langchain.com/hub/rlm/rag-prompt
prompt = hub.pull("rlm/rag-prompt")

qa_chain = RetrievalQA.from_llm(
    llm, retriever=vectorstore.as_retriever(), prompt=prompt
)

qa_chain("What are autonomous agents?")
```



```output
{'query': 'What are autonomous agents?',
 'result': 'Autonomous agents are LLM-empowered agents capable of handling autonomous design, planning, and performance of complex scientific experiments. These agents can browse the Internet, read documentation, execute code, call robotics experimentation APIs, and leverage other LLMs. They can generate reasoning steps, such as developing a novel anticancer drug, based on requested tasks.'}
```


</details>

## LCEL

<details open>


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from RetrievalQA"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Migrating from RetrievalQA"}]-->
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# See full prompt at https://smith.langchain.com/hub/rlm/rag-prompt
prompt = hub.pull("rlm/rag-prompt")


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


qa_chain = (
    {
        "context": vectorstore.as_retriever() | format_docs,
        "question": RunnablePassthrough(),
    }
    | prompt
    | llm
    | StrOutputParser()
)

qa_chain.invoke("What are autonomous agents?")
```



```output
'Autonomous agents are agents empowered by large language models (LLMs) that can handle autonomous design, planning, and performance of complex tasks such as scientific experiments. These agents can use tools to browse the Internet, read documentation, execute code, call robotics experimentation APIs, and leverage other LLMs for their tasks. The model can come up with reasoning steps when given a specific task, such as developing a novel anticancer drug.'
```


LCEL 实现暴露了在检索、格式化文档以及将它们通过提示传递给大型语言模型（LLM）时发生的内部过程，但它更为冗长。您可以在辅助函数中自定义和封装此组合逻辑，或使用更高级的 [`create_retrieval_chain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html) 和 [`create_stuff_documents_chain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html) 辅助方法：


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Migrating from RetrievalQA"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Migrating from RetrievalQA"}]-->
from langchain import hub
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# See full prompt at https://smith.langchain.com/hub/langchain-ai/retrieval-qa-chat
retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")

combine_docs_chain = create_stuff_documents_chain(llm, retrieval_qa_chat_prompt)
rag_chain = create_retrieval_chain(vectorstore.as_retriever(), combine_docs_chain)

rag_chain.invoke({"input": "What are autonomous agents?"})
```



```output
{'input': 'What are autonomous agents?',
 'context': [Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log", 'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en'}, page_content='Boiko et al. (2023) also looked into LLM-empowered agents for scientific discovery, to handle autonomous design, planning, and performance of complex scientific experiments. This agent can use tools to browse the Internet, read documentation, execute code, call robotics experimentation APIs and leverage other LLMs.\nFor example, when requested to "develop a novel anticancer drug", the model came up with the following reasoning steps:'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log", 'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en'}, page_content='Weng, Lilian. (Jun 2023). “LLM-powered Autonomous Agents”. Lil’Log. https://lilianweng.github.io/posts/2023-06-23-agent/.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log", 'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en'}, page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log", 'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en'}, page_content='Or\n@article{weng2023agent,\n  title   = "LLM-powered Autonomous Agents",\n  author  = "Weng, Lilian",\n  journal = "lilianweng.github.io",\n  year    = "2023",\n  month   = "Jun",\n  url     = "https://lilianweng.github.io/posts/2023-06-23-agent/"\n}\nReferences#\n[1] Wei et al. “Chain of thought prompting elicits reasoning in large language models.” NeurIPS 2022\n[2] Yao et al. “Tree of Thoughts: Dliberate Problem Solving with Large Language Models.” arXiv preprint arXiv:2305.10601 (2023).')],
 'answer': 'Autonomous agents are entities capable of operating independently to perform tasks or make decisions without direct human intervention. In the context provided, autonomous agents empowered by Large Language Models (LLMs) are used for scientific discovery, including tasks like autonomous design, planning, and executing complex scientific experiments.'}
```


</details>

## 下一步

查看 [LCEL 概念文档](/docs/concepts/#langchain-expression-language-lcel) 以获取有关 LangChain 表达式语言的更多背景信息。
