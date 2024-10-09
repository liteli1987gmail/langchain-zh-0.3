---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/lemonai.ipynb
---
# Lemon Agent

>[Lemon Agent](https://github.com/felixbrock/lemon-agent) 帮助您在几分钟内构建强大的 AI 助手，并通过允许在 `Airtable`、`Hubspot`、`Discord`、`Notion`、`Slack` 和 `Github` 等工具中进行准确可靠的读写操作来自动化工作流程。

请查看 [完整文档](https://github.com/felixbrock/lemonai-py-client)。


目前大多数连接器专注于只读操作，限制了大型语言模型的潜力。另一方面，代理有时会由于缺乏上下文或指令而产生幻觉。

使用 `Lemon AI`，可以为您的代理提供访问明确定义的 API，以进行可靠的读写操作。此外，`Lemon AI` 函数允许您通过提供一种静态定义工作流程的方法，进一步降低幻觉的风险，以便在不确定的情况下模型可以依赖。

## 快速开始

以下快速开始演示了如何将 Lemon AI 与代理结合使用，以自动化涉及与内部工具交互的工作流程。

### 1. 安装 Lemon AI

需要 Python 3.8.1 及以上版本。

要在您的 Python 项目中使用 Lemon AI，请运行 `pip install lemonai`

这将安装相应的 Lemon AI 客户端，您可以将其导入到您的脚本中。

该工具使用 Python 包 langchain 和 loguru。如果在安装 Lemon AI 时遇到任何错误，请先安装这两个包，然后再安装 Lemon AI 包。

### 2. 启动服务器

您的代理与 Lemon AI 提供的所有工具的交互由 [Lemon AI 服务器](https://github.com/felixbrock/lemonai-server) 处理。要使用 Lemon AI，您需要在本地计算机上运行服务器，以便 Lemon AI Python 客户端可以连接到它。

### 3. 使用 Lemon AI 和 Langchain

Lemon AI 通过找到相关工具的正确组合或使用 Lemon AI 函数作为替代方案，自动解决给定的任务。以下示例演示如何从 Hackernews 检索用户并将其写入 Airtable 的表中：

#### （可选）定义您的 Lemon AI 函数

类似于 [OpenAI 函数](https://openai.com/blog/function-calling-and-other-api-updates)，Lemon AI 提供了将工作流定义为可重用函数的选项。这些函数可以为那些特别重要的用例定义，以尽可能接近确定性行为。特定的工作流可以在单独的 lemonai.json 中定义：

```json
[
  {
    "name": "Hackernews Airtable User Workflow",
    "description": "retrieves user data from Hackernews and appends it to a table in Airtable",
    "tools": ["hackernews-get-user", "airtable-append-data"]
  }
]
```

您的模型将能够访问这些功能，并会优先使用它们而不是自我选择工具来解决给定任务。您只需通过在提示中包含函数名称来让代理知道它应该使用给定的函数。

#### 在您的 LangChain 项目中包含 Lemon AI


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Lemon Agent"}]-->
import os

from langchain_openai import OpenAI
from lemonai import execute_workflow
```

#### 加载 API 密钥和访问令牌

要使用需要身份验证的工具，您必须以 `"{工具名称}_{身份验证字符串}"` 的格式将相应的访问凭据存储在您的环境中，其中身份验证字符串可以是 API 密钥的其中之一 ["API_KEY", "SECRET_KEY", "SUBSCRIPTION_KEY", "ACCESS_KEY"] 或身份验证令牌的 ["ACCESS_TOKEN", "SECRET_TOKEN"]。示例包括 "OPENAI_API_KEY", "BING_SUBSCRIPTION_KEY", "AIRTABLE_ACCESS_TOKEN"。


```python
""" Load all relevant API Keys and Access Tokens into your environment variables """
os.environ["OPENAI_API_KEY"] = "*INSERT OPENAI API KEY HERE*"
os.environ["AIRTABLE_ACCESS_TOKEN"] = "*INSERT AIRTABLE TOKEN HERE*"
```


```python
hackernews_username = "*INSERT HACKERNEWS USERNAME HERE*"
airtable_base_id = "*INSERT BASE ID HERE*"
airtable_table_id = "*INSERT TABLE ID HERE*"

""" Define your instruction to be given to your LLM """
prompt = f"""Read information from Hackernews for user {hackernews_username} and then write the results to
Airtable (baseId: {airtable_base_id}, tableId: {airtable_table_id}). Only write the fields "username", "karma"
and "created_at_i". Please make sure that Airtable does NOT automatically convert the field types.
"""

"""
Use the Lemon AI execute_workflow wrapper 
to run your Langchain agent in combination with Lemon AI  
"""
model = OpenAI(temperature=0)

execute_workflow(llm=model, prompt_string=prompt)
```

### 4. 了解您的代理决策过程的透明度

为了了解您的代理如何与 Lemon AI 工具互动以解决给定任务，所有做出的决策、使用的工具和执行的操作都记录在本地的 `lemonai.log` 文件中。每次您的大型语言模型代理与 Lemon AI 工具栈互动时，都会创建相应的日志条目。

```log
2023-06-26T11:50:27.708785+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - hackernews-get-user
2023-06-26T11:50:39.624035+0100 - b5f91c59-8487-45c2-800a-156eac0c7dae - airtable-append-data
2023-06-26T11:58:32.925228+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - hackernews-get-user
2023-06-26T11:58:43.988788+0100 - 5efe603c-9898-4143-b99a-55b50007ed9d - airtable-append-data
```

通过使用 [Lemon AI Analytics](https://github.com/felixbrock/lemon-agent/blob/main/apps/analytics/README.md)，您可以轻松了解工具使用的频率和顺序。因此，您可以识别代理决策能力中的薄弱环节，并通过定义 Lemon AI 函数来实现更确定的行为。


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
