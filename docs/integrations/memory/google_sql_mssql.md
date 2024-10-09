---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/google_sql_mssql.ipynb
---
# Google SQL for SQL Server

> [Google Cloud SQL](https://cloud.google.com/sql) 是一个完全托管的关系数据库服务，提供高性能、无缝集成和令人印象深刻的可扩展性。它提供 `MySQL`、`PostgreSQL` 和 `SQL Server` 数据库引擎。扩展您的数据库应用程序，构建利用 Cloud SQL 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 `Google Cloud SQL for SQL Server` 使用 `MSSQLChatMessageHistory` 类存储聊天消息历史。

在 [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mssql-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mssql-python/blob/main/docs/chat_message_history.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Cloud SQL 管理 API。](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [创建一个 Cloud SQL for SQL Server 实例](https://cloud.google.com/sql/docs/sqlserver/create-instance)
* [创建 Cloud SQL 数据库](https://cloud.google.com/sql/docs/sqlserver/create-manage-databases)
* [创建数据库用户](https://cloud.google.com/sql/docs/sqlserver/create-manage-users)（如果选择使用 `sqlserver` 用户，则可选）

### 🦜🔗 库安装
集成在其自己的 `langchain-google-cloud-sql-mssql` 包中，因此我们需要安装它。


```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mssql langchain-google-vertexai
```

**仅限Colab:** 取消注释以下单元以重启内核，或使用按钮重启内核。对于Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 认证
以登录此笔记本的IAM用户身份认证到Google Cloud，以便访问您的Google Cloud项目。

* 如果您使用Colab运行此笔记本，请使用下面的单元并继续。
* 如果您使用Vertex AI Workbench，请查看[这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ 设置您的Google Cloud项目
设置您的Google Cloud项目，以便您可以在此笔记本中利用Google Cloud资源。

如果您不知道您的项目ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 请查看支持页面：[查找项目 ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API 启用
`langchain-google-cloud-sql-mssql` 包要求您在 Google Cloud 项目中 [启用 Cloud SQL 管理 API](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)。


```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## 基本用法

### 设置 Cloud SQL 数据库值
在 [Cloud SQL 实例页面](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) 查找您的数据库值。


```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mssql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
DB_USER = "my-username"  # @param {type: "string"}
DB_PASS = "my-password"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### MSSQLEngine 连接池

将 Cloud SQL 作为 ChatMessageHistory 内存存储的要求和参数之一是 `MSSQLEngine` 对象。`MSSQLEngine` 配置了与您的 Cloud SQL 数据库的连接池，使您的应用程序能够成功连接并遵循行业最佳实践。

要使用 `MSSQLEngine.from_instance()` 创建 `MSSQLEngine`，您只需提供 6 个参数：

1. `project_id` : Cloud SQL 实例所在的 Google Cloud 项目的项目 ID。
1. `region` : Cloud SQL 实例所在的区域。
1. `instance` : Cloud SQL 实例的名称。
1. `database` : 要连接的 Cloud SQL 实例上的数据库名称。
1. `user` : 用于内置数据库身份验证和登录的数据库用户。
1. `password` : 用于内置数据库身份验证和登录的数据库密码。

默认情况下，使用用户名和密码访问 Cloud SQL 数据库的 [内置数据库身份验证](https://cloud.google.com/sql/docs/sqlserver/users) 用于数据库身份验证。



```python
from langchain_google_cloud_sql_mssql import MSSQLEngine

engine = MSSQLEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
    user=DB_USER,
    password=DB_PASS,
)
```

### 初始化表
`MSSQLChatMessageHistory` 类需要一个具有特定模式的数据库表来存储聊天消息历史记录。

`MSSQLEngine` 引擎有一个辅助方法 `init_chat_history_table()`，可以用来为您创建具有正确模式的表。


```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### MSSQLChatMessageHistory

要初始化 `MSSQLChatMessageHistory` 类，您只需提供 3 个参数：

1. `engine` - 一个 `MSSQLEngine` 引擎的实例。
1. `session_id` - 一个唯一标识符字符串，用于指定会话的 ID。
1. `table_name` : 存储聊天消息历史的 Cloud SQL 数据库中的表名。


```python
from langchain_google_cloud_sql_mssql import MSSQLChatMessageHistory

history = MSSQLChatMessageHistory(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```


```python
history.messages
```



```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```


#### 清理
当特定会话的历史记录过时并可以删除时，可以通过以下方式进行。

**注意：** 一旦删除，数据将不再存储在 Cloud SQL 中，并且将永远消失。


```python
history.clear()
```

## 🔗 链接

我们可以轻松地将此消息历史类与 [LCEL 可运行项](/docs/how_to/message_history) 结合起来。

为此，我们将使用 [Google 的 Vertex AI 聊天模型](/docs/integrations/chat/google_vertex_ai_palm)，这要求您在 Google Cloud 项目中 [启用 Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)。



```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Google SQL for SQL Server"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Google SQL for SQL Server"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Google SQL for SQL Server"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```


```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: MSSQLChatMessageHistory(
        engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```


```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```


```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```



```output
AIMessage(content=' Hello Bob, how can I help you today?')
```



```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```



```output
AIMessage(content=' Your name is Bob.')
```

