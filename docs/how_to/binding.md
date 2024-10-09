---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/binding.ipynb
sidebar_position: 2
keywords: [RunnableBinding, LCEL]
---
# 如何为 Runnable 添加默认调用参数

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain 表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)
- [工具调用](/docs/how_to/tool_calling)

:::

有时我们希望在 [`Runnable`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html) 内部的 [RunnableSequence](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableSequence.html) 中调用具有常量参数的可运行项，这些参数不是序列中前一个可运行项的输出的一部分，也不是用户输入的一部分。我们可以使用 [`Runnable.bind()`](https://python.langchain.com/api_reference/langchain_core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.bind) 方法提前设置这些参数。

## 绑定停止序列

假设我们有一个简单的提示 + 模型链：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to add default invocation args to a Runnable"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add default invocation args to a Runnable"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add default invocation args to a Runnable"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add default invocation args to a Runnable"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Write out the following equation using algebraic symbols then solve it. Use the format\n\nEQUATION:...\nSOLUTION:...\n\n",
        ),
        ("human", "{equation_statement}"),
    ]
)

model = ChatOpenAI(temperature=0)

runnable = (
    {"equation_statement": RunnablePassthrough()} | prompt | model | StrOutputParser()
)

print(runnable.invoke("x raised to the third plus seven equals 12"))
```
```output
EQUATION: x^3 + 7 = 12

SOLUTION: 
Subtract 7 from both sides:
x^3 = 5

Take the cube root of both sides:
x = ∛5
```
并希望使用某些 `stop` 词调用模型，以便在某些提示技术中缩短输出。虽然我们可以将一些参数传递给构造函数，但其他运行时参数使用 `.bind()` 方法，如下所示：


```python
runnable = (
    {"equation_statement": RunnablePassthrough()}
    | prompt
    | model.bind(stop="SOLUTION")
    | StrOutputParser()
)

print(runnable.invoke("x raised to the third plus seven equals 12"))
```
```output
EQUATION: x^3 + 7 = 12
```
您可以绑定到 Runnable 的内容将取决于您在调用时可以传递的额外参数。

## 附加 OpenAI 工具

另一个常见用例是工具调用。虽然您通常应该使用 [`.bind_tools()`](/docs/how_to/tool_calling) 方法来调用工具模型，但如果您想要更低级别的控制，也可以直接绑定特定于大模型供应商的参数：


```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
```


```python
model = ChatOpenAI(model="gpt-4o-mini").bind(tools=tools)
model.invoke("What's the weather in SF, NYC and LA?")
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_z0OU2CytqENVrRTI6T8DkI3u', 'function': {'arguments': '{"location": "San Francisco, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_ft96IJBh0cMKkQWrZjNg4bsw', 'function': {'arguments': '{"location": "New York, NY", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_tfbtGgCLmuBuWgZLvpPwvUMH', 'function': {'arguments': '{"location": "Los Angeles, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 84, 'prompt_tokens': 85, 'total_tokens': 169}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': 'fp_77a673219d', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-d57ad5fa-b52a-4822-bc3e-74f838697e18-0', tool_calls=[{'name': 'get_current_weather', 'args': {'location': 'San Francisco, CA', 'unit': 'celsius'}, 'id': 'call_z0OU2CytqENVrRTI6T8DkI3u'}, {'name': 'get_current_weather', 'args': {'location': 'New York, NY', 'unit': 'celsius'}, 'id': 'call_ft96IJBh0cMKkQWrZjNg4bsw'}, {'name': 'get_current_weather', 'args': {'location': 'Los Angeles, CA', 'unit': 'celsius'}, 'id': 'call_tfbtGgCLmuBuWgZLvpPwvUMH'}])
```


## 下一步

您现在知道如何将运行时参数绑定到 Runnable。

要了解更多信息，请参阅本节中有关 runnable 的其他使用指南，包括：

- [使用可配置字段和替代方案](/docs/how_to/configure) 在运行时更改链中步骤的参数，甚至交换整个步骤
