---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/edenai.ipynb
---
# Eden AI

Eden AI 正在通过联合最佳的 AI 提供商来革新 AI 领域，赋能用户解锁无限可能，挖掘人工智能的真正潜力。通过一个全面且无忧的平台，它允许用户快速将 AI 功能部署到生产环境，使用户能够通过单一 API 轻松访问全面的 AI 能力。（网站：https://edenai.co/）

本示例介绍了如何使用 LangChain 与 Eden AI 模型进行交互

-----------------------------------------------------------------------------------

`EdenAI` 超越了简单的模型调用。它为您提供了高级功能，包括：

- **多个提供商**：访问由各种提供商提供的多样化语言模型，让您可以自由选择最适合您用例的模型。

- **后备机制**：设置后备机制，以确保即使主要提供商不可用，操作也能无缝进行，您可以轻松切换到替代提供商。

- **使用跟踪**：按项目和 API 密钥跟踪使用统计数据。此功能使您能够有效监控和管理资源消耗。

- **监控和可观察性**：`EdenAI` 在平台上提供全面的监控和可观察性工具。监控您的语言模型的性能，分析使用模式，并获得有价值的见解以优化您的应用程序。


访问 EDENAI 的 API 需要一个 API 密钥，

您可以通过创建一个账户 https://app.edenai.run/user/register 来获取，并前往这里 https://app.edenai.run/admin/iam/api-keys

一旦我们有了密钥，我们将希望通过运行以下命令将其设置为环境变量：

```bash
export EDENAI_API_KEY="..."
```

您可以在API参考中找到更多详细信息： https://docs.edenai.co/reference

如果您不想设置环境变量，可以通过名为edenai_api_key的参数直接传递密钥

在初始化EdenAI聊天模型类时。


```python
<!--IMPORTS:[{"imported": "ChatEdenAI", "source": "langchain_community.chat_models.edenai", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.edenai.ChatEdenAI.html", "title": "Eden AI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Eden AI"}]-->
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```


```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```


```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```



```output
AIMessage(content='Hello! How can I assist you today?')
```



```python
await chat.ainvoke(messages)
```



```output
AIMessage(content='Hello! How can I assist you today?')
```


## 流式处理和批处理

`ChatEdenAI`支持流式处理和批处理。以下是一个示例。


```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```
```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```



```output
[AIMessage(content='Hello! How can I assist you today?')]
```


## 回退机制

使用Eden AI，您可以设置回退机制，以确保即使主要大模型供应商不可用，也能无缝操作，您可以轻松切换到替代大模型供应商。


```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

在此示例中，如果OpenAI遇到任何问题，您可以使用Google作为备份大模型供应商。

有关Eden AI的更多信息和详细信息，请查看此链接： https://docs.edenai.co/docs/additional-parameters

## 链式调用



```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Eden AI"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```


```python
chain.invoke({"product": "healthy snacks"})
```



```output
AIMessage(content='VitalBites')
```


## 工具

### bind_tools()

使用 `ChatEdenAI.bind_tools`，我们可以轻松地将 Pydantic 类、字典模式、LangChain 工具，甚至函数作为工具传递给模型。


```python
from pydantic import BaseModel, Field

llm = ChatEdenAI(provider="openai", temperature=0.2, max_tokens=500)


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
AIMessage(content='', response_metadata={'openai': {'status': 'success', 'generated_text': None, 'message': [{'role': 'user', 'message': 'what is the weather like in San Francisco', 'tools': [{'name': 'GetWeather', 'description': 'Get the current weather in a given location', 'parameters': {'type': 'object', 'properties': {'location': {'description': 'The city and state, e.g. San Francisco, CA', 'type': 'string'}}, 'required': ['location']}}], 'tool_calls': None}, {'role': 'assistant', 'message': None, 'tools': None, 'tool_calls': [{'id': 'call_tRpAO7KbQwgTjlka70mCQJdo', 'name': 'GetWeather', 'arguments': '{"location":"San Francisco"}'}]}], 'cost': 0.000194}}, id='run-5c44c01a-d7bb-4df6-835e-bda596080399-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_tRpAO7KbQwgTjlka70mCQJdo'}])
```



```python
ai_msg.tool_calls
```



```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_tRpAO7KbQwgTjlka70mCQJdo'}]
```


### with_structured_output()

BaseChatModel.with_structured_output 接口使从聊天模型获取结构化输出变得简单。您可以使用 ChatEdenAI.with_structured_output（在底层使用工具调用），以更可靠地以特定格式返回输出：



```python
structured_llm = llm.with_structured_output(GetWeather)
structured_llm.invoke(
    "what is the weather like in San Francisco",
)
```



```output
GetWeather(location='San Francisco')
```


### 将工具结果传递给模型

以下是如何使用工具的完整示例。将工具输出传递给模型，并从模型中获取结果


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Eden AI"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "Eden AI"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Eden AI"}]-->
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


llm = ChatEdenAI(
    provider="openai",
    max_tokens=1000,
    temperature=0.2,
)

llm_with_tools = llm.bind_tools([add], tool_choice="required")

query = "What is 11 + 11?"

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

tool_call = ai_msg.tool_calls[0]
tool_output = add.invoke(tool_call["args"])

# This append the result from our tool to the model
messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

llm_with_tools.invoke(messages).content
```



```output
'11 + 11 = 22'
```


### 流式处理

Eden AI 目前不支持流式工具调用。尝试流式处理将产生一个最终消息。


```python
list(llm_with_tools.stream("What's 9 + 9"))
```
```output
/home/eden/Projects/edenai-langchain/libs/community/langchain_community/chat_models/edenai.py:603: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")
```


```output
[AIMessageChunk(content='', id='run-fae32908-ec48-4ab2-ad96-bb0d0511754f', tool_calls=[{'name': 'add', 'args': {'a': 9, 'b': 9}, 'id': 'call_n0Tm7I9zERWa6UpxCAVCweLN'}], tool_call_chunks=[{'name': 'add', 'args': '{"a": 9, "b": 9}', 'id': 'call_n0Tm7I9zERWa6UpxCAVCweLN', 'index': 0}])]
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
