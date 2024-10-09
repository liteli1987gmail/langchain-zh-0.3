---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/sitemap.ipynb
---
# 网站地图

从 `WebBaseLoader` 扩展而来，`SitemapLoader` 从给定的 URL 加载网站地图，然后抓取并加载网站地图中的所有页面，将每个页面作为文档返回。

抓取是并发进行的。对并发请求有合理的限制，默认每秒 2 次。如果你不担心做一个好公民，或者你控制被抓取的服务器，或者不在乎负载，你可以增加这个限制。请注意，虽然这会加快抓取过程，但可能会导致服务器阻止你。请小心！

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/document_loaders/web_loaders/sitemap/)|
| :--- | :--- | :---: | :---: |  :---: |
| [SiteMapLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sitemap.SitemapLoader.html#langchain_community.document_loaders.sitemap.SitemapLoader) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ✅ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| SiteMapLoader | ✅ | ❌ |

## 设置

要访问 SiteMap 文档加载器，您需要安装 `LangChain 社区` 集成包。

### 凭证

运行此程序不需要凭证。

如果您想获得自动化的最佳模型调用追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community**。


```python
%pip install -qU langchain-community
```

### 修复笔记本 asyncio 错误


```python
import nest_asyncio

nest_asyncio.apply()
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：


```python
<!--IMPORTS:[{"imported": "SitemapLoader", "source": "langchain_community.document_loaders.sitemap", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sitemap.SitemapLoader.html", "title": "Sitemap"}]-->
from langchain_community.document_loaders.sitemap import SitemapLoader
```


```python
sitemap_loader = SitemapLoader(web_path="https://api.python.langchain.com/sitemap.xml")
```

## 加载


```python
docs = sitemap_loader.load()
docs[0]
```
```output
Fetching pages: 100%|##########| 28/28 [00:04<00:00,  6.83it/s]
```


```output
Document(metadata={'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-05-15T00:29:42.163001+00:00', 'changefreq': 'weekly', 'priority': '1'}, page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n')
```



```python
print(docs[0].metadata)
```
```output
{'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-05-15T00:29:42.163001+00:00', 'changefreq': 'weekly', 'priority': '1'}
```
您可以更改 `requests_per_second` 参数以增加最大并发请求，并使用 `requests_kwargs` 在发送请求时传递 kwargs。


```python
sitemap_loader.requests_per_second = 2
# Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
sitemap_loader.requests_kwargs = {"verify": False}
```

## 懒加载

您还可以懒加载页面以最小化内存负载。


```python
page = []
for doc in sitemap_loader.lazy_load():
    page.append(doc)
    if len(page) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        page = []
```
```output
Fetching pages: 100%|##########| 28/28 [00:01<00:00, 19.06it/s]
```
## 过滤网站地图 URL

网站地图可能是巨大的文件，包含成千上万的URL。通常你并不需要每一个URL。你可以通过将字符串列表或正则表达式模式传递给`filter_urls`参数来过滤URL。只有与某个模式匹配的URL才会被加载。


```python
loader = SitemapLoader(
    web_path="https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest"],
)
documents = loader.load()
```


```python
documents[0]
```



```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/latest/', 'loc': 'https://api.python.langchain.com/en/latest/', 'lastmod': '2024-02-12T05:26:10.971077+00:00', 'changefreq': 'daily', 'priority': '0.9'})
```


## 添加自定义抓取规则

`SitemapLoader`使用`beautifulsoup4`进行抓取过程，默认情况下会抓取页面上的每个元素。`SitemapLoader`构造函数接受一个自定义抓取函数。这个功能可以帮助你根据特定需求定制抓取过程；例如，你可能想避免抓取头部或导航元素。

以下示例展示了如何开发和使用自定义函数以避免导航和头部元素。

导入`beautifulsoup4`库并定义自定义函数。


```python
pip install beautifulsoup4
```


```python
from bs4 import BeautifulSoup


def remove_nav_and_header_elements(content: BeautifulSoup) -> str:
    # Find all 'nav' and 'header' elements in the BeautifulSoup object
    nav_elements = content.find_all("nav")
    header_elements = content.find_all("header")

    # Remove each 'nav' and 'header' element from the BeautifulSoup object
    for element in nav_elements + header_elements:
        element.decompose()

    return str(content.get_text())
```

将你的自定义函数添加到`SitemapLoader`对象中。


```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## 本地网站地图

网站地图加载器也可以用于加载本地文件。


```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```

## API 参考

有关所有SiteMapLoader功能和配置的详细文档，请访问API参考：https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sitemap.SitemapLoader.html#langchain_community.document_loaders.sitemap.SitemapLoader


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
