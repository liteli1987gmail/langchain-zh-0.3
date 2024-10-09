---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/subtitle.ipynb
---
# 副标题

> [SubRip 文件格式](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format) 在 `Matroska` 多媒体容器格式网站上被描述为“可能是所有字幕格式中最基本的。” `SubRip (SubRip Text)` 文件的扩展名为 `.srt`，包含格式化的纯文本行，按空行分组。字幕按顺序编号，从 1 开始。使用的时间码格式为小时:分钟:秒,毫秒，时间单位固定为两位零填充数字，分数固定为三位零填充数字（00:00:00,000）。使用的分数分隔符是逗号，因为该程序是在法国编写的。

如何从字幕（`.srt`）文件加载数据

请从这里下载 [示例 .srt 文件](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en)。


```python
%pip install --upgrade --quiet  pysrt
```


```python
<!--IMPORTS:[{"imported": "SRTLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.srt.SRTLoader.html", "title": "Subtitle"}]-->
from langchain_community.document_loaders import SRTLoader
```


```python
loader = SRTLoader(
    "example_data/Star_Wars_The_Clone_Wars_S06E07_Crisis_at_the_Heart.srt"
)
```


```python
docs = loader.load()
```


```python
docs[0].page_content[:100]
```



```output
'<i>Corruption discovered\nat the core of the Banking Clan!</i> <i>Reunited, Rush Clovis\nand Senator A'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
