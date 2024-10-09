---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_drive.ipynb
---
# Google Drive

>[Google Drive](https://en.wikipedia.org/wiki/Google_Drive) 是由 Google 开发的文件存储和同步服务。

本笔记本涵盖如何从 `Google Drive` 加载文档。目前，仅支持 `Google Docs`。

## 前提条件

1. 创建一个 Google Cloud 项目或使用现有项目
1. 启用 [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [为桌面应用授权凭据](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 导入您的 Google Docs 数据的说明
将环境变量 `GOOGLE_APPLICATION_CREDENTIALS` 设置为空字符串 (`""`)。

默认情况下，`GoogleDriveLoader`期望`credentials.json`文件位于`~/.credentials/credentials.json`，但可以使用`credentials_path`关键字参数进行配置。`token.json`也是同样的情况 - 默认路径：`~/.credentials/token.json`，构造函数参数：`token_path`。

第一次使用GoogleDriveLoader时，您将在浏览器中看到用户身份验证的同意屏幕。身份验证后，`token.json`将自动在提供的路径或默认路径下创建。此外，如果该路径下已经存在`token.json`，则不会提示进行身份验证。

`GoogleDriveLoader`可以从一组Google文档ID或文件夹ID加载。您可以从URL中获取您的文件夹和文档ID：

* 文件夹：https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> 文件夹ID是`"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* 文档：https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> 文档ID是`"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`


```python
%pip install --upgrade --quiet langchain-google-community[drive]
```


```python
from langchain_google_community import GoogleDriveLoader
```


```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```


```python
docs = loader.load()
```

当您传递一个 `folder_id` 时，默认会加载所有类型为文档、表格和PDF的文件。您可以通过传递 `file_types` 参数来修改此行为。


```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## 传递可选文件加载器

在处理除 Google 文档和 Google 表格之外的文件时，传递一个可选的文件加载器给 `GoogleDriveLoader` 是很有帮助的。如果您传递一个文件加载器，该文件加载器将用于没有 Google 文档或 Google 表格 MIME 类型的文档。以下是如何使用文件加载器从 Google Drive 加载 Excel 文档的示例。


```python
<!--IMPORTS:[{"imported": "UnstructuredFileIOLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.unstructured.UnstructuredFileIOLoader.html", "title": "Google Drive"}]-->
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```


```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```


```python
docs = loader.load()
```


```python
docs[0]
```

您还可以使用以下模式处理包含混合文件和 Google 文档/表格的文件夹：


```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```


```python
docs = loader.load()
```


```python
docs[0]
```

## 扩展用法
一个外部（非官方）组件可以管理 Google Drive 的复杂性：`langchain-googledrive`
它与 `langchain_community.document_loaders.GoogleDriveLoader` 兼容，并可以替代使用。
以兼容容器，认证使用环境变量 `GOOGLE_ACCOUNT_FILE` 作为凭证文件（用于用户或服务）。

为了与容器兼容，认证使用环境变量 `GOOGLE_ACCOUNT_FILE` 指向凭证文件（用于用户或服务）。


```python
%pip install --upgrade --quiet  langchain-googledrive
```


```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```


```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```


```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

默认情况下，所有具有这些 MIME 类型的文件都可以转换为 `Document`。
- 文本/文本
- 文本/纯文本
- 文本/HTML
- 文本/CSV
- 文本/Markdown
- 图像/PNG
- 图像/JPEG
- 应用程序/EPUB+ZIP
- 应用程序/PDF
- 应用程序/RTF
- application/vnd.google-apps.document (谷歌文档)
- application/vnd.google-apps.presentation (谷歌幻灯片)
- application/vnd.google-apps.spreadsheet (谷歌表格)
- application/vnd.google.colaboratory (Colab笔记本)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

可以更新或自定义此项。请参阅`GDriveLoader`的文档。

但是，必须安装相应的包。


```python
%pip install --upgrade --quiet  unstructured
```


```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 加载授权身份

每个由Google Drive Loader导入的文件的授权身份可以与每个文档的元数据一起加载。


```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

您可以传递 load_auth=True，以将 Google Drive 文档访问身份添加到元数据中。


```python
doc[0].metadata
```

### 加载扩展元数据
以下额外字段也可以在每个文档的元数据中获取：
- full_path - Google Drive 中文件的完整路径。
- owner - 文件的拥有者。
- size - 文件的大小。


```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

您可以传递 load_extended_matadata=True，以将 Google Drive 文档的扩展详细信息添加到元数据中。


```python
doc[0].metadata
```

### 自定义搜索模式

所有参数与 Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) 兼容。
API 可以被设置。

要指定 Google 请求的新模式，可以使用 `PromptTemplate()`。
提示词的变量可以在构造函数中通过 `kwargs` 设置。
提供了一些预格式化的请求（使用 `{query}`、`{folder_id}` 和/或 `{mime_type}`）：

您可以自定义选择文件的标准。提供了一组预定义的过滤器：

| 模板                                   | 描述                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | 从 `folder_id` 返回所有兼容的文件                                    |
| gdrive-query                           | 在所有驱动器中搜索 `query`                                          |
| gdrive-by-name                         | 按名称 `query` 搜索文件                                             |
| gdrive-query-in-folder                 | 在 `folder_id` 中搜索 `query`（如果 `recursive=true`，则包括子文件夹） |
| gdrive-mime-type                       | 搜索特定的 `mime_type`                                         |
| gdrive-mime-type-in-folder             | 在 `folder_id` 中搜索特定的 `mime_type`                          |
| gdrive-query-with-mime-type            | 使用特定的 `mime_type` 搜索 `query`                            |
| gdrive-query-with-mime-type-and-folder | 使用特定的 `mime_type` 和在 `folder_id` 中搜索 `query`         |



```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

您可以自定义您的模式。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts.prompt", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Google Drive"}]-->
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

转换可以以 Markdown 格式管理：
- 项目符号
- 链接
- 表格
- 标题

将属性 `return_link` 设置为 `True` 以导出链接。

#### GSlide 和 GSheet 的模式
参数 mode 接受不同的值：

- "document": 返回每个文档的主体
- "snippets": 返回每个文件的描述（在 Google Drive 文件的元数据中设置）。


参数 `gslide_mode` 接受不同的值：

- "single" : 一个文档带有 &lt;PAGE BREAK&gt;
- "slide" : 每个幻灯片一个文档
- "elements" : 每个元素一个文档。



```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

参数 `gsheet_mode` 接受不同的值：
- `"single"`: 按行生成一个文档
- `"elements"` : 一个包含markdown数组和&lt;PAGE BREAK&gt;标签的文档。


```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 高级用法
所有Google文件在元数据中都有一个'描述'字段。该字段可用于记忆文档的摘要或其他索引标签（参见方法`lazy_update_description_with_summary()`）。

如果您使用`mode="snippet"`，则仅使用描述作为正文。否则，`metadata['summary']`中包含该字段。

有时，可以使用特定过滤器从文件名中提取一些信息，以选择符合特定标准的文件。您可以使用过滤器。

有时，会返回许多文档。并不需要同时将所有文档保存在内存中。您可以使用方法的惰性版本，一次获取一个文档。最好使用复杂查询而不是递归搜索。如果您激活`recursive=True`，则必须对每个文件夹应用查询。


```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
