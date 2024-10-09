---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/scrapfly.ipynb
---
## ScrapFly
[ScrapFly](https://scrapfly.io/) 是一个具有无头浏览器功能、代理和反机器人绕过能力的网页抓取API。它允许将网页数据提取为可访问的LLM markdown或文本。

#### 安装
使用pip安装ScrapFly Python SDK和所需的LangChain包：
```shell
pip install scrapfly-sdk langchain langchain-community
```

#### 用法


```python
<!--IMPORTS:[{"imported": "ScrapflyLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.scrapfly.ScrapflyLoader.html", "title": "# ScrapFly"}]-->
from langchain_community.document_loaders import ScrapflyLoader

scrapfly_loader = ScrapflyLoader(
    ["https://web-scraping.dev/products"],
    api_key="Your ScrapFly API key",  # Get your API key from https://www.scrapfly.io/
    continue_on_failure=True,  # Ignore unprocessable web pages and log their exceptions
)

# Load documents from URLs as markdown
documents = scrapfly_loader.load()
print(documents)
```

ScrapflyLoader 还允许传递 ScrapeConfig 对象以自定义抓取请求。有关完整功能细节及其 API 参数，请参阅文档：https://scrapfly.io/docs/scrape-api/getting-started


```python
<!--IMPORTS:[{"imported": "ScrapflyLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.scrapfly.ScrapflyLoader.html", "title": "# ScrapFly"}]-->
from langchain_community.document_loaders import ScrapflyLoader

scrapfly_scrape_config = {
    "asp": True,  # Bypass scraping blocking and antibot solutions, like Cloudflare
    "render_js": True,  # Enable JavaScript rendering with a cloud headless browser
    "proxy_pool": "public_residential_pool",  # Select a proxy pool (datacenter or residnetial)
    "country": "us",  # Select a proxy location
    "auto_scroll": True,  # Auto scroll the page
    "js": "",  # Execute custom JavaScript code by the headless browser
}

scrapfly_loader = ScrapflyLoader(
    ["https://web-scraping.dev/products"],
    api_key="Your ScrapFly API key",  # Get your API key from https://www.scrapfly.io/
    continue_on_failure=True,  # Ignore unprocessable web pages and log their exceptions
    scrape_config=scrapfly_scrape_config,  # Pass the scrape_config object
    scrape_format="markdown",  # The scrape result format, either `markdown`(default) or `text`
)

# Load documents from URLs as markdown
documents = scrapfly_loader.load()
print(documents)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
