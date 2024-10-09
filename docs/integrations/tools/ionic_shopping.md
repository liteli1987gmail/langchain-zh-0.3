---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/ionic_shopping.ipynb
---
# Ionic 购物工具

[Ionic](https://www.ioniccommerce.com/) 是一个即插即用的电子商务市场，专为 AI 助手设计。通过在您的代理中包含 [Ionic 工具](https://github.com/ioniccommerce/ionic_langchain)，您可以轻松地为用户提供在代理内直接购物和交易的能力，并且您将获得交易的一部分收益。


这是一个基本的 Jupyter Notebook，演示如何将 Ionic 工具集成到您的代理中。有关如何使用 Ionic 设置代理的更多信息，请参阅 Ionic [文档](https://docs.ioniccommerce.com/introduction)。

这个 Jupyter Notebook 演示了如何与代理一起使用 Ionic 工具。

**注意：ionic-langchain 包由 Ionic Commerce 团队维护，而不是 LangChain 维护者。**



---



## Setup


```python
pip install langchain langchain_openai langchainhub
```


```python
pip install ionic-langchain
```

## Setup Agent


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Ionic Shopping Tool"}, {"imported": "Tool", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Ionic Shopping Tool"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Ionic Shopping Tool"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Ionic Shopping Tool"}]-->
from ionic_langchain.tool import Ionic, IonicTool
from langchain import hub
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain_openai import OpenAI

# Based on ReAct Agent
# https://python.langchain.com/docs/modules/agents/agent_types/react
# See the paper "ReAct: Synergizing Reasoning and Acting in Language Models" (https://arxiv.org/abs/2210.03629)
# Please reach out to support@ionicapi.com for help with add'l agent types.

open_ai_key = "YOUR KEY HERE"
model = "gpt-3.5-turbo-instruct"
temperature = 0.6

llm = OpenAI(openai_api_key=open_ai_key, model_name=model, temperature=temperature)


ionic_tool = IonicTool().tool()


# The tool comes with its own prompt,
# but you may also update it directly via the description attribute:

ionic_tool.description = str(
    """
Ionic is an e-commerce shopping tool. Assistant uses the Ionic Commerce Shopping Tool to find, discover, and compare products from thousands of online retailers. Assistant should use the tool when the user is looking for a product recommendation or trying to find a specific product.

The user may specify the number of results, minimum price, and maximum price for which they want to see results.
Ionic Tool input is a comma-separated string of values:
  - query string (required, must not include commas)
  - number of results (default to 4, no more than 10)
  - minimum price in cents ($5 becomes 500)
  - maximum price in cents
For example, if looking for coffee beans between 5 and 10 dollars, the tool input would be `coffee beans, 5, 500, 1000`.

Return them as a markdown formatted list with each recommendation from tool results, being sure to include the full PDP URL. For example:

1. Product 1: [Price] -- link
2. Product 2: [Price] -- link
3. Product 3: [Price] -- link
4. Product 4: [Price] -- link
"""
)

tools = [ionic_tool]

# default prompt for create_react_agent
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(
    llm,
    tools,
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True, max_iterations=5
)
```

## Run


```python
input = (
    "I'm looking for a new 4k monitor can you find me some options for less than $1000"
)
agent_executor.invoke({"input": input})
```


## Related

- Tool [conceptual guide](/docs/concepts/#tools)
- Tool [how-to guides](/docs/how_to/#tools)
