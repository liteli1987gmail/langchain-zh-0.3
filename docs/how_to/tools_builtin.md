---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_builtin.ipynb
sidebar_position: 4
sidebar_class_name: hidden
---
# 如何使用内置工具和工具包

:::info Prerequisites

本指南假设您熟悉以下概念：

- [LangChain 工具](/docs/concepts/#tools)
- [LangChain 工具包](/docs/concepts/#tools)

:::

## 工具

LangChain 拥有大量第三方工具。请访问 [工具集成](/docs/integrations/tools/) 查看可用工具的列表。

:::important

使用第三方工具时，请确保您了解该工具的工作原理、权限
以及它所拥有的权限。请阅读其文档，并检查是否需要您
从安全角度提供任何信息。有关更多信息，请参见我们的 [安全](https://python.langchain.com/docs/security/) 
指南。

:::

让我们试试[维基百科集成](/docs/integrations/tools/wikipedia/)。


```python
!pip install -qU langchain-community wikipedia
```


```python
<!--IMPORTS:[{"imported": "WikipediaQueryRun", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.wikipedia.tool.WikipediaQueryRun.html", "title": "How to use built-in tools and toolkits"}, {"imported": "WikipediaAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikipedia.WikipediaAPIWrapper.html", "title": "How to use built-in tools and toolkits"}]-->
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)

print(tool.invoke({"query": "langchain"}))
```
```output
Page: LangChain
Summary: LangChain is a framework designed to simplify the creation of applications
```
该工具具有以下默认设置：


```python
print(f"Name: {tool.name}")
print(f"Description: {tool.description}")
print(f"args schema: {tool.args}")
print(f"returns directly?: {tool.return_direct}")
```
```output
Name: wikipedia
Description: A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.
args schema: {'query': {'description': 'query to look up on wikipedia', 'title': 'Query', 'type': 'string'}}
returns directly?: False
```
## 自定义默认工具
我们还可以修改内置的名称、描述和参数的 JSON 模式。

在定义参数的 JSON 模式时，输入必须与函数保持一致，因此不应更改。但您可以轻松为每个输入定义自定义描述。


```python
<!--IMPORTS:[{"imported": "WikipediaQueryRun", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.wikipedia.tool.WikipediaQueryRun.html", "title": "How to use built-in tools and toolkits"}, {"imported": "WikipediaAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikipedia.WikipediaAPIWrapper.html", "title": "How to use built-in tools and toolkits"}]-->
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from pydantic import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )


tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)

print(tool.run("langchain"))
```
```output
Page: LangChain
Summary: LangChain is a framework designed to simplify the creation of applications
```

```python
print(f"Name: {tool.name}")
print(f"Description: {tool.description}")
print(f"args schema: {tool.args}")
print(f"returns directly?: {tool.return_direct}")
```
```output
Name: wiki-tool
Description: look up things in wikipedia
args schema: {'query': {'description': 'query to look up in Wikipedia, should be 3 or less words', 'title': 'Query', 'type': 'string'}}
returns directly?: True
```
## 如何使用内置工具包

工具包是为特定任务设计的工具集合。它们具有方便的加载方法。

所有工具包都暴露一个 `get_tools` 方法，该方法返回工具列表。

您通常应该这样使用它们：

```python
# Initialize a toolkit
toolkit = ExampleTookit(...)

# Get list of tools
tools = toolkit.get_tools()
```
