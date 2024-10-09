---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/box.ipynb
sidebar_label: Box
---
# BoxRetriever

这将帮助您开始使用 Box [检索器](/docs/concepts/#retrievers)。有关所有 BoxRetriever 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/box/retrievers/langchain_box.retrievers.box.BoxRetriever.html)。

# 概述

`BoxRetriever` 类帮助您以 Langchain 的 `Document` 格式从 Box 获取非结构化内容。您可以通过基于全文搜索查找文件或使用 Box AI 检索包含针对文件的 AI 查询结果的 `Document`。这需要包含一个 `List[str]`，其中包含 Box 文件 ID，即 `[

:::info
Box AI 需要企业增强版许可证
:::

没有文本表示的文件将被跳过。

### 集成细节

1: 自带数据（即，索引和搜索自定义文档语料库）：

| 检索器 | 自托管 | 云服务 | 包名 |
| :--- | :--- | :---: | :---: |
[BoxRetriever](https://python.langchain.com/api_reference/box/retrievers/langchain_box.retrievers.box.BoxRetriever.html) | ❌ | ✅ | langchain-box |

## 设置

要使用 Box 包，您需要一些东西：

* 一个 Box 账户 — 如果您不是当前的 Box 客户或想在生产 Box 实例之外进行测试，您可以使用一个 [免费开发者账户](https://account.box.com/signup/n/developer#ty9l3)。
* [一个 Box 应用](https://developer.box.com/guides/getting-started/first-application/) — 这在 [开发者控制台](https://account.box.com/developers/console) 中配置，对于 Box AI，必须启用 `Manage AI` 范围。在这里，您还将选择您的认证方法。
* 应用必须由 [管理员启用](https://developer.box.com/guides/authorization/custom-app-approval/#manual-approval)。对于免费开发者账户，这就是注册账户的人。

### 凭证

在这些示例中，我们将使用 [令牌认证](https://developer.box.com/guides/authentication/tokens/developer-tokens)。这可以与任何 [认证方法](https://developer.box.com/guides/authentication/) 一起使用。只需使用任何方法获取令牌。如果您想了解如何使用其他认证类型与 `langchain-box`，请访问 [Box 大模型供应商](/docs/integrations/providers/box) 文档。


```python
import getpass
import os

box_developer_token = getpass.getpass("Enter your Box Developer Token: ")
```
```output
Enter your Box Developer Token:  ········
```
如果您想从单个查询中获取自动追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

该检索器位于 `langchain-box` 包中：


```python
%pip install -qU langchain-box
```

## 实例化

现在我们可以实例化我们的检索器：

## 搜索


```python
<!--IMPORTS:[{"imported": "BoxRetriever", "source": "langchain_box", "docs": "https://python.langchain.com/api_reference/box/retrievers/langchain_box.retrievers.box.BoxRetriever.html", "title": "BoxRetriever"}]-->
from langchain_box import BoxRetriever

retriever = BoxRetriever(box_developer_token=box_developer_token)
```

为了更细粒度的搜索，我们提供了一系列选项来帮助您过滤结果。这使用 `langchain_box.utilities.SearchOptions` 结合 `langchain_box.utilities.SearchTypeFilter` 和 `langchain_box.utilities.DocumentFiles` 枚举来过滤创建日期、搜索文件的哪个部分，甚至限制搜索范围到特定文件夹。

有关更多信息，请查看 [API 参考](https://python.langchain.com/v0.2/api_reference/box/utilities/langchain_box.utilities.box.SearchOptions.html)。


```python
<!--IMPORTS:[{"imported": "BoxSearchOptions", "source": "langchain_box.utilities", "docs": "https://python.langchain.com/api_reference/box/utilities/langchain_box.utilities.box.BoxSearchOptions.html", "title": "BoxRetriever"}, {"imported": "DocumentFiles", "source": "langchain_box.utilities", "docs": "https://python.langchain.com/api_reference/box/utilities/langchain_box.utilities.box.DocumentFiles.html", "title": "BoxRetriever"}, {"imported": "SearchTypeFilter", "source": "langchain_box.utilities", "docs": "https://python.langchain.com/api_reference/box/utilities/langchain_box.utilities.box.SearchTypeFilter.html", "title": "BoxRetriever"}]-->
from langchain_box.utilities import BoxSearchOptions, DocumentFiles, SearchTypeFilter

box_folder_id = "260931903795"

box_search_options = BoxSearchOptions(
    ancestor_folder_ids=[box_folder_id],
    search_type_filter=[SearchTypeFilter.FILE_CONTENT],
    created_date_range=["2023-01-01T00:00:00-07:00", "2024-08-01T00:00:00-07:00,"],
    k=200,
    size_range=[1, 1000000],
    updated_data_range=None,
)

retriever = BoxRetriever(
    box_developer_token=box_developer_token, box_search_options=box_search_options
)

retriever.invoke("AstroTech Solutions")
```



```output
[Document(metadata={'source': 'https://dl.boxcloud.com/api/2.0/internal_files/1514555423624/versions/1663171610024/representations/extracted_text/content/', 'title': 'Invoice-A5555_txt'}, page_content='Vendor: AstroTech Solutions\nInvoice Number: A5555\n\nLine Items:\n    - Gravitational Wave Detector Kit: $800\n    - Exoplanet Terrarium: $120\nTotal: $920')]
```


## Box AI


```python
<!--IMPORTS:[{"imported": "BoxRetriever", "source": "langchain_box", "docs": "https://python.langchain.com/api_reference/box/retrievers/langchain_box.retrievers.box.BoxRetriever.html", "title": "BoxRetriever"}]-->
from langchain_box import BoxRetriever

box_file_ids = ["1514555423624", "1514553902288"]

retriever = BoxRetriever(
    box_developer_token=box_developer_token, box_file_ids=box_file_ids
)
```

## 用法


```python
query = "What was the most expensive item purchased"

retriever.invoke(query)
```



```output
[Document(metadata={'source': 'Box AI', 'title': 'Box AI What was the most expensive item purchased'}, page_content='The most expensive item purchased was the **Gravitational Wave Detector Kit** from AstroTech Solutions, which cost $800.')]
```


## 在链中使用

与其他检索器一样，BoxRetriever 可以通过 [链](/docs/how_to/sequence/) 集成到 LLM 应用中。

我们需要一个大型语言模型或聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
openai_key = getpass.getpass("Enter your OpenAI key: ")
```
```output
Enter your OpenAI key:  ········
```

```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "BoxRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "BoxRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "BoxRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

box_search_options = BoxSearchOptions(
    ancestor_folder_ids=[box_folder_id],
    search_type_filter=[SearchTypeFilter.FILE_CONTENT],
    created_date_range=["2023-01-01T00:00:00-07:00", "2024-08-01T00:00:00-07:00,"],
    k=200,
    size_range=[1, 1000000],
    updated_data_range=None,
)

retriever = BoxRetriever(
    box_developer_token=box_developer_token, box_search_options=box_search_options
)

context = "You are a finance professional that handles invoices and purchase orders."
question = "Show me all the items purchased from AstroTech Solutions"

prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

    Context: {context}

    Question: {question}"""
)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke(question)
```



```output
'- Gravitational Wave Detector Kit: $800\n- Exoplanet Terrarium: $120'
```


## 作为代理工具使用

与其他检索器一样，BoxRetriever 也可以作为工具添加到 LangGraph 代理中。


```python
pip install -U langsmith
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "BoxRetriever"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "BoxRetriever"}, {"imported": "create_retriever_tool", "source": "langchain.tools.retriever", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.retriever.create_retriever_tool.html", "title": "BoxRetriever"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools.retriever import create_retriever_tool
```


```python
box_search_options = BoxSearchOptions(
    ancestor_folder_ids=[box_folder_id],
    search_type_filter=[SearchTypeFilter.FILE_CONTENT],
    created_date_range=["2023-01-01T00:00:00-07:00", "2024-08-01T00:00:00-07:00,"],
    k=200,
    size_range=[1, 1000000],
    updated_data_range=None,
)

retriever = BoxRetriever(
    box_developer_token=box_developer_token, box_search_options=box_search_options
)

box_search_tool = create_retriever_tool(
    retriever,
    "box_search_tool",
    "This tool is used to search Box and retrieve documents that match the search criteria",
)
tools = [box_search_tool]
```


```python
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.messages

llm = ChatOpenAI(temperature=0, openai_api_key=openai_key)

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```
```output
/Users/shurrey/local/langchain/.venv/lib/python3.11/site-packages/langsmith/client.py:312: LangSmithMissingAPIKeyWarning: API key must be provided when using hosted LangSmith API
  warnings.warn(
```

```python
result = agent_executor.invoke(
    {
        "input": "list the items I purchased from AstroTech Solutions from most expensive to least expensive"
    }
)
```


```python
print(f"result {result['output']}")
```
```output
result The items you purchased from AstroTech Solutions from most expensive to least expensive are:

1. Gravitational Wave Detector Kit: $800
2. Exoplanet Terrarium: $120

Total: $920
```
## API 参考

有关 BoxRetriever 所有功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/box/retrievers/langchain_box.retrievers.box.BoxRetriever.html)。


## 帮助

如果您有问题，可以查看我们的 [开发者文档](https://developer.box.com) 或在我们的 [开发者社区](https://community.box.com) 中与我们联系。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
