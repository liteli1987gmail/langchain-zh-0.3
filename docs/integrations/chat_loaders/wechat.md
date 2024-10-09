---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/wechat.ipynb
---
# 微信

目前还没有简单的方法来导出个人微信消息。不过，如果您只需要几百条消息用于模型微调或少量示例，这个笔记本展示了如何创建自己的聊天加载器，能够处理复制粘贴的微信消息并将其转换为LangChain消息列表。

> 深受 https://python.langchain.com/docs/integrations/chat_loaders/discord 启发


该过程分为五个步骤：
1. 在微信桌面应用中打开您的聊天。通过鼠标拖动或右键选择所需的消息。由于限制，您一次最多可以选择100条消息。`CMD`/`Ctrl` + `C` 进行复制。
2. 在本地计算机上创建聊天 .txt 文件，将选定的消息粘贴到该文件中。
3. 从下面复制聊天加载器定义到本地文件。
4. 使用指向文本文件的文件路径初始化 `WeChatChatLoader`。
5. 调用 `loader.load()`（或 `loader.lazy_load()`）以执行转换。

## 1. 创建消息转储

此加载器仅支持以将应用中的消息复制到剪贴板并粘贴到文件中生成的格式的 .txt 文件。以下是一个示例。


```python
%%writefile wechat_chats.txt
女朋友 2023/09/16 2:51 PM
天气有点凉

男朋友 2023/09/16 2:51 PM
珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。

女朋友 2023/09/16 3:06 PM
忙什么呢

男朋友 2023/09/16 3:06 PM
今天只干成了一件像样的事
那就是想你

女朋友 2023/09/16 3:06 PM
[动画表情]
```
```output
Overwriting wechat_chats.txt
```
## 2. 定义聊天加载器

LangChain 目前不支持


```python
<!--IMPORTS:[{"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "WeChat"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "WeChat"}]-->
import logging
import re
from typing import Iterator, List

from langchain_community.chat_loaders import base as chat_loaders
from langchain_core.messages import BaseMessage, HumanMessage

logger = logging.getLogger()


class WeChatChatLoader(chat_loaders.BaseChatLoader):
    def __init__(self, path: str):
        """
        Initialize the Discord chat loader.

        Args:
            path: Path to the exported Discord chat text file.
        """
        self.path = path
        self._message_line_regex = re.compile(
            r"(?P<sender>.+?) (?P<timestamp>\d{4}/\d{2}/\d{2} \d{1,2}:\d{2} (?:AM|PM))",
            # flags=re.DOTALL,
        )

    def _append_message_to_results(
        self,
        results: List,
        current_sender: str,
        current_timestamp: str,
        current_content: List[str],
    ):
        content = "\n".join(current_content).strip()
        # skip non-text messages like stickers, images, etc.
        if not re.match(r"\[.*\]", content):
            results.append(
                HumanMessage(
                    content=content,
                    additional_kwargs={
                        "sender": current_sender,
                        "events": [{"message_time": current_timestamp}],
                    },
                )
            )
        return results

    def _load_single_chat_session_from_txt(
        self, file_path: str
    ) -> chat_loaders.ChatSession:
        """
        Load a single chat session from a text file.

        Args:
            file_path: Path to the text file containing the chat messages.

        Returns:
            A `ChatSession` object containing the loaded chat messages.
        """
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()

        results: List[BaseMessage] = []
        current_sender = None
        current_timestamp = None
        current_content = []
        for line in lines:
            if re.match(self._message_line_regex, line):
                if current_sender and current_content:
                    results = self._append_message_to_results(
                        results, current_sender, current_timestamp, current_content
                    )
                current_sender, current_timestamp = re.match(
                    self._message_line_regex, line
                ).groups()
                current_content = []
            else:
                current_content.append(line.strip())

        if current_sender and current_content:
            results = self._append_message_to_results(
                results, current_sender, current_timestamp, current_content
            )

        return chat_loaders.ChatSession(messages=results)

    def lazy_load(self) -> Iterator[chat_loaders.ChatSession]:
        """
        Lazy load the messages from the chat file and yield them in the required format.

        Yields:
            A `ChatSession` object containing the loaded chat messages.
        """
        yield self._load_single_chat_session_from_txt(self.path)
```

## 2. 创建加载器

我们将指向刚刚写入磁盘的文件。


```python
loader = WeChatChatLoader(
    path="./wechat_chats.txt",
)
```

## 3. 加载消息

假设格式正确，加载器将把聊天转换为 LangChain 消息。


```python
<!--IMPORTS:[{"imported": "map_ai_messages", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.map_ai_messages.html", "title": "WeChat"}, {"imported": "merge_chat_runs", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.merge_chat_runs.html", "title": "WeChat"}, {"imported": "ChatSession", "source": "langchain_core.chat_sessions", "docs": "https://python.langchain.com/api_reference/core/chat_sessions/langchain_core.chat_sessions.ChatSession.html", "title": "WeChat"}]-->
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "男朋友" to AI messages
messages: List[ChatSession] = list(map_ai_messages(merged_messages, sender="男朋友"))
```


```python
messages
```



```output
[{'messages': [HumanMessage(content='天气有点凉', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   AIMessage(content='珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   HumanMessage(content='忙什么呢', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False),
   AIMessage(content='今天只干成了一件像样的事\n那就是想你', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False)]}]
```


### 下一步

然后您可以根据需要使用这些消息，例如微调模型、少量示例选择或直接预测下一条消息


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "WeChat"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
