---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/nvidia_ai_endpoints.ipynb
sidebar_label: NVIDIA AI Endpoints
---

# ChatNVIDIA

这将帮助您开始使用 NVIDIA [聊天模型](/docs/concepts/#chat-models)。有关所有 `ChatNVIDIA` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/nvidia_ai_endpoints/chat_models/langchain_nvidia_ai_endpoints.chat_models.ChatNVIDIA.html)。

## 概述
`langchain-nvidia-ai-endpoints` 包含 LangChain 集成，构建基于模型的应用程序，
NVIDIA NIM 推理微服务。NIM 支持跨领域的模型，如聊天、嵌入和重排序模型，
来自社区以及 NVIDIA。这些模型经过 NVIDIA 优化，以在 NVIDIA
加速基础设施上提供最佳性能，并作为 NIM 部署，NIM 是一种易于使用的预构建容器，可以通过单个
命令在 NVIDIA 加速基础设施上进行部署。

NVIDIA 托管的 NIM 部署可在 [NVIDIA API 目录](https://build.nvidia.com/) 上进行测试。测试后，
NIM 可以使用 NVIDIA AI 企业许可证从 NVIDIA 的 API 目录导出，并在本地或云中运行，
赋予企业对其知识产权和人工智能应用的所有权和完全控制权。

NIM以每个模型为基础打包为容器镜像，并通过NVIDIA NGC目录分发为NGC容器镜像。
从本质上讲，NIM提供了易于使用、一致且熟悉的API，用于对人工智能模型进行推理。

本示例介绍了如何使用LangChain通过`ChatNVIDIA`类与NVIDIA进行交互。

有关通过此API访问聊天模型的更多信息，请查看[ChatNVIDIA](https://python.langchain.com/docs/integrations/chat/nvidia_ai_endpoints/)文档。

### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatNVIDIA](https://python.langchain.com/api_reference/nvidia_ai_endpoints/chat_models/langchain_nvidia_ai_endpoints.chat_models.ChatNVIDIA.html) | [langchain_nvidia_ai_endpoints](https://python.langchain.com/api_reference/nvidia_ai_endpoints/index.html) | ✅ | beta | ❌ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain_nvidia_ai_endpoints?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain_nvidia_ai_endpoints?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

## 设置

**开始使用：**

1. 在[NVIDIA](https://build.nvidia.com/)创建一个免费账户，该平台托管NVIDIA AI基础模型。

2. 点击您选择的模型。

3. 在`输入`下选择`Python`选项卡，然后点击`获取API密钥`。接着点击`生成密钥`。

4. 复制并保存生成的密钥为`NVIDIA_API_KEY`。从此，您应该可以访问端点。

### 凭证



```python
import getpass
import os

if not os.getenv("NVIDIA_API_KEY"):
    # Note: the API key should start with "nvapi-"
    os.environ["NVIDIA_API_KEY"] = getpass.getpass("Enter your NVIDIA API key: ")
```

如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain NVIDIA AI 端点集成位于 `langchain_nvidia_ai_endpoints` 包中：


```python
%pip install --upgrade --quiet langchain-nvidia-ai-endpoints
```

## 实例化

现在我们可以访问 NVIDIA API 目录中的模型：


```python
## Core LC Chat Interface
from langchain_nvidia_ai_endpoints import ChatNVIDIA

llm = ChatNVIDIA(model="mistralai/mixtral-8x7b-instruct-v0.1")
```

## 调用


```python
result = llm.invoke("Write a ballad about LangChain.")
print(result.content)
```

## 使用 NVIDIA NIMs
准备部署时，您可以使用 NVIDIA NIM 自托管模型——这包含在 NVIDIA AI 企业软件许可证中——并在任何地方运行它们，从而拥有自定义的所有权和对知识产权 (IP) 及 AI 应用程序的完全控制。

[了解更多关于 NIMs 的信息](https://developer.nvidia.com/blog/nvidia-nim-offers-optimized-inference-microservices-for-deploying-ai-models-at-scale/)



```python
from langchain_nvidia_ai_endpoints import ChatNVIDIA

# connect to an embedding NIM running at localhost:8000, specifying a specific model
llm = ChatNVIDIA(base_url="http://localhost:8000/v1", model="meta/llama3-8b-instruct")
```

## 流式、批处理和异步

这些模型原生支持流式处理，和所有LangChain大型语言模型一样，它们提供了一个批处理方法来处理并发请求，以及用于调用、流式和批处理的异步方法。以下是一些示例。


```python
print(llm.batch(["What's 2*3?", "What's 2*6?"]))
# Or via the async API
# await llm.abatch(["What's 2*3?", "What's 2*6?"])
```


```python
for chunk in llm.stream("How far can a seagull fly in one day?"):
    # Show the token separations
    print(chunk.content, end="|")
```


```python
async for chunk in llm.astream(
    "How long does it take for monarch butterflies to migrate?"
):
    print(chunk.content, end="|")
```

## 支持的模型

查询`available_models`仍然会给你所有由你的API凭证提供的其他模型。

`playground_`前缀是可选的。


```python
ChatNVIDIA.get_available_models()
# llm.get_available_models()
```

## 模型类型

以上所有模型都受支持，可以通过`ChatNVIDIA`访问。

某些模型类型支持独特的提示技术和聊天消息。我们将在下面回顾一些重要的模型。

**要了解更多关于特定模型的信息，请导航到AI Foundation模型的API部分 [链接在此](https://catalog.ngc.nvidia.com/orgs/nvidia/teams/ai-foundation/models/codellama-13b/api)。**

### 一般聊天

像`meta/llama3-8b-instruct`和`mistralai/mixtral-8x22b-instruct-v0.1`这样的模型是适合与任何LangChain聊天消息一起使用的全能模型。以下是示例。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "ChatNVIDIA"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatNVIDIA"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_nvidia_ai_endpoints import ChatNVIDIA

prompt = ChatPromptTemplate.from_messages(
    [("system", "You are a helpful AI assistant named Fred."), ("user", "{input}")]
)
chain = prompt | ChatNVIDIA(model="meta/llama3-8b-instruct") | StrOutputParser()

for txt in chain.stream({"input": "What's your name?"}):
    print(txt, end="")
```

### 代码生成

这些模型接受与常规聊天模型相同的参数和输入结构，但它们在代码生成和结构化代码任务上表现更好。一个例子是 `meta/codellama-70b`。


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert coding AI. Respond only in valid python; no narration whatsoever.",
        ),
        ("user", "{input}"),
    ]
)
chain = prompt | ChatNVIDIA(model="meta/codellama-70b") | StrOutputParser()

for txt in chain.stream({"input": "How do I solve this fizz buzz problem?"}):
    print(txt, end="")
```

## 多模态

NVIDIA 还支持多模态输入，这意味着您可以同时提供图像和文本供模型推理。支持多模态输入的示例模型是 `nvidia/neva-22b`。

下面是一个使用示例：


```python
import IPython
import requests

image_url = "https://www.nvidia.com/content/dam/en-zz/Solutions/research/ai-playground/nvidia-picasso-3c33-p@2x.jpg"  ## Large Image
image_content = requests.get(image_url).content

IPython.display.Image(image_content)
```


```python
from langchain_nvidia_ai_endpoints import ChatNVIDIA

llm = ChatNVIDIA(model="nvidia/neva-22b")
```

#### 作为 URL 传递图像


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatNVIDIA"}]-->
from langchain_core.messages import HumanMessage

llm.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "Describe this image:"},
                {"type": "image_url", "image_url": {"url": image_url}},
            ]
        )
    ]
)
```

#### 作为 base64 编码字符串传递图像

目前，为了支持像上面那样的大图像，客户端会进行一些额外处理。但对于较小的图像（并且为了更好地说明后台正在进行的过程），我们可以直接传递图像，如下所示：


```python
import IPython
import requests

image_url = "https://picsum.photos/seed/kitten/300/200"
image_content = requests.get(image_url).content

IPython.display.Image(image_content)
```


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatNVIDIA"}]-->
import base64

from langchain_core.messages import HumanMessage

## Works for simpler images. For larger images, see actual implementation
b64_string = base64.b64encode(image_content).decode("utf-8")

llm.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "Describe this image:"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{b64_string}"},
                },
            ]
        )
    ]
)
```

#### 直接在字符串中

NVIDIA API 独特地接受作为 base64 图像嵌入在 `<img/>` HTML 标签中的图像。虽然这与其他大型语言模型不兼容，但您可以相应地直接提示模型。


```python
base64_with_mime_type = f"data:image/png;base64,{b64_string}"
llm.invoke(f'What\'s in this image?\n<img src="{base64_with_mime_type}" />')
```

## 在 RunnableWithMessageHistory 中的示例用法

与其他集成一样，ChatNVIDIA 可以支持聊天工具，如 RunnableWithMessageHistory，这类似于使用 `ConversationChain`。下面，我们展示了 [LangChain RunnableWithMessageHistory](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html) 示例，应用于 `mistralai/mixtral-8x22b-instruct-v0.1` 模型。


```python
%pip install --upgrade --quiet langchain
```


```python
<!--IMPORTS:[{"imported": "InMemoryChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.InMemoryChatMessageHistory.html", "title": "ChatNVIDIA"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "ChatNVIDIA"}]-->
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# store is a dictionary that maps session IDs to their corresponding chat histories.
store = {}  # memory is maintained outside the chain


# A function that returns the chat history for a given session ID.
def get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


chat = ChatNVIDIA(
    model="mistralai/mixtral-8x22b-instruct-v0.1",
    temperature=0.1,
    max_tokens=100,
    top_p=1.0,
)

#  Define a RunnableConfig object, with a `configurable` key. session_id determines thread
config = {"configurable": {"session_id": "1"}}

conversation = RunnableWithMessageHistory(
    chat,
    get_session_history,
)

conversation.invoke(
    "Hi I'm Srijan Dubey.",  # input or query
    config=config,
)
```


```python
conversation.invoke(
    "I'm doing well! Just having a conversation with an AI.",
    config=config,
)
```


```python
conversation.invoke(
    "Tell me about yourself.",
    config=config,
)
```

## 工具调用

从 v0.2 开始，`ChatNVIDIA` 支持 [bind_tools](https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.chat_models.BaseChatModel.html#langchain_core.language_models.chat_models.BaseChatModel.bind_tools)。

`ChatNVIDIA` 提供与 [build.nvidia.com](https://build.nvidia.com) 上各种模型的集成，以及本地 NIM。并非所有这些模型都经过工具调用的训练。请确保选择一个支持工具调用的模型进行实验和应用。

您可以通过以下方式获取已知支持工具调用的模型列表，


```python
tool_models = [
    model for model in ChatNVIDIA.get_available_models() if model.supports_tools
]
tool_models
```

使用一个能够调用工具的模型，


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "ChatNVIDIA"}]-->
from langchain_core.tools import tool
from pydantic import Field


@tool
def get_current_weather(
    location: str = Field(..., description="The location to get the weather for."),
):
    """Get the current weather for a location."""
    ...


llm = ChatNVIDIA(model=tool_models[0].id).bind_tools(tools=[get_current_weather])
response = llm.invoke("What is the weather in Boston?")
response.tool_calls
```

请参见 [如何使用聊天模型调用工具](https://python.langchain.com/docs/how_to/tool_calling/) 获取更多示例。

## 链接

我们可以像这样使用提示词模板 [链式](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatNVIDIA"}]-->
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

有关所有 `ChatNVIDIA` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/nvidia_ai_endpoints/chat_models/langchain_nvidia_ai_endpoints.chat_models.ChatNVIDIA.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
