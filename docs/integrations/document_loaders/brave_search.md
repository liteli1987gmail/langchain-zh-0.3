---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/brave_search.ipynb
---
# Brave Search


>[Brave Search](https://en.wikipedia.org/wiki/Brave_Search) 是由 Brave Software 开发的搜索引擎。
> - `Brave Search` 使用自己的网页索引。截至 2022 年 5 月，它覆盖了超过 100 亿个页面，并用于提供 92%
> 的搜索结果，而不依赖于任何第三方，其余部分通过
> 服务器端从 Bing API 检索，或（在选择加入的基础上）客户端从 Google 检索。根据
> Brave 的说法，该索引被保持为“故意小于 Google 或 Bing 的索引”，以帮助
> 避免垃圾邮件和其他低质量内容，缺点是“Brave Search 还不如 Google 在恢复长尾查询方面好。”
>
>- `Brave Search Premium`: 截至 2023 年 4 月，Brave Search 是一个无广告的网站，但它将
> 最终切换到一个新模型，其中将包括广告，付费用户将获得无广告体验。
> 用户数据，包括IP地址，默认情况下不会被收集。需要一个高级账户
> 才能选择加入数据收集。


## 安装和设置

要访问Brave Search API，您需要[创建一个账户并获取API密钥](https://api.search.brave.com/app/dashboard)。



```python
api_key = "..."
```


```python
<!--IMPORTS:[{"imported": "BraveSearchLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.brave_search.BraveSearchLoader.html", "title": "Brave Search"}]-->
from langchain_community.document_loaders import BraveSearchLoader
```

## 示例


```python
loader = BraveSearchLoader(
    query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```



```output
3
```



```python
[doc.metadata for doc in docs]
```



```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
  'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
 {'title': "What's up with Obama's middle name? - Quora",
  'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
 {'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
  'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```



```python
[doc.page_content for doc in docs]
```



```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
 'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
 'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
