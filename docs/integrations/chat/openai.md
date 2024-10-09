---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/openai.ipynb
sidebar_label: OpenAI
---
# ChatOpenAI

本笔记本提供了关于如何开始使用OpenAI [聊天模型](/docs/concepts/#chat-models) 的快速概述。有关所有ChatOpenAI功能和配置的详细文档，请访问 [API参考](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html)。

OpenAI有几个聊天模型。您可以在 [OpenAI文档](https://platform.openai.com/docs/models) 中找到有关其最新模型及其成本、上下文窗口和支持的输入类型的信息。

:::info Azure OpenAI

请注意，某些OpenAI模型也可以通过 [Microsoft Azure平台](https://azure.microsoft.com/en-us/products/ai-services/openai-service) 访问。要使用Azure OpenAI服务，请使用 [AzureChatOpenAI集成](/docs/integrations/chat/azure_chat_openai/)。

:::

## 概述

### 集成细节
| 类别 | 包名 | 本地 | 可序列化 | [JS支持](https://js.langchain.com/docs/integrations/chat/openai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatOpenAI](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html) | [langchain-openai](https://python.langchain.com/api_reference/openai/index.html) | ❌ | beta | ✅ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain-openai?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain-openai?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | 图像输入 | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

## 设置

要访问OpenAI模型，您需要创建一个OpenAI账户，获取API密钥，并安装`langchain-openai`集成包。

### 凭证

前往 https://platform.openai.com 注册OpenAI并生成API密钥。完成后设置OPENAI_API_KEY环境变量：


```python
import getpass
import os

if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")
```

如果您想自动跟踪模型调用，可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain OpenAI 集成位于 `langchain-openai` 包中：


```python
%pip install -qU langchain-openai
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "ChatOpenAI"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # api_key="...",  # if you prefer to pass api key in directly instaed of using env vars
    # base_url="...",
    # organization="...",
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
AIMessage(content="J'adore la programmation.", additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 31, 'total_tokens': 36}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'stop', 'logprobs': None}, id='run-63219b22-03e3-4561-8cc4-78b7c7c3a3ca-0', usage_metadata={'input_tokens': 31, 'output_tokens': 5, 'total_tokens': 36})
```



```python
print(ai_msg.content)
```
```output
J'adore la programmation.
```
## 链接

我们可以像这样使用提示词模板来 [链接](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatOpenAI"}]-->
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
AIMessage(content='Ich liebe das Programmieren.', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 26, 'total_tokens': 32}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'stop', 'logprobs': None}, id='run-350585e1-16ca-4dad-9460-3d9e7e49aaf1-0', usage_metadata={'input_tokens': 26, 'output_tokens': 6, 'total_tokens': 32})
```


## 工具调用

OpenAI 有一个 [工具调用](https://platform.openai.com/docs/guides/function-calling) API（我们在这里将“工具调用”和“函数调用”互换使用），它允许您描述工具及其参数，并让模型返回一个 JSON 对象，其中包含要调用的工具及其输入。工具调用对于构建使用工具的链和代理非常有用，并且更一般地从模型获取结构化输出。

### ChatOpenAI.bind_tools()

使用 `ChatOpenAI.bind_tools`，我们可以轻松地将 Pydantic 类、字典模式、LangChain 工具，甚至函数作为工具传递给模型。在后台，这些会被转换为 OpenAI 工具模式，格式如下：
```
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```
并在每次模型调用中传递。


```python
from pydantic import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = llm.bind_tools([GetWeather])
```


```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_o9udf3EVOWiV4Iupktpbpofk', 'function': {'arguments': '{"location":"San Francisco, CA"}', 'name': 'GetWeather'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 68, 'total_tokens': 85}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-1617c9b2-dda5-4120-996b-0333ed5992e2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'call_o9udf3EVOWiV4Iupktpbpofk', 'type': 'tool_call'}], usage_metadata={'input_tokens': 68, 'output_tokens': 17, 'total_tokens': 85})
```


### ``strict=True``

:::info Requires ``langchain-openai>=0.1.21rc1``

:::

截至 2024 年 8 月 6 日，OpenAI 在调用工具时支持 `strict` 参数，这将强制模型遵循工具参数模式。更多信息请见： https://platform.openai.com/docs/guides/function-calling

**注意**：如果 ``strict=True``，工具定义也将被验证，并且接受 JSON 模式的子集。重要的是，模式不能有可选参数（即具有默认值的参数）。请在此处阅读完整文档，了解支持的模式类型： https://platform.openai.com/docs/guides/structured-outputs/supported-schemas。


```python
llm_with_tools = llm.bind_tools([GetWeather], strict=True)
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_jUqhd8wzAIzInTJl72Rla8ht', 'function': {'arguments': '{"location":"San Francisco, CA"}', 'name': 'GetWeather'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 68, 'total_tokens': 85}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_3aa7262c27', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-5e3356a9-132d-4623-8e73-dd5a898cf4a6-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco, CA'}, 'id': 'call_jUqhd8wzAIzInTJl72Rla8ht', 'type': 'tool_call'}], usage_metadata={'input_tokens': 68, 'output_tokens': 17, 'total_tokens': 85})
```


### AIMessage.tool_calls
请注意，AIMessage 具有 `tool_calls` 属性。它以标准化的 ToolCall 格式包含，这种格式与大模型供应商无关。


```python
ai_msg.tool_calls
```



```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco, CA'},
  'id': 'call_jUqhd8wzAIzInTJl72Rla8ht',
  'type': 'tool_call'}]
```


有关绑定工具和工具调用输出的更多信息，请查看 [工具调用](/docs/how_to/function_calling) 文档。

## 微调

您可以通过传入相应的 `modelName` 参数来调用微调后的 OpenAI 模型。

这通常采用 `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}` 的形式。例如：


```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model.invoke(messages)
```



```output
AIMessage(content="J'adore la programmation.", additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 8, 'prompt_tokens': 31, 'total_tokens': 39}, 'model_name': 'ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-0f39b30e-c56e-4f3b-af99-5c948c984146-0', usage_metadata={'input_tokens': 31, 'output_tokens': 8, 'total_tokens': 39})
```


## API 参考

有关所有 ChatOpenAI 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
