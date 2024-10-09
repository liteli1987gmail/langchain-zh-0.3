---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/anthropic_functions.ipynb
sidebar_class_name: hidden
---
# [已弃用] 实验性Anthropic工具包装器

:::warning

Anthropic API正式支持工具调用，因此不再需要此变通方法。请使用[ChatAnthropic](/docs/integrations/chat/anthropic)与`langchain-anthropic>=0.1.15`。

:::

本笔记本展示了如何使用一个实验性包装器，该包装器为Anthropic提供了工具调用和结构化输出的能力。它遵循Anthropic的指南[这里](https://docs.anthropic.com/claude/docs/functions-external-tools)

该包装器可从`langchain-anthropic`包中获得，并且还需要可选依赖项`defusedxml`来解析llm的XML输出。

注意：这是一个测试版功能，将被Anthropic正式实现的工具调用所替代，但在此期间对于测试和实验是有用的。


```python
<!--IMPORTS:[{"imported": "ChatAnthropicTools", "source": "langchain_anthropic.experimental", "docs": "https://python.langchain.com/api_reference/anthropic/experimental/langchain_anthropic.experimental.ChatAnthropicTools.html", "title": "[Deprecated] Experimental Anthropic Tools Wrapper"}]-->
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## 工具绑定

`ChatAnthropicTools` 提供了一个 `bind_tools` 方法，允许您将 Pydantic 模型或 BaseTools 传递给 llm。


```python
from pydantic import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("I am a 27 year old named Erick")
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```


## 结构化输出

`ChatAnthropicTools` 还实现了 [`with_structured_output` 规范](/docs/how_to/structured_output) 用于提取值。注意：这可能不如明确提供工具调用的模型稳定。


```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("I am a 27 year old named Erick")
```



```output
Person(name='Erick', age=27)
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
