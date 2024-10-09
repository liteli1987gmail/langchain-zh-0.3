---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/async_chromium.ipynb
---
# 异步 Chromium

Chromium 是 Playwright 支持的浏览器之一，Playwright 是一个用于控制浏览器自动化的库。

通过运行 `p.chromium.launch(headless=True)`，我们正在启动一个无头的 Chromium 实例。

无头模式意味着浏览器在没有图形用户界面的情况下运行。

在下面的示例中，我们将使用 `AsyncChromiumLoader` 加载页面，然后使用 [`Html2TextTransformer`](/docs/integrations/document_transformers/html2text/) 来剥离 HTML 标签和其他语义信息。


```python
%pip install --upgrade --quiet playwright beautifulsoup4 html2text
!playwright install
```

**注意：** 如果您使用的是 Jupyter 笔记本，您可能还需要在加载文档之前安装并应用 `nest_asyncio`，如下所示：


```python
!pip install nest-asyncio
import nest_asyncio

nest_asyncio.apply()
```


```python
<!--IMPORTS:[{"imported": "AsyncChromiumLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.chromium.AsyncChromiumLoader.html", "title": "Async Chromium"}]-->
from langchain_community.document_loaders import AsyncChromiumLoader

urls = ["https://docs.smith.langchain.com/"]
loader = AsyncChromiumLoader(urls, user_agent="MyAppUserAgent")
docs = loader.load()
docs[0].page_content[0:100]
```



```output
'<!DOCTYPE html><html lang="en" dir="ltr" class="docs-wrapper docs-doc-page docs-version-2.0 plugin-d'
```


现在让我们使用转换器将文档转换为更易读的语法：


```python
<!--IMPORTS:[{"imported": "Html2TextTransformer", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.html2text.Html2TextTransformer.html", "title": "Async Chromium"}]-->
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
docs_transformed[0].page_content[0:500]
```



```output
'Skip to main content\n\nGo to API Docs\n\nSearch`⌘``K`\n\nGo to App\n\n  * Quick start\n  * Tutorials\n\n  * How-to guides\n\n  * Concepts\n\n  * Reference\n\n  * Pricing\n  * Self-hosting\n\n  * LangGraph Cloud\n\n  *   * Quick start\n\nOn this page\n\n# Get started with LangSmith\n\n**LangSmith** is a platform for building production-grade LLM applications. It\nallows you to closely monitor and evaluate your application, so you can ship\nquickly and with confidence. Use of LangChain is not necessary - LangSmith\nworks on it'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
