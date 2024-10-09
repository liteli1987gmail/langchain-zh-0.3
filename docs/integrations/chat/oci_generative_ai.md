---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/oci_generative_ai.ipynb
sidebar_label: OCIGenAI
---
# ChatOCIGenAI

本笔记本提供了关于如何开始使用 OCIGenAI [聊天模型](/docs/concepts/#chat-models) 的快速概述。有关所有 ChatOCIGenAI 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.oci_generative_ai.ChatOCIGenAI.html)。

Oracle Cloud Infrastructure (OCI) 生成式 AI 是一项完全托管的服务，提供一组最先进的、可定制的大型语言模型 (LLMs)，涵盖广泛的用例，并通过单一 API 提供。
使用 OCI 生成式 AI 服务，您可以访问现成的预训练模型，或根据自己的数据在专用 AI 集群上创建和托管自己的微调自定义模型。有关该服务和 API 的详细文档可在 __[这里](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ 和 __[这里](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ 找到。


## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/oci_generative_ai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatOCIGenAI](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.oci_generative_ai.ChatOCIGenAI.html) | [langchain-community](https://python.langchain.com/api_reference/community/index.html) | ❌ | ❌ | ❌ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain-oci-generative-ai?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-oci-generative-ai?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling/) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

## 设置

要访问 OCIGenAI 模型，您需要安装 `oci` 和 `langchain-community` 包。

### 凭证

此集成支持的凭证和身份验证方法与其他 OCI 服务使用的方法相同，并遵循 __[标准 SDK 身份验证](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__ 方法，具体包括 API 密钥、会话令牌、实例主体和资源主体。

API 密钥是上述示例中使用的默认身份验证方法。以下示例演示如何使用不同的身份验证方法（会话令牌）

### 安装

LangChain OCIGenAI 集成位于 `langchain-community` 包中，您还需要安装 `oci` 包：


```python
%pip install -qU langchain-community oci
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成内容：



```python
<!--IMPORTS:[{"imported": "ChatOCIGenAI", "source": "langchain_community.chat_models.oci_generative_ai", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.oci_generative_ai.ChatOCIGenAI.html", "title": "ChatOCIGenAI"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "ChatOCIGenAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatOCIGenAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatOCIGenAI"}]-->
from langchain_community.chat_models.oci_generative_ai import ChatOCIGenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

chat = ChatOCIGenAI(
    model_id="cohere.command-r-16k",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    model_kwargs={"temperature": 0.7, "max_tokens": 500},
)
```

## 调用


```python
messages = [
    SystemMessage(content="your are an AI assistant."),
    AIMessage(content="Hi there human!"),
    HumanMessage(content="tell me a joke."),
]
response = chat.invoke(messages)
```


```python
print(response.content)
```

## 链接

我们可以像这样将我们的模型与提示词模板[链接](/docs/how_to/sequence/)：



```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatOCIGenAI"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat

response = chain.invoke({"topic": "dogs"})
print(response.content)
```

## API 参考

有关所有 ChatOCIGenAI 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.oci_generative_ai.ChatOCIGenAI.html


## 相关

- 聊天模型[概念指南](/docs/concepts/#chat-models)
- 聊天模型[使用指南](/docs/how_to/#chat-models)
