---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/pdf_qa.ipynb
keywords: [pdf, document loader]
---
# 构建一个PDF摄取和问答系统

:::info Prerequisites

本指南假设您熟悉以下概念：

- [文档加载器](/docs/concepts/#document-loaders)
- [聊天模型](/docs/concepts/#chat-models)
- [嵌入](/docs/concepts/#embedding-models)
- [向量存储](/docs/concepts/#vector-stores)
- [检索增强生成](/docs/tutorials/rag/)

:::

PDF文件通常包含其他来源无法获得的重要非结构化数据。它们可能相当冗长，并且与纯文本文件不同，通常不能直接输入到语言模型的提示中。

在本教程中，您将创建一个可以回答关于PDF文件的问题的系统。更具体地说，您将使用[文档加载器](/docs/concepts/#document-loaders)加载可供大型语言模型使用的文本，然后构建一个检索增强生成（RAG）管道来回答问题，包括来自源材料的引用。

本教程将略过一些在我们的[RAG](/docs/tutorials/rag/)教程中更深入讨论的概念，因此如果您还没有阅读过，您可能想先浏览那些内容。

让我们开始吧！

## 加载文档

首先，您需要选择一个要加载的PDF。我们将使用来自[Nike年度公开SEC报告](https://s1.q4cdn.com/806093406/files/doc_downloads/2023/414759-1-_5_Nike-NPS-Combo_Form-10-K_WR.pdf)的文档。它超过100页，包含一些重要数据和较长的解释性文本。不过，您可以随意使用您选择的PDF。

一旦您选择了PDF，下一步是将其加载为LLM更容易处理的格式，因为LLM通常需要文本输入。LangChain有几个不同的[内置文档加载器](/docs/how_to/document_loader_pdf/)可以用于此目的，您可以进行实验。下面，我们将使用一个由[`pypdf`](https://pypi.org/project/pypdf/)包提供支持的加载器，它从文件路径读取：


```python
%pip install -qU pypdf langchain_community
```


```python
<!--IMPORTS:[{"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "Build a PDF ingestion and Question/Answering system"}]-->
from langchain_community.document_loaders import PyPDFLoader

file_path = "../example_data/nke-10k-2023.pdf"
loader = PyPDFLoader(file_path)

docs = loader.load()

print(len(docs))
```
```output
107
```

```python
print(docs[0].page_content[0:100])
print(docs[0].metadata)
```
```output
Table of Contents
UNITED STATES
SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K

{'source': '../example_data/nke-10k-2023.pdf', 'page': 0}
```
那么刚刚发生了什么？

- 加载器将指定路径的PDF读取到内存中。
- 然后，它使用 `pypdf` 包提取文本数据。
- 最后，它为PDF的每一页创建一个LangChain [文档](/docs/concepts/#documents)，包含该页的内容和一些关于文本来源于文档的元数据。

LangChain有[许多其他文档加载器](/docs/integrations/document_loaders/)用于其他数据源，或者您可以创建一个[自定义文档加载器](/docs/how_to/document_loader_custom/)。

## 使用RAG进行问答

接下来，您将准备加载的文档以便后续检索。使用[文本分割器](/docs/concepts/#text-splitters)，您将把加载的文档分割成更小的文档，以便更容易适应LLM的上下文窗口，然后将它们加载到[向量存储](/docs/concepts/#vector-stores)中。然后，您可以从向量存储中创建一个[检索器](/docs/concepts/#retrievers)以在我们的RAG链中使用：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" openaiParams={`model="gpt-4o"`} />



```python
%pip install langchain_chroma langchain_openai
```


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Build a PDF ingestion and Question/Answering system"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Build a PDF ingestion and Question/Answering system"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Build a PDF ingestion and Question/Answering system"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever()
```

最后，您将使用一些内置助手构建最终的 `rag_chain`：


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Build a PDF ingestion and Question/Answering system"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Build a PDF ingestion and Question/Answering system"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a PDF ingestion and Question/Answering system"}]-->
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)


question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

results = rag_chain.invoke({"input": "What was Nike's revenue in 2023?"})

results
```



```output
{'input': "What was Nike's revenue in 2023?",
 'context': [Document(page_content='Table of Contents\nFISCAL 2023 NIKE BRAND REVENUE HIGHLIGHTS\nThe following tables present NIKE Brand revenues disaggregated by reportable operating segment, distribution channel and major product line:\nFISCAL 2023 COMPARED TO FISCAL 2022\n•NIKE, Inc. Revenues were $51.2 billion in fiscal 2023, which increased 10% and 16% compared to fiscal 2022 on a reported and currency-neutral basis, respectively.\nThe increase was due to higher revenues in North America, Europe, Middle East & Africa ("EMEA"), APLA and Greater China, which contributed approximately 7, 6,\n2 and 1 percentage points to NIKE, Inc. Revenues, respectively.\n•NIKE Brand revenues, which represented over 90% of NIKE, Inc. Revenues, increased 10% and 16% on a reported and currency-neutral basis, respectively. This\nincrease was primarily due to higher revenues in Men\'s, the Jordan Brand, Women\'s and Kids\' which grew 17%, 35%,11% and 10%, respectively, on a wholesale\nequivalent basis.', metadata={'page': 35, 'source': '../example_data/nke-10k-2023.pdf'}),
  Document(page_content='Enterprise Resource Planning Platform, data and analytics, demand sensing, insight gathering, and other areas to create an end-to-end technology foundation, which we\nbelieve will further accelerate our digital transformation. We believe this unified approach will accelerate growth and unlock more efficiency for our business, while driving\nspeed and responsiveness as we serve consumers globally.\nFINANCIAL HIGHLIGHTS\n•In fiscal 2023, NIKE, Inc. achieved record Revenues of $51.2 billion, which increased 10% and 16% on a reported and currency-neutral basis, respectively\n•NIKE Direct revenues grew 14% from $18.7 billion in fiscal 2022 to $21.3 billion in fiscal 2023, and represented approximately 44% of total NIKE Brand revenues for\nfiscal 2023\n•Gross margin for the fiscal year decreased 250 basis points to 43.5% primarily driven by higher product costs, higher markdowns and unfavorable changes in foreign\ncurrency exchange rates, partially offset by strategic pricing actions', metadata={'page': 30, 'source': '../example_data/nke-10k-2023.pdf'}),
  Document(page_content="Table of Contents\nNORTH AMERICA\n(Dollars in millions) FISCAL 2023FISCAL 2022 % CHANGE% CHANGE\nEXCLUDING\nCURRENCY\nCHANGESFISCAL 2021 % CHANGE% CHANGE\nEXCLUDING\nCURRENCY\nCHANGES\nRevenues by:\nFootwear $ 14,897 $ 12,228 22 % 22 %$ 11,644 5 % 5 %\nApparel 5,947 5,492 8 % 9 % 5,028 9 % 9 %\nEquipment 764 633 21 % 21 % 507 25 % 25 %\nTOTAL REVENUES $ 21,608 $ 18,353 18 % 18 %$ 17,179 7 % 7 %\nRevenues by:    \nSales to Wholesale Customers $ 11,273 $ 9,621 17 % 18 %$ 10,186 -6 % -6 %\nSales through NIKE Direct 10,335 8,732 18 % 18 % 6,993 25 % 25 %\nTOTAL REVENUES $ 21,608 $ 18,353 18 % 18 %$ 17,179 7 % 7 %\nEARNINGS BEFORE INTEREST AND TAXES $ 5,454 $ 5,114 7 % $ 5,089 0 %\nFISCAL 2023 COMPARED TO FISCAL 2022\n•North America revenues increased 18% on a currency-neutral basis, primarily due to higher revenues in Men's and the Jordan Brand. NIKE Direct revenues\nincreased 18%, driven by strong digital sales growth of 23%, comparable store sales growth of 9% and the addition of new stores.", metadata={'page': 39, 'source': '../example_data/nke-10k-2023.pdf'}),
  Document(page_content="Table of Contents\nEUROPE, MIDDLE EAST & AFRICA\n(Dollars in millions) FISCAL 2023FISCAL 2022 % CHANGE% CHANGE\nEXCLUDING\nCURRENCY\nCHANGESFISCAL 2021 % CHANGE% CHANGE\nEXCLUDING\nCURRENCY\nCHANGES\nRevenues by:\nFootwear $ 8,260 $ 7,388 12 % 25 %$ 6,970 6 % 9 %\nApparel 4,566 4,527 1 % 14 % 3,996 13 % 16 %\nEquipment 592 564 5 % 18 % 490 15 % 17 %\nTOTAL REVENUES $ 13,418 $ 12,479 8 % 21 %$ 11,456 9 % 12 %\nRevenues by:    \nSales to Wholesale Customers $ 8,522 $ 8,377 2 % 15 %$ 7,812 7 % 10 %\nSales through NIKE Direct 4,896 4,102 19 % 33 % 3,644 13 % 15 %\nTOTAL REVENUES $ 13,418 $ 12,479 8 % 21 %$ 11,456 9 % 12 %\nEARNINGS BEFORE INTEREST AND TAXES $ 3,531 $ 3,293 7 % $ 2,435 35 % \nFISCAL 2023 COMPARED TO FISCAL 2022\n•EMEA revenues increased 21% on a currency-neutral basis, due to higher revenues in Men's, the Jordan Brand, Women's and Kids'. NIKE Direct revenues\nincreased 33%, driven primarily by strong digital sales growth of 43% and comparable store sales growth of 22%.", metadata={'page': 40, 'source': '../example_data/nke-10k-2023.pdf'})],
 'answer': 'According to the financial highlights, Nike, Inc. achieved record revenues of $51.2 billion in fiscal 2023, which increased 10% on a reported basis and 16% on a currency-neutral basis compared to fiscal 2022.'}
```


您可以看到，结果字典的 `answer` 键中得到了最终答案，以及LLM用于生成答案的 `context`。

进一步检查 `context` 下的值，您可以看到它们是每个包含摄取页面内容块的文档。值得注意的是，这些文档还保留了您最初加载时的原始元数据：


```python
print(results["context"][0].page_content)
```
```output
Table of Contents
FISCAL 2023 NIKE BRAND REVENUE HIGHLIGHTS
The following tables present NIKE Brand revenues disaggregated by reportable operating segment, distribution channel and major product line:
FISCAL 2023 COMPARED TO FISCAL 2022
•NIKE, Inc. Revenues were $51.2 billion in fiscal 2023, which increased 10% and 16% compared to fiscal 2022 on a reported and currency-neutral basis, respectively.
The increase was due to higher revenues in North America, Europe, Middle East & Africa ("EMEA"), APLA and Greater China, which contributed approximately 7, 6,
2 and 1 percentage points to NIKE, Inc. Revenues, respectively.
•NIKE Brand revenues, which represented over 90% of NIKE, Inc. Revenues, increased 10% and 16% on a reported and currency-neutral basis, respectively. This
increase was primarily due to higher revenues in Men's, the Jordan Brand, Women's and Kids' which grew 17%, 35%,11% and 10%, respectively, on a wholesale
equivalent basis.
```

```python
print(results["context"][0].metadata)
```
```output
{'page': 35, 'source': '../example_data/nke-10k-2023.pdf'}
```
这一部分来自原始PDF的第35页。您可以使用这些数据来显示答案来自PDF的哪一页，从而让用户快速验证答案是否基于源材料。

:::info
要深入了解RAG，请参见[这个更专注的教程](/docs/tutorials/rag/)或[我们的操作指南](/docs/how_to/#qa-with-rag)。
:::

## 下一步

您现在已经看到如何使用文档加载器从PDF文件加载文档，以及一些可以用来准备加载数据以进行RAG的技术。

有关文档加载器的更多信息，您可以查看：

- [概念指南中的条目](/docs/concepts/#document-loaders)
- [相关操作指南](/docs/how_to/#document-loaders)
- [可用的集成](/docs/integrations/document_loaders/)
- [如何创建自定义文档加载器](/docs/how_to/document_loader_custom/)

有关RAG的更多信息，请参见：

- [构建一个检索增强生成 (RAG) 应用](/docs/tutorials/rag/)
- [相关的操作指南](/docs/how_to/#qa-with-rag)
