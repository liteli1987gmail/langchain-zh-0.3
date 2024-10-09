---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/confluence.ipynb
---
# Confluence

>[Confluence](https://www.atlassian.com/software/confluence) 是一个维基协作平台，用于保存和组织所有与项目相关的材料。`Confluence` 是一个主要处理内容管理活动的知识库。

用于 `Confluence` 页面加载的加载器。


目前支持 `username/api_key` 和 `Oauth2 登录`。此外，本地安装还支持 `token` 认证。


指定一个 `page_id` 和/或 `space_key` 的列表，以将相应的页面加载到文档对象中，如果同时指定了两者，将返回两个集合的并集。


您还可以指定一个布尔值 `include_attachments` 来包含附件，默认设置为 False，如果设置为 True，所有附件将被下载，ConfluenceReader 将从附件中提取文本并将其添加到文档对象中。目前支持的附件类型有：`PDF`、`PNG`、`JPEG/JPG`、`SVG`、`Word` 和 `Excel`。

提示：`space_key` 和 `page_id` 都可以在 Confluence 页面的网址中找到 - https://yoursite.atlassian.com/wiki/spaces/&lt;space_key&gt;/pages/&lt;page_id&gt;


在使用 ConfluenceLoader 之前，请确保您已安装最新版本的 atlassian-python-api 包：


```python
%pip install --upgrade --quiet  atlassian-python-api
```

## 示例

### 用户名和密码或用户名和API令牌（仅限Atlassian Cloud）

此示例使用用户名和密码进行身份验证，或者如果您连接到Atlassian Cloud托管版本的Confluence，则使用用户名和API令牌。
您可以在以下网址生成API令牌：https://id.atlassian.com/manage-profile/security/api-tokens。

`limit`参数指定在单次调用中将检索多少文档，而不是总共将检索多少文档。
默认情况下，代码将以50个文档为一批返回最多1000个文档。要控制文档的总数，请使用`max_pages`参数。
请注意，atlassian-python-api包中`limit`参数的最大值目前为100。


```python
<!--IMPORTS:[{"imported": "ConfluenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.confluence.ConfluenceLoader.html", "title": "Confluence"}]-->
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(
    url="https://yoursite.atlassian.com/wiki", username="me", api_key="12345"
)
documents = loader.load(space_key="SPACE", include_attachments=True, limit=50)
```

### 个人访问令牌（仅限服务器/本地）

此方法仅适用于数据中心/服务器本地版本。
有关如何生成个人访问令牌（PAT）的更多信息，请查看官方Confluence文档：https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html。
使用PAT时，您只需提供令牌值，无法提供用户名。
请注意，ConfluenceLoader将在生成PAT的用户权限下运行，并且只能加载该用户有权限访问的文档。


```python
<!--IMPORTS:[{"imported": "ConfluenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.confluence.ConfluenceLoader.html", "title": "Confluence"}]-->
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(url="https://yoursite.atlassian.com/wiki", token="12345")
documents = loader.load(
    space_key="SPACE", include_attachments=True, limit=50, max_pages=50
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
