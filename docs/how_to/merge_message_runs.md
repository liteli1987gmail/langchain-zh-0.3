---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/merge_message_runs.ipynb
---
# 如何合并相同类型的连续消息

某些模型不支持传递相同类型的连续消息（即相同消息类型的“运行”）。

`merge_message_runs` 工具使合并相同类型的连续消息变得简单。

### 设置


```python
%pip install -qU langchain-core langchain-anthropic
```

## 基本用法


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to merge consecutive messages of the same type"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to merge consecutive messages of the same type"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to merge consecutive messages of the same type"}, {"imported": "merge_message_runs", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.merge_message_runs.html", "title": "How to merge consecutive messages of the same type"}]-->
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    merge_message_runs,
)

messages = [
    SystemMessage("you're a good assistant."),
    SystemMessage("you always respond with a joke."),
    HumanMessage([{"type": "text", "text": "i wonder why it's called langchain"}]),
    HumanMessage("and who is harrison chasing anyways"),
    AIMessage(
        'Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!'
    ),
    AIMessage("Why, he's probably chasing after the last cup of coffee in the office!"),
]

merged = merge_message_runs(messages)
print("\n\n".join([repr(x) for x in merged]))
```
```output
SystemMessage(content="you're a good assistant.\nyou always respond with a joke.", additional_kwargs={}, response_metadata={})

HumanMessage(content=[{'type': 'text', 'text': "i wonder why it's called langchain"}, 'and who is harrison chasing anyways'], additional_kwargs={}, response_metadata={})

AIMessage(content='Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!\nWhy, he\'s probably chasing after the last cup of coffee in the office!', additional_kwargs={}, response_metadata={})
```
请注意，如果要合并的消息内容是一个内容块的列表，则合并后的消息将包含一个内容块的列表。如果要合并的两个消息都有字符串内容，则这些内容将用换行符连接。

## 链接

`merge_message_runs` 可以以命令式（如上所示）或声明式使用，使其易于与链中的其他组件组合：


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to merge consecutive messages of the same type"}]-->
%pip install -qU langchain-anthropic
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
# Notice we don't pass in messages. This creates
# a RunnableLambda that takes messages as input
merger = merge_message_runs()
chain = merger | llm
chain.invoke(messages)
```
```output
Note: you may need to restart the kernel to use updated packages.
```


```output
AIMessage(content=[], additional_kwargs={}, response_metadata={'id': 'msg_01KNGUMTuzBVfwNouLDpUMwf', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 84, 'output_tokens': 3}}, id='run-b908b198-9c24-450b-9749-9d4a8182937b-0', usage_metadata={'input_tokens': 84, 'output_tokens': 3, 'total_tokens': 87})
```


查看 LangSmith 跟踪，我们可以看到在将消息传递给模型之前，它们被合并： https://smith.langchain.com/public/ab558677-cac9-4c59-9066-1ecce5bcd87c/r

仅查看合并器，我们可以看到它是一个可运行对象，可以像所有可运行对象一样被调用：


```python
merger.invoke(messages)
```



```output
[SystemMessage(content="you're a good assistant.\nyou always respond with a joke.", additional_kwargs={}, response_metadata={}),
 HumanMessage(content=[{'type': 'text', 'text': "i wonder why it's called langchain"}, 'and who is harrison chasing anyways'], additional_kwargs={}, response_metadata={}),
 AIMessage(content='Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!\nWhy, he\'s probably chasing after the last cup of coffee in the office!', additional_kwargs={}, response_metadata={})]
```


`merge_message_runs` 也可以放在提示之后：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to merge consecutive messages of the same type"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate(
    [
        ("system", "You're great a {skill}"),
        ("system", "You're also great at explaining things"),
        ("human", "{query}"),
    ]
)
chain = prompt | merger | llm
chain.invoke({"skill": "math", "query": "what's the definition of a convergent series"})
```



```output
AIMessage(content='A convergent series is an infinite series whose partial sums approach a finite value as more terms are added. In other words, the sequence of partial sums has a limit.\n\nMore formally, an infinite series Σ an (where an are the terms of the series) is said to be convergent if the sequence of partial sums:\n\nS1 = a1\nS2 = a1 + a2  \nS3 = a1 + a2 + a3\n...\nSn = a1 + a2 + a3 + ... + an\n...\n\nconverges to some finite number S as n goes to infinity. We write:\n\nlim n→∞ Sn = S\n\nThe finite number S is called the sum of the convergent infinite series.\n\nIf the sequence of partial sums does not approach any finite limit, the infinite series is said to be divergent.\n\nSome key properties:\n- A series converges if and only if the sequence of its partial sums is a Cauchy sequence.\n- Absolute/conditional convergence criteria help determine if a given series converges.\n- Convergent series have many important applications in mathematics, physics, engineering etc.', additional_kwargs={}, response_metadata={'id': 'msg_01MfV6y2hep7ZNvDz24A36U4', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 29, 'output_tokens': 267}}, id='run-9d925f58-021e-4bd0-94fc-f8f5e91010a4-0', usage_metadata={'input_tokens': 29, 'output_tokens': 267, 'total_tokens': 296})
```


LangSmith 跟踪： https://smith.langchain.com/public/432150b6-9909-40a7-8ae7-944b7e657438/r/f4ad5fb2-4d38-42a6-b780-25f62617d53f

## API 参考

有关所有参数的完整描述，请访问 API 参考： https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.merge_message_runs.html
