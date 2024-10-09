---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/microsoft_onedrive.ipynb
---
# Microsoft OneDrive

>[Microsoft OneDrive](https://en.wikipedia.org/wiki/OneDrive)（前称 `SkyDrive`）是由微软运营的文件托管服务。

本笔记本涵盖如何从 `OneDrive` 加载文档。目前，仅支持 docx、doc 和 pdf 文件。

## 前提条件
1. 按照 [Microsoft 身份平台](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 的说明注册一个应用程序。
2. 注册完成后，Azure 门户将显示应用注册的概述面板。您将看到应用程序（客户端）ID。也称为 `client ID`，此值唯一标识您在 Microsoft 身份平台中的应用程序。
3. 在您将要遵循的 **第 1 项** 步骤中，您可以将重定向 URI 设置为 `http://localhost:8000/callback`。
4. 在您将要遵循的 **第 1 项** 步骤中，在应用程序机密部分生成一个新密码（`client_secret`）。
5. 按照此 [文档](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) 中的说明，将以下 `SCOPES`（`offline_access` 和 `Files.Read.All`）添加到您的应用程序中。
6. 访问 [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) 以获取您的 `OneDrive ID`。第一步是确保您已使用与您的 OneDrive 账户关联的帐户登录。然后，您需要向 `https://graph.microsoft.com/v1.0/me/drive` 发出请求，响应将返回一个有效负载，其中包含一个字段 `id`，该字段保存您的 OneDrive 账户的 ID。
7. 您需要使用命令 `pip install o365` 安装 o365 包。
8. 在步骤结束时，您必须拥有以下值：
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 从 OneDrive 导入文档的说明

### 🔑 认证

默认情况下，`OneDriveLoader` 期望 `CLIENT_ID` 和 `CLIENT_SECRET` 的值必须存储为名为 `O365_CLIENT_ID` 和 `O365_CLIENT_SECRET` 的环境变量。您可以通过在应用程序根目录下使用 `.env` 文件或在脚本中使用以下命令传递这些环境变量。

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

该加载器使用一种称为[*代表用户*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)的身份验证。这是一种需要用户同意的两步身份验证。当您实例化加载器时，它将打印一个URL，用户必须访问该URL以对应用程序所需权限给予同意。然后用户必须访问此URL并对应用程序给予同意。接着，用户必须复制结果页面的URL并粘贴回控制台。如果登录尝试成功，该方法将返回True。


```python
<!--IMPORTS:[{"imported": "OneDriveLoader", "source": "langchain_community.document_loaders.onedrive", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.onedrive.OneDriveLoader.html", "title": "Microsoft OneDrive"}]-->
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

一旦完成身份验证，加载器将在`~/.credentials/`文件夹中存储一个令牌(`o365_token.txt`)。此令牌可以在后续的身份验证中使用，而无需之前解释的复制/粘贴步骤。要使用此令牌进行身份验证，您需要在加载器的实例化中将`auth_with_token`参数更改为True。

```python
<!--IMPORTS:[{"imported": "OneDriveLoader", "source": "langchain_community.document_loaders.onedrive", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.onedrive.OneDriveLoader.html", "title": "Microsoft OneDrive"}]-->
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ 文档加载器

#### 📑 从OneDrive目录加载文档

`OneDriveLoader`可以从您的OneDrive中的特定文件夹加载文档。例如，您想加载存储在OneDrive中的`Documents/clients`文件夹中的所有文档。


```python
<!--IMPORTS:[{"imported": "OneDriveLoader", "source": "langchain_community.document_loaders.onedrive", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.onedrive.OneDriveLoader.html", "title": "Microsoft OneDrive"}]-->
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 从文档ID列表加载文档

另一种可能性是提供每个要加载的文档的`object_id`列表。为此，您需要查询[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)以查找您感兴趣的所有文档ID。此[链接](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources)提供了一系列端点，这些端点将有助于检索文档ID。

例如，要检索存储在文档文件夹根目录下的所有对象的信息，您需要发出请求到：`https://graph.microsoft.com/v1.0/drives/{YOUR DRIVE ID}/root/children`。一旦您获得了感兴趣的ID列表，您就可以使用以下参数实例化加载器。


```python
<!--IMPORTS:[{"imported": "OneDriveLoader", "source": "langchain_community.document_loaders.onedrive", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.onedrive.OneDriveLoader.html", "title": "Microsoft OneDrive"}]-->
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```



## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
