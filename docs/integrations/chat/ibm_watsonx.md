---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/ibm_watsonx.ipynb
sidebar_label: IBM watsonx.ai
---
# ChatWatsonx

>ChatWatsonx 是 IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) 基础模型的封装。

这些示例的目的是展示如何使用 `LangChain` LLMs API 与 `watsonx.ai` 模型进行通信。

## 概述

### 集成细节
| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/openai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| ChatWatsonx | ❌ | ❌ | ❌ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain-ibm?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-ibm?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling/) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | 图像输入 | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |

## 设置

要访问 IBM watsonx.ai 模型，您需要创建一个 IBM watsonx.ai 账户，获取 API 密钥，并安装 `langchain-ibm` 集成包。

### 凭证

下面的单元定义了与 watsonx 基础模型推理相关的凭证。

**操作：** 提供 IBM Cloud 用户 API 密钥。有关详细信息，请参见
[管理用户 API 密钥](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)。


```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

此外，您可以将额外的密钥作为环境变量传递。


```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

### 安装

LangChain IBM 集成位于 `langchain-ibm` 包中：


```python
!pip install -qU langchain-ibm
```

## 实例化

您可能需要根据不同的模型或任务调整模型 `参数`。有关详细信息，请参阅 [可用的 MetaNames](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames)。


```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "stop_sequences": ["."],
}
```

使用之前设置的参数初始化 `WatsonxLLM` 类。


**注意**：

- 要为 API 调用提供上下文，您必须传递 `project_id` 或 `space_id`。要获取您的项目或空间 ID，请打开您的项目或空间，转到 **管理** 选项卡，然后单击 **常规**。有关更多信息，请参见：[项目文档](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects) 或 [部署空间文档](https://www.ibm.com/docs/en/watsonx/saas?topic=spaces-creating-deployment)。
- 根据您提供的服务实例的区域，使用 [watsonx.ai API 认证](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication) 中列出的其中一个 URL。

在此示例中，我们将使用 `project_id` 和达拉斯 URL。


您需要指定将用于推理的 `model_id`。您可以在 [支持的基础模型](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes) 中找到所有可用模型的列表。


```python
from langchain_ibm import ChatWatsonx

chat = ChatWatsonx(
    model_id="ibm/granite-13b-chat-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

或者，您可以使用 Cloud Pak for Data 凭据。有关详细信息，请参见 [watsonx.ai 软件设置](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)。


```python
chat = ChatWatsonx(
    model_id="ibm/granite-13b-chat-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

您还可以传递先前调优模型的 `deployment_id`，而不是 `model_id`。整个模型调优工作流程在 [使用 TuneExperiment 和 PromptTuner](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html) 中进行了描述。


```python
chat = ChatWatsonx(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## 调用

要获取完成结果，您可以使用字符串提示直接调用模型。


```python
# Invocation

messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    (
        "human",
        "I love you for listening to Rock.",
    ),
]

chat.invoke(messages)
```



```output
AIMessage(content="Je t'aime pour écouter la Rock.", response_metadata={'token_usage': {'generated_token_count': 12, 'input_token_count': 28}, 'model_name': 'ibm/granite-13b-chat-v2', 'system_fingerprint': '', 'finish_reason': 'stop_sequence'}, id='run-05b305ce-5401-4a10-b557-41a4b15c7f6f-0')
```



```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatWatsonx"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatWatsonx"}]-->
# Invocation multiple chat
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
)

system_message = SystemMessage(
    content="You are a helpful assistant which telling short-info about provided topic."
)
human_message = HumanMessage(content="horse")

chat.invoke([system_message, human_message])
```



```output
AIMessage(content='Sure, I can help you with that! Horses are large, powerful mammals that belong to the family Equidae.', response_metadata={'token_usage': {'generated_token_count': 24, 'input_token_count': 24}, 'model_name': 'ibm/granite-13b-chat-v2', 'system_fingerprint': '', 'finish_reason': 'stop_sequence'}, id='run-391776ff-3b38-4768-91e8-ff64177149e5-0')
```


## 链接
创建 `ChatPromptTemplate` 对象，这些对象将负责生成随机问题。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatWatsonx"}]-->
from langchain_core.prompts import ChatPromptTemplate

system = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human = "{input}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
```

提供输入并运行链。


```python
chain = prompt | chat
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love Python",
    }
)
```



```output
AIMessage(content='Ich liebe Python.', response_metadata={'token_usage': {'generated_token_count': 5, 'input_token_count': 23}, 'model_name': 'ibm/granite-13b-chat-v2', 'system_fingerprint': '', 'finish_reason': 'stop_sequence'}, id='run-1b1ccf5d-0e33-46f2-a087-e2a136ba1fb7-0')
```


## 流式输出模型结果

您可以流式输出模型结果。


```python
system_message = SystemMessage(
    content="You are a helpful assistant which telling short-info about provided topic."
)
human_message = HumanMessage(content="moon")

for chunk in chat.stream([system_message, human_message]):
    print(chunk.content, end="")
```
```output
The moon is a natural satellite of the Earth, and it has been a source of fascination for humans for centuries.
```
## 批量模型输出

您可以批量处理模型输出。


```python
message_1 = [
    SystemMessage(
        content="You are a helpful assistant which telling short-info about provided topic."
    ),
    HumanMessage(content="cat"),
]
message_2 = [
    SystemMessage(
        content="You are a helpful assistant which telling short-info about provided topic."
    ),
    HumanMessage(content="dog"),
]

chat.batch([message_1, message_2])
```



```output
[AIMessage(content='Cats are domestic animals that belong to the Felidae family.', response_metadata={'token_usage': {'generated_token_count': 13, 'input_token_count': 24}, 'model_name': 'ibm/granite-13b-chat-v2', 'system_fingerprint': '', 'finish_reason': 'stop_sequence'}, id='run-71a8bd7a-a1aa-497b-9bdd-a4d6fe1d471a-0'),
 AIMessage(content='Dogs are domesticated mammals of the family Canidae, characterized by their adaptability to various environments and social structures.', response_metadata={'token_usage': {'generated_token_count': 24, 'input_token_count': 24}, 'model_name': 'ibm/granite-13b-chat-v2', 'system_fingerprint': '', 'finish_reason': 'stop_sequence'}, id='run-22b7a0cb-e44a-4b68-9921-872f82dcd82b-0')]
```


## 工具调用

### ChatWatsonx.bind_tools()

请注意，`ChatWatsonx.bind_tools` 处于测试状态，因此目前我们仅支持 `mistralai/mixtral-8x7b-instruct-v01` 模型。

您还应该重新定义 `max_new_tokens` 参数以获取整个模型响应。默认情况下，`max_new_tokens` 设置为 20。


```python
from langchain_ibm import ChatWatsonx

parameters = {"max_new_tokens": 200}

chat = ChatWatsonx(
    model_id="mistralai/mixtral-8x7b-instruct-v01",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```


```python
from pydantic import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = chat.bind_tools([GetWeather])
```


```python
ai_msg = llm_with_tools.invoke(
    "Which city is hotter today: LA or NY?",
)
ai_msg
```



```output
AIMessage(content='', additional_kwargs={'function_call': {'type': 'function'}, 'tool_calls': [{'type': 'function', 'function': {'name': 'GetWeather', 'arguments': '{"location": "Los Angeles"}'}, 'id': None}, {'type': 'function', 'function': {'name': 'GetWeather', 'arguments': '{"location": "New York"}'}, 'id': None}]}, response_metadata={'token_usage': {'generated_token_count': 99, 'input_token_count': 320}, 'model_name': 'mistralai/mixtral-8x7b-instruct-v01', 'system_fingerprint': '', 'finish_reason': 'eos_token'}, id='run-38627104-f2ac-4edb-8390-d5425fb65979-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'Los Angeles'}, 'id': None}, {'name': 'GetWeather', 'args': {'location': 'New York'}, 'id': None}])
```


### AIMessage.tool_calls
请注意，AIMessage 具有 `tool_calls` 属性。它以标准化的 ToolCall 格式包含，这种格式与大模型供应商无关。


```python
ai_msg.tool_calls
```



```output
[{'name': 'GetWeather', 'args': {'location': 'Los Angeles'}, 'id': None},
 {'name': 'GetWeather', 'args': {'location': 'New York'}, 'id': None}]
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
