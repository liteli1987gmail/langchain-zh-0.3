---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/qa_streaming.ipynb
---
# 如何从您的 RAG 应用程序流式传输结果

本指南解释了如何从 RAG 应用程序流式传输结果。它涵盖了从最终输出以及链的中间步骤（例如，从查询重写）流式传输令牌。

我们将基于 Lilian Weng 在 [RAG 教程](/docs/tutorials/rag) 中撰写的 [LLM 驱动的自主代理](https://lilianweng.github.io/posts/2023-06-23-agent/) 博客文章构建 Q&A 应用程序及其来源。

## 设置

### 依赖项

在本演练中，我们将使用 OpenAI 嵌入和 Chroma 向量存储，但这里展示的所有内容都适用于任何 [嵌入](/docs/concepts#embedding-models)、[向量存储](/docs/concepts#vectorstores) 或 [检索器](/docs/concepts#retrievers)。

我们将使用以下软件包：


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

您使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。做到这一点的最佳方法是使用 [LangSmith](https://smith.langchain.com)。

请注意，LangSmith 不是必需的，但它是有帮助的。如果您确实想使用 LangSmith，在您在上面的链接注册后，请确保设置您的环境变量以开始记录跟踪：


```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## RAG 链

让我们首先选择一个 LLM：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />


这是我们在 [RAG 教程](/docs/tutorials/rag) 中基于 Lilian Weng 的 [LLM 驱动的自主代理](https://lilianweng.github.io/posts/2023-06-23-agent/) 博客文章构建的带有来源的问答应用：


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "How to stream results from your RAG application"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "How to stream results from your RAG application"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to stream results from your RAG application"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "How to stream results from your RAG application"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to stream results from your RAG application"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to stream results from your RAG application"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to stream results from your RAG application"}]-->
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

## 流式处理最终输出

`create_retrieval_chain` 构建的链返回一个包含键 `

请注意，这里只有 `


```python
for chunk in rag_chain.stream({"input": "What is Task Decomposition?"}):
    print(chunk)
```
```output
{'input': 'What is Task Decomposition?'}
{'context': [Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content="(3) Task execution: Expert models execute on the specific tasks and log results.\nInstruction:\n\nWith the input and the inference results, the AI assistant needs to describe the process and results. The previous stages can be formed as - User Input: {{ User Input }}, Task Planning: {{ Tasks }}, Model Selection: {{ Model Assignment }}, Task Execution: {{ Predictions }}. You must first answer the user's request in a straightforward manner. Then describe the task process and show your analysis and model inference results to the user in the first person. If inference results contain a file path, must tell the user the complete file path.", metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})]}
{'answer': ''}
{'answer': 'Task'}
{'answer': ' decomposition'}
{'answer': ' involves'}
{'answer': ' breaking'}
{'answer': ' down'}
{'answer': ' complex'}
{'answer': ' tasks'}
{'answer': ' into'}
{'answer': ' smaller'}
{'answer': ' and'}
{'answer': ' simpler'}
{'answer': ' steps'}
{'answer': ' to'}
{'answer': ' make'}
{'answer': ' them'}
{'answer': ' more'}
{'answer': ' manageable'}
{'answer': '.'}
{'answer': ' This'}
{'answer': ' process'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' facilitated'}
{'answer': ' by'}
{'answer': ' techniques'}
{'answer': ' like'}
{'answer': ' Chain'}
{'answer': ' of'}
{'answer': ' Thought'}
{'answer': ' ('}
{'answer': 'Co'}
{'answer': 'T'}
{'answer': ')'}
{'answer': ' and'}
{'answer': ' Tree'}
{'answer': ' of'}
{'answer': ' Thoughts'}
{'answer': ','}
{'answer': ' which'}
{'answer': ' help'}
{'answer': ' agents'}
{'answer': ' plan'}
{'answer': ' and'}
{'answer': ' execute'}
{'answer': ' tasks'}
{'answer': ' effectively'}
{'answer': ' by'}
{'answer': ' dividing'}
{'answer': ' them'}
{'answer': ' into'}
{'answer': ' sub'}
{'answer': 'goals'}
{'answer': ' or'}
{'answer': ' multiple'}
{'answer': ' reasoning'}
{'answer': ' possibilities'}
{'answer': '.'}
{'answer': ' Task'}
{'answer': ' decomposition'}
{'answer': ' can'}
{'answer': ' be'}
{'answer': ' initiated'}
{'answer': ' through'}
{'answer': ' simple'}
{'answer': ' prompts'}
{'answer': ','}
{'answer': ' task'}
{'answer': '-specific'}
{'answer': ' instructions'}
{'answer': ','}
{'answer': ' or'}
{'answer': ' human'}
{'answer': ' inputs'}
{'answer': ' to'}
{'answer': ' guide'}
{'answer': ' the'}
{'answer': ' agent'}
{'answer': ' in'}
{'answer': ' achieving'}
{'answer': ' its'}
{'answer': ' goals'}
{'answer': ' efficiently'}
{'answer': '.'}
{'answer': ''}
```
我们可以自由地处理流出的数据块。例如，如果我们只想流式传输答案令牌，我们可以选择具有相应键的数据块：


```python
for chunk in rag_chain.stream({"input": "What is Task Decomposition?"}):
    if answer_chunk := chunk.get("answer"):
        print(f"{answer_chunk}|", end="")
```
```output
Task| decomposition| is| a| technique| used| to| break| down| complex| tasks| into| smaller| and| more| manageable| steps|.| This| process| helps| agents| or| models| handle| intricate| tasks| by| dividing| them| into| simpler| sub|tasks|.| By| decom|posing| tasks|,| the| model| can| effectively| plan| and| execute| each| step| towards| achieving| the| overall| goal|.|
```
更简单地说，我们可以使用 [.pick](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.pick) 方法仅选择所需的键：


```python
chain = rag_chain.pick("answer")

for chunk in chain.stream({"input": "What is Task Decomposition?"}):
    print(f"{chunk}|", end="")
```
```output
|Task| decomposition| involves| breaking| down| complex| tasks| into| smaller| and| simpler| steps| to| make| them| more| manageable| for| an| agent| or| model| to| handle|.| This| process| helps| in| planning| and| executing| tasks| efficiently| by| dividing| them| into| a| series| of| sub|goals| or| actions|.| Task| decomposition| can| be| achieved| through| techniques| like| Chain| of| Thought| (|Co|T|)| or| Tree| of| Thoughts|,| which| enhance| model| performance| on| intricate| tasks| by| guiding| them| through| step|-by|-step| thinking| processes|.||
```
## 流式中间步骤

假设我们不仅想流式传输链的最终输出，还想流式传输一些中间步骤。作为示例，我们以我们的 [对话式 RAG](/docs/tutorials/qa_chat_history) 链为例。在这里，我们在将用户问题传递给检索器之前重新表述该问题。这个重新表述的问题不会作为最终输出的一部分返回。我们可以修改我们的链以返回新问题，但出于演示目的，我们将保持原样。


```python
<!--IMPORTS:[{"imported": "create_history_aware_retriever", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html", "title": "How to stream results from your RAG application"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to stream results from your RAG application"}]-->
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

### Contextualize question ###
contextualize_q_system_prompt = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood "
    "without the chat history. Do NOT answer the question, "
    "just reformulate it if needed and otherwise return it as is."
)
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
contextualize_q_llm = llm.with_config(tags=["contextualize_q_llm"])
history_aware_retriever = create_history_aware_retriever(
    contextualize_q_llm, retriever, contextualize_q_prompt
)


### Answer question ###
system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
```

请注意，上面我们使用 `.with_config` 为用于问题重新表述步骤的 LLM 分配了一个标签。这不是必需的，但会使从该特定步骤流式输出更方便。

为了演示，我们将传入一个人工消息历史：
```
Human: What is task decomposition?

AI: Task decomposition involves breaking up a complex task into smaller and simpler steps.
```
然后我们问一个后续问题：“有什么常见的方法来做到这一点？”在检索步骤中，我们的 `history_aware_retriever` 将使用对话的上下文重新表述这个问题，以确保检索是有意义的。

为了流式传输中间输出，我们建议使用异步的 `.astream_events` 方法。该方法将从链中的所有“事件”流式输出，可能会非常冗长。我们可以使用标签、事件类型和其他标准进行过滤，正如我们在这里所做的。

下面我们展示一个典型的 `.astream_events` 循环，在其中我们传入链输入并发出所需结果。有关更多详细信息，请参见 [API 参考](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.astream_events) 和 [流式处理指南](/docs/how_to/streaming)。


```python
first_question = "What is task decomposition?"
first_answer = (
    "Task decomposition involves breaking up "
    "a complex task into smaller and simpler "
    "steps."
)
follow_up_question = "What are some common ways of doing it?"

chat_history = [
    ("human", first_question),
    ("ai", first_answer),
]


async for event in rag_chain.astream_events(
    {
        "input": follow_up_question,
        "chat_history": chat_history,
    },
    version="v1",
):
    if (
        event["event"] == "on_chat_model_stream"
        and "contextualize_q_llm" in event["tags"]
    ):
        ai_message_chunk = event["data"]["chunk"]
        print(f"{ai_message_chunk.content}|", end="")
```
```output
|What| are| some| typical| methods| used| for| task| decomposition|?||
```
在这里，我们逐个令牌恢复传递给检索器的查询，给定我们的问题“有什么常见的方法来做到这一点？”

如果我们想获取检索到的文档，可以根据名称“检索器”进行过滤：


```python
async for event in rag_chain.astream_events(
    {
        "input": follow_up_question,
        "chat_history": chat_history,
    },
    version="v1",
):
    if event["name"] == "Retriever":
        print(event)
        print()
```
```output
{'event': 'on_retriever_start', 'name': 'Retriever', 'run_id': '6834097c-07fe-42f5-a566-a4780af4d1d0', 'tags': ['seq:step:4', 'Chroma', 'OpenAIEmbeddings'], 'metadata': {}, 'data': {'input': {'query': 'What are some typical methods used for task decomposition?'}}}

{'event': 'on_retriever_end', 'name': 'Retriever', 'run_id': '6834097c-07fe-42f5-a566-a4780af4d1d0', 'tags': ['seq:step:4', 'Chroma', 'OpenAIEmbeddings'], 'metadata': {}, 'data': {'input': {'query': 'What are some typical methods used for task decomposition?'}, 'output': {'documents': [Document(page_content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Resources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}), Document(page_content='Fig. 9. Comparison of MIPS algorithms, measured in recall@10. (Image source: Google Blog, 2020)\nCheck more MIPS algorithms and performance comparison in ann-benchmarks.com.\nComponent Three: Tool Use#\nTool use is a remarkable and distinguishing characteristic of human beings. We create, modify and utilize external objects to do things that go beyond our physical and cognitive limits. Equipping LLMs with external tools can significantly extend the model capabilities.', metadata={'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'})]}}}
```
有关如何流式处理中间步骤的更多信息，请查看[流式处理指南](/docs/how_to/streaming)。
