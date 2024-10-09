---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/mojeek_search.ipynb
---
# Mojeek 搜索

以下笔记本将解释如何使用 Mojeek 搜索获取结果。请访问 [Mojeek 网站](https://www.mojeek.com/services/search/web-search-api/) 以获取 API 密钥。


```python
<!--IMPORTS:[{"imported": "MojeekSearch", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.mojeek_search.tool.MojeekSearch.html", "title": "Mojeek Search"}]-->
from langchain_community.tools import MojeekSearch
```


```python
api_key = "KEY"  # obtained from Mojeek Website
```


```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

在 `search_kwargs` 中，您可以添加在 [Mojeek 文档](https://www.mojeek.com/support/api/search/request_parameters.html) 中找到的任何搜索参数


```python
search.run("mojeek")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
