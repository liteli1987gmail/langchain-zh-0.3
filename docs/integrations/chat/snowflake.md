---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/snowflake.ipynb
---
# Snowflake Cortex

[Snowflake Cortex](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-functions) 让您即时访问由 Mistral、Reka、Meta 和 Google 等公司研究人员训练的行业领先的大型语言模型 (LLMs)，包括 [Snowflake Arctic](https://www.snowflake.com/en/data-cloud/arctic/)，这是一个由 Snowflake 开发的开放企业级模型。

本示例介绍如何使用 LangChain 与 Snowflake Cortex 进行交互。

### 安装和设置

我们首先安装 `snowflake-snowpark-python` 库，使用下面的命令。然后我们配置连接到 Snowflake 的凭据，可以作为环境变量或直接传递。


```python
%pip install --upgrade --quiet snowflake-snowpark-python
```
```output
Note: you may need to restart the kernel to use updated packages.
```

```python
import getpass
import os

# First step is to set up the environment variables, to connect to Snowflake,
# you can also pass these snowflake credentials while instantiating the model

if os.environ.get("SNOWFLAKE_ACCOUNT") is None:
    os.environ["SNOWFLAKE_ACCOUNT"] = getpass.getpass("Account: ")

if os.environ.get("SNOWFLAKE_USERNAME") is None:
    os.environ["SNOWFLAKE_USERNAME"] = getpass.getpass("Username: ")

if os.environ.get("SNOWFLAKE_PASSWORD") is None:
    os.environ["SNOWFLAKE_PASSWORD"] = getpass.getpass("Password: ")

if os.environ.get("SNOWFLAKE_DATABASE") is None:
    os.environ["SNOWFLAKE_DATABASE"] = getpass.getpass("Database: ")

if os.environ.get("SNOWFLAKE_SCHEMA") is None:
    os.environ["SNOWFLAKE_SCHEMA"] = getpass.getpass("Schema: ")

if os.environ.get("SNOWFLAKE_WAREHOUSE") is None:
    os.environ["SNOWFLAKE_WAREHOUSE"] = getpass.getpass("Warehouse: ")

if os.environ.get("SNOWFLAKE_ROLE") is None:
    os.environ["SNOWFLAKE_ROLE"] = getpass.getpass("Role: ")
```


```python
<!--IMPORTS:[{"imported": "ChatSnowflakeCortex", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.snowflake.ChatSnowflakeCortex.html", "title": "Snowflake Cortex"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Snowflake Cortex"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Snowflake Cortex"}]-->
from langchain_community.chat_models import ChatSnowflakeCortex
from langchain_core.messages import HumanMessage, SystemMessage

# By default, we'll be using the cortex provided model: `snowflake-arctic`, with function: `complete`
chat = ChatSnowflakeCortex()
```

上述单元假设您的 Snowflake 凭据已设置在环境变量中。如果您更愿意手动指定它们，请使用以下代码：

```python
chat = ChatSnowflakeCortex(
    # change default cortex model and function
    model="snowflake-arctic",
    cortex_function="complete",

    # change default generation parameters
    temperature=0,
    max_tokens=10,
    top_p=0.95,

    # specify snowflake credentials
    account="YOUR_SNOWFLAKE_ACCOUNT",
    username="YOUR_SNOWFLAKE_USERNAME",
    password="YOUR_SNOWFLAKE_PASSWORD",
    database="YOUR_SNOWFLAKE_DATABASE",
    schema="YOUR_SNOWFLAKE_SCHEMA",
    role="YOUR_SNOWFLAKE_ROLE",
    warehouse="YOUR_SNOWFLAKE_WAREHOUSE"
)
```

### 调用模型
我们现在可以使用 `invoke` 或 `generate` 方法调用模型。

#### 生成


```python
messages = [
    SystemMessage(content="You are a friendly assistant."),
    HumanMessage(content="What are large language models?"),
]
chat.invoke(messages)
```



```output
AIMessage(content=" Large language models are artificial intelligence systems designed to understand, generate, and manipulate human language. These models are typically based on deep learning techniques and are trained on vast amounts of text data to learn patterns and structures in language. They can perform a wide range of language-related tasks, such as language translation, text generation, sentiment analysis, and answering questions. Some well-known large language models include Google's BERT, OpenAI's GPT series, and Facebook's RoBERTa. These models have shown remarkable performance in various natural language processing tasks, and their applications continue to expand as research in AI progresses.", response_metadata={'completion_tokens': 131, 'prompt_tokens': 29, 'total_tokens': 160}, id='run-5435bd0a-83fd-4295-b237-66cbd1b5c0f3-0')
```


### 流式处理
`ChatSnowflakeCortex` 目前不支持流式处理。流式处理的支持将在后续版本中推出！


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
