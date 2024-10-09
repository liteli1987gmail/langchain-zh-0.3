---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/telegram.ipynb
---
# Telegram

本笔记本展示了如何使用Telegram聊天加载器。该类帮助将导出的Telegram对话映射到LangChain聊天消息。

该过程分为三个步骤：
1. 通过从Telegram应用中复制聊天并粘贴到本地计算机上的文件中导出聊天.txt文件
2. 创建指向json文件或JSON文件目录的文件路径的`TelegramChatLoader`
3. 调用`loader.load()`（或`loader.lazy_load()`）进行转换。可选地使用`merge_chat_runs`按顺序合并来自同一发送者的消息，和/或使用`map_ai_messages`将指定发送者的消息转换为"AIMessage"类。

## 1. 创建消息转储

目前（2023/08/23），该加载器最佳支持从[Telegram桌面应用](https://desktop.telegram.org/)导出聊天记录生成的json文件格式。

**重要：** 有一些"轻量版"的Telegram，例如"MacOS版Telegram"，缺乏导出功能。请确保使用正确的应用程序导出文件。

进行导出：
1. 下载并打开 Telegram 桌面版
2. 选择一个对话
3. 进入对话设置（目前在右上角的三个点）
4. 点击“导出聊天记录”
5. 取消选择照片和其他媒体。选择“机器可读 JSON”格式进行导出。

下面是一个示例：


```python
%%writefile telegram_conversation.json
{
 "name": "Jiminy",
 "type": "personal_chat",
 "id": 5965280513,
 "messages": [
  {
   "id": 1,
   "type": "message",
   "date": "2023-08-23T13:11:23",
   "date_unixtime": "1692821483",
   "from": "Jiminy Cricket",
   "from_id": "user123450513",
   "text": "You better trust your conscience",
   "text_entities": [
    {
     "type": "plain",
     "text": "You better trust your conscience"
    }
   ]
  },
  {
   "id": 2,
   "type": "message",
   "date": "2023-08-23T13:13:20",
   "date_unixtime": "1692821600",
   "from": "Batman & Robin",
   "from_id": "user6565661032",
   "text": "What did you just say?",
   "text_entities": [
    {
     "type": "plain",
     "text": "What did you just say?"
    }
   ]
  }
 ]
}
```
```output
Overwriting telegram_conversation.json
```
## 2. 创建聊天加载器

所需的仅是文件路径。您可以选择性地指定与AI消息对应的用户名，并配置是否合并消息运行。


```python
<!--IMPORTS:[{"imported": "TelegramChatLoader", "source": "langchain_community.chat_loaders.telegram", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.telegram.TelegramChatLoader.html", "title": "Telegram"}]-->
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```


```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
)
```

## 3. 加载消息

`load()`（或`lazy_load`）方法返回一个“聊天会话”的列表，目前仅包含每个加载的对话的消息列表。


```python
<!--IMPORTS:[{"imported": "map_ai_messages", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.map_ai_messages.html", "title": "Telegram"}, {"imported": "merge_chat_runs", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.merge_chat_runs.html", "title": "Telegram"}, {"imported": "ChatSession", "source": "langchain_core.chat_sessions", "docs": "https://python.langchain.com/api_reference/core/chat_sessions/langchain_core.chat_sessions.ChatSession.html", "title": "Telegram"}]-->
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "Jiminy Cricket" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Jiminy Cricket")
)
```

### 下一步

然后，您可以根据需要使用这些消息，例如微调模型、少量示例选择或直接预测下一条消息。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Telegram"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
```output
I said, "You better trust your conscience."
```