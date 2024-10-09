---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/local_rag.ipynb
---
# 构建一个本地RAG应用

:::info Prerequisites

本指南假设您熟悉以下概念：

- [聊天模型](/docs/concepts/#chat-models)
- [链式运行](/docs/how_to/sequence/)
- [嵌入](/docs/concepts/#embedding-models)
- [向量存储](/docs/concepts/#vector-stores)
- [检索增强生成](/docs/tutorials/rag/)

:::

像 [llama.cpp](https://github.com/ggerganov/llama.cpp)、[Ollama](https://github.com/ollama/ollama) 和 [llamafile](https://github.com/Mozilla-Ocho/llamafile) 这样的项目的流行性强调了本地运行大型语言模型的重要性。

LangChain 与 [许多开源大模型供应商](/docs/how_to/local_llms) 集成，可以在本地运行。

本指南将展示如何通过一个大模型供应商 [Ollama](/docs/integrations/providers/ollama/) 在本地（例如，在您的笔记本电脑上）使用本地嵌入和本地大型语言模型运行 `LLaMA 3.1`。但是，如果您愿意，可以设置并切换到其他本地大模型供应商，例如 [LlamaCPP](/docs/integrations/chat/llamacpp/)。

**注意：** 本指南使用一个 [聊天模型](/docs/concepts/#chat-models) 包装器，负责为您使用的特定本地模型格式化输入提示。然而，如果您直接使用 [文本输入/文本输出 LLM](/docs/concepts/#llms) 包装器提示本地模型，您可能需要使用针对您特定模型的提示。这通常 [需要包含特殊标记](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)。[这是 LLaMA 2 的一个示例](https://smith.langchain.com/hub/rlm/rag-prompt-llama)。

## 设置

首先，我们需要设置 Ollama。

说明 [在他们的 GitHub 仓库](https://github.com/ollama/ollama) 中提供了详细信息，我们在这里总结如下：

- [下载](https://ollama.com/download) 并运行他们的桌面应用程序
- 从命令行中，从 [这个选项列表](https://ollama.com/library) 获取模型。对于本指南，您需要：
- 一个通用模型，如 `llama3.1:8b`，您可以使用类似 `ollama pull llama3.1:8b` 的命令来获取
- 一个 [文本嵌入模型](https://ollama.com/search?c=embedding)，如 `nomic-embed-text`，您可以使用类似 `ollama pull nomic-embed-text` 的命令来获取
- 当应用程序运行时，所有模型都自动提供在 `localhost:11434` 上
- 请注意，您的模型选择将取决于您的硬件能力

接下来，安装本地嵌入、向量存储和推理所需的包。


```python
# Document loading, retrieval methods and text splitting
%pip install -qU langchain langchain_community

# Local vector store via Chroma
%pip install -qU langchain_chroma

# Local inference and embeddings via Ollama
%pip install -qU langchain_ollama

# Web Loader
% pip install -qU beautifulsoup4
```

您还可以[查看此页面](/docs/integrations/text_embedding/)以获取可用嵌入模型的完整列表

## 文档加载

现在让我们加载并分割一个示例文档。

我们将使用Lilian Weng关于代理的[博客文章](https://lilianweng.github.io/posts/2023-06-23-agent/)作为示例。


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Build a Local RAG Application"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Build a Local RAG Application"}]-->
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)
```

接下来，以下步骤将初始化您的向量存储。我们使用[`nomic-embed-text`](https://ollama.com/library/nomic-embed-text)，但您也可以探索其他大模型供应商或选项：


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Build a Local RAG Application"}, {"imported": "OllamaEmbeddings", "source": "langchain_ollama", "docs": "https://python.langchain.com/api_reference/ollama/embeddings/langchain_ollama.embeddings.OllamaEmbeddings.html", "title": "Build a Local RAG Application"}]-->
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

local_embeddings = OllamaEmbeddings(model="nomic-embed-text")

vectorstore = Chroma.from_documents(documents=all_splits, embedding=local_embeddings)
```

现在我们有一个可工作的向量存储！测试相似性搜索是否正常工作：


```python
question = "What are the approaches to Task Decomposition?"
docs = vectorstore.similarity_search(question)
len(docs)
```



```output
4
```



```python
docs[0]
```



```output
Document(metadata={'description': 'Building agents with LLM (large language model) as its core controller is a cool concept. Several proof-of-concepts demos, such as AutoGPT, GPT-Engineer and BabyAGI, serve as inspiring examples. The potentiality of LLM extends beyond generating well-written copies, stories, essays and programs; it can be framed as a powerful general problem solver.\nAgent System Overview In a LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components:', 'language': 'en', 'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/', 'title': "LLM Powered Autonomous Agents | Lil'Log"}, page_content='Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.')
```


接下来，设置一个模型。我们在这里使用Ollama和`llama3.1:8b`，但您可以[探索其他大模型供应商](/docs/how_to/local_llms/)或[根据您的硬件设置选择模型选项](https://ollama.com/library)：


```python
<!--IMPORTS:[{"imported": "ChatOllama", "source": "langchain_ollama", "docs": "https://python.langchain.com/api_reference/ollama/chat_models/langchain_ollama.chat_models.ChatOllama.html", "title": "Build a Local RAG Application"}]-->
from langchain_ollama import ChatOllama

model = ChatOllama(
    model="llama3.1:8b",
)
```

测试一下以确保您已正确设置所有内容：


```python
response_message = model.invoke(
    "Simulate a rap battle between Stephen Colbert and John Oliver"
)

print(response_message.content)
```
```output
**The scene is set: a packed arena, the crowd on their feet. In the blue corner, we have Stephen Colbert, aka "The O'Reilly Factor" himself. In the red corner, the challenger, John Oliver. The judges are announced as Tina Fey, Larry Wilmore, and Patton Oswalt. The crowd roars as the two opponents face off.**

**Stephen Colbert (aka "The Truth with a Twist"):**
Yo, I'm the king of satire, the one they all fear
My show's on late, but my jokes are clear
I skewer the politicians, with precision and might
They tremble at my wit, day and night

**John Oliver:**
Hold up, Stevie boy, you may have had your time
But I'm the new kid on the block, with a different prime
Time to wake up from that 90s coma, son
My show's got bite, and my facts are never done

**Stephen Colbert:**
Oh, so you think you're the one, with the "Last Week" crown
But your jokes are stale, like the ones I wore down
I'm the master of absurdity, the lord of the spin
You're just a British import, trying to fit in

**John Oliver:**
Stevie, my friend, you may have been the first
But I've got the skill and the wit, that's never blurred
My show's not afraid, to take on the fray
I'm the one who'll make you think, come what may

**Stephen Colbert:**
Well, it's time for a showdown, like two old friends
Let's see whose satire reigns supreme, till the very end
But I've got a secret, that might just seal your fate
My humor's contagious, and it's already too late!

**John Oliver:**
Bring it on, Stevie! I'm ready for you
I'll take on your jokes, and show them what to do
My sarcasm's sharp, like a scalpel in the night
You're just a relic of the past, without a fight

**The judges deliberate, weighing the rhymes and the flow. Finally, they announce their decision:**

Tina Fey: I've got to go with John Oliver. His jokes were sharper, and his delivery was smoother.

Larry Wilmore: Agreed! But Stephen Colbert's still got that old-school charm.

Patton Oswalt: You know what? It's a tie. Both of them brought the heat!

**The crowd goes wild as both opponents take a bow. The rap battle may be over, but the satire war is just beginning...
```
## 在链中使用

我们可以通过传入检索到的文档和一个简单的提示来创建一个摘要链，使用任一模型。

它使用提供的输入键值格式化提示词模板，并将格式化后的字符串传递给指定模型：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Build a Local RAG Application"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a Local RAG Application"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "Summarize the main themes in these retrieved docs: {docs}"
)


# Convert loaded documents into strings by concatenating their content
# and ignoring metadata
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = {"docs": format_docs} | prompt | model | StrOutputParser()

question = "What are the approaches to Task Decomposition?"

docs = vectorstore.similarity_search(question)

chain.invoke(docs)
```



```output
'The main themes in these documents are:\n\n1. **Task Decomposition**: The process of breaking down complex tasks into smaller, manageable subgoals is crucial for efficient task handling.\n2. **Autonomous Agent System**: A system powered by Large Language Models (LLMs) that can perform planning, reflection, and refinement to improve the quality of final results.\n3. **Challenges in Planning and Decomposition**:\n\t* Long-term planning and task decomposition are challenging for LLMs.\n\t* Adjusting plans when faced with unexpected errors is difficult for LLMs.\n\t* Humans learn from trial and error, making them more robust than LLMs in certain situations.\n\nOverall, the documents highlight the importance of task decomposition and planning in autonomous agent systems powered by LLMs, as well as the challenges that still need to be addressed.'
```


## 问答

您还可以使用本地模型和向量存储进行问答。以下是一个使用简单字符串提示的示例：


```python
<!--IMPORTS:[{"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Build a Local RAG Application"}]-->
from langchain_core.runnables import RunnablePassthrough

RAG_TEMPLATE = """
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

<context>
{context}
</context>

Answer the following question:

{question}"""

rag_prompt = ChatPromptTemplate.from_template(RAG_TEMPLATE)

chain = (
    RunnablePassthrough.assign(context=lambda input: format_docs(input["context"]))
    | rag_prompt
    | model
    | StrOutputParser()
)

question = "What are the approaches to Task Decomposition?"

docs = vectorstore.similarity_search(question)

# Run
chain.invoke({"context": docs, "question": question})
```



```output
'Task decomposition can be done through (1) simple prompting using LLM, (2) task-specific instructions, or (3) human inputs. This approach helps break down large tasks into smaller, manageable subgoals for efficient handling of complex tasks. It enables agents to plan ahead and improve the quality of final results through reflection and refinement.'
```


## 带检索的问答

最后，您可以根据用户问题自动从我们的向量存储中检索文档，而不是手动传递文档：


```python
retriever = vectorstore.as_retriever()

qa_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | model
    | StrOutputParser()
)
```


```python
question = "What are the approaches to Task Decomposition?"

qa_chain.invoke(question)
```



```output
'Task decomposition can be done through (1) simple prompting in Large Language Models (LLM), (2) using task-specific instructions, or (3) with human inputs. This process involves breaking down large tasks into smaller, manageable subgoals for efficient handling of complex tasks.'
```


## 下一步

您现在已经看到如何使用所有本地组件构建RAG应用程序。RAG是一个非常深奥的话题，您可能会对以下指南感兴趣，这些指南讨论并演示了其他技术：

- [视频：使用LLaMA 3构建可靠的完全本地RAG代理](https://www.youtube.com/watch?v=-ROS6gfYIts)，适用于本地模型的代理方法
- [视频：从头开始使用开源本地LLM构建纠正RAG](https://www.youtube.com/watch?v=E2shqsYwxck)
- [检索的概念指南](/docs/concepts/#retrieval)，概述了您可以应用以提高性能的各种检索技术
- [关于RAG的指南](/docs/how_to/#qa-with-rag)，深入了解RAG的不同细节
- [如何在本地运行模型](/docs/how_to/local_llms/)，了解设置不同大模型供应商的不同方法
