---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/mistralai.ipynb
sidebar_label: MistralAI
---
# ChatMistralAI

这将帮助您开始使用 Mistral [聊天模型](/docs/concepts/#chat-models)。有关所有 `ChatMistralAI` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html)。`ChatMistralAI` 类构建于 [Mistral API](https://docs.mistral.ai/api/) 之上。有关 Mistral 支持的所有模型的列表，请查看 [此页面](https://docs.mistral.ai/getting-started/models/)。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/mistral) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatMistralAI](https://python.langchain.com/api_reference/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html) | [langchain_mistralai](https://python.langchain.com/api_reference/mistralai/index.html) | ❌ | beta | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain_mistralai?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_mistralai?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

## 设置


要访问 `ChatMistralAI` 模型，您需要创建一个 Mistral 账户，获取 API 密钥，并安装 `langchain_mistralai` 集成包。

### 凭证


需要一个有效的 [API 密钥](https://console.mistral.ai/users/api-keys/) 来与 API 进行通信。完成后，请设置 MISTRAL_API_KEY 环境变量:


```python
import getpass
import os

if "MISTRAL_API_KEY" not in os.environ:
    os.environ["MISTRAL_API_KEY"] = getpass.getpass("Enter your Mistral API key: ")
```

如果您想要自动跟踪模型调用，可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Mistral 集成位于 `langchain_mistralai` 包中：


```python
%pip install -qU langchain_mistralai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "ChatMistralAI", "source": "langchain_mistralai", "docs": "https://python.langchain.com/api_reference/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html", "title": "ChatMistralAI"}]-->
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0,
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
AIMessage(content='Sure, I\'d be happy to help you translate that sentence into French! The English sentence "I love programming" translates to "J\'aime programmer" in French. Let me know if you have any other questions or need further assistance!', response_metadata={'token_usage': {'prompt_tokens': 32, 'total_tokens': 84, 'completion_tokens': 52}, 'model': 'mistral-small', 'finish_reason': 'stop'}, id='run-64bac156-7160-4b68-b67e-4161f63e021f-0', usage_metadata={'input_tokens': 32, 'output_tokens': 52, 'total_tokens': 84})
```



```python
print(ai_msg.content)
```
```output
Sure, I'd be happy to help you translate that sentence into French! The English sentence "I love programming" translates to "J'aime programmer" in French. Let me know if you have any other questions or need further assistance!
```
## 链接

我们可以像这样使用提示词模板 [链](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatMistralAI"}]-->
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
AIMessage(content='Ich liebe Programmierung. (German translation)', response_metadata={'token_usage': {'prompt_tokens': 26, 'total_tokens': 38, 'completion_tokens': 12}, 'model': 'mistral-small', 'finish_reason': 'stop'}, id='run-dfd4094f-e347-47b0-9056-8ebd7ea35fe7-0', usage_metadata={'input_tokens': 26, 'output_tokens': 12, 'total_tokens': 38})
```


## API 参考

前往 [API 参考](https://python.langchain.com/api_reference/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html) 获取所有属性和方法的详细文档。


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
