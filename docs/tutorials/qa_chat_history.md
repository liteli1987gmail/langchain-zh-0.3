---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/qa_chat_history.ipynb
sidebar_position: 2
---
# 对话式RAG

:::info Prerequisites

本指南假设您熟悉以下概念：

- [聊天历史](/docs/concepts/#chat-history)
- [聊天模型](/docs/concepts/#chat-models)
- [嵌入](/docs/concepts/#embedding-models)
- [向量存储](/docs/concepts/#vector-stores)
- [检索增强生成](/docs/tutorials/rag/)
- [工具](/docs/concepts/#tools)
- [代理](/docs/concepts/#agents)

:::

在许多问答应用中，我们希望允许用户进行反复对话，这意味着应用需要某种形式的“记忆”来记录过去的问题和答案，并具备将这些信息融入当前思考的逻辑。

在本指南中，我们重点关注**添加用于整合历史消息的逻辑。** 关于聊天历史管理的更多细节[在这里覆盖](/docs/how_to/message_history)。

我们将介绍两种方法：

1. 链接，其中我们始终执行检索步骤；
2. 代理，其中我们给予大型语言模型自由决定是否以及如何执行检索步骤（或多个步骤）。

对于外部知识源，我们将使用Lilian Weng的同一篇[LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)博客文章，来自[RAG教程](/docs/tutorials/rag)。

## 设置

### 依赖项

在本演练中，我们将使用OpenAI嵌入和Chroma向量存储，但这里展示的所有内容都适用于任何[嵌入](/docs/concepts#embedding-models)和[向量存储](/docs/concepts#vectorstores)或[检索器](/docs/concepts#retrievers)。

我们将使用以下软件包：


```python
%%capture --no-stderr
%pip install --upgrade --quiet  langchain langchain-community langchainhub langchain-chroma beautifulsoup4
```

我们需要设置环境变量 `OPENAI_API_KEY`，可以直接设置或从 `.env` 文件中加载，如下所示：


```python
import getpass
import os

if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass()

# import dotenv

# dotenv.load_dotenv()
```

### LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。最好的方法是使用 [LangSmith](https://smith.langchain.com)。

请注意，LangSmith 不是必需的，但它是有帮助的。如果您确实想使用 LangSmith，在您在上面的链接注册后，请确保设置您的环境变量以开始记录跟踪：


```python
os.environ["LANGCHAIN_TRACING_V2"] = "true"
if not os.environ.get("LANGCHAIN_API_KEY"):
    os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 链 {#chains}

让我们首先回顾一下我们在 [Lilian Weng 的博客文章](https://lilianweng.github.io/posts/2023-06-23-agent/) 中构建的 Q&A 应用程序，该文章位于 [RAG 教程](/docs/tutorials/rag) 中。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Conversational RAG"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Conversational RAG"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Conversational RAG"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Conversational RAG"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Conversational RAG"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Conversational RAG"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Conversational RAG"}]-->
import bs4
from langchain import hub
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
response = rag_chain.invoke({"input": "What is Task Decomposition?"})
response["answer"]
```



```output
"Task decomposition involves breaking down complex tasks into smaller and simpler steps to make them more manageable for an agent or model. This process helps in guiding the agent through the various subgoals required to achieve the overall task efficiently. Different techniques like Chain of Thought and Tree of Thoughts can be used to decompose tasks into step-by-step processes, enhancing performance and understanding of the model's thinking process."
```


请注意，我们使用了内置的链构造函数 `create_stuff_documents_chain` 和 `create_retrieval_chain`，因此我们解决方案的基本组成部分是：

1. 检索器；
2. 提示；
3. 大型语言模型。

这将简化整合聊天历史的过程。

### 添加聊天历史

我们构建的链直接使用输入查询来检索相关上下文。但在对话环境中，用户查询可能需要对话上下文才能被理解。例如，考虑以下交流：

> 人类: "什么是任务分解？"
>
> AI: "任务分解涉及将复杂任务分解为更小、更简单的步骤，以便使代理或模型更易于管理。"
>
> 人类: "常见的做法有哪些？"

为了回答第二个问题，我们的系统需要理解“它”指的是“任务分解”。

我们需要更新我们现有应用的两个方面：

1. **提示词**: 更新我们的提示词以支持历史消息作为输入。
2. **上下文化问题**: 添加一个子链，获取最新的用户问题，并在聊天历史的上下文中重新表述它。这可以简单地理解为构建一个新的“历史感知”检索器。而之前我们有：
- `查询` -> `检索器`
现在我们将有：
- `(查询, 聊天历史)` -> `大型语言模型` -> `重新表述的查询` -> `检索器`

#### 上下文化问题

首先，我们需要定义一个子链，该子链获取历史消息和最新的用户问题，并在引用历史信息时重新表述问题。

我们将使用一个提示词，其中包含名为“chat_history”的 `MessagesPlaceholder` 变量。这允许我们使用“chat_history”输入键将消息列表传递给提示词，这些消息将在系统消息之后和包含最新问题的人类消息之前插入。

请注意，我们利用一个辅助函数 [create_history_aware_retriever](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html) 来处理这一步，该函数管理 `chat_history` 为空的情况，否则按顺序应用 `提示词 | 大型语言模型 | 输出解析器() | 检索器`。

`create_history_aware_retriever` 构建一个接受 `输入` 和 `聊天历史` 作为输入的链，并具有与检索器相同的输出模式。


```python
<!--IMPORTS:[{"imported": "create_history_aware_retriever", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html", "title": "Conversational RAG"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Conversational RAG"}]-->
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

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
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_q_prompt
)
```

该链将输入查询的重述添加到我们的检索器之前，以便检索包含对话的上下文。

现在我们可以构建完整的问答链。这只需将检索器更新为我们的新 `history_aware_retriever`。

同样，我们将使用 [create_stuff_documents_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html) 来生成一个 `question_answer_chain`，输入键为 `context`、`chat_history` 和 `input`——它接受检索到的上下文以及对话历史和查询以生成答案。更详细的解释在 [这里](/docs/tutorials/rag/#built-in-chains)。

我们使用 [create_retrieval_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html) 构建最终的 `rag_chain`。该链按顺序应用 `history_aware_retriever` 和 `question_answer_chain`，保留中间输出，例如检索到的上下文，以便于使用。它的输入键为 `input` 和 `chat_history`，输出中包括 `input`、`chat_history`、`context` 和 `answer`。


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Conversational RAG"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Conversational RAG"}]-->
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

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

让我们试试这个。下面我们提出一个问题和一个需要上下文化的后续问题，以返回合理的响应。因为我们的链包括一个 `"chat_history"` 输入，调用者需要管理聊天历史。我们可以通过将输入和输出消息附加到列表来实现这一点：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Conversational RAG"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Conversational RAG"}]-->
from langchain_core.messages import AIMessage, HumanMessage

chat_history = []

question = "What is Task Decomposition?"
ai_msg_1 = rag_chain.invoke({"input": question, "chat_history": chat_history})
chat_history.extend(
    [
        HumanMessage(content=question),
        AIMessage(content=ai_msg_1["answer"]),
    ]
)

second_question = "What are common ways of doing it?"
ai_msg_2 = rag_chain.invoke({"input": second_question, "chat_history": chat_history})

print(ai_msg_2["answer"])
```
```output
Task decomposition can be achieved through various methods such as using techniques like Chain of Thought (CoT) or Tree of Thoughts to break down complex tasks into smaller steps. Common ways include prompting the model with simple instructions like "Steps for XYZ" or task-specific instructions like "Write a story outline." Human inputs can also be used to guide the task decomposition process effectively.
```
:::tip

查看 [LangSmith trace](https://smith.langchain.com/public/243301e4-4cc5-4e52-a6e7-8cfe9208398d/r)。

:::

#### 聊天历史的状态管理

在这里，我们已经讨论了如何添加应用逻辑以纳入历史输出，但我们仍在手动更新聊天历史并将其插入到每个输入中。在一个真实的问答应用中，我们希望有某种方式来持久化聊天历史，以及某种方式来自动插入和更新它。

为此，我们可以使用：

- [BaseChatMessageHistory](https://python.langchain.com/api_reference/langchain/index.html#module-langchain.memory)：存储聊天历史。
- [RunnableWithMessageHistory](/docs/how_to/message_history): LCEL链和`BaseChatMessageHistory`的包装器，处理将聊天历史注入输入并在每次调用后更新它。

有关如何将这些类结合使用以创建有状态对话链的详细步骤，请访问[如何添加消息历史 (内存)](/docs/how_to/message_history) LCEL页面。

下面，我们实现第二种选项的简单示例，其中聊天历史存储在一个简单的字典中。LangChain管理与[Redis](/docs/integrations/memory/redis_chat_message_history/)等技术的内存集成，以提供更强大的持久性。

`RunnableWithMessageHistory`的实例为您管理聊天历史。它们接受一个配置，其中包含一个键（默认为`"session_id"`），指定要获取并预先添加到输入中的对话历史，并将输出附加到相同的对话历史。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.ChatMessageHistory.html", "title": "Conversational RAG"}, {"imported": "BaseChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html", "title": "Conversational RAG"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Conversational RAG"}]-->
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


conversational_rag_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)
```


```python
conversational_rag_chain.invoke(
    {"input": "What is Task Decomposition?"},
    config={
        "configurable": {"session_id": "abc123"}
    },  # constructs a key "abc123" in `store`.
)["answer"]
```



```output
'Task decomposition involves breaking down complex tasks into smaller and simpler steps to make them more manageable. Techniques like Chain of Thought (CoT) and Tree of Thoughts help models decompose hard tasks into multiple manageable subtasks. This process allows agents to plan ahead and tackle intricate tasks effectively.'
```



```python
conversational_rag_chain.invoke(
    {"input": "What are common ways of doing it?"},
    config={"configurable": {"session_id": "abc123"}},
)["answer"]
```



```output
'Task decomposition can be achieved through various methods such as using Language Model (LLM) with simple prompting, task-specific instructions tailored to the specific task at hand, or incorporating human inputs to break down the task into smaller components. These approaches help in guiding agents to think step by step and decompose complex tasks into more manageable subgoals.'
```


可以在`store`字典中检查对话历史：


```python
for message in store["abc123"].messages:
    if isinstance(message, AIMessage):
        prefix = "AI"
    else:
        prefix = "User"

    print(f"{prefix}: {message.content}\n")
```
```output
User: What is Task Decomposition?

AI: Task decomposition involves breaking down complex tasks into smaller and simpler steps to make them more manageable. Techniques like Chain of Thought (CoT) and Tree of Thoughts help models decompose hard tasks into multiple manageable subtasks. This process allows agents to plan ahead and tackle intricate tasks effectively.

User: What are common ways of doing it?

AI: Task decomposition can be achieved through various methods such as using Language Model (LLM) with simple prompting, task-specific instructions tailored to the specific task at hand, or incorporating human inputs to break down the task into smaller components. These approaches help in guiding agents to think step by step and decompose complex tasks into more manageable subgoals.
```
### 将其结合起来

![](../../static/img/conversational_retrieval_chain.png)

为了方便，我们将所有必要步骤结合在一个代码单元中：


```python
<!--IMPORTS:[{"imported": "create_history_aware_retriever", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.history_aware_retriever.create_history_aware_retriever.html", "title": "Conversational RAG"}, {"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Conversational RAG"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Conversational RAG"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Conversational RAG"}, {"imported": "ChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.ChatMessageHistory.html", "title": "Conversational RAG"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Conversational RAG"}, {"imported": "BaseChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html", "title": "Conversational RAG"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Conversational RAG"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Conversational RAG"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Conversational RAG"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Conversational RAG"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Conversational RAG"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Conversational RAG"}]-->
import bs4
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_chroma import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


### Construct retriever ###
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
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_q_prompt
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


### Statefully manage chat history ###
store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


conversational_rag_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)
```


```python
conversational_rag_chain.invoke(
    {"input": "What is Task Decomposition?"},
    config={
        "configurable": {"session_id": "abc123"}
    },  # constructs a key "abc123" in `store`.
)["answer"]
```



```output
'Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. It involves transforming big tasks into multiple manageable tasks to facilitate problem-solving. Different methods like Chain of Thought and Tree of Thoughts can be employed to decompose tasks effectively.'
```



```python
conversational_rag_chain.invoke(
    {"input": "What are common ways of doing it?"},
    config={"configurable": {"session_id": "abc123"}},
)["answer"]
```



```output
'Task decomposition can be achieved through various methods such as using prompting techniques like "Steps for XYZ" or "What are the subgoals for achieving XYZ?", providing task-specific instructions like "Write a story outline," or incorporating human inputs to break down complex tasks into smaller components. These approaches help in organizing thoughts and planning ahead for successful task completion.'
```


## 代理 {#agents}

代理利用大型语言模型的推理能力在执行过程中做出决策。使用代理可以将一些对检索过程的自由裁量权转移出去。尽管它们的行为比链更不可预测，但在这种情况下它们提供了一些优势：

- 代理直接生成检索器的输入，而不一定需要我们像上面那样明确构建上下文；
- 代理可以执行多个检索步骤以服务于查询，或者完全不执行检索步骤（例如，响应用户的通用问候时）。

### 检索工具

代理可以访问“工具”并管理它们的执行。在这种情况下，我们将把检索器转换为一个LangChain工具，由代理使用：


```python
<!--IMPORTS:[{"imported": "create_retriever_tool", "source": "langchain.tools.retriever", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.retriever.create_retriever_tool.html", "title": "Conversational RAG"}]-->
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "blog_post_retriever",
    "Searches and returns excerpts from the Autonomous Agents blog post.",
)
tools = [tool]
```

工具是LangChain [可运行的](/docs/concepts#langchain-expression-language-lcel)，并实现了通常的接口：


```python
tool.invoke("task decomposition")
```



```output
'Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.\n\nTree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.\n\nFig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nFig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.'
```


### 代理构造器

现在我们已经定义了工具和大型语言模型，我们可以创建代理。我们将使用[LangGraph](/docs/concepts/#langgraph)来构建代理。
目前我们正在使用高级接口来构建代理，但LangGraph的好处在于，这个高级接口是由一个低级的、高度可控的API支持的，以防你想修改代理逻辑。


```python
from langgraph.prebuilt import create_react_agent

agent_executor = create_react_agent(llm, tools)
```

我们现在可以试一试。请注意，到目前为止它是无状态的（我们仍然需要添加内存）


```python
query = "What is Task Decomposition?"

for s in agent_executor.stream(
    {"messages": [HumanMessage(content=query)]},
):
    print(s)
    print("----")
```
```output
Error in LangChainTracer.on_tool_end callback: TracerException("Found chain run at ID 1a50f4da-34a7-44af-8cbb-c67c90c9619e, but expected {'tool'} run.")
``````output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_1ZkTWsLYIlKZ1uMyIQGUuyJx', 'function': {'arguments': '{"query":"Task Decomposition"}', 'name': 'blog_post_retriever'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 19, 'prompt_tokens': 68, 'total_tokens': 87}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-dddbe2d2-2355-4ca5-9961-1ceb39d78cf9-0', tool_calls=[{'name': 'blog_post_retriever', 'args': {'query': 'Task Decomposition'}, 'id': 'call_1ZkTWsLYIlKZ1uMyIQGUuyJx'}])]}}
----
{'tools': {'messages': [ToolMessage(content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nFig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nTree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.\n\nTree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', name='blog_post_retriever', tool_call_id='call_1ZkTWsLYIlKZ1uMyIQGUuyJx')]}}
----
{'agent': {'messages': [AIMessage(content='Task decomposition is a technique used to break down complex tasks into smaller and simpler steps. This approach helps in managing and solving difficult tasks by dividing them into more manageable components. One common method of task decomposition is the Chain of Thought (CoT) technique, where models are instructed to think step by step to decompose hard tasks into smaller steps. Another extension of CoT is the Tree of Thoughts, which explores multiple reasoning possibilities at each step and generates multiple thoughts per step, creating a tree structure. Task decomposition can be facilitated by using simple prompts, task-specific instructions, or human inputs.', response_metadata={'token_usage': {'completion_tokens': 119, 'prompt_tokens': 636, 'total_tokens': 755}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-4a701854-97f2-4ec2-b6e1-73410911fa72-0')]}}
----
```
LangGraph内置了持久性，因此我们不需要使用ChatMessageHistory！相反，我们可以直接将检查点传递给我们的LangGraph代理


```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

agent_executor = create_react_agent(llm, tools, checkpointer=memory)
```

这就是构建对话式RAG代理所需的一切。

让我们观察它的行为。请注意，如果我们输入一个不需要检索步骤的查询，代理不会执行检索：


```python
config = {"configurable": {"thread_id": "abc123"}}

for s in agent_executor.stream(
    {"messages": [HumanMessage(content="Hi! I'm bob")]}, config=config
):
    print(s)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content='Hello Bob! How can I assist you today?', response_metadata={'token_usage': {'completion_tokens': 11, 'prompt_tokens': 67, 'total_tokens': 78}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-022806f0-eb26-4c87-9132-ed2fcc6c21ea-0')]}}
----
```
进一步地，如果我们输入一个需要检索步骤的查询，代理会生成工具的输入：


```python
query = "What is Task Decomposition?"

for s in agent_executor.stream(
    {"messages": [HumanMessage(content=query)]}, config=config
):
    print(s)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_DdAAJJgGIQOZQgKVE4duDyML', 'function': {'arguments': '{"query":"Task Decomposition"}', 'name': 'blog_post_retriever'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 19, 'prompt_tokens': 91, 'total_tokens': 110}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-acc3c903-4f6f-48dd-8b36-f6f3b80d0856-0', tool_calls=[{'name': 'blog_post_retriever', 'args': {'query': 'Task Decomposition'}, 'id': 'call_DdAAJJgGIQOZQgKVE4duDyML'}])]}}
----
``````output
Error in LangChainTracer.on_tool_end callback: TracerException("Found chain run at ID 9a7ba580-ec91-412d-9649-1b5cbf5ae7bc, but expected {'tool'} run.")
``````output
{'tools': {'messages': [ToolMessage(content='Fig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nFig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nTree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.\n\nTree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.', name='blog_post_retriever', tool_call_id='call_DdAAJJgGIQOZQgKVE4duDyML')]}}
----
```
在上面，代理没有将我们的查询逐字插入工具，而是去掉了“什么”和“是”等不必要的词。

同样的原则允许代理在必要时使用对话的上下文：


```python
query = "What according to the blog post are common ways of doing it? redo the search"

for s in agent_executor.stream(
    {"messages": [HumanMessage(content=query)]}, config=config
):
    print(s)
    print("----")
```
```output
{'agent': {'messages': [AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_KvoiamnLfGEzMeEMlV3u0TJ7', 'function': {'arguments': '{"query":"common ways of task decomposition"}', 'name': 'blog_post_retriever'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 21, 'prompt_tokens': 930, 'total_tokens': 951}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-dd842071-6dbd-4b68-8657-892eaca58638-0', tool_calls=[{'name': 'blog_post_retriever', 'args': {'query': 'common ways of task decomposition'}, 'id': 'call_KvoiamnLfGEzMeEMlV3u0TJ7'}])]}}
----
{'action': {'messages': [ToolMessage(content='Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.\nTask decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.\n\nFig. 1. Overview of a LLM-powered autonomous agent system.\nComponent One: Planning#\nA complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\nTask Decomposition#\nChain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.\n\nResources:\n1. Internet access for searches and information gathering.\n2. Long Term memory management.\n3. GPT-3.5 powered Agents for delegation of simple tasks.\n4. File output.\n\nPerformance Evaluation:\n1. Continuously review and analyze your actions to ensure you are performing to the best of your abilities.\n2. Constructively self-criticize your big-picture behavior constantly.\n3. Reflect on past decisions and strategies to refine your approach.\n4. Every command has a cost, so be smart and efficient. Aim to complete tasks in the least number of steps.\n\n(3) Task execution: Expert models execute on the specific tasks and log results.\nInstruction:\n\nWith the input and the inference results, the AI assistant needs to describe the process and results. The previous stages can be formed as - User Input: {{ User Input }}, Task Planning: {{ Tasks }}, Model Selection: {{ Model Assignment }}, Task Execution: {{ Predictions }}. You must first answer the user\'s request in a straightforward manner. Then describe the task process and show your analysis and model inference results to the user in the first person. If inference results contain a file path, must tell the user the complete file path.', name='blog_post_retriever', id='c749bb8e-c8e0-4fa3-bc11-3e2e0651880b', tool_call_id='call_KvoiamnLfGEzMeEMlV3u0TJ7')]}}
----
{'agent': {'messages': [AIMessage(content='According to the blog post, common ways of task decomposition include:\n\n1. Using language models with simple prompting like "Steps for XYZ" or "What are the subgoals for achieving XYZ?"\n2. Utilizing task-specific instructions, for example, using "Write a story outline" for writing a novel.\n3. Involving human inputs in the task decomposition process.\n\nThese methods help in breaking down complex tasks into smaller and more manageable steps, facilitating better planning and execution of the overall task.', response_metadata={'token_usage': {'completion_tokens': 100, 'prompt_tokens': 1475, 'total_tokens': 1575}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-98b765b3-f1a6-4c9a-ad0f-2db7950b900f-0')]}}
----
```
请注意，代理能够推断出我们查询中的“它”指的是“任务分解”，并因此生成了一个合理的搜索查询——在这种情况下是“任务分解的常见方法”。

### 将其结合起来

为了方便，我们将所有必要的步骤结合在一个代码单元中：


```python
<!--IMPORTS:[{"imported": "create_retriever_tool", "source": "langchain.tools.retriever", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.retriever.create_retriever_tool.html", "title": "Conversational RAG"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Conversational RAG"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Conversational RAG"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Conversational RAG"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Conversational RAG"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Conversational RAG"}]-->
import bs4
from langchain.tools.retriever import create_retriever_tool
from langchain_chroma import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

memory = MemorySaver()
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


### Construct retriever ###
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


### Build retriever tool ###
tool = create_retriever_tool(
    retriever,
    "blog_post_retriever",
    "Searches and returns excerpts from the Autonomous Agents blog post.",
)
tools = [tool]


agent_executor = create_react_agent(llm, tools, checkpointer=memory)
```

## 下一步

我们已经涵盖了构建基本对话式问答应用程序的步骤：

- 我们使用链构建了一个可预测的应用程序，为每个用户输入生成搜索查询；
- 我们使用代理构建了一个应用程序，能够“决定”何时以及如何生成搜索查询。

要探索不同类型的检索器和检索策略，请访问使用手册中的[检索器](/docs/how_to/#retrievers)部分。

有关LangChain对话记忆抽象的详细讲解，请访问[如何添加消息历史（记忆）](/docs/how_to/message_history)的LCEL页面。

要了解更多关于代理的信息，请前往[代理模块](/docs/tutorials/agents)。
