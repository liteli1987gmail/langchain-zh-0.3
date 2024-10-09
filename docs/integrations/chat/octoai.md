---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/octoai.ipynb
---
# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs) 提供便捷的高效计算访问，并使用户能够将其选择的 AI 模型集成到应用程序中。`OctoAI` 计算服务帮助您轻松运行、调整和扩展 AI 应用程序。

本笔记本演示了如何使用 `langchain.chat_models.ChatOctoAI` 访问 [OctoAI 端点](https://octoai.cloud/text)。

## 设置

要运行我们的示例应用，有两个简单的步骤：

1. 从 [您的 OctoAI 账户页面](https://octoai.cloud/settings) 获取 API 令牌。
   
2. 将您的 API 令牌粘贴到下面的代码单元中，或使用 `octoai_api_token` 关键字参数。

注意：如果您想使用与 [可用模型](https://octoai.cloud/text?selectedTags=Chat) 不同的模型，您可以将模型容器化，并通过遵循 [从 Python 构建容器](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) 和 [从容器创建自定义端点](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container) 自行创建自定义 OctoAI 端点，然后更新您的 `OCTOAI_API_BASE` 环境变量。



```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```


```python
<!--IMPORTS:[{"imported": "ChatOctoAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.octoai.ChatOctoAI.html", "title": "ChatOctoAI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatOctoAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatOctoAI"}]-->
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## 示例


```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```


```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

列奥纳多·达·芬奇（1452-1519）是一位意大利博学家，常被认为是历史上最伟大的画家之一。然而，他的天才远不止于艺术。他还是一位科学家、发明家、数学家、工程师、解剖学家、地质学家和制图师。

达·芬奇以他的画作而闻名，如《蒙娜丽莎》、《最后的晚餐》和《岩间圣母》。他的科学研究超越了他的时代，他的笔记本中包含了各种机器、人类解剖和自然现象的详细图纸和描述。

尽管从未接受过正式教育，达·芬奇那种无法满足的好奇心和观察能力使他在许多领域成为先驱。他的作品至今仍激励和影响着艺术家、科学家和思想家。


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
