---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/blackboard.ipynb
---
# Blackboard

> [Blackboard Learn](https://en.wikipedia.org/wiki/Blackboard_Learn)（之前称为Blackboard学习管理系统）是由Blackboard Inc.开发的基于网络的虚拟学习环境和学习管理系统。该软件具有课程管理、可定制的开放架构和可扩展设计，允许与学生信息系统和认证协议集成。它可以安装在本地服务器上，由`Blackboard ASP Solutions`托管，或作为托管在亚马逊网络服务上的软件即服务提供。其主要目的包括为传统面对面授课的课程增加在线元素，以及开发几乎没有面对面会议的完全在线课程。

这部分介绍如何从[Blackboard Learn](https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard-learn)实例加载数据。

此加载器与所有`Blackboard`课程不兼容。它仅
与使用新`Blackboard`界面的课程兼容。
要使用此加载器，您必须拥有BbRouter cookie。您可以通过登录课程并复制
浏览器开发者工具中的BbRouter cookie的值来获取此
cookie。


```python
<!--IMPORTS:[{"imported": "BlackboardLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.blackboard.BlackboardLoader.html", "title": "Blackboard"}]-->
from langchain_community.document_loaders import BlackboardLoader

loader = BlackboardLoader(
    blackboard_course_url="https://blackboard.example.com/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_123456_1",
    bbrouter="expires:12345...",
    load_all_recursively=True,
)
documents = loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
