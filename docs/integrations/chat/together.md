---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/together.ipynb
sidebar_label: Together
---
# ChatTogether


本页面将帮助您开始使用 Together AI [聊天模型](../../concepts.mdx#chat-models)。有关所有 ChatTogether 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/together/chat_models/langchain_together.chat_models.ChatTogether.html)。

[Together AI](https://www.together.ai/) 提供一个 API 来查询 [50+ 个领先的开源模型](https://docs.together.ai/docs/chat-models)

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/togetherai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatTogether](https://python.langchain.com/api_reference/together/chat_models/langchain_together.chat_models.ChatTogether.html) | [langchain-together](https://python.langchain.com/api_reference/together/index.html) | ❌ | beta | ✅ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain-together?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-together?style=flat-square&label=%20) |

### 模型特性
| [工具调用](../../how_to/tool_calling.md) | [结构化输出](../../how_to/structured_output.md) | JSON 模式 | [图像输入](../../how_to/multimodal_inputs.md) | 音频输入 | 视频输入 | [令牌级流式处理](../../how_to/chat_streaming.md) | 原生异步 | [令牌使用](../../how_to/chat_token_usage_tracking.md) | [Logprobs](../../how_to/logprobs.md) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

## 设置

要访问 Together 模型，您需要创建一个 Together 账户，获取 API 密钥，并安装 `langchain-together` 集成包。

### 凭证

前往 [此页面](https://api.together.ai) 注册 Together 并生成 API 密钥。完成后设置 TOGETHER_API_KEY 环境变量：


```python
import getpass
import os

if "TOGETHER_API_KEY" not in os.environ:
    os.environ["TOGETHER_API_KEY"] = getpass.getpass("Enter your Together API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Together 集成位于 `langchain-together` 包中：


```python
%pip install -qU langchain-together
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
from langchain_together import ChatTogether

llm = ChatTogether(
    model="meta-llama/Llama-3-70b-chat-hf",
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
AIMessage(content="J'adore la programmation.", response_metadata={'token_usage': {'completion_tokens': 9, 'prompt_tokens': 35, 'total_tokens': 44}, 'model_name': 'meta-llama/Llama-3-70b-chat-hf', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-eabcbe33-cdd8-45b8-ab0b-f90b6e7dfad8-0', usage_metadata={'input_tokens': 35, 'output_tokens': 9, 'total_tokens': 44})
```



```python
print(ai_msg.content)
```
```output
J'adore la programmation.
```
## 链接

我们可以像这样使用提示词模板 [链](../../how_to/sequence.md) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatTogether"}]-->
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
AIMessage(content='Ich liebe das Programmieren.', response_metadata={'token_usage': {'completion_tokens': 7, 'prompt_tokens': 30, 'total_tokens': 37}, 'model_name': 'meta-llama/Llama-3-70b-chat-hf', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-a249aa24-ee31-46ba-9bf9-f4eb135b0a95-0', usage_metadata={'input_tokens': 30, 'output_tokens': 7, 'total_tokens': 37})
```


## API 参考

有关所有 ChatTogether 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/together/chat_models/langchain_together.chat_models.ChatTogether.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
