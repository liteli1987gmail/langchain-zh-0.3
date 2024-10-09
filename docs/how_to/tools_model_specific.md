---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_model_specific.ipynb
---
# 如何绑定特定模型的工具

大模型供应商采用不同的约定来格式化工具架构。
例如，OpenAI使用如下格式：

- `type`: 工具的类型。在撰写时，这始终是`"function"`。
- `function`: 包含工具参数的对象。
- `function.name`: 要输出的架构名称。
- `function.description`: 要输出的架构的高级描述。
- `function.parameters`: 您想要提取的架构的嵌套细节，格式为[JSON架构](https://json-schema.org/)字典。

如果需要，我们可以将此特定模型格式直接绑定到模型上。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to bind model-specific tools"}]-->
from langchain_openai import ChatOpenAI

model = ChatOpenAI()

model_with_tools = model.bind(
    tools=[
        {
            "type": "function",
            "function": {
                "name": "multiply",
                "description": "Multiply two integers together.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "a": {"type": "number", "description": "First integer"},
                        "b": {"type": "number", "description": "Second integer"},
                    },
                    "required": ["a", "b"],
                },
            },
        }
    ]
)

model_with_tools.invoke("Whats 119 times 8?")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_mn4ELw1NbuE0DFYhIeK0GrPe', 'function': {'arguments': '{"a":119,"b":8}', 'name': 'multiply'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 62, 'total_tokens': 79}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-353e8a9a-7125-4f94-8c68-4f3da4c21120-0', tool_calls=[{'name': 'multiply', 'args': {'a': 119, 'b': 8}, 'id': 'call_mn4ELw1NbuE0DFYhIeK0GrPe'}])
```

这在功能上等同于 `bind_tools()` 方法。
