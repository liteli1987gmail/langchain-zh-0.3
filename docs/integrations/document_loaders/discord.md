---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/discord.ipynb
---
# Discord

>[Discord](https://discord.com/) 是一个VoIP和即时消息社交平台。用户可以通过语音通话、视频通话、文本消息、媒体和文件在私人聊天或称为“服务器”的社区中进行交流。服务器是一个持久的聊天室和语音频道的集合，可以通过邀请链接访问。

按照以下步骤下载您的 `Discord` 数据：

1. 前往您的 **用户设置**
2. 然后进入 **隐私和安全**
3. 前往 **请求我的所有数据** 并点击 **请求数据** 按钮

您可能需要30天才能收到您的数据。您将收到一封发送到与Discord注册的电子邮件地址的邮件。该邮件将包含一个下载按钮，您可以通过该按钮下载您的个人Discord数据。


```python
import os

import pandas as pd
```


```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```


```python
<!--IMPORTS:[{"imported": "DiscordChatLoader", "source": "langchain_community.document_loaders.discord", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.discord.DiscordChatLoader.html", "title": "Discord"}]-->
from langchain_community.document_loaders.discord import DiscordChatLoader
```


```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
