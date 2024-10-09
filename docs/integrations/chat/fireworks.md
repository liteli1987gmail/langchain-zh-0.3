---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/fireworks.ipynb
sidebar_label: Fireworks
---
# ChatFireworks

本文件帮助您开始使用 Fireworks AI [聊天模型](/docs/concepts/#chat-models)。有关所有 ChatFireworks 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/fireworks/chat_models/langchain_fireworks.chat_models.ChatFireworks.html)。

Fireworks AI 是一个 AI 推理平台，用于运行和自定义模型。有关 Fireworks 提供的所有模型的列表，请参见 [Fireworks 文档](https://fireworks.ai/models)。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/fireworks) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatFireworks](https://python.langchain.com/api_reference/fireworks/chat_models/langchain_fireworks.chat_models.ChatFireworks.html) | [langchain-fireworks](https://python.langchain.com/api_reference/fireworks/index.html) | ❌ | beta | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain-fireworks?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-fireworks?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

## 设置

要访问 Fireworks 模型，您需要创建一个 Fireworks 账户，获取 API 密钥，并安装 `langchain-fireworks` 集成包。

### 凭证

前往 (https://fireworks.ai/login 注册 Fireworks 并生成 API 密钥。完成后设置 FIREWORKS_API_KEY 环境变量：


```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Enter your Fireworks API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Fireworks 集成位于 `langchain-fireworks` 包中：


```python
%pip install -qU langchain-fireworks
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

- TODO: 使用相关参数更新模型实例化。


```python
<!--IMPORTS:[{"imported": "ChatFireworks", "source": "langchain_fireworks", "docs": "https://python.langchain.com/api_reference/fireworks/chat_models/langchain_fireworks.chat_models.ChatFireworks.html", "title": "ChatFireworks"}]-->
from langchain_fireworks import ChatFireworks

llm = ChatFireworks(
    model="accounts/fireworks/models/llama-v3-70b-instruct",
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
AIMessage(content="J'adore la programmation.", response_metadata={'token_usage': {'prompt_tokens': 35, 'total_tokens': 44, 'completion_tokens': 9}, 'model_name': 'accounts/fireworks/models/llama-v3-70b-instruct', 'system_fingerprint': '', 'finish_reason': 'stop', 'logprobs': None}, id='run-df28e69a-ff30-457e-a743-06eb14d01cb0-0', usage_metadata={'input_tokens': 35, 'output_tokens': 9, 'total_tokens': 44})
```



```python
print(ai_msg.content)
```
```output
J'adore la programmation.
```
## 链接

我们可以像这样使用提示词模板 [链](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatFireworks"}]-->
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
AIMessage(content='Ich liebe das Programmieren.', response_metadata={'token_usage': {'prompt_tokens': 30, 'total_tokens': 37, 'completion_tokens': 7}, 'model_name': 'accounts/fireworks/models/llama-v3-70b-instruct', 'system_fingerprint': '', 'finish_reason': 'stop', 'logprobs': None}, id='run-ff3f91ad-ed81-4acf-9f59-7490dc8d8f48-0', usage_metadata={'input_tokens': 30, 'output_tokens': 7, 'total_tokens': 37})
```


## API 参考

有关所有ChatFireworks功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/fireworks/chat_models/langchain_fireworks.chat_models.ChatFireworks.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
