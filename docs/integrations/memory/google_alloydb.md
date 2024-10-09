---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/google_alloydb.ipynb
---
# Google AlloyDB for PostgreSQL

> [Google Cloud AlloyDB for PostgreSQL](https://cloud.google.com/alloydb) 是一个完全托管的 `PostgreSQL` 兼容数据库服务，适用于您最苛刻的企业工作负载。`AlloyDB` 将 `Google Cloud` 和 `PostgreSQL` 的最佳特性结合在一起，提供卓越的性能、可扩展性和可用性。扩展您的数据库应用程序，构建利用 `AlloyDB` Langchain 集成的 AI 驱动体验。

本笔记本介绍如何使用 `Google Cloud AlloyDB for PostgreSQL` 存储聊天消息历史记录，使用 `AlloyDBChatMessageHistory` 类。

在 [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/chat_message_history.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 AlloyDB API](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
* [创建一个 AlloyDB 实例](https://cloud.google.com/alloydb/docs/instance-primary-create)
* [创建一个 AlloyDB 数据库](https://cloud.google.com/alloydb/docs/database-create)
* [向数据库添加一个 IAM 数据库用户](https://cloud.google.com/alloydb/docs/manage-iam-authn) (可选)

### 🦜🔗 库安装
集成在其自己的 `langchain-google-alloydb-pg` 包中，因此我们需要安装它。


```python
%pip install --upgrade --quiet langchain-google-alloydb-pg langchain-google-vertexai
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
`langchain-google-alloydb-pg` 包要求您在 Google Cloud 项目中 [启用 AlloyDB 管理 API](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)。


```python
# enable AlloyDB API
!gcloud services enable alloydb.googleapis.com
```

## 基本用法

### 设置 AlloyDB 数据库值
在 [AlloyDB 集群页面](https://console.cloud.google.com/alloydb?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687) 查找您的数据库值。


```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-alloydb-cluster"  # @param {type: "string"}
INSTANCE = "my-alloydb-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### AlloyDBEngine 连接池

将 AlloyDB 作为 ChatMessageHistory 内存存储的要求和参数之一是 `AlloyDBEngine` 对象。`AlloyDBEngine` 配置了与您的 AlloyDB 数据库的连接池，使您的应用程序能够成功连接并遵循行业最佳实践。

要使用 `AlloyDBEngine.from_instance()` 创建 `AlloyDBEngine`，您只需提供 5 个信息：

1. `project_id` : AlloyDB 实例所在的 Google Cloud 项目的项目 ID。
1. `region` : AlloyDB 实例所在的区域。
1. `cluster`: AlloyDB 集群的名称。
1. `instance` : AlloyDB 实例的名称。
1. `database` : 要连接的 AlloyDB 实例上的数据库名称。

默认情况下，将使用 [IAM 数据库身份验证](https://cloud.google.com/alloydb/docs/manage-iam-authn) 作为数据库身份验证的方法。该库使用来自环境的 [应用程序默认凭据 (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) 所属的 IAM 主体。

可选地，可以使用用户名和密码访问 AlloyDB 数据库的 [内置数据库身份验证](https://cloud.google.com/alloydb/docs/database-users/about)。只需向 `AlloyDBEngine.from_instance()` 提供可选的 `user` 和 `password` 参数：

* `user` : 用于内置数据库身份验证和登录的数据库用户。
* `password` : 用于内置数据库身份验证和登录的数据库密码。



```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = AlloyDBEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### 初始化一个表
`AlloyDBChatMessageHistory` 类需要一个具有特定模式的数据库表，以便存储聊天消息历史。

`AlloyDBEngine` 引擎有一个辅助方法 `init_chat_history_table()`，可以用来为您创建一个具有正确模式的表。


```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### AlloyDB聊天消息历史

要初始化 `AlloyDBChatMessageHistory` 类，您只需提供 3 个参数：

1. `engine` - `AlloyDBEngine` 引擎的实例。
1. `session_id` - 一个唯一标识符字符串，用于指定会话的 ID。
1. `table_name` : 在 AlloyDB 数据库中存储聊天消息历史的表的名称。


```python
from langchain_google_alloydb_pg import AlloyDBChatMessageHistory

history = AlloyDBChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```


```python
history.messages
```

#### 清理
当特定会话的历史记录过时时，可以通过以下方式删除。

**注意：** 一旦删除，数据将不再存储在 AlloyDB 中，并且将永远消失。


```python
history.clear()
```

## 🔗 链接

我们可以轻松地将这个消息历史类与 [LCEL 运行接口](/docs/how_to/message_history) 结合起来。

为此，我们将使用 [Google 的 Vertex AI 聊天模型](/docs/integrations/chat/google_vertex_ai_palm)，这需要您在 Google Cloud 项目中 [启用 Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)。



```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Google AlloyDB for PostgreSQL"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Google AlloyDB for PostgreSQL"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Google AlloyDB for PostgreSQL"}]-->
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
    lambda session_id: AlloyDBChatMessageHistory.create_sync(
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


```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```
