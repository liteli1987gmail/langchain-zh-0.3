---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/filter_messages.ipynb
---
# 如何过滤消息

在更复杂的链和代理中，我们可能会通过消息列表来跟踪状态。这个列表可能会开始积累来自多个不同模型、发言者、子链等的消息，我们可能只想将这个完整消息列表的子集传递给链/代理中的每个模型调用。

`filter_messages` 工具使按类型、ID 或名称过滤消息变得简单。

## 基本用法


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to filter messages"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to filter messages"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to filter messages"}, {"imported": "filter_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.filter_messages.html", "title": "How to filter messages"}]-->
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    filter_messages,
)

messages = [
    SystemMessage("you are a good assistant", id="1"),
    HumanMessage("example input", id="2", name="example_user"),
    AIMessage("example output", id="3", name="example_assistant"),
    HumanMessage("real input", id="4", name="bob"),
    AIMessage("real output", id="5", name="alice"),
]

filter_messages(messages, include_types="human")
```



```output
[HumanMessage(content='example input', name='example_user', id='2'),
 HumanMessage(content='real input', name='bob', id='4')]
```



```python
filter_messages(messages, exclude_names=["example_user", "example_assistant"])
```



```output
[SystemMessage(content='you are a good assistant', id='1'),
 HumanMessage(content='real input', name='bob', id='4'),
 AIMessage(content='real output', name='alice', id='5')]
```



```python
filter_messages(messages, include_types=[HumanMessage, AIMessage], exclude_ids=["3"])
```



```output
[HumanMessage(content='example input', name='example_user', id='2'),
 HumanMessage(content='real input', name='bob', id='4'),
 AIMessage(content='real output', name='alice', id='5')]
```


## 链接

`filter_messages` 可以以命令式（如上所示）或声明式使用，使其易于与链中的其他组件组合:


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to filter messages"}]-->
# pip install -U langchain-anthropic
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
# Notice we don't pass in messages. This creates
# a RunnableLambda that takes messages as input
filter_ = filter_messages(exclude_names=["example_user", "example_assistant"])
chain = filter_ | llm
chain.invoke(messages)
```



```output
AIMessage(content=[], response_metadata={'id': 'msg_01Wz7gBHahAwkZ1KCBNtXmwA', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 3}}, id='run-b5d8a3fe-004f-4502-a071-a6c025031827-0', usage_metadata={'input_tokens': 16, 'output_tokens': 3, 'total_tokens': 19})
```


查看 LangSmith 跟踪，我们可以看到在消息传递给模型之前，它们被过滤: https://smith.langchain.com/public/f808a724-e072-438e-9991-657cc9e7e253/r

仅查看 filter_，我们可以看到它是一个可运行对象，可以像所有可运行对象一样被调用:


```python
filter_.invoke(messages)
```



```output
[HumanMessage(content='real input', name='bob', id='4'),
 AIMessage(content='real output', name='alice', id='5')]
```


## API 参考

有关所有参数的完整描述，请访问 API 参考: https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.filter_messages.html
