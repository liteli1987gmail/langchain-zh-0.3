---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/ifttt.ipynb
---
# IFTTT WebHooks

本笔记本展示了如何使用IFTTT Webhooks。

来自 https://github.com/SidU/teams-langchain-js/wiki/Connecting-IFTTT-Services。

## 创建一个Webhook
- 前往 https://ifttt.com/create

## 配置 "如果这样"
- 在IFTTT界面中点击"如果这样"按钮。
- 在搜索栏中搜索"Webhooks"。
- 选择第一个选项"接收带有JSON负载的网络请求。"
- 选择一个特定于您计划连接的服务的事件名称。
这将使您更容易管理 webhook URL。
例如，如果您要连接到 Spotify，您可以使用 "Spotify" 作为您的
事件名称。
- 点击 "创建触发器" 按钮以保存您的设置并创建 webhook。

## 配置 "Then That"
- 在 IFTTT 界面中点击 "Then That" 按钮。
- 搜索您想要连接的服务，例如 Spotify。
- 从服务中选择一个操作，例如 "将曲目添加到播放列表"。
- 通过指定必要的详细信息来配置操作，例如播放列表名称，
例如，"来自 AI 的歌曲"。
- 在您的操作中引用通过Webhook接收到的JSON有效负载。对于Spotify
场景，选择 `}` 作为您的搜索查询。
- 点击“创建操作”按钮以保存您的操作设置。
- 配置完操作后，点击“完成”按钮以
完成设置。
- 恭喜！您已成功将Webhook连接到所需的
服务，并且您准备好开始接收数据和触发操作 🎉

## 完成
- 要获取您的Webhook URL，请访问 https://ifttt.com/maker_webhooks/settings
- 从那里复制IFTTT密钥值。URL的格式为
https://maker.ifttt.com/use/YOUR_IFTTT_KEY。获取 YOUR_IFTTT_KEY 值。



```python
%pip install --upgrade --quiet  langchain-community
```


```python
<!--IMPORTS:[{"imported": "IFTTTWebhook", "source": "langchain_community.tools.ifttt", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.ifttt.IFTTTWebhook.html", "title": "IFTTT WebHooks"}]-->
from langchain_community.tools.ifttt import IFTTTWebhook
```


```python
import os

key = os.environ["IFTTTKey"]
url = f"https://maker.ifttt.com/trigger/spotify/json/with/key/{key}"
tool = IFTTTWebhook(
    name="Spotify", description="Add a song to spotify playlist", url=url
)
```


```python
tool.run("taylor swift")
```



```output
"Congratulations! You've fired the spotify JSON event"
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
