---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/rockset_chat_message_history.ipynb
---
# Rockset

>[Rockset](https://rockset.com/product/) 是一个实时分析数据库服务，旨在以低延迟和高并发处理大规模分析查询。它在结构化和半结构化数据上构建了一个融合索引™，并为向量嵌入提供了高效的存储。它对无模式数据运行 SQL 的支持使其成为使用元数据过滤进行向量搜索的完美选择。


本笔记本介绍了如何使用 [Rockset](https://rockset.com/docs) 存储聊天消息历史。


## 设置


```python
%pip install --upgrade --quiet  rockset langchain-community
```

首先，从[Rockset控制台](https://console.rockset.com/apikeys)获取您的API密钥。查找Rockset的[API参考](https://rockset.com/docs/rest-api#introduction)中的API区域。

## 示例


```python
<!--IMPORTS:[{"imported": "RocksetChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.rocksetdb.RocksetChatMessageHistory.html", "title": "Rockset"}]-->
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

输出应该类似于：

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False), 
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
