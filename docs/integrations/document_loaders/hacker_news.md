---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/hacker_news.ipynb
---
# Hacker News

>[Hacker News](https://en.wikipedia.org/wiki/Hacker_News)（有时缩写为`HN`）是一个专注于计算机科学和创业的社交新闻网站。它由投资基金和创业孵化器`Y Combinator`运营。一般来说，可以提交的内容被定义为“任何满足个人智力好奇心的东西。”

本笔记本涵盖如何从[Hacker News](https://news.ycombinator.com/)提取页面数据和评论


```python
<!--IMPORTS:[{"imported": "HNLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.hn.HNLoader.html", "title": "Hacker News"}]-->
from langchain_community.document_loaders import HNLoader
```


```python
loader = HNLoader("https://news.ycombinator.com/item?id=34817881")
```


```python
data = loader.load()
```


```python
data[0].page_content[:300]
```



```output
"delta_p_delta_x 73 days ago  \n             | next [–] \n\nAstrophysical and cosmological simulations are often insightful. They're also very cross-disciplinary; besides the obvious astrophysics, there's networking and sysadmin, parallel computing and algorithm theory (so that the simulation programs a"
```



```python
data[0].metadata
```



```output
{'source': 'https://news.ycombinator.com/item?id=34817881',
 'title': 'What Lights the Universe’s Standard Candles?'}
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
