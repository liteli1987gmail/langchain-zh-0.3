---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/browserless.ipynb
---
# 无头浏览器

无头浏览器是一个服务，允许您在云中运行无头 Chrome 实例。这是以规模运行基于浏览器的自动化的好方法，而无需担心管理自己的基础设施。

要将无头浏览器用作文档加载器，请按照本笔记本中的示例初始化 `BrowserlessLoader` 实例。请注意，默认情况下，`BrowserlessLoader` 返回页面 `body` 元素的 `innerText`。要禁用此功能并获取原始 HTML，请将 `text_content` 设置为 `False`。


```python
<!--IMPORTS:[{"imported": "BrowserlessLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.browserless.BrowserlessLoader.html", "title": "Browserless"}]-->
from langchain_community.document_loaders import BrowserlessLoader
```


```python
BROWSERLESS_API_TOKEN = "YOUR_BROWSERLESS_API_TOKEN"
```


```python
loader = BrowserlessLoader(
    api_token=BROWSERLESS_API_TOKEN,
    urls=[
        "https://en.wikipedia.org/wiki/Document_classification",
    ],
    text_content=True,
)

documents = loader.load()

print(documents[0].page_content[:1000])
```
```output
Jump to content
Main menu
Search
Create account
Log in
Personal tools
Toggle the table of contents
Document classification
17 languages
Article
Talk
Read
Edit
View history
Tools
From Wikipedia, the free encyclopedia

Document classification or document categorization is a problem in library science, information science and computer science. The task is to assign a document to one or more classes or categories. This may be done "manually" (or "intellectually") or algorithmically. The intellectual classification of documents has mostly been the province of library science, while the algorithmic classification of documents is mainly in information science and computer science. The problems are overlapping, however, and there is therefore interdisciplinary research on document classification.

The documents to be classified may be texts, images, music, etc. Each kind of document possesses its special classification problems. When not otherwise specified, text classification is implied.

Do
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
