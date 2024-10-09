---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/azlyrics.ipynb
---
# AZLyrics

>[AZLyrics](https://www.azlyrics.com/) 是一个大型的、合法的、每天都在增长的歌词集合。

这部分介绍如何将AZLyrics网页加载为我们可以在后续使用的文档格式。


```python
<!--IMPORTS:[{"imported": "AZLyricsLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.azlyrics.AZLyricsLoader.html", "title": "AZLyrics"}]-->
from langchain_community.document_loaders import AZLyricsLoader
```


```python
loader = AZLyricsLoader("https://www.azlyrics.com/lyrics/mileycyrus/flowers.html")
```


```python
data = loader.load()
```


```python
data
```



```output
[Document(page_content="Miley Cyrus - Flowers Lyrics | AZLyrics.com\n\r\nWe were good, we were gold\nKinda dream that can't be sold\nWe were right till we weren't\nBuilt a home and watched it burn\n\nI didn't wanna leave you\nI didn't wanna lie\nStarted to cry but then remembered I\n\nI can buy myself flowers\nWrite my name in the sand\nTalk to myself for hours\nSay things you don't understand\nI can take myself dancing\nAnd I can hold my own hand\nYeah, I can love me better than you can\n\nCan love me better\nI can love me better, baby\nCan love me better\nI can love me better, baby\n\nPaint my nails, cherry red\nMatch the roses that you left\nNo remorse, no regret\nI forgive every word you said\n\nI didn't wanna leave you, baby\nI didn't wanna fight\nStarted to cry but then remembered I\n\nI can buy myself flowers\nWrite my name in the sand\nTalk to myself for hours, yeah\nSay things you don't understand\nI can take myself dancing\nAnd I can hold my own hand\nYeah, I can love me better than you can\n\nCan love me better\nI can love me better, baby\nCan love me better\nI can love me better, baby\nCan love me better\nI can love me better, baby\nCan love me better\nI\n\nI didn't wanna wanna leave you\nI didn't wanna fight\nStarted to cry but then remembered I\n\nI can buy myself flowers\nWrite my name in the sand\nTalk to myself for hours (Yeah)\nSay things you don't understand\nI can take myself dancing\nAnd I can hold my own hand\nYeah, I can love me better than\nYeah, I can love me better than you can, uh\n\nCan love me better\nI can love me better, baby\nCan love me better\nI can love me better, baby (Than you can)\nCan love me better\nI can love me better, baby\nCan love me better\nI\n", lookup_str='', metadata={'source': 'https://www.azlyrics.com/lyrics/mileycyrus/flowers.html'}, lookup_index=0)]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
