---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/streamlit_chat_message_history.ipynb
---
# Streamlit

>[Streamlit](https://docs.streamlit.io/) 是一个开源的 Python 库，使创建和分享美观的
机器学习和数据科学的自定义网页应用变得简单。

本笔记本介绍了如何在 `Streamlit` 应用中存储和使用聊天消息历史。`StreamlitChatMessageHistory` 将在
[Streamlit 会话状态](https://docs.streamlit.io/library/api-reference/session-state)
指定的 `key=` 中存储消息。默认键为 "langchain_messages"。

- 注意，`StreamlitChatMessageHistory` 仅在 Streamlit 应用中运行时有效。
- 您可能还对 LangChain 的 [StreamlitCallbackHandler](/docs/integrations/callbacks/streamlit) 感兴趣。
- 有关 Streamlit 的更多信息，请查看他们的
[入门文档](https://docs.streamlit.io/library/get-started)。

该集成位于 `LangChain 社区` 包中，因此我们需要安装它。我们还需要安装 `streamlit`。

```
pip install -U langchain-community streamlit
```

您可以在这里查看[完整的应用示例](https://langchain-st-memory.streamlit.app/)，以及更多示例在
[github.com/langchain-ai/streamlit-agent](https://github.com/langchain-ai/streamlit-agent)。


```python
<!--IMPORTS:[{"imported": "StreamlitChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.streamlit.StreamlitChatMessageHistory.html", "title": "Streamlit"}]-->
from langchain_community.chat_message_histories import (
    StreamlitChatMessageHistory,
)

history = StreamlitChatMessageHistory(key="chat_messages")

history.add_user_message("hi!")
history.add_ai_message("whats up?")
```


```python
history.messages
```

我们可以轻松地将此消息历史类与[LCEL 运行接口](/docs/how_to/message_history)结合。

历史记录将在给定用户会话内的Streamlit应用的重新运行中保持。给定的`StreamlitChatMessageHistory`不会在用户会话之间保持或共享。


```python
# Optionally, specify your own session_state key for storing messages
msgs = StreamlitChatMessageHistory(key="special_app_key")

if len(msgs.messages) == 0:
    msgs.add_ai_message("How can I help you?")
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Streamlit"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Streamlit"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Streamlit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Streamlit"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an AI chatbot having a conversation with a human."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```


```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: msgs,  # Always return the instance created earlier
    input_messages_key="question",
    history_messages_key="history",
)
```

对话式Streamlit应用通常会在每次重新运行时重新绘制每条先前的聊天消息。这可以通过遍历`StreamlitChatMessageHistory.messages`轻松实现：


```python
import streamlit as st

for msg in msgs.messages:
    st.chat_message(msg.type).write(msg.content)

if prompt := st.chat_input():
    st.chat_message("human").write(prompt)

    # As usual, new messages are added to StreamlitChatMessageHistory when the Chain is called.
    config = {"configurable": {"session_id": "any"}}
    response = chain_with_history.invoke({"question": prompt}, config)
    st.chat_message("ai").write(response.content)
```

**[查看最终应用](https://langchain-st-memory.streamlit.app/)。**
