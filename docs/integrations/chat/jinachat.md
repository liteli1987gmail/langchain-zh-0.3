---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/jinachat.ipynb
---
# JinaChat

本笔记本介绍如何开始使用 JinaChat 聊天模型。


```python
<!--IMPORTS:[{"imported": "JinaChat", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.jinachat.JinaChat.html", "title": "JinaChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "JinaChat"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "JinaChat"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "JinaChat"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "JinaChat"}, {"imported": "SystemMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html", "title": "JinaChat"}]-->
from langchain_community.chat_models import JinaChat
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```


```python
chat = JinaChat(temperature=0)
```


```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chat(messages)
```



```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```


您可以通过使用 `MessagePromptTemplate` 来利用模板功能。您可以从一个或多个 `MessagePromptTemplates` 构建 `ChatPromptTemplate`。您可以使用 `ChatPromptTemplate` 的 `format_prompt` - 这将返回一个 `PromptValue`，您可以根据是否希望将格式化值用作大型语言模型或聊天模型的输入，将其转换为字符串或消息对象。

为了方便起见，模板上暴露了一个 `from_template` 方法。如果您要使用此模板，它的样子将是：


```python
template = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
```


```python
chat_prompt = ChatPromptTemplate.from_messages(
    [system_message_prompt, human_message_prompt]
)

# get a chat completion from the formatted messages
chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="French", text="I love programming."
    ).to_messages()
)
```



```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
