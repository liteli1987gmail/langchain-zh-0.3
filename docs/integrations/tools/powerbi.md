---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/powerbi.ipynb
---
# PowerBI 工具包

本笔记本展示了一个代理与 `Power BI 数据集` 交互。代理正在回答有关数据集的更一般性问题，并且能够从错误中恢复。

请注意，由于该代理正在积极开发中，所有答案可能并不正确。它运行在 [executequery 端点](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries) 上，该端点不允许删除。

### 注意事项：
- 它依赖于使用 azure.identity 包进行身份验证，可以通过 `pip install azure-identity` 安装。或者，您可以使用字符串形式的令牌创建 Power BI 数据集，而无需提供凭据。
- 您还可以提供一个用户名，以便在启用了 RLS 的数据集上进行模拟使用。
- 该工具包使用大型语言模型（LLM）根据问题创建查询，代理使用 LLM 进行整体执行。
- 测试主要使用 `gpt-3.5-turbo-instruct` 模型，codex 模型似乎表现不佳。

## 初始化


```python
<!--IMPORTS:[{"imported": "PowerBIToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.powerbi.toolkit.PowerBIToolkit.html", "title": "PowerBI Toolkit"}, {"imported": "create_pbi_agent", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.powerbi.base.create_pbi_agent.html", "title": "PowerBI Toolkit"}, {"imported": "PowerBIDataset", "source": "langchain_community.utilities.powerbi", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.powerbi.PowerBIDataset.html", "title": "PowerBI Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "PowerBI Toolkit"}]-->
from azure.identity import DefaultAzureCredential
from langchain_community.agent_toolkits import PowerBIToolkit, create_pbi_agent
from langchain_community.utilities.powerbi import PowerBIDataset
from langchain_openai import ChatOpenAI
```


```python
fast_llm = ChatOpenAI(
    temperature=0.5, max_tokens=1000, model_name="gpt-3.5-turbo", verbose=True
)
smart_llm = ChatOpenAI(temperature=0, max_tokens=100, model_name="gpt-4", verbose=True)

toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
)

agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

## 示例：描述一个表


```python
agent_executor.run("Describe table1")
```

## 示例：对一个表进行简单查询
在这个示例中，代理实际上找出了正确的查询以获取表的行数。


```python
agent_executor.run("How many records are in table1?")
```

## 示例：运行查询


```python
agent_executor.run("How many records are there by dimension1 in table2?")
```


```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## 示例：添加你自己的少量示例提示


```python
# fictional example
few_shots = """
Question: How many rows are in the table revenue?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(revenue_details))
----
Question: How many rows are in the table revenue where year is not empty?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(FILTER(revenue_details, revenue_details[year] <> "")))
----
Question: What was the average of value in revenue in dollars?
DAX: EVALUATE ROW("Average", AVERAGE(revenue_details[dollar_value]))
----
"""
toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
    examples=few_shots,
)
agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```


```python
agent_executor.run("What was the maximum of value in revenue in dollars in 2022?")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
