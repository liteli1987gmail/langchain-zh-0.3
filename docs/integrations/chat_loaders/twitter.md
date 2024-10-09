---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/twitter.ipynb
---
# Twitter (通过 Apify)

本笔记本展示了如何从 Twitter 加载聊天消息以进行微调。我们通过利用 Apify 来实现这一点。

首先，使用 Apify 导出推文。一个示例


```python
<!--IMPORTS:[{"imported": "convert_message_to_dict", "source": "langchain_community.adapters.openai", "docs": "https://python.langchain.com/api_reference/community/adapters/langchain_community.adapters.openai.convert_message_to_dict.html", "title": "Twitter (via Apify)"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Twitter (via Apify)"}]-->
import json

from langchain_community.adapters.openai import convert_message_to_dict
from langchain_core.messages import AIMessage
```


```python
with open("example_data/dataset_twitter-scraper_2023-08-23_22-13-19-740.json") as f:
    data = json.load(f)
```


```python
# Filter out tweets that reference other tweets, because it's a bit weird
tweets = [d["full_text"] for d in data if "t.co" not in d["full_text"]]
# Create them as AI messages
messages = [AIMessage(content=t) for t in tweets]
# Add in a system message at the start
# TODO: we could try to extract the subject from the tweets, and put that in the system message.
system_message = {"role": "system", "content": "write a tweet"}
data = [[system_message, convert_message_to_dict(m)] for m in messages]
```
