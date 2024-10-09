---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/xata_chat_message_history.ipynb
---
# Xata

>[Xata](https://xata.io) 是一个无服务器数据平台，基于 `PostgreSQL` 和 `Elasticsearch`。它提供了一个用于与数据库交互的 Python SDK，以及一个用于管理数据的 UI。使用 `XataChatMessageHistory` 类，您可以使用 Xata 数据库来长期保存聊天会话。

本笔记本涵盖：

* 一个简单的示例，展示 `XataChatMessageHistory` 的功能。
* 一个更复杂的示例，使用 REACT 代理根据知识库或文档（存储在 Xata 中作为向量存储）回答问题，并且还具有其过去消息的长期可搜索历史（存储在 Xata 中作为记忆存储）。

## 设置

### 创建数据库

在 [Xata UI](https://app.xata.io) 中创建一个新数据库。您可以随意命名，在这个笔记本中我们将使用 `langchain`。Langchain 集成可以自动创建用于存储记忆的表，这就是我们在这个示例中将使用的。如果您想预先创建表，请确保它具有正确的模式，并在创建类时将 `create_table` 设置为 `False`。预先创建表可以在每次会话初始化期间节省一次往返数据库的时间。

让我们首先安装我们的依赖项：


```python
%pip install --upgrade --quiet  xata langchain-openai langchain langchain-community
```

接下来，我们需要获取 Xata 的环境变量。您可以通过访问您的 [账户设置](https://app.xata.io/settings) 创建一个新的 API 密钥。要找到数据库 URL，请转到您创建的数据库的设置页面。数据库 URL 应该类似于：`https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`。


```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## 创建一个简单的内存存储

为了单独测试内存存储功能，让我们使用以下代码片段：


```python
<!--IMPORTS:[{"imported": "XataChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.xata.XataChatMessageHistory.html", "title": "Xata"}]-->
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

上述代码创建了一个 ID 为 `session-1` 的会话，并在其中存储了两条消息。运行上述代码后，如果您访问 Xata UI，您应该会看到一个名为 `memory` 的表格，以及添加的两条消息。

您可以使用以下代码检索特定会话的消息历史：


```python
history.messages
```

## 基于内存的数据对话式问答链

现在让我们看看一个更复杂的示例，在这个示例中，我们结合 OpenAI、Xata 向量存储集成和 Xata 内存存储集成，创建一个基于您数据的问答聊天机器人，支持后续问题和历史记录。

我们需要访问 OpenAI API，因此让我们配置 API 密钥：


```python
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

为了存储聊天机器人将搜索答案的文档，请使用 Xata UI 向您的 `langchain` 数据库添加一个名为 `docs` 的表，并添加以下列：

* `content` 类型为 "Text"。用于存储 `Document.pageContent` 值。
* `embedding` 类型为 "向量"。使用您计划使用的模型所用的维度。在这个笔记本中，我们使用 OpenAI 嵌入，维度为 1536。

让我们创建向量存储并添加一些示例文档：


```python
<!--IMPORTS:[{"imported": "XataVectorStore", "source": "langchain_community.vectorstores.xata", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.xata.XataVectorStore.html", "title": "Xata"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Xata"}]-->
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

运行上述命令后，如果您进入 Xata UI，您应该会看到文档与其嵌入一起加载在 `docs` 表中。

现在让我们创建一个 ConversationBufferMemory 来存储用户和 AI 的聊天消息。


```python
<!--IMPORTS:[{"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Xata"}]-->
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

现在是时候创建一个代理，以便同时使用向量存储和聊天记忆。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Xata"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Xata"}, {"imported": "create_retriever_tool", "source": "langchain.agents.agent_toolkits", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.retriever.create_retriever_tool.html", "title": "Xata"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Xata"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

为了测试，让我们告诉代理我们的名字：


```python
agent.run(input="My name is bob")
```

现在，让我们问代理一些关于 Xata 的问题：


```python
agent.run(input="What is xata?")
```

请注意，它是根据存储在文档存储中的数据进行回答的。现在，让我们问一个后续问题：


```python
agent.run(input="Does it support similarity search?")
```

现在让我们测试它的记忆：


```python
agent.run(input="Did I tell you my name? What is it?")
```
