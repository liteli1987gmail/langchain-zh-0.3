---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/vllm.ipynb
sidebar_label: vLLM Chat
---
# vLLM 聊天

vLLM 可以作为一个服务器部署，模拟 OpenAI API 协议。这使得 vLLM 可以作为使用 OpenAI API 的应用程序的直接替代品。这个服务器可以以与 OpenAI API 相同的格式进行查询。

## 概述
这将帮助你开始使用 vLLM [聊天模型](/docs/concepts/#chat-models)，它利用了 `langchain-openai` 包。有关所有 `ChatOpenAI` 特性和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html)。

### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatOpenAI](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html) | [langchain_openai](https://python.langchain.com/api_reference/openai/) | ✅ | beta | ❌ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain_openai?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_openai?style=flat-square&label=%20) |

### 模型特性
特定模型特性——如工具调用、对多模态输入的支持、对令牌级流式处理的支持等——将取决于托管的模型。

## 设置

请查看 vLLM 文档 [这里](https://docs.vllm.ai/en/latest/)。

要通过 LangChain 访问 vLLM 模型，您需要安装 `langchain-openai` 集成包。

### 凭证

身份验证将取决于推理服务器的具体情况。

如果您想自动跟踪模型调用，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain vLLM 集成可以通过 `langchain-openai` 包访问：


```python
%pip install -qU langchain-openai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "vLLM Chat"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "vLLM Chat"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "vLLM Chat"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "vLLM Chat"}, {"imported": "SystemMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html", "title": "vLLM Chat"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "vLLM Chat"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
```


```python
inference_server_url = "http://localhost:8000/v1"

llm = ChatOpenAI(
    model="mosaicml/mpt-7b",
    openai_api_key="EMPTY",
    openai_api_base=inference_server_url,
    max_tokens=5,
    temperature=0,
)
```

## 调用


```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to Italian."
    ),
    HumanMessage(
        content="Translate the following sentence from English to Italian: I love programming."
    ),
]
llm.invoke(messages)
```



```output
AIMessage(content=' Io amo programmare', additional_kwargs={}, example=False)
```


## 链接

我们可以像这样使用提示词模板[链接](/docs/how_to/sequence/)我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "vLLM Chat"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate(
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

## API 参考

有关通过 `langchain-openai` 暴露的所有功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html

请参考 vLLM [文档](https://docs.vllm.ai/en/latest/)。


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
