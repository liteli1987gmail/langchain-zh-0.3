---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/evernote.ipynb
---
# EverNote

>[EverNote](https://evernote.com/) 旨在归档和创建可以嵌入照片、音频和保存的网页内容的笔记。笔记存储在虚拟“笔记本”中，可以进行标签、注释、编辑、搜索和导出。

本笔记本展示了如何从磁盘加载 `Evernote` [导出](https://help.evernote.com/hc/en-us/articles/209005557-Export-notes-and-notebooks-as-ENEX-or-HTML) 文件 (.enex)。

每个导出的笔记将创建一个文档。


```python
# lxml and html2text are required to parse EverNote notes
%pip install --upgrade --quiet  lxml
%pip install --upgrade --quiet  html2text
```


```python
<!--IMPORTS:[{"imported": "EverNoteLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.evernote.EverNoteLoader.html", "title": "EverNote"}]-->
from langchain_community.document_loaders import EverNoteLoader

# By default all notes are combined into a single Document
loader = EverNoteLoader("example_data/testing.enex")
loader.load()
```



```output
[Document(page_content='testing this\n\nwhat happens?\n\nto the world?**Jan - March 2022**', metadata={'source': 'example_data/testing.enex'})]
```



```python
# It's likely more useful to return a Document for each note
loader = EverNoteLoader("example_data/testing.enex", load_single_document=False)
loader.load()
```



```output
[Document(page_content='testing this\n\nwhat happens?\n\nto the world?', metadata={'title': 'testing', 'created': time.struct_time(tm_year=2023, tm_mon=2, tm_mday=9, tm_hour=3, tm_min=47, tm_sec=46, tm_wday=3, tm_yday=40, tm_isdst=-1), 'updated': time.struct_time(tm_year=2023, tm_mon=2, tm_mday=9, tm_hour=3, tm_min=53, tm_sec=28, tm_wday=3, tm_yday=40, tm_isdst=-1), 'note-attributes.author': 'Harrison Chase', 'source': 'example_data/testing.enex'}),
 Document(page_content='**Jan - March 2022**', metadata={'title': 'Summer Training Program', 'created': time.struct_time(tm_year=2022, tm_mon=12, tm_mday=27, tm_hour=1, tm_min=59, tm_sec=48, tm_wday=1, tm_yday=361, tm_isdst=-1), 'note-attributes.author': 'Mike McGarry', 'note-attributes.source': 'mobile.iphone', 'source': 'example_data/testing.enex'})]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
