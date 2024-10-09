---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/llamacpp.ipynb
---
# Llama.cpp

>[llama.cpp python](https://github.com/abetlen/llama-cpp-python) 库是 `@ggerganov` 的简单 Python 绑定
>[llama.cpp](https://github.com/ggerganov/llama.cpp)。
>
>该包提供：
>
> - 通过 ctypes 接口对 C API 的低级访问。
> - 用于文本补全的高级 Python API
>   - 类似于 `OpenAI` 的 API
>   - 与 `LangChain` 兼容
>   - `LlamaIndex` 兼容性
> - OpenAI 兼容的网络服务器
>   - 本地 Copilot 替代品
>   - 函数调用支持
>   - 视觉 API 支持
>   - 多模型


## 概述

### 集成细节
| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [ChatLlamaCpp](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.llamacpp.ChatLlamaCpp.html) | [LangChain 社区](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | 图像输入 | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

## 设置

要开始并使用下面显示的**所有**功能，我们建议使用经过微调的工具调用模型。

我们将使用 [
Hermes-2-Pro-Llama-3-8B-GGUF](https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF) 来自 NousResearch。

> Hermes 2 Pro 是 Nous Hermes 2 的升级版，由更新和清理后的 OpenHermes 2.5 数据集组成，以及新引入的内部开发的函数调用和 JSON 模式数据集。这个新版本的 Hermes 保持了其出色的通用任务和对话能力 - 但在函数调用方面也表现出色。

查看我们关于本地模型的指南以深入了解：

* [在本地运行大型语言模型](https://python.langchain.com/v0.1/docs/guides/development/local_llms/)
* [将本地模型与RAG结合使用](https://python.langchain.com/v0.1/docs/use_cases/question_answering/local_retrieval_qa/)

### 安装

LangChain LlamaCpp集成位于`langchain-community`和`llama-cpp-python`包中：


```python
%pip install -qU langchain-community llama-cpp-python
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成内容：


```python
# Path to your model weights
local_model = "local/path/to/Hermes-2-Pro-Llama-3-8B-Q8_0.gguf"
```


```python
<!--IMPORTS:[{"imported": "ChatLlamaCpp", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.llamacpp.ChatLlamaCpp.html", "title": "Llama.cpp"}]-->
import multiprocessing

from langchain_community.chat_models import ChatLlamaCpp

llm = ChatLlamaCpp(
    temperature=0.5,
    model_path=local_model,
    n_ctx=10000,
    n_gpu_layers=8,
    n_batch=300,  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.
    max_tokens=512,
    n_threads=multiprocessing.cpu_count() - 1,
    repeat_penalty=1.5,
    top_p=0.5,
    verbose=True,
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


```python
print(ai_msg.content)
```
```output
J'aime programmer. (In France, "programming" is often used in its original sense of scheduling or organizing events.) 

If you meant computer-programming: 
Je suis amoureux de la programmation informatique.

(You might also say simply 'programmation', which would be understood as both meanings - depending on context).
```
## 链接

我们可以像这样将我们的模型与提示词模板[链接](/docs/how_to/sequence/)：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Llama.cpp"}]-->
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

## 工具调用

首先，它的工作方式与OpenAI函数调用基本相同

OpenAI有一个[工具调用](https://platform.openai.com/docs/guides/function-calling)（我们在这里将“工具调用”和“函数调用”互换使用）API，允许您描述工具及其参数，并让模型返回一个包含要调用的工具及其输入的JSON对象。工具调用对于构建使用工具的链和代理非常有用，并且更普遍地从模型获取结构化输出。

通过`ChatLlamaCpp.bind_tools`，我们可以轻松地将Pydantic类、字典模式、LangChain工具甚至函数作为工具传递给模型。在底层，这些被转换为OpenAI工具模式，格式如下：
```
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```
并在每次模型调用中传递。


然而，它无法自动触发一个函数/工具，我们需要通过指定 'tool choice' 参数来强制执行。该参数通常按照下面描述的格式进行设置。

```{"type": "function", "function": {"name": <<tool_name>>}}.```


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Llama.cpp"}]-->
from langchain_core.tools import tool
from pydantic import BaseModel, Field


class WeatherInput(BaseModel):
    location: str = Field(description="The city and state, e.g. San Francisco, CA")
    unit: str = Field(enum=["celsius", "fahrenheit"])


@tool("get_current_weather", args_schema=WeatherInput)
def get_weather(location: str, unit: str):
    """Get the current weather in a given location"""
    return f"Now the weather in {location} is 22 {unit}"


llm_with_tools = llm.bind_tools(
    tools=[get_weather],
    tool_choice={"type": "function", "function": {"name": "get_current_weather"}},
)
```


```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in HCMC in celsius",
)
```


```python
ai_msg.tool_calls
```



```output
[{'name': 'get_current_weather',
  'args': {'location': 'Ho Chi Minh City', 'unit': 'celsius'},
  'id': 'call__0_get_current_weather_cmpl-394d9943-0a1f-425b-8139-d2826c1431f2'}]
```



```python
class MagicFunctionInput(BaseModel):
    magic_function_input: int = Field(description="The input value for magic function")


@tool("get_magic_function", args_schema=MagicFunctionInput)
def magic_function(magic_function_input: int):
    """Get the value of magic function for an input."""
    return magic_function_input + 2


llm_with_tools = llm.bind_tools(
    tools=[magic_function],
    tool_choice={"type": "function", "function": {"name": "get_magic_function"}},
)

ai_msg = llm_with_tools.invoke(
    "What is magic function of 3?",
)

ai_msg
```


```python
ai_msg.tool_calls
```



```output
[{'name': 'get_magic_function',
  'args': {'magic_function_input': 3},
  'id': 'call__0_get_magic_function_cmpl-cd83a994-b820-4428-957c-48076c68335a'}]
```


# 结构化输出


```python
<!--IMPORTS:[{"imported": "convert_to_openai_tool", "source": "langchain_core.utils.function_calling", "docs": "https://python.langchain.com/api_reference/core/utils/langchain_core.utils.function_calling.convert_to_openai_tool.html", "title": "Llama.cpp"}]-->
from langchain_core.utils.function_calling import convert_to_openai_tool
from pydantic import BaseModel


class Joke(BaseModel):
    """A setup to a joke and the punchline."""

    setup: str
    punchline: str


dict_schema = convert_to_openai_tool(Joke)
structured_llm = llm.with_structured_output(dict_schema)
result = structured_llm.invoke("Tell me a joke about birds")
result
```


```python
result
```



```output
{'setup': '- Why did the chicken cross the playground?',
 'punchline': '\n\n- To get to its gilded cage on the other side!'}
```


# 流式处理



```python
for chunk in llm.stream("what is 25x5"):
    print(chunk.content, end="\n", flush=True)
```

## API 参考

有关所有 ChatLlamaCpp 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.llamacpp.ChatLlamaCpp.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
