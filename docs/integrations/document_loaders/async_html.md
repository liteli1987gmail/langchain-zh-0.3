---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/async_html.ipynb
---
# 异步HTML

`AsyncHtmlLoader` 从URL列表中并发加载原始HTML。


```python
<!--IMPORTS:[{"imported": "AsyncHtmlLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.async_html.AsyncHtmlLoader.html", "title": "AsyncHtml"}]-->
from langchain_community.document_loaders import AsyncHtmlLoader
```


```python
urls = ["https://www.espn.com", "https://lilianweng.github.io/posts/2023-06-23-agent/"]
loader = AsyncHtmlLoader(urls)
# If you need to use the proxy to make web requests, for example using http_proxy/https_proxy environmental variables,
# please set trust_env=True explicitly here as follows:
# loader = AsyncHtmlLoader(urls, trust_env=True)
# Otherwise, loader.load() may stuck becuase aiohttp session does not recognize the proxy by default
docs = loader.load()
```
```output
Fetching pages: 100%|############| 2/2 [00:00<00:00,  9.96it/s]
```

```python
docs[0].page_content[1000:2000]
```



```output
' news. Stream exclusive games on ESPN+ and play fantasy sports." />\n<meta property="og:image" content="https://a1.espncdn.com/combiner/i?img=%2Fi%2Fespn%2Fespn_logos%2Fespn_red.png"/>\n<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n<meta property="og:type" content="website" />\n<meta name="twitter:site" content="espn" />\n<meta name="twitter:url" content="https://www.espn.com" />\n<meta name="twitter:title" content="ESPN - Serving Sports Fans. Anytime. Anywhere."/>\n<meta name="twitter:description" content="Visit ESPN for live scores, highlights and sports news. Stream exclusive games on ESPN+ and play fantasy sports." />\n<meta name="twitter:card" content="summary">\n<meta name="twitter:app:name:iphone" content="ESPN"/>\n<meta name="twitter:app:id:iphone" content="317469184"/>\n<meta name="twitter:app:name:googleplay" content="ESPN"/>\n<meta name="twitter:app:id:googleplay" content="com.espn.score_center"/>\n<meta name="title" content="ESPN - '
```



```python
docs[1].page_content[1000:2000]
```



```output
'al" href="https://lilianweng.github.io/posts/2023-06-23-agent/" />\n<link crossorigin="anonymous" href="/assets/css/stylesheet.min.67a6fb6e33089cb29e856bcc95d7aa39f70049a42b123105531265a0d9f1258b.css" integrity="sha256-Z6b7bjMInLKehWvMldeqOfcASaQrEjEFUxJloNnxJYs=" rel="preload stylesheet" as="style">\n<script defer crossorigin="anonymous" src="/assets/js/highlight.min.7680afc38aa6b15ddf158a4f3780b7b1f7dde7e91d26f073e6229bb7a0793c92.js" integrity="sha256-doCvw4qmsV3fFYpPN4C3sffd5&#43;kdJvBz5iKbt6B5PJI="\n    onload="hljs.initHighlightingOnLoad();"></script>\n<link rel="icon" href="https://lilianweng.github.io/favicon_peach.ico">\n<link rel="icon" type="image/png" sizes="16x16" href="https://lilianweng.github.io/favicon-16x16.png">\n<link rel="icon" type="image/png" sizes="32x32" href="https://lilianweng.github.io/favicon-32x32.png">\n<link rel="apple-touch-icon" href="https://lilianweng.github.io/apple-touch-icon.png">\n<link rel="mask-icon" href="https://lilianweng.github.io/safari-pinned-tab.'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
