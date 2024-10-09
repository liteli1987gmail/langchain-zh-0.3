---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/beautiful_soup.ipynb
---
# 美丽汤

> [美丽汤](https://www.crummy.com/software/BeautifulSoup/) 是一个用于解析 HTML 和 XML 文档的 Python 包（包括处理格式错误的标记，即未闭合的标签，因此得名标签汤）。
> 它为解析的页面创建一个解析树，可以用于从 HTML 中提取数据，这对于网络爬虫非常有用。
> 它为解析的页面创建一个解析树，可以用于从 HTML 中提取数据，这对于网络爬虫非常有用。
> 这对于网络爬虫非常有用。

`美丽汤` 提供了对 HTML 内容的细粒度控制，使得特定标签的提取、删除和内容清理成为可能。

它适用于您想要提取特定信息并根据需要清理 HTML 内容的情况。

例如，我们可以从 HTML 内容中抓取 `、`、`、` 和 ` ` 标签内的文本内容：

* ``: 段落标签。它在 HTML 中定义一个段落，用于将相关句子和/或短语分组在一起。
 
* ``: 列表项标签。它用于有序（``）和无序（``）列表中，以定义列表中的单个项。
 
* ``: 分割标签。它是一个块级元素，用于分组其他内联或块级元素。
 
* ``: 锚标签。它用于定义超链接。


```python
<!--IMPORTS:[{"imported": "AsyncChromiumLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.chromium.AsyncChromiumLoader.html", "title": "Beautiful Soup"}, {"imported": "BeautifulSoupTransformer", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.beautiful_soup_transformer.BeautifulSoupTransformer.html", "title": "Beautiful Soup"}]-->
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```


```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
```


```python
docs_transformed[0].page_content[0:500]
```



```output
'Conservative legal activists are challenging Amazon, Comcast and others using many of the same tools that helped kill affirmative-action programs in colleges.1,2099 min read U.S. stock indexes fell and government-bond prices climbed, after Moody’s lowered credit ratings for 10 smaller U.S. banks and said it was reviewing ratings for six larger ones. The Dow industrials dropped more than 150 points.3 min read Penn Entertainment’s Barstool Sportsbook app will be rebranded as ESPN Bet this fall as '
```

