---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/databricks.ipynb
sidebar_label: Databricks
---
# ChatDatabricks

> [Databricks](https://www.databricks.com/) Lakehouse 平台将数据、分析和人工智能统一在一个平台上。

本笔记本提供了一个快速概述，帮助您开始使用 Databricks [聊天模型](/docs/concepts/#chat-models)。有关所有 ChatDatabricks 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html)。

## 概述

`ChatDatabricks` 类封装了一个托管在 [Databricks 模型服务](https://docs.databricks.com/en/machine-learning/model-serving/index.html) 上的聊天模型端点。此示例笔记本展示了如何封装您的服务端点并在您的 LangChain 应用中将其用作聊天模型。

### 集成细节

| 类 | 包名 | 本地 | 可序列化 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: |
| [ChatDatabricks](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html) | [langchain-databricks](https://python.langchain.com/api_reference/databricks/index.html) | ❌ | beta | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain-databricks?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-databricks?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling/) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |  ✅ | ✅ | ✅ | ❌ |

### 支持的方法

`ChatDatabricks` 支持所有 `ChatModel` 的方法，包括异步API。


### 端点要求

服务端点 `ChatDatabricks` 包装的必须具有与OpenAI兼容的聊天输入/输出格式 ([参考](https://mlflow.org/docs/latest/llms/deployments/index.html#chat))。只要输入格式兼容，`ChatDatabricks` 可以用于托管在 [Databricks Model Serving](https://docs.databricks.com/en/machine-learning/model-serving/index.html) 上的任何端点类型：

1. 基础模型 - 精心挑选的最先进基础模型列表，如 DRBX、Llama3、Mixtral-8x7B 等。这些端点可以在您的 Databricks 工作区中直接使用，无需任何设置。
2. 自定义模型 - 您还可以通过 MLflow 将自定义模型部署到服务端点，
选择您喜欢的框架，如 LangChain、Pytorch、Transformers 等。
3. 外部模型 - Databricks 端点可以作为代理服务托管在 Databricks 之外的模型，例如像 OpenAI GPT4 这样的专有模型服务。


## 设置

要访问 Databricks 模型，您需要创建一个 Databricks 账户，设置凭据（仅当您在 Databricks 工作区外时），并安装所需的包。

### 凭据（仅当您在 Databricks 工作区外时）

如果您在 Databricks 内运行 LangChain 应用程序，可以跳过此步骤。

否则，您需要手动将 Databricks 工作区主机名和个人访问令牌分别设置为 `DATABRICKS_HOST` 和 `DATABRICKS_TOKEN` 环境变量。有关如何获取访问令牌，请参见 [身份验证文档](https://docs.databricks.com/en/dev-tools/auth/index.html#databricks-personal-access-tokens)。


```python
import getpass
import os

os.environ["DATABRICKS_HOST"] = "https://your-workspace.cloud.databricks.com"
if "DATABRICKS_TOKEN" not in os.environ:
    os.environ["DATABRICKS_TOKEN"] = getpass.getpass(
        "Enter your Databricks access token: "
    )
```
```output
Enter your Databricks access token:  ········
```
### 安装

LangChain Databricks 集成位于 `langchain-databricks` 包中。


```python
%pip install -qU langchain-databricks
```

我们首先演示如何使用 `ChatDatabricks` 查询作为基础模型端点托管的 DBRX-instruct 模型。

对于其他类型的端点，设置端点本身的方式有所不同，但是，一旦端点准备就绪，使用 `ChatDatabricks` 查询它的方式没有区别。请参考本笔记本底部的其他类型端点的示例。

## 实例化



```python
from langchain_databricks import ChatDatabricks

chat_model = ChatDatabricks(
    endpoint="databricks-dbrx-instruct",
    temperature=0.1,
    max_tokens=256,
    # See https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html for other supported parameters
)
```

## 调用


```python
chat_model.invoke("What is MLflow?")
```



```output
AIMessage(content='MLflow is an open-source platform for managing end-to-end machine learning workflows. It was introduced by Databricks in 2018. MLflow provides tools for tracking experiments, packaging and sharing code, and deploying models. It is designed to work with any machine learning library and can be used in a variety of environments, including local machines, virtual machines, and cloud-based clusters. MLflow aims to streamline the machine learning development lifecycle, making it easier for data scientists and engineers to collaborate and deploy models into production.', response_metadata={'prompt_tokens': 229, 'completion_tokens': 104, 'total_tokens': 333}, id='run-d3fb4d06-3e10-4471-83c9-c282cc62b74d-0')
```



```python
# You can also pass a list of messages
messages = [
    ("system", "You are a chatbot that can answer questions about Databricks."),
    ("user", "What is Databricks Model Serving?"),
]
chat_model.invoke(messages)
```



```output
AIMessage(content='Databricks Model Serving is a feature of the Databricks platform that allows data scientists and engineers to easily deploy machine learning models into production. With Model Serving, you can host, manage, and serve machine learning models as APIs, making it easy to integrate them into applications and business processes. It supports a variety of popular machine learning frameworks, including TensorFlow, PyTorch, and scikit-learn, and provides tools for monitoring and managing the performance of deployed models. Model Serving is designed to be scalable, secure, and easy to use, making it a great choice for organizations that want to quickly and efficiently deploy machine learning models into production.', response_metadata={'prompt_tokens': 35, 'completion_tokens': 130, 'total_tokens': 165}, id='run-b3feea21-223e-4105-8627-41d647d5ccab-0')
```


## 链接
与其他聊天模型类似，`ChatDatabricks` 可以作为复杂链的一部分使用。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatDatabricks"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a chatbot that can answer questions about {topic}.",
        ),
        ("user", "{question}"),
    ]
)

chain = prompt | chat_model
chain.invoke(
    {
        "topic": "Databricks",
        "question": "What is Unity Catalog?",
    }
)
```



```output
AIMessage(content="Unity Catalog is a new data catalog feature in Databricks that allows you to discover, manage, and govern all your data assets across your data landscape, including data lakes, data warehouses, and data marts. It provides a centralized repository for storing and managing metadata, data lineage, and access controls for all your data assets. Unity Catalog enables data teams to easily discover and access the data they need, while ensuring compliance with data privacy and security regulations. It is designed to work seamlessly with Databricks' Lakehouse platform, providing a unified experience for managing and analyzing all your data.", response_metadata={'prompt_tokens': 32, 'completion_tokens': 118, 'total_tokens': 150}, id='run-82d72624-f8df-4c0d-a976-919feec09a55-0')
```


## 调用（流式处理）


```python
for chunk in chat_model.stream("How are you?"):
    print(chunk.content, end="|")
```
```output
I|'m| an| AI| and| don|'t| have| feelings|,| but| I|'m| here| and| ready| to| assist| you|.| How| can| I| help| you| today|?||
```
## 异步调用


```python
import asyncio

country = ["Japan", "Italy", "Australia"]
futures = [chat_model.ainvoke(f"Where is the capital of {c}?") for c in country]
await asyncio.gather(*futures)
```

## 包装自定义模型端点

前提条件：

* 一个大型语言模型已通过 MLflow 注册并部署到 [Databricks 服务端点](https://docs.databricks.com/machine-learning/model-serving/index.html)。该端点必须具有与 OpenAI 兼容的聊天输入/输出格式 ([参考](https://mlflow.org/docs/latest/llms/deployments/index.html#chat))
* 您对该端点具有 [“可以查询”权限](https://docs.databricks.com/security/auth-authz/access-control/serving-endpoint-acl.html)。

一旦端点准备就绪，使用模式与基础模型相同。


```python
chat_model_custom = ChatDatabricks(
    endpoint="YOUR_ENDPOINT_NAME",
    temperature=0.1,
    max_tokens=256,
)

chat_model_custom.invoke("How are you?")
```

## 包装外部模型

前提条件：创建代理端点

首先，创建一个新的 Databricks 服务端点，该端点将请求代理到目标外部模型。创建端点的过程应该相对快速，以便代理外部模型。

这需要在 Databricks 秘密管理器中注册您的 OpenAI API 密钥，具体如下：
```sh
# Replace `<scope>` with your scope
databricks secrets create-scope <scope>
databricks secrets put-secret <scope> openai-api-key --string-value $OPENAI_API_KEY
```

有关如何设置 Databricks CLI 和管理秘密的信息，请参阅 https://docs.databricks.com/en/security/secrets/secrets.html


```python
from mlflow.deployments import get_deploy_client

client = get_deploy_client("databricks")

secret = "secrets/<scope>/openai-api-key"  # replace `<scope>` with your scope
endpoint_name = "my-chat"  # rename this if my-chat already exists
client.create_endpoint(
    name=endpoint_name,
    config={
        "served_entities": [
            {
                "name": "my-chat",
                "external_model": {
                    "name": "gpt-3.5-turbo",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{" + secret + "}}",
                    },
                },
            }
        ],
    },
)
```

一旦端点状态变为“就绪”，您可以像查询其他类型的端点一样查询该端点。


```python
chat_model_external = ChatDatabricks(
    endpoint=endpoint_name,
    temperature=0.1,
    max_tokens=256,
)
chat_model_external.invoke("How to use Databricks?")
```

## 在Databricks上调用函数

Databricks函数调用与OpenAI兼容，仅在模型服务期间作为基础模型API的一部分可用。

有关支持的模型，请参见[Databricks函数调用介绍](https://docs.databricks.com/en/machine-learning/model-serving/function-calling.html#supported-models)。


```python
llm = ChatDatabricks(endpoint="databricks-meta-llama-3-70b-instruct")
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
            },
        },
    }
]

# supported tool_choice values: "auto", "required", "none", function name in string format,
# or a dictionary as {"type": "function", "function": {"name": <<tool_name>>}}
model = llm.bind_tools(tools, tool_choice="auto")

messages = [{"role": "user", "content": "What is the current temperature of Chicago?"}]
print(model.invoke(messages))
```

有关如何在链中使用UC函数，请参见[Databricks Unity Catalog](docs/integrations/tools/databricks.md)。

## API参考

有关所有ChatDatabricks功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/databricks/chat_models/langchain_databricks.chat_models.ChatDatabricks.html


## 相关

- 聊天模型[概念指南](/docs/concepts/#chat-models)
- 聊天模型[操作指南](/docs/how_to/#chat-models)
