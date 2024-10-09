---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/google_finance.ipynb
---
# Google Finance

本笔记本介绍如何使用 Google Finance 工具从 Google Finance 页面获取信息

要获取 SerpApi 密钥，请注册： https://serpapi.com/users/sign_up。

然后使用以下命令安装 google-search-results：

pip install google-search-results

然后将环境变量 SERPAPI_API_KEY 设置为您的 SerpApi 密钥

或者将密钥作为参数传递给包装器 serp_api_key="您的密钥"

使用该工具


```python
%pip install --upgrade --quiet  google-search-results langchain-community
```


```python
<!--IMPORTS:[{"imported": "GoogleFinanceQueryRun", "source": "langchain_community.tools.google_finance", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.google_finance.tool.GoogleFinanceQueryRun.html", "title": "Google Finance"}, {"imported": "GoogleFinanceAPIWrapper", "source": "langchain_community.utilities.google_finance", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.google_finance.GoogleFinanceAPIWrapper.html", "title": "Google Finance"}]-->
import os

from langchain_community.tools.google_finance import GoogleFinanceQueryRun
from langchain_community.utilities.google_finance import GoogleFinanceAPIWrapper

os.environ["SERPAPI_API_KEY"] = ""
tool = GoogleFinanceQueryRun(api_wrapper=GoogleFinanceAPIWrapper())
```


```python
tool.run("Google")
```

与LangChain一起使用


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Google Finance"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Google Finance"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Google Finance"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Google Finance"}]-->
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["SERP_API_KEY"] = ""
llm = OpenAI()
tools = load_tools(["google-scholar", "google-finance"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("what is google's stock")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
