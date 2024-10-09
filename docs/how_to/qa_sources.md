---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/qa_sources.ipynb
---
# 如何让你的RAG应用返回来源

在问答应用中，向用户展示用于生成答案的来源通常很重要。最简单的方法是让链返回每次生成中检索到的文档。

我们将基于Lilian Weng在[RAG教程](/docs/tutorials/rag)中构建的[LLM驱动的自主代理](https://lilianweng.github.io/posts/2023-06-23-agent/)应用进行工作。

我们将涵盖两种方法：

1. 使用内置的[create_retrieval_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html)，默认返回来源；
2. 使用简单的[LCEL](/docs/concepts#langchain-expression-language-lcel)实现，以展示操作原理。

我们还将展示如何将来源结构化到模型响应中，以便模型可以报告在生成答案时使用了哪些具体来源。

## 设置

### 依赖

在本次演示中，我们将使用OpenAI嵌入和Chroma向量存储，但这里展示的所有内容都适用于任何[嵌入](/docs/concepts#embedding-models)、[向量存储](/docs/concepts#vectorstores)或[检索器](/docs/concepts#retrievers)。

我们将使用以下库:


```python
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-openai langchain-chroma beautifulsoup4
```

我们需要设置环境变量 `OPENAI_API_KEY`，可以直接设置或从 `.env` 文件中加载，如下所示：


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。随着这些应用程序变得越来越复杂，能够检查您的链或代理内部到底发生了什么变得至关重要。做到这一点的最佳方法是使用 [LangSmith](https://smith.langchain.com)。

请注意，LangSmith 不是必需的，但它是有帮助的。如果您确实想使用 LangSmith，在您在上面的链接注册后，请确保设置您的环境变量以开始记录跟踪：


```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用 `create_retrieval_chain`

让我们首先选择一个 LLM：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />


这是我们在 [Lilian Weng 的博客文章](https://lilianweng.github.io/posts/2023-06-23-agent/) 中构建的带有来源的问答应用程序，文章属于 [RAG 教程](/docs/tutorials/rag)：


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "How to get your RAG application to return sources"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "How to get your RAG application to return sources"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to get your RAG application to return sources"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "How to get your RAG application to return sources"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to get your RAG application to return sources"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to get your RAG application to return sources"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to get your RAG application to return sources"}]-->
import bs4
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Load, chunk and index the contents of the blog to create a retriever.
loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    ),
)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())
retriever = vectorstore.as_retriever()


# 2. Incorporate the retriever into a question-answering chain.
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
```


```python
result = rag_chain.invoke({"input": "What is Task Decomposition?"})
```

请注意，`result` 是一个字典，包含键 `


```python
result
```



```output
{'input': 'What is Task Decomposition?',
 'context': [Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content="(3) Task execution: Expert models execute on the specific tasks and log results.\nInstruction:\n\nWith the input and the inference results, the AI assistant needs to describe the process and results. The previous stages can be formed as - User Input: {{ User Input }}, Task Planning: {{ Tasks }}, Model Selection: {{ Model Assignment }}, Task Execution: {{ Predictions }}. You must first answer the user's request in a straightforward manner. Then describe the task process and show your analysis and model inference results to the user in the first person. If inference results contain a file path, must tell the user the complete file path.")],
 'answer': 'Task decomposition involves breaking down a complex task into smaller and more manageable steps. This process helps agents or models tackle difficult tasks by dividing them into simpler subtasks or components. Task decomposition can be achieved through techniques like Chain of Thought or Tree of Thoughts, which guide the agent in breaking down tasks into sequential or branching steps.'}
```


在这里，`

## 自定义 LCEL 实现

下面我们构建一个类似于 `create_retrieval_chain` 构建的链。它通过构建一个字典来工作：

1. 从一个包含输入查询的字典开始，将检索到的文档添加到 `"context"` 键中；
2. 将查询和上下文一起输入到 RAG 链中，并将结果添加到字典中。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to get your RAG application to return sources"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to get your RAG application to return sources"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


# This Runnable takes a dict with keys 'input' and 'context',
# formats them into a prompt, and generates a response.
rag_chain_from_docs = (
    {
        "input": lambda x: x["input"],  # input query
        "context": lambda x: format_docs(x["context"]),  # context
    }
    | prompt  # format query and context into prompt
    | llm  # generate response
    | StrOutputParser()  # coerce to string
)

# Pass input query to retriever
retrieve_docs = (lambda x: x["input"]) | retriever

# Below, we chain `.assign` calls. This takes a dict and successively
# adds keys-- "context" and "answer"-- where the value for each key
# is determined by a Runnable. The Runnable operates on all existing
# keys in the dict.
chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)

chain.invoke({"input": "What is Task Decomposition"})
```



```output
{'input': 'What is Task Decomposition',
 'context': [Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='The AI assistant can parse user input to several tasks: [{"task": task, "id", task_id, "dep": dependency_task_ids, "args": {"text": text, "image": URL, "audio": URL, "video": URL}}]. The "dep" field denotes the id of the previous task which generates a new resource that the current task relies on. A special tag "-task_id" refers to the generated text image, audio and video in the dependency task with id as task_id. The task MUST be selected from the following options: {{ Available Task List }}. There is a logical relationship between tasks, please note their order. If the user input can\'t be parsed, you need to reply empty JSON. Here are several cases for your reference: {{ Demonstrations }}. The chat history is recorded as {{ Chat History }}. From this chat history, you can find the path of the user-mentioned resources for your task planning.'),
  Document(metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}, page_content='Fig. 11. Illustration of how HuggingGPT works. (Image source: Shen et al. 2023)\nThe system comprises of 4 stages:\n(1) Task planning: LLM works as the brain and parses the user requests into multiple tasks. There are four attributes associated with each task: task type, ID, dependencies, and arguments. They use few-shot examples to guide LLM to do task parsing and planning.\nInstruction:')],
 'answer': 'Task decomposition is a technique used in artificial intelligence to break down complex tasks into smaller and more manageable subtasks. This approach helps agents or models to tackle difficult problems by dividing them into simpler steps, improving performance and interpretability. Different methods like Chain of Thought and Tree of Thoughts have been developed to enhance task decomposition in AI systems.'}
```


:::tip

查看 [LangSmith 跟踪](https://smith.langchain.com/public/1c055a3b-0236-4670-a3fb-023d418ba796/r)

:::

## 在模型响应中结构化来源

到目前为止，我们只是将检索步骤返回的文档传播到最终响应中。但这可能无法说明模型在生成答案时依赖的具体信息子集。下面，我们展示如何将来源结构化到模型响应中，使模型能够报告其答案所依赖的具体上下文。

因为上述 LCEL 实现由 [Runnable](/docs/concepts/#runnable-interface) 原语组成，所以扩展起来非常简单。下面，我们做一个简单的更改：

- 我们使用模型的工具调用功能生成 [结构化输出](/docs/how_to/structured_output/)，包括一个答案和来源列表。响应的模式在下面的 `AnswerWithSources` TypedDict 中表示。
- 我们移除了 `StrOutputParser()`，因为我们在这种情况下期望 `dict` 输出。


```python
<!--IMPORTS:[{"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to get your RAG application to return sources"}]-->
from typing import List

from langchain_core.runnables import RunnablePassthrough
from typing_extensions import Annotated, TypedDict


# Desired schema for response
class AnswerWithSources(TypedDict):
    """An answer to the question, with sources."""

    answer: str
    sources: Annotated[
        List[str],
        ...,
        "List of sources (author + year) used to answer the question",
    ]


# Our rag_chain_from_docs has the following changes:
# - add `.with_structured_output` to the LLM;
# - remove the output parser
rag_chain_from_docs = (
    {
        "input": lambda x: x["input"],
        "context": lambda x: format_docs(x["context"]),
    }
    | prompt
    | llm.with_structured_output(AnswerWithSources)
)

retrieve_docs = (lambda x: x["input"]) | retriever

chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)

response = chain.invoke({"input": "What is Chain of Thought?"})
```


```python
import json

print(json.dumps(response["answer"], indent=2))
```
```output
{
  "answer": "Chain of Thought (CoT) is a prompting technique that enhances model performance on complex tasks by instructing the model to \"think step by step\" to decompose hard tasks into smaller and simpler steps. It transforms big tasks into multiple manageable tasks and sheds light on the interpretation of the model's thinking process.",
  "sources": [
    "Wei et al. 2022"
  ]
}
```
:::tip

查看 [LangSmith 跟踪](https://smith.langchain.com/public/0eeddf06-3a7b-4f27-974c-310ca8160f60/r)

:::
