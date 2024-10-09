---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/maritalk.ipynb
---
<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/chat/maritalk.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

# Maritalk

## 介绍

MariTalk是由巴西公司[Maritaca AI](https://www.maritaca.ai)开发的助手。
MariTalk基于经过特别训练以良好理解葡萄牙语的语言模型。

本笔记本演示了如何通过两个示例使用MariTalk与LangChain。

1. 一个简单的示例，演示如何使用MariTalk执行任务。
2. LLM + RAG：第二个示例展示了如何回答一个答案在一份不符合MariTalk令牌限制的长文档中的问题。为此，我们将使用一个简单的搜索器（BM25）首先搜索文档中最相关的部分，然后将其提供给MariTalk进行回答。

## 安装
首先，使用以下命令安装LangChain库（及其所有依赖项）：


```python
!pip install langchain langchain-core langchain-community httpx
```

## API 密钥
您需要一个可以从 chat.maritaca.ai 获取的 API 密钥（在“Chaves da API”部分）。


### 示例 1 - 宠物名称建议

让我们定义我们的语言模型 ChatMaritalk，并使用您的 API 密钥进行配置。


```python
<!--IMPORTS:[{"imported": "ChatMaritalk", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.maritalk.ChatMaritalk.html", "title": "Maritalk"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Maritalk"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Maritalk"}]-->
from langchain_community.chat_models import ChatMaritalk
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate

llm = ChatMaritalk(
    model="sabia-2-medium",  # Available models: sabia-2-small and sabia-2-medium
    api_key="",  # Insert your API key here
    temperature=0.7,
    max_tokens=100,
)

output_parser = StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an assistant specialized in suggesting pet names. Given the animal, you must suggest 4 names.",
        ),
        ("human", "I have a {animal}"),
    ]
)

chain = chat_prompt | llm | output_parser

response = chain.invoke({"animal": "dog"})
print(response)  # should answer something like "1. Max\n2. Bella\n3. Charlie\n4. Rocky"
```

### 流式生成

对于涉及生成长文本的任务，例如创建一篇详尽的文章或翻译一份大型文档，分部分接收响应可能更有利，因为文本是在生成时逐步生成的，而不是等待完整文本。这使得应用程序更加响应迅速和高效，特别是当生成的文本很庞大时。我们提供两种方法来满足这一需求：一种是同步的，另一种是异步的。

#### 同步：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Maritalk"}]-->
from langchain_core.messages import HumanMessage

messages = [HumanMessage(content="Suggest 3 names for my dog")]

for chunk in llm.stream(messages):
    print(chunk.content, end="", flush=True)
```

#### 异步：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Maritalk"}]-->
from langchain_core.messages import HumanMessage


async def async_invoke_chain(animal: str):
    messages = [HumanMessage(content=f"Suggest 3 names for my {animal}")]
    async for chunk in llm._astream(messages):
        print(chunk.message.content, end="", flush=True)


await async_invoke_chain("dog")
```

### 示例 2 - RAG + LLM：UNICAMP 2024 入学考试问题回答系统
对于这个示例，我们需要安装一些额外的库：


```python
!pip install unstructured rank_bm25 pdf2image pdfminer-six pikepdf pypdf unstructured_inference fastapi kaleido uvicorn "pillow<10.1.0" pillow_heif -q
```

#### 正在加载数据库

第一步是创建一个包含通知信息的数据库。为此，我们将从COMVEST网站下载通知，并将提取的文本分割成500个字符的窗口。


```python
<!--IMPORTS:[{"imported": "OnlinePDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.OnlinePDFLoader.html", "title": "Maritalk"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Maritalk"}]-->
from langchain_community.document_loaders import OnlinePDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Loading the COMVEST 2024 notice
loader = OnlinePDFLoader(
    "https://www.comvest.unicamp.br/wp-content/uploads/2023/10/31-2023-Dispoe-sobre-o-Vestibular-Unicamp-2024_com-retificacao.pdf"
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=100, separators=["\n", " ", ""]
)
texts = text_splitter.split_documents(data)
```

#### 创建搜索器
现在我们有了数据库，我们需要一个搜索器。对于这个例子，我们将使用一个简单的BM25作为搜索系统，但这可以被任何其他搜索器（例如通过嵌入进行搜索）替代。


```python
<!--IMPORTS:[{"imported": "BM25Retriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.bm25.BM25Retriever.html", "title": "Maritalk"}]-->
from langchain_community.retrievers import BM25Retriever

retriever = BM25Retriever.from_documents(texts)
```

#### 结合搜索系统 + 大型语言模型
现在我们有了搜索器，我们只需要实现一个指定任务的提示，并调用链。


```python
<!--IMPORTS:[{"imported": "load_qa_chain", "source": "langchain.chains.question_answering", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.question_answering.chain.load_qa_chain.html", "title": "Maritalk"}]-->
from langchain.chains.question_answering import load_qa_chain

prompt = """Baseado nos seguintes documentos, responda a pergunta abaixo.

{context}

Pergunta: {query}
"""

qa_prompt = ChatPromptTemplate.from_messages([("human", prompt)])

chain = load_qa_chain(llm, chain_type="stuff", verbose=True, prompt=qa_prompt)

query = "Qual o tempo máximo para realização da prova?"

docs = retriever.invoke(query)

chain.invoke(
    {"input_documents": docs, "query": query}
)  # Should output something like: "O tempo máximo para realização da prova é de 5 horas."
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
