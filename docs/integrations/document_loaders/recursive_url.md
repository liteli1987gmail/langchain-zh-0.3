---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/recursive_url.ipynb
---
# 递归 URL

 `RecursiveUrlLoader` 允许您递归抓取根 URL 的所有子链接并将其解析为文档。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/document_loaders/web_loaders/recursive_url_loader/)|
| :--- | :--- | :---: | :---: |  :---: |
| [RecursiveUrlLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.recursive_url_loader.RecursiveUrlLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ✅ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| RecursiveUrlLoader | ✅ | ❌ |


## 设置

### 凭证

使用 `RecursiveUrlLoader` 不需要任何凭证。

### 安装

`RecursiveUrlLoader` 位于 `langchain-community` 包中。虽然没有其他必需的包，但如果您安装了 `beautifulsoup4`，您将获得更丰富的默认文档元数据。


```python
%pip install -qU langchain-community beautifulsoup4
```

## 实例化

现在我们可以实例化我们的文档加载器对象并加载文档：


```python
<!--IMPORTS:[{"imported": "RecursiveUrlLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.recursive_url_loader.RecursiveUrlLoader.html", "title": "Recursive URL"}]-->
from langchain_community.document_loaders import RecursiveUrlLoader

loader = RecursiveUrlLoader(
    "https://docs.python.org/3.9/",
    # max_depth=2,
    # use_async=False,
    # extractor=None,
    # metadata_extractor=None,
    # exclude_dirs=(),
    # timeout=10,
    # check_response_status=True,
    # continue_on_failure=True,
    # prevent_outside=True,
    # base_url=None,
    # ...
)
```

## 加载

使用 ``.load()`` 同步加载所有文档到内存中，每个访问的 URL 对应一个文档。
从初始 URL 开始，我们递归遍历所有链接的 URL，直到指定的最大深度。
让我们通过一个基本示例来演示如何在 [Python 3.9 文档](https://docs.python.org/3.9/) 上使用 `RecursiveUrlLoader`。

让我们通过一个基本示例来了解如何在 [Python 3.9 文档](https://docs.python.org/3.9/) 上使用 `RecursiveUrlLoader`。


```python
docs = loader.load()
docs[0].metadata
```
```output
/Users/bagatur/.pyenv/versions/3.9.1/lib/python3.9/html/parser.py:170: XMLParsedAsHTMLWarning: It looks like you're parsing an XML document using an HTML parser. If this really is an HTML document (maybe it's XHTML?), you can ignore or filter this warning. If it's XML, you should know that using an XML parser will be more reliable. To parse this document as XML, make sure you have the lxml package installed, and pass the keyword argument `features="xml"` into the BeautifulSoup constructor.
  k = self.parse_starttag(i)
```


```output
{'source': 'https://docs.python.org/3.9/',
 'content_type': 'text/html',
 'title': '3.9.19 Documentation',
 'language': None}
```


太好了！第一个文档看起来像是我们开始时的根页面。让我们看看下一个文档的元数据。


```python
docs[1].metadata
```



```output
{'source': 'https://docs.python.org/3.9/using/index.html',
 'content_type': 'text/html',
 'title': 'Python Setup and Usage — Python 3.9.19 documentation',
 'language': None}
```


那个 URL 看起来像是我们根页面的子页面，这很好！让我们从元数据转到检查我们文档的内容。


```python
print(docs[0].page_content[:300])
```
```output

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" /><title>3.9.19 Documentation</title><meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" href="_static/pydoctheme.css" type="text/css" />
    <link rel=
```
那确实看起来像是来自 URL https://docs.python.org/3.9/ 的 HTML，这正是我们所期待的。现在让我们看看一些我们可以对基本示例进行的变体，这在不同情况下可能会很有帮助。

## 懒加载

如果我们加载大量文档，并且我们的下游操作可以在所有加载文档的子集上进行，我们可以逐个懒加载文档，以最小化内存占用：


```python
pages = []
for doc in loader.lazy_load():
    pages.append(doc)
    if len(pages) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        pages = []
```
```output
/var/folders/4j/2rz3865x6qg07tx43146py8h0000gn/T/ipykernel_73962/2110507528.py:6: XMLParsedAsHTMLWarning: It looks like you're parsing an XML document using an HTML parser. If this really is an HTML document (maybe it's XHTML?), you can ignore or filter this warning. If it's XML, you should know that using an XML parser will be more reliable. To parse this document as XML, make sure you have the lxml package installed, and pass the keyword argument `features="xml"` into the BeautifulSoup constructor.
  soup = BeautifulSoup(html, "lxml")
```
在这个例子中，我们一次加载到内存中的文档不超过10个。

## 添加提取器

默认情况下，加载器将每个链接的原始HTML设置为文档页面内容。要将此HTML解析为更适合人类/大型语言模型的格式，您可以传入自定义的``extractor``方法：


```python
import re

from bs4 import BeautifulSoup


def bs4_extractor(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    return re.sub(r"\n\n+", "\n\n", soup.text).strip()


loader = RecursiveUrlLoader("https://docs.python.org/3.9/", extractor=bs4_extractor)
docs = loader.load()
print(docs[0].page_content[:200])
```
```output
/var/folders/td/vzm913rx77x21csd90g63_7c0000gn/T/ipykernel_10935/1083427287.py:6: XMLParsedAsHTMLWarning: It looks like you're parsing an XML document using an HTML parser. If this really is an HTML document (maybe it's XHTML?), you can ignore or filter this warning. If it's XML, you should know that using an XML parser will be more reliable. To parse this document as XML, make sure you have the lxml package installed, and pass the keyword argument `features="xml"` into the BeautifulSoup constructor.
  soup = BeautifulSoup(html, "lxml")
/Users/isaachershenson/.pyenv/versions/3.11.9/lib/python3.11/html/parser.py:170: XMLParsedAsHTMLWarning: It looks like you're parsing an XML document using an HTML parser. If this really is an HTML document (maybe it's XHTML?), you can ignore or filter this warning. If it's XML, you should know that using an XML parser will be more reliable. To parse this document as XML, make sure you have the lxml package installed, and pass the keyword argument `features="xml"` into the BeautifulSoup constructor.
  k = self.parse_starttag(i)
``````output
3.9.19 Documentation

Download
Download these documents
Docs by version

Python 3.13 (in development)
Python 3.12 (stable)
Python 3.11 (security-fixes)
Python 3.10 (security-fixes)
Python 3.9 (securit
```
这看起来好多了！

您可以类似地传入 `metadata_extractor` 来自定义如何从 HTTP 响应中提取文档元数据。有关更多信息，请参见 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.recursive_url_loader.RecursiveUrlLoader.html)。

## API 参考

这些示例展示了您可以修改默认 `RecursiveUrlLoader` 的几种方式，但还有许多其他修改可以更好地适应您的用例。使用参数 `link_regex` 和 `exclude_dirs` 可以帮助您过滤掉不需要的 URL，`aload()` 和 `alazy_load()` 可用于异步加载，等等。

有关配置和调用 ``RecursiveUrlLoader`` 的详细信息，请参见 API 参考：https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.recursive_url_loader.RecursiveUrlLoader.html。


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
