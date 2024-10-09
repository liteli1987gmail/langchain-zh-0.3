---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/stackexchange.ipynb
---
# StackExchange

>[Stack Exchange](https://stackexchange.com/) 是一个涵盖多个领域的问答网站网络，每个网站专注于特定主题，用户的提问、回答和声誉都受到声誉奖励机制的影响。声誉系统使得这些网站能够自我管理。

``StackExchange`` 组件将 StackExchange API 集成到 LangChain 中，允许访问 Stack Exchange 网络的 [StackOverflow](https://stackoverflow.com/) 网站。Stack Overflow 专注于计算机编程。


本笔记本介绍了如何使用 ``StackExchange`` 组件。

我们首先需要安装实现 Stack Exchange API 的 python 包 stackapi。


```python
pip install --upgrade stackapi
```


```python
<!--IMPORTS:[{"imported": "StackExchangeAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.stackexchange.StackExchangeAPIWrapper.html", "title": "StackExchange"}]-->
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
