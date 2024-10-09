---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/google_firestore_datastore.ipynb
---
# Google Firestore (数据存储模式)

> [Google Cloud Firestore in Datastore](https://cloud.google.com/datastore) 是一个无服务器的文档导向数据库，可以根据需求进行扩展。扩展您的数据库应用程序，构建利用 `Datastore` 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 [Google Cloud Firestore in Datastore](https://cloud.google.com/datastore) 来存储聊天消息历史，使用 `DatastoreChatMessageHistory` 类。

在 [GitHub](https://github.com/googleapis/langchain-google-datastore-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/chat_message_history.ipynb)

## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Datastore API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [创建一个 Datastore 数据库](https://cloud.google.com/datastore/docs/manage-databases)

在确认可以访问此笔记本的运行时环境中的数据库后，填写以下值并在运行示例脚本之前运行该单元格。

### 🦜🔗 库安装

集成存在于其自己的 `langchain-google-datastore` 包中，因此我们需要安装它。


```python
%pip install -upgrade --quiet langchain-google-datastore
```

**仅限Colab**：取消注释以下单元以重启内核，或使用按钮重启内核。对于Vertex AI Workbench，您可以使用顶部的按钮重启终端。


```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ 设置您的Google Cloud项目
设置您的Google Cloud项目，以便您可以在此笔记本中利用Google Cloud资源。

如果您不知道您的项目ID，请尝试以下方法：

* 运行 `gcloud config list`。
* 运行 `gcloud projects list`。
* 查看支持页面：[查找项目ID](https://support.google.com/googleapi/answer/7014113)。


```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 认证

以在此笔记本中登录的IAM用户身份进行Google Cloud认证，以访问您的Google Cloud项目。

- 如果您正在使用Colab运行此笔记本，请使用下面的单元并继续。
- 如果您使用的是 Vertex AI Workbench，请查看 [这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) 的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

### API 启用
`langchain-google-datastore` 包要求您在 Google Cloud 项目中 [启用 Datastore API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)。


```python
# enable Datastore API
!gcloud services enable datastore.googleapis.com
```

## 基本用法

### DatastoreChatMessageHistory

要初始化 `DatastoreChatMessageHistory` 类，您只需提供 3 个内容：

1. `session_id` - 一个唯一标识符字符串，用于指定会话的 ID。
1. `kind` - 要写入的 Datastore 类型的名称。此值是可选的，默认情况下将使用 `ChatHistory` 作为类型。
1. `collection` - 指向 Datastore 集合的单个 `/` 分隔路径。


```python
from langchain_google_datastore import DatastoreChatMessageHistory

chat_history = DatastoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```


```python
chat_history.messages
```

#### 清理
当特定会话的历史记录过时并可以从数据库和内存中删除时，可以通过以下方式进行。

**注意：** 一旦删除，数据将不再存储在数据存储中，并且将永远消失。


```python
chat_history.clear()
```

### 自定义客户端

客户端默认使用可用的环境变量创建。可以将[自定义客户端](https://cloud.google.com/python/docs/reference/datastore/latest/client)传递给构造函数。


```python
from google.auth import compute_engine
from google.cloud import datastore

client = datastore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = DatastoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
