---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/zep_cloud_chat_message_history.ipynb
---
# ZepCloud聊天消息历史
> 回忆、理解并提取聊天历史中的数据。为个性化的AI体验提供动力。

> [Zep](https://www.getzep.com) 是一个用于AI助手应用的长期记忆服务。
> 使用Zep，您可以为AI助手提供回忆过去对话的能力，无论时间多么久远，
> 同时减少幻觉、延迟和成本。

> 请参阅 [Zep Cloud安装指南](https://help.getzep.com/sdks) 和更多 [Zep Cloud Langchain示例](https://github.com/getzep/zep-python/tree/main/examples)

## 示例

本笔记本演示了如何使用 [Zep](https://www.getzep.com/) 来持久化聊天历史并在您的链中使用Zep记忆。



```python
<!--IMPORTS:[{"imported": "ZepCloudChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.zep_cloud.ZepCloudChatMessageHistory.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "ZepCloudMemory", "source": "langchain_community.memory.zep_cloud_memory", "docs": "https://python.langchain.com/api_reference/community/memory/langchain_community.memory.zep_cloud_memory.ZepCloudMemory.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "ZepCloudChatMessageHistory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "ZepCloudChatMessageHistory"}]-->
from uuid import uuid4

from langchain_community.chat_message_histories import ZepCloudChatMessageHistory
from langchain_community.memory.zep_cloud_memory import ZepCloudMemory
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import (
    RunnableParallel,
)
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

session_id = str(uuid4())  # This is a unique identifier for the session
```

提供您的 OpenAI 密钥


```python
import getpass

openai_key = getpass.getpass()
```

提供您的 Zep API 密钥。请参见 https://help.getzep.com/projects#api-keys



```python
zep_api_key = getpass.getpass()
```

预加载一些消息到内存中。默认消息窗口为 4 条消息。我们希望超越这个限制以演示自动摘要。


```python
test_history = [
    {"role": "human", "content": "Who was Octavia Butler?"},
    {
        "role": "ai",
        "content": (
            "Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American"
            " science fiction author."
        ),
    },
    {"role": "human", "content": "Which books of hers were made into movies?"},
    {
        "role": "ai",
        "content": (
            "The most well-known adaptation of Octavia Butler's work is the FX series"
            " Kindred, based on her novel of the same name."
        ),
    },
    {"role": "human", "content": "Who were her contemporaries?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R."
            " Delany, and Joanna Russ."
        ),
    },
    {"role": "human", "content": "What awards did she win?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur"
            " Fellowship."
        ),
    },
    {
        "role": "human",
        "content": "Which other women sci-fi writers might I want to read?",
    },
    {
        "role": "ai",
        "content": "You might want to read Ursula K. Le Guin or Joanna Russ.",
    },
    {
        "role": "human",
        "content": (
            "Write a short synopsis of Butler's book, Parable of the Sower. What is it"
            " about?"
        ),
    },
    {
        "role": "ai",
        "content": (
            "Parable of the Sower is a science fiction novel by Octavia Butler,"
            " published in 1993. It follows the story of Lauren Olamina, a young woman"
            " living in a dystopian future where society has collapsed due to"
            " environmental disasters, poverty, and violence."
        ),
        "metadata": {"foo": "bar"},
    },
]

zep_memory = ZepCloudMemory(
    session_id=session_id,
    api_key=zep_api_key,
)

for msg in test_history:
    zep_memory.chat_memory.add_message(
        HumanMessage(content=msg["content"])
        if msg["role"] == "human"
        else AIMessage(content=msg["content"])
    )

import time

time.sleep(
    10
)  # Wait for the messages to be embedded and summarized, this happens asynchronously.
```

**MessagesPlaceholder** - 我们在这里使用变量名 chat_history。这将把聊天历史纳入提示中。
重要的是，这个变量名与 RunnableWithMessageHistory 链中的 history_messages_key 对齐，以实现无缝集成。

**question** 必须与 `RunnableWithMessageHistory` 链中的 input_messages_key 匹配。


```python
template = """Be helpful and answer the question below using the provided context:
    """
answer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", template),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{question}"),
    ]
)
```

我们使用 RunnableWithMessageHistory 将 Zep 的聊天历史纳入我们的链中。激活链时，此类需要 session_id 作为参数。


```python
inputs = RunnableParallel(
    {
        "question": lambda x: x["question"],
        "chat_history": lambda x: x["chat_history"],
    },
)
chain = RunnableWithMessageHistory(
    inputs | answer_prompt | ChatOpenAI(openai_api_key=openai_key) | StrOutputParser(),
    lambda s_id: ZepCloudChatMessageHistory(
        session_id=s_id,  # This uniquely identifies the conversation, note that we are getting session id as chain configurable field
        api_key=zep_api_key,
        memory_type="perpetual",
    ),
    input_messages_key="question",
    history_messages_key="chat_history",
)
```


```python
chain.invoke(
    {
        "question": "What is the book's relevance to the challenges facing contemporary society?"
    },
    config={"configurable": {"session_id": session_id}},
)
```
```output
Parent run 622c6f75-3e4a-413d-ba20-558c1fea0d50 not found for run af12a4b1-e882-432d-834f-e9147465faf6. Treating as a root run.
```


```output
'"Parable of the Sower" is relevant to the challenges facing contemporary society as it explores themes of environmental degradation, economic inequality, social unrest, and the search for hope and community in the face of chaos. The novel\'s depiction of a dystopian future where society has collapsed due to environmental and economic crises serves as a cautionary tale about the potential consequences of our current societal and environmental challenges. By addressing issues such as climate change, social injustice, and the impact of technology on humanity, Octavia Butler\'s work prompts readers to reflect on the pressing issues of our time and the importance of resilience, empathy, and collective action in building a better future.'
```

