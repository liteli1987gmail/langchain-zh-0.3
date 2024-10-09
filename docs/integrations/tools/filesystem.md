---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/filesystem.ipynb
---
# 文件系统

LangChain 提供了与本地文件系统交互的工具，开箱即用。本笔记本将介绍其中的一些工具。

**注意：** 这些工具不建议在沙盒环境之外使用！


```python
%pip install -qU langchain-community
```

首先，我们将导入工具。


```python
<!--IMPORTS:[{"imported": "FileManagementToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.file_management.toolkit.FileManagementToolkit.html", "title": "File System"}]-->
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()
```

## 文件管理工具包

如果您想为代理提供所有文件工具，使用工具包很简单。我们将临时目录作为根目录传入，作为大型语言模型的工作空间。

建议始终传入根目录，因为没有根目录，大型语言模型很容易污染工作目录，并且没有根目录就没有任何验证。
直接的提示注入。


```python
toolkit = FileManagementToolkit(
    root_dir=str(working_directory.name)
)  # If you don't provide a root_dir, operations will default to the current working directory
toolkit.get_tools()
```



```output
[CopyFileTool(root_dir='/tmp/tmprdvsw3tg'),
 DeleteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 FileSearchTool(root_dir='/tmp/tmprdvsw3tg'),
 MoveFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```


### 选择文件系统工具

如果您只想选择某些工具，可以在初始化工具包时将它们作为参数传入，或者可以单独初始化所需的工具。


```python
tools = FileManagementToolkit(
    root_dir=str(working_directory.name),
    selected_tools=["read_file", "write_file", "list_directory"],
).get_tools()
tools
```



```output
[ReadFileTool(root_dir='/tmp/tmprdvsw3tg'),
 WriteFileTool(root_dir='/tmp/tmprdvsw3tg'),
 ListDirectoryTool(root_dir='/tmp/tmprdvsw3tg')]
```



```python
read_tool, write_tool, list_tool = tools
write_tool.invoke({"file_path": "example.txt", "text": "Hello World!"})
```



```output
'File written successfully to example.txt.'
```



```python
# List files in the working directory
list_tool.invoke({})
```



```output
'example.txt'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
