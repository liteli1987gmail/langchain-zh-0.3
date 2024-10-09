---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/dappier.ipynb
---
# Dappier AI

**Dappier：用动态实时数据模型驱动AI**

Dappier提供了一个尖端平台，使开发者能够立即访问广泛的实时数据模型，涵盖新闻、娱乐、金融、市场数据、天气等。通过我们的预训练数据模型，您可以为您的AI应用程序提供强大的支持，确保它们提供准确、最新的响应，并减少不准确性。

Dappier数据模型帮助您构建下一代大型语言模型应用，提供来自全球领先品牌的可信、最新内容。通过简单的API释放您的创造力，增强任何GPT应用或AI工作流程，利用可操作的专有数据。通过可信来源的专有数据增强您的AI是确保事实准确、最新响应的最佳方式，无论问题是什么，都能减少幻觉。

为开发者而生，服务于开发者
Dappier以开发者为中心，简化了从数据集成到货币化的旅程，提供清晰、直接的路径来部署和从您的AI模型中获利。体验新互联网货币化基础设施的未来，访问**https://dappier.com/**。

本示例介绍如何使用LangChain与Dappier AI模型进行交互

-----------------------------------------------------------------------------------

要使用我们的Dappier AI数据模型，您需要一个API密钥。请访问Dappier平台（https://platform.dappier.com/）登录并在您的个人资料中创建API密钥。


您可以在API参考中找到更多详细信息： https://docs.dappier.com/introduction

要使用我们的 Dappier 聊天模型，您可以在初始化类时通过名为 dappier_api_key 的参数直接传递密钥
或设置为环境变量。

```bash
export DAPPIER_API_KEY="..."
```



```python
<!--IMPORTS:[{"imported": "ChatDappierAI", "source": "langchain_community.chat_models.dappier", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.dappier.ChatDappierAI.html", "title": "Dappier AI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Dappier AI"}]-->
from langchain_community.chat_models.dappier import ChatDappierAI
from langchain_core.messages import HumanMessage
```


```python
chat = ChatDappierAI(
    dappier_endpoint="https://api.dappier.com/app/datamodelconversation",
    dappier_model="dm_01hpsxyfm2fwdt2zet9cg6fdxt",
    dappier_api_key="...",
)
```


```python
messages = [HumanMessage(content="Who won the super bowl in 2024?")]
chat.invoke(messages)
```



```output
AIMessage(content='Hey there! The Kansas City Chiefs won Super Bowl LVIII in 2024. They beat the San Francisco 49ers in overtime with a final score of 25-22. It was quite the game! 🏈')
```



```python
await chat.ainvoke(messages)
```



```output
AIMessage(content='The Kansas City Chiefs won Super Bowl LVIII in 2024! 🏈')
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
