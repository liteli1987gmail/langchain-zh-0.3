---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/financial_datasets.ipynb
---
# 财务数据工具包

该 [财务数据集](https://financialdatasets.ai/) 股票市场 API 提供 REST 端点，让您获取超过 16,000 个股票代码的财务数据，涵盖 30 多年。

## 设置

要使用此工具包，您需要两个 API 密钥：

`FINANCIAL_DATASETS_API_KEY`: 从 [financialdatasets.ai](https://financialdatasets.ai/) 获取。
`OPENAI_API_KEY`: 从 [OpenAI](https://platform.openai.com/) 获取。


```python
import getpass
import os

os.environ["FINANCIAL_DATASETS_API_KEY"] = getpass.getpass()
```


```python
os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

### 安装

该工具包位于 `langchain-community` 包中。


```python
%pip install -qU langchain-community
```

## 实例化

现在我们可以实例化我们的工具包：


```python
<!--IMPORTS:[{"imported": "FinancialDatasetsToolkit", "source": "langchain_community.agent_toolkits.financial_datasets.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.financial_datasets.toolkit.FinancialDatasetsToolkit.html", "title": "FinancialDatasets Toolkit"}, {"imported": "FinancialDatasetsAPIWrapper", "source": "langchain_community.utilities.financial_datasets", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.financial_datasets.FinancialDatasetsAPIWrapper.html", "title": "FinancialDatasets Toolkit"}]-->
from langchain_community.agent_toolkits.financial_datasets.toolkit import (
    FinancialDatasetsToolkit,
)
from langchain_community.utilities.financial_datasets import FinancialDatasetsAPIWrapper

api_wrapper = FinancialDatasetsAPIWrapper(
    financial_datasets_api_key=os.environ["FINANCIAL_DATASETS_API_KEY"]
)
toolkit = FinancialDatasetsToolkit(api_wrapper=api_wrapper)
```

## 工具

查看可用工具：


```python
tools = toolkit.get_tools()
```

## 在代理中使用

让我们为我们的代理配备 FinancialDatasetsToolkit 并提出财务问题。


```python
system_prompt = """
You are an advanced financial analysis AI assistant equipped with specialized tools
to access and analyze financial data. Your primary function is to help users with
financial analysis by retrieving and interpreting income statements, balance sheets,
and cash flow statements for publicly traded companies.

You have access to the following tools from the FinancialDatasetsToolkit:

1. Balance Sheets: Retrieves balance sheet data for a given ticker symbol.
2. Income Statements: Fetches income statement data for a specified company.
3. Cash Flow Statements: Accesses cash flow statement information for a particular ticker.

Your capabilities include:

1. Retrieving financial statements for any publicly traded company using its ticker symbol.
2. Analyzing financial ratios and metrics based on the data from these statements.
3. Comparing financial performance across different time periods (e.g., year-over-year or quarter-over-quarter).
4. Identifying trends in a company's financial health and performance.
5. Providing insights on a company's liquidity, solvency, profitability, and efficiency.
6. Explaining complex financial concepts in simple terms.

When responding to queries:

1. Always specify which financial statement(s) you're using for your analysis.
2. Provide context for the numbers you're referencing (e.g., fiscal year, quarter).
3. Explain your reasoning and calculations clearly.
4. If you need more information to provide a complete answer, ask for clarification.
5. When appropriate, suggest additional analyses that might be helpful.

Remember, your goal is to provide accurate, insightful financial analysis to
help users make informed decisions. Always maintain a professional and objective tone in your responses.
"""
```

实例化大型语言模型。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "FinancialDatasets Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "FinancialDatasets Toolkit"}]-->
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
```

定义用户查询。


```python
query = "What was AAPL's revenue in 2023? What about it's total debt in Q1 2024?"
```

创建代理。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "FinancialDatasets Toolkit"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "FinancialDatasets Toolkit"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "FinancialDatasets Toolkit"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
        # Placeholders fill up a **list** of messages
        ("placeholder", "{agent_scratchpad}"),
    ]
)


agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

查询代理。


```python
agent_executor.invoke({"input": query})
```

## API 参考

有关所有 `FinancialDatasetsToolkit` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.financial_datasets.toolkit.FinancialDatasetsToolkit.html)。


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
