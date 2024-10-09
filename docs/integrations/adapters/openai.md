---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/adapters/openai.ipynb
---
# OpenAI 适配器

**请确保 OpenAI 库版本为 1.0.0 或更高；否则，请参考旧文档 [OpenAI 适配器(旧)](/docs/integrations/adapters/openai-old/)。**

很多人开始使用 OpenAI，但希望探索其他模型。LangChain 与许多模型提供商的集成使这变得简单。虽然 LangChain 有自己的消息和模型 API，但我们也尽可能简化了探索其他模型的过程，通过暴露适配器将 LangChain 模型适配到 OpenAI API。

目前这仅处理输出，不返回其他信息（令牌计数、停止原因等）。


```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## 聊天.完成.创建


```python
messages = [{"role": "user", "content": "hi"}]
```

原始 OpenAI 调用


```python
result = openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result.choices[0].message.model_dump()
```



```output
{'content': 'Hello! How can I assist you today?',
 'role': 'assistant',
 'function_call': None,
 'tool_calls': None}
```


LangChain OpenAI 包装调用


```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)

lc_result.choices[0].message  # Attribute access
```



```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```



```python
lc_result["choices"][0]["message"]  # Also compatible with index access
```



```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```


更换大模型供应商


```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result.choices[0].message
```



```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```


## 聊天.完成.流式

原始 OpenAI 调用


```python
for c in openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta.model_dump())
```
```output
{'content': '', 'function_call': None, 'role': 'assistant', 'tool_calls': None}
{'content': 'Hello', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '!', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' How', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' can', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' I', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' assist', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' you', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' today', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '?', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': None, 'function_call': None, 'role': None, 'tool_calls': None}
```
LangChain OpenAI 包装调用


```python
for c in lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta)
```
```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```
更换大模型供应商


```python
for c in lc_openai.chat.completions.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
):
    print(c["choices"][0]["delta"])
```
```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```