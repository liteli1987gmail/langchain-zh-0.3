---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/openai.ipynb
---
# OpenAI

:::caution
您当前正在查看有关使用 OpenAI [文本补全模型](/docs/concepts/#llms) 的文档。最新和最受欢迎的 OpenAI 模型是 [聊天补全模型](/docs/concepts/#chat-models)。

除非您特别使用 `gpt-3.5-turbo-instruct`，否则您可能正在寻找 [此页面](/docs/integrations/chat/openai/)。
:::

[OpenAI](https://platform.openai.com/docs/introduction) 提供了一系列适合不同任务的不同能力模型。

本示例介绍如何使用 LangChain 与 `OpenAI` [模型](https://platform.openai.com/docs/models) 进行交互。

## 概述

### 集成细节
| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/openai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatOpenAI](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html) | [langchain-openai](https://python.langchain.com/api_reference/openai/index.html) | ❌ | beta | ✅ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain-openai?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain-openai?style=flat-square&label=%20) |


## 设置

要访问 OpenAI 模型，您需要创建一个 OpenAI 账户，获取 API 密钥，并安装 `langchain-openai` 集成包。

### 凭证

前往 https://platform.openai.com 注册 OpenAI 并生成 API 密钥。完成后设置 OPENAI_API_KEY 环境变量：


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")
```

如果您想要自动获取最佳的模型调用追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain OpenAI 集成位于 `langchain-openai` 包中：


```python
%pip install -qU langchain-openai
```

如果您需要指定您的组织 ID，可以使用以下单元格。然而，如果您只属于一个组织或打算使用默认组织，则不需要。您可以在 [这里](https://platform.openai.com/account/api-keys) 检查您的默认组织。

要指定您的组织，您可以使用以下内容：
```python
OPENAI_ORGANIZATION = getpass()

os.environ["OPENAI_ORGANIZATION"] = OPENAI_ORGANIZATION
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "OpenAI"}]-->
from langchain_openai import OpenAI

llm = OpenAI()
```

## 调用


```python
llm.invoke("Hello how are you?")
```



```output
'\n\nI am an AI and do not have emotions like humans do, so I am always functioning at my optimal level. Thank you for asking! How can I assist you today?'
```


## 链接


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OpenAI"}]-->
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("How to say {input} in {output_language}:\n")

chain = prompt | llm
chain.invoke(
    {
        "output_language": "German",
        "input": "I love programming.",
    }
)
```



```output
'\nIch liebe Programmieren.'
```


## 使用代理

如果您使用的是显式代理，可以指定 http_client 进行传递


```python
%pip install httpx

import httpx

openai = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"),
)
```
## API 参考

有关所有 `OpenAI` 大型语言模型功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
