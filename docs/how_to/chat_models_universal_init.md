---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chat_models_universal_init.ipynb
---
# 如何在一行中初始化任何模型

许多大型语言模型应用程序允许最终用户指定他们希望应用程序使用的大模型供应商和模型。这需要编写一些逻辑，根据用户配置初始化不同的聊天模型。`init_chat_model()` 辅助方法使得初始化多种不同模型集成变得简单，而无需担心导入路径和类名。

:::tip Supported models

请参阅 [init_chat_model()](https://python.langchain.com/api_reference/langchain/chat_models/langchain.chat_models.base.init_chat_model.html) API 参考，以获取支持的集成的完整列表。

确保您已安装任何希望支持的大模型供应商的集成包。例如，您应该安装 `langchain-openai` 以初始化 OpenAI 模型。

:::


```python
%pip install -qU langchain>=0.2.8 langchain-openai langchain-anthropic langchain-google-vertexai
```

## 基本用法


```python
<!--IMPORTS:[{"imported": "init_chat_model", "source": "langchain.chat_models", "docs": "https://python.langchain.com/api_reference/langchain/chat_models/langchain.chat_models.base.init_chat_model.html", "title": "How to init any model in one line"}]-->
from langchain.chat_models import init_chat_model

# Returns a langchain_openai.ChatOpenAI instance.
gpt_4o = init_chat_model("gpt-4o", model_provider="openai", temperature=0)
# Returns a langchain_anthropic.ChatAnthropic instance.
claude_opus = init_chat_model(
    "claude-3-opus-20240229", model_provider="anthropic", temperature=0
)
# Returns a langchain_google_vertexai.ChatVertexAI instance.
gemini_15 = init_chat_model(
    "gemini-1.5-pro", model_provider="google_vertexai", temperature=0
)

# Since all model integrations implement the ChatModel interface, you can use them in the same way.
print("GPT-4o: " + gpt_4o.invoke("what's your name").content + "\n")
print("Claude Opus: " + claude_opus.invoke("what's your name").content + "\n")
print("Gemini 1.5: " + gemini_15.invoke("what's your name").content + "\n")
```
```output
/var/folders/4j/2rz3865x6qg07tx43146py8h0000gn/T/ipykernel_95293/571506279.py:4: LangChainBetaWarning: The function `init_chat_model` is in beta. It is actively being worked on, so the API may change.
  gpt_4o = init_chat_model("gpt-4o", model_provider="openai", temperature=0)
``````output
GPT-4o: I'm an AI created by OpenAI, and I don't have a personal name. How can I assist you today?
``````output
Claude Opus: My name is Claude. It's nice to meet you!
``````output
Gemini 1.5: I am a large language model, trained by Google. 

I don't have a name like a person does. You can call me Bard if you like! 😊
```
## 推断大模型供应商

对于常见和不同的模型名称，`init_chat_model()` 将尝试推断大模型供应商。有关推断行为的完整列表，请参见 [API 参考](https://python.langchain.com/api_reference/langchain/chat_models/langchain.chat_models.base.init_chat_model.html)。例如，任何以 `gpt-3...` 或 `gpt-4...` 开头的模型将被推断为使用大模型供应商 `openai`。


```python
gpt_4o = init_chat_model("gpt-4o", temperature=0)
claude_opus = init_chat_model("claude-3-opus-20240229", temperature=0)
gemini_15 = init_chat_model("gemini-1.5-pro", temperature=0)
```

## 创建可配置模型

您还可以通过指定 `configurable_fields` 来创建一个运行时可配置的模型。如果您不指定 `model` 值，则“model”和“model_provider”将默认可配置。


```python
configurable_model = init_chat_model(temperature=0)

configurable_model.invoke(
    "what's your name", config={"configurable": {"model": "gpt-4o"}}
)
```



```output
AIMessage(content="I'm an AI created by OpenAI, and I don't have a personal name. How can I assist you today?", additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 23, 'prompt_tokens': 11, 'total_tokens': 34}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_25624ae3a5', 'finish_reason': 'stop', 'logprobs': None}, id='run-b41df187-4627-490d-af3c-1c96282d3eb0-0', usage_metadata={'input_tokens': 11, 'output_tokens': 23, 'total_tokens': 34})
```



```python
configurable_model.invoke(
    "what's your name", config={"configurable": {"model": "claude-3-5-sonnet-20240620"}}
)
```



```output
AIMessage(content="My name is Claude. It's nice to meet you!", additional_kwargs={}, response_metadata={'id': 'msg_01Fx9P74A7syoFkwE73CdMMY', 'model': 'claude-3-5-sonnet-20240620', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 11, 'output_tokens': 15}}, id='run-a0fd2bbd-3b7e-46bf-8d69-a48c7e60b03c-0', usage_metadata={'input_tokens': 11, 'output_tokens': 15, 'total_tokens': 26})
```


### 带有默认值的可配置模型

我们可以创建一个带有默认模型值的可配置模型，指定哪些参数是可配置的，并为可配置参数添加前缀：


```python
first_llm = init_chat_model(
    model="gpt-4o",
    temperature=0,
    configurable_fields=("model", "model_provider", "temperature", "max_tokens"),
    config_prefix="first",  # useful when you have a chain with multiple models
)

first_llm.invoke("what's your name")
```



```output
AIMessage(content="I'm an AI created by OpenAI, and I don't have a personal name. How can I assist you today?", additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 23, 'prompt_tokens': 11, 'total_tokens': 34}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_25624ae3a5', 'finish_reason': 'stop', 'logprobs': None}, id='run-3380f977-4b89-4f44-bc02-b64043b3166f-0', usage_metadata={'input_tokens': 11, 'output_tokens': 23, 'total_tokens': 34})
```



```python
first_llm.invoke(
    "what's your name",
    config={
        "configurable": {
            "first_model": "claude-3-5-sonnet-20240620",
            "first_temperature": 0.5,
            "first_max_tokens": 100,
        }
    },
)
```



```output
AIMessage(content="My name is Claude. It's nice to meet you!", additional_kwargs={}, response_metadata={'id': 'msg_01EFKSWpmsn2PSYPQa4cNHWb', 'model': 'claude-3-5-sonnet-20240620', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 11, 'output_tokens': 15}}, id='run-3c58f47c-41b9-4e56-92e7-fb9602e3787c-0', usage_metadata={'input_tokens': 11, 'output_tokens': 15, 'total_tokens': 26})
```


### 以声明方式使用可配置模型

我们可以在可配置模型上调用声明性操作，如 `bind_tools`、`with_structured_output`、`with_configurable` 等，并以与常规实例化的聊天模型对象相同的方式链接可配置模型。


```python
from pydantic import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


class GetPopulation(BaseModel):
    """Get the current population in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm = init_chat_model(temperature=0)
llm_with_tools = llm.bind_tools([GetWeather, GetPopulation])

llm_with_tools.invoke(
    "what's bigger in 2024 LA or NYC", config={"configurable": {"model": "gpt-4o"}}
).tool_calls
```



```output
[{'name': 'GetPopulation',
  'args': {'location': 'Los Angeles, CA'},
  'id': 'call_Ga9m8FAArIyEjItHmztPYA22',
  'type': 'tool_call'},
 {'name': 'GetPopulation',
  'args': {'location': 'New York, NY'},
  'id': 'call_jh2dEvBaAHRaw5JUDthOs7rt',
  'type': 'tool_call'}]
```



```python
llm_with_tools.invoke(
    "what's bigger in 2024 LA or NYC",
    config={"configurable": {"model": "claude-3-5-sonnet-20240620"}},
).tool_calls
```



```output
[{'name': 'GetPopulation',
  'args': {'location': 'Los Angeles, CA'},
  'id': 'toolu_01JMufPf4F4t2zLj7miFeqXp',
  'type': 'tool_call'},
 {'name': 'GetPopulation',
  'args': {'location': 'New York City, NY'},
  'id': 'toolu_01RQBHcE8kEEbYTuuS8WqY1u',
  'type': 'tool_call'}]
```

