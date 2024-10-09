---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/google_drive.ipynb
---
# Google Drive

本笔记本演示如何将LangChain连接到`Google Drive API`。

## 前提条件

1. 创建一个Google Cloud项目或使用现有项目
1. 启用[Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [为桌面应用授权凭据](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 检索您的Google Docs数据的说明
默认情况下，`GoogleDriveTools`和`GoogleDriveWrapper`期望`credentials.json`文件位于`~/.credentials/credentials.json`，但可以使用`GOOGLE_ACCOUNT_FILE`环境变量进行配置。
`token.json`的位置使用相同的目录（或使用参数`token_path`）。请注意，`token.json`将在您第一次使用该工具时自动创建。

`GoogleDriveSearchTool` 可以根据一些请求检索一部分文件。

默认情况下，如果您使用 `folder_id`，则可以将该文件夹内的所有文件检索到 `Document`，前提是名称与查询匹配。



```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib langchain-community
```

您可以从URL中获取您的文件夹和文档ID：

* 文件夹: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> 文件夹ID是`"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* 文档: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> 文档ID是`"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

特殊值`root`是指您的个人主页。


```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

默认情况下，所有具有这些mime类型的文件都可以转换为`文档`。
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (谷歌文档)
- application/vnd.google-apps.presentation (谷歌幻灯片)
- application/vnd.google-apps.spreadsheet (谷歌表格)
- application/vnd.google.colaboratory (Colab笔记本)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

可以更新或自定义此项。请参阅 `GoogleDriveAPIWrapper` 的文档。

但是，必须安装相应的包。


```python
%pip install --upgrade --quiet  unstructured
```


```python
from langchain_googledrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```


```python
import logging

logging.basicConfig(level=logging.INFO)
```


```python
tool.run("machine learning")
```


```python
tool.description
```


```python
<!--IMPORTS:[{"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Google Drive"}]-->
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## 在代理中使用


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Google Drive"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Google Drive"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Google Drive"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```


```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
