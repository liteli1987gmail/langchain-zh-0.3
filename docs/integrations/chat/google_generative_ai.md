---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/google_generative_ai.ipynb
sidebar_label: Google AI
---
# ChatGoogleGenerativeAI

本文档将帮助您开始使用 Google AI [聊天模型](/docs/concepts/#chat-models)。有关所有 ChatGoogleGenerativeAI 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/google_genai/chat_models/langchain_google_genai.chat_models.ChatGoogleGenerativeAI.html)。

Google AI 提供多种不同的聊天模型。有关最新模型、其功能、上下文窗口等信息，请访问 [Google AI 文档](https://ai.google.dev/gemini-api/docs/models/gemini)。

:::info Google AI vs Google Cloud Vertex AI

Google 的 Gemini 模型可以通过 Google AI 和 Google Cloud Vertex AI 访问。使用 Google AI 只需一个 Google 账户和 API 密钥。使用 Google Cloud Vertex AI 需要一个 Google Cloud 账户（需签署条款协议和计费），但提供企业功能，如客户加密密钥、虚拟私有云等。

要了解这两个 API 的主要功能，请参见 [Google 文档](https://cloud.google.com/vertex-ai/generative-ai/docs/migrate/migrate-google-ai#google-ai)。

:::

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/google_generativeai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatGoogleGenerativeAI](https://python.langchain.com/api_reference/google_genai/chat_models/langchain_google_genai.chat_models.ChatGoogleGenerativeAI.html) | [langchain-google-genai](https://python.langchain.com/api_reference/google_genai/index.html) | ❌ | beta | ✅ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain-google-genai?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-google-genai?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## 设置

要访问Google AI模型，您需要创建一个Google账户，获取Google AI API密钥，并安装`langchain-google-genai`集成包。

### 凭证

前往 https://ai.google.dev/gemini-api/docs/api-key 生成Google AI API密钥。完成后设置GOOGLE_API_KEY环境变量：


```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter your Google AI API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Google AI 集成位于 `langchain-google-genai` 包中：


```python
%pip install -qU langchain-google-genai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # other params...
)
```

## 调用


```python
messages = [
    (
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ),
    ("human", "I love programming."),
]
ai_msg = llm.invoke(messages)
ai_msg
```



```output
AIMessage(content="J'adore programmer. \n", response_metadata={'prompt_feedback': {'block_reason': 0, 'safety_ratings': []}, 'finish_reason': 'STOP', 'safety_ratings': [{'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability': 'NEGLIGIBLE', 'blocked': False}]}, id='run-eef5b138-1da6-4226-9cfe-ab9073ddd77e-0', usage_metadata={'input_tokens': 21, 'output_tokens': 5, 'total_tokens': 26})
```



```python
print(ai_msg.content)
```
```output
J'adore programmer.
```
## 链接

我们可以像这样使用提示词模板 [链](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatGoogleGenerativeAI"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```



```output
AIMessage(content='Ich liebe das Programmieren. \n', response_metadata={'prompt_feedback': {'block_reason': 0, 'safety_ratings': []}, 'finish_reason': 'STOP', 'safety_ratings': [{'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability': 'NEGLIGIBLE', 'blocked': False}]}, id='run-fbb35f30-4937-4a81-ae68-f7cb35721a0c-0', usage_metadata={'input_tokens': 16, 'output_tokens': 7, 'total_tokens': 23})
```


## 安全设置

Gemini 模型具有默认的安全设置，可以被覆盖。如果您从模型中收到很多“安全警告”，您可以尝试调整模型的 `safety_settings` 属性。例如，要关闭对危险内容的安全阻止，您可以按如下方式构造您的 LLM：


```python
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    },
)
```

有关可用类别和阈值的枚举，请参见谷歌的 [安全设置类型](https://ai.google.dev/api/python/google/generativeai/types/SafetySettingDict)。

## API 参考

有关所有 ChatGoogleGenerativeAI 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/google_genai/chat_models/langchain_google_genai.chat_models.ChatGoogleGenerativeAI.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
