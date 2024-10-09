---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/google_bigtable.ipynb
---
# Google Bigtable

> [Google Cloud Bigtable](https://cloud.google.com/bigtable) 是一个键值和宽列存储，适合快速访问结构化、半结构化或非结构化数据。扩展您的数据库应用程序，构建利用 Bigtable 的 LangChain 集成的 AI 驱动体验。

本笔记本介绍如何使用 [Google Cloud Bigtable](https://cloud.google.com/bigtable) 使用 `BigtableChatMessageHistory` 类存储聊天消息历史。

在 [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/chat_message_history.ipynb)


## 开始之前

要运行此笔记本，您需要执行以下操作：

* [创建一个 Google Cloud 项目](https://developers.google.com/workspace/guides/create-project)
* [启用 Bigtable API](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [创建一个 Bigtable 实例](https://cloud.google.com/bigtable/docs/creating-instance)
* [创建 Bigtable 表](https://cloud.google.com/bigtable/docs/managing-tables)
* [创建 Bigtable 访问凭证](https://developers.google.com/workspace/guides/create-credentials)

### 🦜🔗 库安装

集成在其自己的 `langchain-google-bigtable` 包中，因此我们需要安装它。


```python
%pip install -upgrade --quiet langchain-google-bigtable
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

以登录此笔记本的IAM用户身份对Google Cloud进行认证，以访问您的Google Cloud项目。

- 如果您使用Colab运行此笔记本，请使用下面的单元并继续。
- 如果您使用的是 Vertex AI Workbench，请查看 [这里](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) 的设置说明。


```python
from google.colab import auth

auth.authenticate_user()
```

## 基本用法

### 初始化 Bigtable 架构

BigtableChatMessageHistory 的架构要求实例和表必须存在，并且有一个名为 `langchain` 的列族。


```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

如果表或列族不存在，您可以使用以下函数来创建它们：


```python
from google.cloud import bigtable
from langchain_google_bigtable import create_chat_history_table

create_chat_history_table(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)
```

### BigtableChatMessageHistory

要初始化 `BigtableChatMessageHistory` 类，您只需提供 3 个参数：

1. `instance_id` - 用于聊天消息历史的 Bigtable 实例。
1. `table_id` : 用于存储聊天消息历史的 Bigtable 表。
1. `session_id` - 一个唯一标识符字符串，用于指定会话的 ID。


```python
from langchain_google_bigtable import BigtableChatMessageHistory

message_history = BigtableChatMessageHistory(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```


```python
message_history.messages
```

#### 清理

当特定会话的历史记录过时时，可以通过以下方式删除。

**注意：** 一旦删除，数据将不再存储在 Bigtable 中，并且将永远消失。


```python
message_history.clear()
```

## 高级用法

### 自定义客户端
默认创建的客户端是默认客户端，仅使用 admin=True 选项。要使用非默认客户端，可以将 [自定义客户端](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) 传递给构造函数。


```python
from google.cloud import bigtable

client = (bigtable.Client(...),)

create_chat_history_table(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)

custom_client_message_history = BigtableChatMessageHistory(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)
```
