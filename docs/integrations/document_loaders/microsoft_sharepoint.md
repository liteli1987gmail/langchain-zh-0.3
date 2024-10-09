---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/microsoft_sharepoint.ipynb
---
# Microsoft SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint) 是一个基于网站的协作系统，使用工作流应用程序、“列表”数据库以及其他网页组件和安全功能，旨在帮助业务团队共同工作，由微软开发。

本笔记本涵盖如何从 [SharePoint 文档库](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872) 加载文档。目前，仅支持 docx、doc 和 pdf 文件。

## 前提条件
1. 按照 [Microsoft 身份平台](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 的说明注册一个应用程序。
2. 注册完成后，Azure 门户会显示应用注册的概述面板。您会看到应用程序（客户端）ID。也称为 `client ID`，此值唯一标识您在 Microsoft 身份平台中的应用程序。
3. 在您将要遵循的 **第 1 项** 步骤中，您可以将重定向 URI 设置为 `https://login.microsoftonline.com/common/oauth2/nativeclient`。
4. 在您将要遵循的 **第 1 项** 步骤中，在应用程序机密部分生成一个新密码（`client_secret`）。
5. 按照此 [文档](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) 中的说明，将以下 `SCOPES`（`offline_access` 和 `Sites.Read.All`）添加到您的应用程序中。
6. 要从您的 **文档库** 中检索文件，您需要其 ID。要获取它，您需要 `Tenant Name`、`Collection ID` 和 `Subsite ID` 的值。
7. 要找到您的 `租户名称`，请按照此 [文档](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name) 中的说明进行操作。一旦您获得此信息，只需从值中删除 `.onmicrosoft.com`，其余部分作为您的 `租户名称`。
8. 要获取您的 `集合 ID` 和 `子站点 ID`，您需要您的 **SharePoint** `站点名称`。您的 `SharePoint` 站点 URL 的格式为 `https://.sharepoint.com/sites/`。此 URL 的最后部分是 `站点名称`。
9. 要获取站点 `集合 ID`，在浏览器中访问此 URL: `https://.sharepoint.com/sites//_api/site/id` 并复制 `Edm.Guid` 属性的值。
10. 要获取 `子站点 ID`（或网页 ID），请使用: `https://.sharepoint.com/sites//_api/web/id` 并复制 `Edm.Guid` 属性的值。
11. `SharePoint 站点 ID` 的格式如下: `.sharepoint.com,,`。您可以保留该值以便在下一步中使用。
12. 访问 [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) 以获取您的 `文档库 ID`。第一步是确保您已使用与您的 **SharePoint** 站点关联的帐户登录。然后，您需要向 `https://graph.microsoft.com/v1.0/sites//drive` 发出请求，响应将返回一个有效负载，其中包含一个字段 `id`，该字段保存您的 `文档库 ID`。

## 🧑 从 SharePoint 文档库中导入文档的说明

### 🔑 认证

默认情况下，`SharePointLoader` 期望 `CLIENT_ID` 和 `CLIENT_SECRET` 的值必须分别存储为名为 `O365_CLIENT_ID` 和 `O365_CLIENT_SECRET` 的环境变量。您可以通过在应用程序根目录下的 `.env` 文件中传递这些环境变量，或在脚本中使用以下命令。

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

此加载器使用一种称为[*代表用户*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)的身份验证。这是一种需要用户同意的两步身份验证。当您实例化加载器时，它将打印一个URL，用户必须访问该URL以对应用程序所需权限给予同意。然后用户必须访问此URL并对应用程序给予同意。接着用户必须复制结果页面的URL并粘贴回控制台。如果登录尝试成功，该方法将返回True。

```python
<!--IMPORTS:[{"imported": "SharePointLoader", "source": "langchain_community.document_loaders.sharepoint", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sharepoint.SharePointLoader.html", "title": "Microsoft SharePoint"}]-->
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

身份验证完成后，加载器将在`~/.credentials/`文件夹中存储一个令牌（`o365_token.txt`）。此令牌可以在后续的身份验证中使用，而无需进行之前解释的复制/粘贴步骤。要使用此令牌进行身份验证，您需要在加载器的实例化中将`auth_with_token`参数更改为True。

```python
<!--IMPORTS:[{"imported": "SharePointLoader", "source": "langchain_community.document_loaders.sharepoint", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sharepoint.SharePointLoader.html", "title": "Microsoft SharePoint"}]-->
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ 文档加载器

#### 📑 从文档库目录加载文档

`SharePointLoader`可以从文档库中的特定文件夹加载文档。例如，您想要加载存储在文档库中的`Documents/marketing`文件夹中的所有文档。

```python
<!--IMPORTS:[{"imported": "SharePointLoader", "source": "langchain_community.document_loaders.sharepoint", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sharepoint.SharePointLoader.html", "title": "Microsoft SharePoint"}]-->
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

如果您收到错误`未找到该段的资源`，请尝试使用`folder_id`而不是文件夹路径，该ID可以从[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)获取。

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

如果您希望从根目录加载文档，可以省略`folder_id`、`folder_path`和`documents_ids`，加载器将加载根目录。
```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

结合`recursive=True`，您可以简单地从整个SharePoint加载所有文档：
```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 从文档ID列表加载文档

另一种可能性是提供每个要加载的文档的`object_id`列表。为此，您需要查询[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)以查找您感兴趣的所有文档ID。此[链接](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)提供了一系列端点，有助于检索文档ID。

例如，要检索存储在 `data/finance/` 文件夹中的所有对象的信息，您需要向以下地址发出请求：`https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`。一旦您获得了感兴趣的ID列表，就可以使用以下参数实例化加载器。

```python
<!--IMPORTS:[{"imported": "SharePointLoader", "source": "langchain_community.document_loaders.sharepoint", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.sharepoint.SharePointLoader.html", "title": "Microsoft SharePoint"}]-->
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
