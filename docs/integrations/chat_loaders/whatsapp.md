---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/whatsapp.ipynb
---
# WhatsApp

本笔记本展示了如何使用WhatsApp聊天加载器。该类帮助将导出的WhatsApp对话映射到LangChain聊天消息。

该过程分为三个步骤：
1. 将聊天对话导出到计算机
2. 创建`WhatsAppChatLoader`，文件路径指向json文件或JSON文件目录
3. 调用`loader.load()`（或`loader.lazy_load()`）以执行转换。

## 1. 创建消息转储

要导出您的WhatsApp对话，请完成以下步骤：

1. 打开目标对话
2. 点击右上角的三个点并选择“更多”。
3. 然后选择“导出聊天”，并选择“无媒体”。

每个对话的数据格式示例如下：


```python
%%writefile whatsapp_chat.txt
[8/15/23, 9:12:33 AM] Dr. Feather: ‎Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[8/15/23, 9:12:43 AM] Dr. Feather: I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!
‎[8/15/23, 9:12:48 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:13:15 AM] Jungle Jane: That's stunning! Were you able to observe its behavior?
‎[8/15/23, 9:13:23 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:02 AM] Dr. Feather: Yes, it seemed quite social with other macaws. They're known for their playful nature.
[8/15/23, 9:14:15 AM] Jungle Jane: How's the research going on parrot communication?
‎[8/15/23, 9:14:30 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:50 AM] Dr. Feather: It's progressing well. We're learning so much about how they use sound and color to communicate.
[8/15/23, 9:15:10 AM] Jungle Jane: That's fascinating! Can't wait to read your paper on it.
[8/15/23, 9:15:20 AM] Dr. Feather: Thank you! I'll send you a draft soon.
[8/15/23, 9:25:16 PM] Jungle Jane: Looking forward to it! Keep up the great work.
```
```output
Writing whatsapp_chat.txt
```
## 2. 创建聊天加载器

WhatsAppChatLoader 接受生成的 zip 文件、解压后的目录或其中任何聊天 `.txt` 文件的路径。

提供该路径以及您希望在微调时担任“AI”角色的用户名。


```python
<!--IMPORTS:[{"imported": "WhatsAppChatLoader", "source": "langchain_community.chat_loaders.whatsapp", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.whatsapp.WhatsAppChatLoader.html", "title": "WhatsApp"}]-->
from langchain_community.chat_loaders.whatsapp import WhatsAppChatLoader
```


```python
loader = WhatsAppChatLoader(
    path="./whatsapp_chat.txt",
)
```

## 3. 加载消息

`load()`（或 `lazy_load`）方法返回一个“聊天会话”列表，当前存储每个加载对话的消息列表。


```python
<!--IMPORTS:[{"imported": "map_ai_messages", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.map_ai_messages.html", "title": "WhatsApp"}, {"imported": "merge_chat_runs", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.merge_chat_runs.html", "title": "WhatsApp"}, {"imported": "ChatSession", "source": "langchain_core.chat_sessions", "docs": "https://python.langchain.com/api_reference/core/chat_sessions/langchain_core.chat_sessions.ChatSession.html", "title": "WhatsApp"}]-->
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "Dr. Feather" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Dr. Feather")
)
```



```output
[{'messages': [AIMessage(content='I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!', additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:12:43 AM'}]}, example=False),
   HumanMessage(content="That's stunning! Were you able to observe its behavior?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:13:15 AM'}]}, example=False),
   AIMessage(content="Yes, it seemed quite social with other macaws. They're known for their playful nature.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:02 AM'}]}, example=False),
   HumanMessage(content="How's the research going on parrot communication?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:14:15 AM'}]}, example=False),
   AIMessage(content="It's progressing well. We're learning so much about how they use sound and color to communicate.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:50 AM'}]}, example=False),
   HumanMessage(content="That's fascinating! Can't wait to read your paper on it.", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:15:10 AM'}]}, example=False),
   AIMessage(content="Thank you! I'll send you a draft soon.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:15:20 AM'}]}, example=False),
   HumanMessage(content='Looking forward to it! Keep up the great work.', additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:25:16 PM'}]}, example=False)]}]
```


### 下一步

然后，您可以根据需要使用这些消息，例如微调模型、少量示例选择或直接预测下一条消息。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "WhatsApp"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
```output
Thank you for the encouragement! I'll do my best to continue studying and sharing fascinating insights about parrot communication.
```