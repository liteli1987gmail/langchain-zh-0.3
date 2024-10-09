---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/spider.ipynb
---
# 蜘蛛
[蜘蛛](https://spider.cloud/) 是[最快](https://github.com/spider-rs/spider/blob/main/benches/BENCHMARKS.md)和最实惠的爬虫和抓取工具，能够返回适合大型语言模型的数据。

## 设置


```python
pip install spider-client
```

## 使用
要使用 spider，您需要从 [spider.cloud](https://spider.cloud/) 获取一个 API 密钥。


```python
<!--IMPORTS:[{"imported": "SpiderLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.spider.SpiderLoader.html", "title": "Spider"}]-->
from langchain_community.document_loaders import SpiderLoader

loader = SpiderLoader(
    api_key="YOUR_API_KEY",
    url="https://spider.cloud",
    mode="scrape",  # if no API key is provided it looks for SPIDER_API_KEY in env
)

data = loader.load()
print(data)
```
```output
[Document(page_content='Spider - Fastest Web Crawler built for AI Agents and Large Language Models[Spider v1 Logo Spider ](/)The World\'s Fastest and Cheapest Crawler API==========View Demo* Basic* StreamingExample requestPythonCopy\`\`\`import requests, osheaders = {    \'Authorization\': os.environ["SPIDER_API_KEY"],    \'Content-Type\': \'application/json\',}json_data = {"limit":50,"url":"http://www.example.com"}response = requests.post(\'https://api.spider.cloud/crawl\',  headers=headers,  json=json_data)print(response.json())\`\`\`Example ResponseScrape with no headaches----------* Proxy rotations* Agent headers* Avoid anti-bot detections* Headless chrome* Markdown LLM ResponsesThe Fastest Web Crawler----------* Powered by [spider-rs](https://github.com/spider-rs/spider)* Do 20,000 pages in seconds* Full concurrency* Powerful and simple API* Cost effectiveScrape Anything with AI----------* Custom scripting browser* Custom data extraction* Data pipelines* Detailed insights* Advanced labeling[API](/docs/api) [Price](/credits/new) [Guides](/guides) [About](/about) [Docs](https://docs.rs/spider/latest/spider/) [Privacy](/privacy) [Terms](/eula)© 2024 Spider from A11yWatchTheme Light Dark Toggle Theme [GitHubGithub](https://github.com/spider-rs/spider)', metadata={'description': 'Collect data rapidly from any website. Seamlessly scrape websites and get data tailored for LLM workloads.', 'domain': 'spider.cloud', 'extracted_data': None, 'file_size': 33743, 'keywords': None, 'pathname': '/', 'resource_type': 'html', 'title': 'Spider - Fastest Web Crawler built for AI Agents and Large Language Models', 'url': '48f1bc3c-3fbb-408a-865b-c191a1bb1f48/spider.cloud/index.html', 'user_id': '48f1bc3c-3fbb-408a-865b-c191a1bb1f48'})]
```
## 模式
- `scrape`: 默认模式，抓取单个 URL
- `crawl`: 爬取提供的域名 URL 的所有子页面

## 爬虫选项
`params` 参数是一个可以传递给加载器的字典。请参阅 [Spider 文档](https://spider.cloud/docs/api) 以查看所有可用参数


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
