---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/mastodon.ipynb
---
# Mastodon

>[Mastodon](https://joinmastodon.org/) 是一个联邦社交媒体和社交网络服务。

该加载器使用 `Mastodon.py` Python 包从一系列 `Mastodon` 账户的“toots”中获取文本。

公共账户可以默认无任何身份验证进行查询。如果查询非公共账户或实例，您必须为您的账户注册一个应用程序，以获取访问令牌，并设置该令牌和您账户的 API 基础 URL。

然后您需要以 `@account@instance` 格式传入您想要提取的 Mastodon 账户名称。


```python
<!--IMPORTS:[{"imported": "MastodonTootsLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.mastodon.MastodonTootsLoader.html", "title": "Mastodon"}]-->
from langchain_community.document_loaders import MastodonTootsLoader
```


```python
%pip install --upgrade --quiet  Mastodon.py
```


```python
loader = MastodonTootsLoader(
    mastodon_accounts=["@Gargron@mastodon.social"],
    number_toots=50,  # Default value is 100
)

# Or set up access information to use a Mastodon app.
# Note that the access token can either be passed into
# constructor or you can set the environment "MASTODON_ACCESS_TOKEN".
# loader = MastodonTootsLoader(
#     access_token="<ACCESS TOKEN OF MASTODON APP>",
#     api_base_url="<API BASE URL OF MASTODON APP INSTANCE>",
#     mastodon_accounts=["@Gargron@mastodon.social"],
#     number_toots=50,  # Default value is 100
# )
```


```python
documents = loader.load()
for doc in documents[:3]:
    print(doc.page_content)
    print("=" * 80)
```
```output
<p>It is tough to leave this behind and go back to reality. And some people live here! I’m sure there are downsides but it sounds pretty good to me right now.</p>
================================================================================
<p>I wish we could stay here a little longer, but it is time to go home 🥲</p>
================================================================================
<p>Last day of the honeymoon. And it’s <a href="https://mastodon.social/tags/caturday" class="mention hashtag" rel="tag">#<span>caturday</span></a>! This cute tabby came to the restaurant to beg for food and got some chicken.</p>
================================================================================
```
默认情况下，toot 文本（文档的 `page_content`）是由 Mastodon API 返回的 HTML。


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
