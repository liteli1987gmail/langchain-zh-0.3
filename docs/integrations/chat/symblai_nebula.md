---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/symblai_nebula.ipynb
sidebar_label: Nebula (Symbl.ai)
---
# Nebula (Symbl.ai)

## 概述
本笔记本介绍如何开始使用 [Nebula](https://docs.symbl.ai/docs/nebula-llm) - Symbl.ai 的聊天模型。

### 集成细节
前往 [API 参考](https://docs.symbl.ai/reference/nebula-chat) 获取详细文档。

### 模型特性：待办事项

## 设置

### 凭证
要开始，请请求 [Nebula API 密钥](https://platform.symbl.ai/#/login) 并设置 `NEBULA_API_KEY` 环境变量：


```python
import getpass
import os

os.environ["NEBULA_API_KEY"] = getpass.getpass()
```

### 安装
集成在 `langchain-community` 包中设置。

## 实例化


```python
<!--IMPORTS:[{"imported": "ChatNebula", "source": "langchain_community.chat_models.symblai_nebula", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.symblai_nebula.ChatNebula.html", "title": "Nebula (Symbl.ai)"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Nebula (Symbl.ai)"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Nebula (Symbl.ai)"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Nebula (Symbl.ai)"}]-->
from langchain_community.chat_models.symblai_nebula import ChatNebula
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```


```python
chat = ChatNebula(max_tokens=1024, temperature=0.5)
```

## 调用


```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that answers general knowledge questions."
    ),
    HumanMessage(content="What is the capital of France?"),
]
chat.invoke(messages)
```



```output
AIMessage(content=[{'role': 'human', 'text': 'What is the capital of France?'}, {'role': 'assistant', 'text': 'The capital of France is Paris.'}])
```


### 异步


```python
await chat.ainvoke(messages)
```



```output
AIMessage(content=[{'role': 'human', 'text': 'What is the capital of France?'}, {'role': 'assistant', 'text': 'The capital of France is Paris.'}])
```


### 流式处理


```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```
```output
 The capital of France is Paris.
```
### 批处理


```python
chat.batch([messages])
```



```output
[AIMessage(content=[{'role': 'human', 'text': 'What is the capital of France?'}, {'role': 'assistant', 'text': 'The capital of France is Paris.'}])]
```


## 链接


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Nebula (Symbl.ai)"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat
```


```python
chain.invoke({"topic": "cows"})
```



```output
AIMessage(content=[{'role': 'human', 'text': 'Tell me a joke about cows'}, {'role': 'assistant', 'text': "Sure, here's a joke about cows:\n\nWhy did the cow cross the road?\n\nTo get to the udder side!"}])
```


## API 参考

查看 [API 参考](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.symblai_nebula.ChatNebula.html) 以获取更多详细信息。


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
