---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/chatgpt_plugins.ipynb
sidebar_class_name: hidden
---
# ChatGPT 插件

:::warning Deprecated

OpenAI 已经[弃用插件](https://openai.com/index/chatgpt-plugins/)。

:::

此示例展示了如何在 LangChain 抽象中使用 ChatGPT 插件。

注意 1：这目前仅适用于没有认证的插件。

注意 2：几乎肯定还有其他方法可以做到这一点，这只是一个初步尝试。如果你有更好的想法，请提交 PR！


```python
%pip install --upgrade --quiet langchain-community
```


```python
<!--IMPORTS:[{"imported": "AIPluginTool", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.plugin.AIPluginTool.html", "title": "ChatGPT Plugins"}]-->
from langchain_community.tools import AIPluginTool
```


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "ChatGPT Plugins"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "ChatGPT Plugins"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "ChatGPT Plugins"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "ChatGPT Plugins"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import ChatOpenAI
```


```python
tool = AIPluginTool.from_plugin_url("https://www.klarna.com/.well-known/ai-plugin.json")
```


```python
llm = ChatOpenAI(temperature=0)
tools = load_tools(["requests_all"])
tools += [tool]

agent_chain = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent_chain.run("what t shirts are available in klarna?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI need to check the Klarna Shopping API to see if it has information on available t shirts.
Action: KlarnaProducts
Action Input: None[0m
Observation: [33;1m[1;3mUsage Guide: Use the Klarna plugin to get relevant product suggestions for any shopping or researching purpose. The query to be sent should not include stopwords like articles, prepositions and determinants. The api works best when searching for words that are related to products, like their name, brand, model or category. Links will always be returned and should be shown to the user.

OpenAPI Spec: {'openapi': '3.0.1', 'info': {'version': 'v0', 'title': 'Open AI Klarna product Api'}, 'servers': [{'url': 'https://www.klarna.com/us/shopping'}], 'tags': [{'name': 'open-ai-product-endpoint', 'description': 'Open AI Product Endpoint. Query for products.'}], 'paths': {'/public/openai/v0/products': {'get': {'tags': ['open-ai-product-endpoint'], 'summary': 'API for fetching Klarna product information', 'operationId': 'productsUsingGET', 'parameters': [{'name': 'q', 'in': 'query', 'description': 'query, must be between 2 and 100 characters', 'required': True, 'schema': {'type': 'string'}}, {'name': 'size', 'in': 'query', 'description': 'number of products returned', 'required': False, 'schema': {'type': 'integer'}}, {'name': 'budget', 'in': 'query', 'description': 'maximum price of the matching product in local currency, filters results', 'required': False, 'schema': {'type': 'integer'}}], 'responses': {'200': {'description': 'Products found', 'content': {'application/json': {'schema': {'$ref': '#/components/schemas/ProductResponse'}}}}, '503': {'description': 'one or more services are unavailable'}}, 'deprecated': False}}}, 'components': {'schemas': {'Product': {'type': 'object', 'properties': {'attributes': {'type': 'array', 'items': {'type': 'string'}}, 'name': {'type': 'string'}, 'price': {'type': 'string'}, 'url': {'type': 'string'}}, 'title': 'Product'}, 'ProductResponse': {'type': 'object', 'properties': {'products': {'type': 'array', 'items': {'$ref': '#/components/schemas/Product'}}}, 'title': 'ProductResponse'}}}}[0m
Thought:[32;1m[1;3mI need to use the Klarna Shopping API to search for t shirts.
Action: requests_get
Action Input: https://www.klarna.com/us/shopping/public/openai/v0/products?q=t%20shirts[0m
Observation: [36;1m[1;3m{"products":[{"name":"Lacoste Men's Pack of Plain T-Shirts","url":"https://www.klarna.com/us/shopping/pl/cl10001/3202043025/Clothing/Lacoste-Men-s-Pack-of-Plain-T-Shirts/?utm_source=openai","price":"$26.60","attributes":["Material:Cotton","Target Group:Man","Color:White,Black"]},{"name":"Hanes Men's Ultimate 6pk. Crewneck T-Shirts","url":"https://www.klarna.com/us/shopping/pl/cl10001/3201808270/Clothing/Hanes-Men-s-Ultimate-6pk.-Crewneck-T-Shirts/?utm_source=openai","price":"$13.82","attributes":["Material:Cotton","Target Group:Man","Color:White"]},{"name":"Nike Boy's Jordan Stretch T-shirts","url":"https://www.klarna.com/us/shopping/pl/cl359/3201863202/Children-s-Clothing/Nike-Boy-s-Jordan-Stretch-T-shirts/?utm_source=openai","price":"$14.99","attributes":["Material:Cotton","Color:White,Green","Model:Boy","Size (Small-Large):S,XL,L,M"]},{"name":"Polo Classic Fit Cotton V-Neck T-Shirts 3-Pack","url":"https://www.klarna.com/us/shopping/pl/cl10001/3203028500/Clothing/Polo-Classic-Fit-Cotton-V-Neck-T-Shirts-3-Pack/?utm_source=openai","price":"$29.95","attributes":["Material:Cotton","Target Group:Man","Color:White,Blue,Black"]},{"name":"adidas Comfort T-shirts Men's 3-pack","url":"https://www.klarna.com/us/shopping/pl/cl10001/3202640533/Clothing/adidas-Comfort-T-shirts-Men-s-3-pack/?utm_source=openai","price":"$14.99","attributes":["Material:Cotton","Target Group:Man","Color:White,Black","Neckline:Round"]}]}[0m
Thought:[32;1m[1;3mThe available t shirts in Klarna are Lacoste Men's Pack of Plain T-Shirts, Hanes Men's Ultimate 6pk. Crewneck T-Shirts, Nike Boy's Jordan Stretch T-shirts, Polo Classic Fit Cotton V-Neck T-Shirts 3-Pack, and adidas Comfort T-shirts Men's 3-pack.
Final Answer: The available t shirts in Klarna are Lacoste Men's Pack of Plain T-Shirts, Hanes Men's Ultimate 6pk. Crewneck T-Shirts, Nike Boy's Jordan Stretch T-shirts, Polo Classic Fit Cotton V-Neck T-Shirts 3-Pack, and adidas Comfort T-shirts Men's 3-pack.[0m

[1m> Finished chain.[0m
```


```output
"The available t shirts in Klarna are Lacoste Men's Pack of Plain T-Shirts, Hanes Men's Ultimate 6pk. Crewneck T-Shirts, Nike Boy's Jordan Stretch T-shirts, Polo Classic Fit Cotton V-Neck T-Shirts 3-Pack, and adidas Comfort T-shirts Men's 3-pack."
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
