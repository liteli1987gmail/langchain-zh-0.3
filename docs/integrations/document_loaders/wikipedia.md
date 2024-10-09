---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/wikipedia.ipynb
---
# 维基百科

>[维基百科](https://wikipedia.org/) 是一个由志愿者社区（称为维基人）编写和维护的多语言免费在线百科全书，通过开放协作和使用名为MediaWiki的基于维基的编辑系统。`维基百科` 是历史上最大和阅读量最高的参考书籍。

本笔记本展示了如何将来自 `wikipedia.org` 的维基页面加载到我们下游使用的文档格式中。

## 安装

首先，您需要安装 `langchain_community` 和 `wikipedia` 包。


```python
%pip install -qU langchain_community wikipedia
```

## 参数

`WikipediaLoader` 有以下参数：
- `query`: 用于在维基百科中查找文档的自由文本
- `lang`（可选）：默认值为"en"。用于在维基百科的特定语言部分进行搜索
- `load_max_docs`（可选）：默认值为100。用于限制下载文档的数量。下载所有100个文档需要时间，因此在实验中使用较小的数字。目前有300的硬限制。
- `load_all_available_meta`（可选）：默认值为False。默认情况下，仅下载最重要的字段：`title` 和 `summary`。如果为`True`，则将下载所有可用字段。
- `doc_content_chars_max`（可选）：默认值为4000。文档内容的最大字符数。

## 示例


```python
<!--IMPORTS:[{"imported": "WikipediaLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.wikipedia.WikipediaLoader.html", "title": "Wikipedia"}]-->
from langchain_community.document_loaders import WikipediaLoader
```


```python
docs = WikipediaLoader(query="HUNTER X HUNTER", load_max_docs=2).load()
len(docs)
```



```output
2
```



```python
docs[0].metadata  # metadata of the first document
```



```output
{'title': 'Hunter × Hunter',
 'summary': 'Hunter × Hunter (pronounced "hunter hunter") is a Japanese manga series written and illustrated by Yoshihiro Togashi. It has been serialized in Shueisha\'s shōnen manga magazine Weekly Shōnen Jump since March 1998, although the manga has frequently gone on extended hiatuses since 2006. Its chapters have been collected in 37 tankōbon volumes as of November 2022. The story focuses on a young boy named Gon Freecss who discovers that his father, who left him at a young age, is actually a world-renowned Hunter, a licensed professional who specializes in fantastical pursuits such as locating rare or unidentified animal species, treasure hunting, surveying unexplored enclaves, or hunting down lawless individuals. Gon departs on a journey to become a Hunter and eventually find his father. Along the way, Gon meets various other Hunters and encounters the paranormal.\nHunter × Hunter was adapted into a 62-episode anime television series by Nippon Animation and directed by Kazuhiro Furuhashi, which ran on Fuji Television from October 1999 to March 2001. Three separate original video animations (OVAs) totaling 30 episodes were subsequently produced by Nippon Animation and released in Japan from 2002 to 2004. A second anime television series by Madhouse aired on Nippon Television from October 2011 to September 2014, totaling 148 episodes, with two animated theatrical films released in 2013. There are also numerous audio albums, video games, musicals, and other media based on Hunter × Hunter.\nThe manga has been licensed for English release in North America by Viz Media since April 2005. Both television series have been also licensed by Viz Media, with the first series having aired on the Funimation Channel in 2009 and the second series broadcast on Adult Swim\'s Toonami programming block from April 2016 to June 2019.\nHunter × Hunter has been a huge critical and financial success and has become one of the best-selling manga series of all time, having over 84 million copies in circulation by July 2022.',
 'source': 'https://en.wikipedia.org/wiki/Hunter_%C3%97_Hunter'}
```



```python
docs[0].page_content[:400]  # a part of the page content
```



```output
'Hunter × Hunter (pronounced "hunter hunter") is a Japanese manga series written and illustrated by Yoshihiro Togashi. It has been serialized in Shueisha\'s shōnen manga magazine Weekly Shōnen Jump since March 1998, although the manga has frequently gone on extended hiatuses since 2006. Its chapters have been collected in 37 tankōbon volumes as of November 2022. The story focuses on a young boy name'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
