---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/yuque.ipynb
---
# 语雀

>[语雀](https://www.yuque.com/) 是一个专业的基于云的知识库，用于团队协作和文档管理。

本笔记本介绍如何从 `语雀` 加载文档。

您可以通过点击个人头像在[个人设置](https://www.yuque.com/settings/tokens)页面获取个人访问令牌。


```python
<!--IMPORTS:[{"imported": "YuqueLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.yuque.YuqueLoader.html", "title": "Yuque"}]-->
from langchain_community.document_loaders import YuqueLoader
```


```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```


```python
docs = loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
