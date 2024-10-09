---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/openapi_nla.ipynb
---
# 自然语言API工具包

`自然语言API`工具包（`NLAToolkits`）允许LangChain代理高效地规划和组合跨端点的调用。

本笔记本演示了`Speak`、`Klarna`和`Spoonacluar` API的示例组合。

### 首先，导入依赖项并加载LLM


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Natural Language API Toolkits"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Natural Language API Toolkits"}, {"imported": "NLAToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.nla.toolkit.NLAToolkit.html", "title": "Natural Language API Toolkits"}, {"imported": "Requests", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.requests.Requests.html", "title": "Natural Language API Toolkits"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Natural Language API Toolkits"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits import NLAToolkit
from langchain_community.utilities import Requests
from langchain_openai import OpenAI
```


```python
# Select the LLM to use. Here, we use gpt-3.5-turbo-instruct
llm = OpenAI(
    temperature=0, max_tokens=700, model_name="gpt-3.5-turbo-instruct"
)  # You can swap between different core LLM's here.
```

### 接下来，加载自然语言API工具包


```python
speak_toolkit = NLAToolkit.from_llm_and_url(llm, "https://api.speak.com/openapi.yaml")
klarna_toolkit = NLAToolkit.from_llm_and_url(
    llm, "https://www.klarna.com/us/shopping/public/openai/v0/api-docs/"
)
```
```output
Attempting to load an OpenAPI 3.0.1 spec.  This may result in degraded performance. Convert your OpenAPI spec to 3.1.* spec for better support.
Attempting to load an OpenAPI 3.0.1 spec.  This may result in degraded performance. Convert your OpenAPI spec to 3.1.* spec for better support.
Attempting to load an OpenAPI 3.0.1 spec.  This may result in degraded performance. Convert your OpenAPI spec to 3.1.* spec for better support.
```
### 创建代理


```python
# Slightly tweak the instructions from the default agent
openapi_format_instructions = """Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: what to instruct the AI Action representative.
Observation: The Agent's response
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer. User can't see any of my observations, API responses, links, or tools.
Final Answer: the final answer to the original input question with the right amount of detail

When responding with your Final Answer, remember that the person you are responding to CANNOT see any of your Thought/Action/Action Input/Observations, so if there is any relevant information there you need to include it explicitly in your response."""
```


```python
natural_language_tools = speak_toolkit.get_tools() + klarna_toolkit.get_tools()
mrkl = initialize_agent(
    natural_language_tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    agent_kwargs={"format_instructions": openapi_format_instructions},
)
```


```python
mrkl.run(
    "I have an end of year party for my Italian class and have to buy some Italian clothes for it"
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out what kind of Italian clothes are available
Action: Open_AI_Klarna_product_Api.productsUsingGET
Action Input: Italian clothes[0m
Observation: [31;1m[1;3mThe API response contains two products from the Alé brand in Italian Blue. The first is the Alé Colour Block Short Sleeve Jersey Men - Italian Blue, which costs $86.49, and the second is the Alé Dolid Flash Jersey Men - Italian Blue, which costs $40.00.[0m
Thought:[32;1m[1;3m I now know what kind of Italian clothes are available and how much they cost.
Final Answer: You can buy two products from the Alé brand in Italian Blue for your end of year party. The Alé Colour Block Short Sleeve Jersey Men - Italian Blue costs $86.49, and the Alé Dolid Flash Jersey Men - Italian Blue costs $40.00.[0m

[1m> Finished chain.[0m
```


```output
'You can buy two products from the Alé brand in Italian Blue for your end of year party. The Alé Colour Block Short Sleeve Jersey Men - Italian Blue costs $86.49, and the Alé Dolid Flash Jersey Men - Italian Blue costs $40.00.'
```


### 使用身份验证并添加更多端点

某些端点可能需要用户通过访问令牌等进行身份验证。这里我们展示如何通过`Requests`包装对象传递身份验证信息。

由于每个NLATool都为其包装的API提供了简洁的自然语言接口，因此顶层对话代理在整合每个端点以满足用户请求时更为轻松。

**添加Spoonacular端点。**

1. 前往[Spoonacular API控制台](https://spoonacular.com/food-api/console#Profile)并创建一个免费账户。
2. 点击`Profile`并复制下面的API密钥。


```python
spoonacular_api_key = ""  # Copy from the API Console
```


```python
requests = Requests(headers={"x-api-key": spoonacular_api_key})
spoonacular_toolkit = NLAToolkit.from_llm_and_url(
    llm,
    "https://spoonacular.com/application/frontend/downloads/spoonacular-openapi-3.json",
    requests=requests,
    max_text_length=1800,  # If you want to truncate the response text
)
```
```output
Attempting to load an OpenAPI 3.0.0 spec.  This may result in degraded performance. Convert your OpenAPI spec to 3.1.* spec for better support.
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Accept. Valid values are ['path', 'query'] Ignoring optional parameter
Unsupported APIPropertyLocation "header" for parameter Content-Type. Valid values are ['path', 'query'] Ignoring optional parameter
```

```python
natural_language_api_tools = (
    speak_toolkit.get_tools()
    + klarna_toolkit.get_tools()
    + spoonacular_toolkit.get_tools()[:30]
)
print(f"{len(natural_language_api_tools)} tools loaded.")
```
```output
34 tools loaded.
```

```python
# Create an agent with the new tools
mrkl = initialize_agent(
    natural_language_api_tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    agent_kwargs={"format_instructions": openapi_format_instructions},
)
```


```python
# Make the query more complex!
user_input = (
    "I'm learning Italian, and my language class is having an end of year party... "
    " Could you help me find an Italian outfit to wear and"
    " an appropriate recipe to prepare so I can present for the class in Italian?"
)
```


```python
mrkl.run(user_input)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find a recipe and an outfit that is Italian-themed.
Action: spoonacular_API.searchRecipes
Action Input: Italian[0m
Observation: [36;1m[1;3mThe API response contains 10 Italian recipes, including Turkey Tomato Cheese Pizza, Broccolini Quinoa Pilaf, Bruschetta Style Pork & Pasta, Salmon Quinoa Risotto, Italian Tuna Pasta, Roasted Brussels Sprouts With Garlic, Asparagus Lemon Risotto, Italian Steamed Artichokes, Crispy Italian Cauliflower Poppers Appetizer, and Pappa Al Pomodoro.[0m
Thought:[32;1m[1;3m I need to find an Italian-themed outfit.
Action: Open_AI_Klarna_product_Api.productsUsingGET
Action Input: Italian[0m
Observation: [31;1m[1;3mI found 10 products related to 'Italian' in the API response. These products include Italian Gold Sparkle Perfectina Necklace - Gold, Italian Design Miami Cuban Link Chain Necklace - Gold, Italian Gold Miami Cuban Link Chain Necklace - Gold, Italian Gold Herringbone Necklace - Gold, Italian Gold Claddagh Ring - Gold, Italian Gold Herringbone Chain Necklace - Gold, Garmin QuickFit 22mm Italian Vacchetta Leather Band, Macy's Italian Horn Charm - Gold, Dolce & Gabbana Light Blue Italian Love Pour Homme EdT 1.7 fl oz.[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: To present for your Italian language class, you could wear an Italian Gold Sparkle Perfectina Necklace - Gold, an Italian Design Miami Cuban Link Chain Necklace - Gold, or an Italian Gold Miami Cuban Link Chain Necklace - Gold. For a recipe, you could make Turkey Tomato Cheese Pizza, Broccolini Quinoa Pilaf, Bruschetta Style Pork & Pasta, Salmon Quinoa Risotto, Italian Tuna Pasta, Roasted Brussels Sprouts With Garlic, Asparagus Lemon Risotto, Italian Steamed Artichokes, Crispy Italian Cauliflower Poppers Appetizer, or Pappa Al Pomodoro.[0m

[1m> Finished chain.[0m
```


```output
'To present for your Italian language class, you could wear an Italian Gold Sparkle Perfectina Necklace - Gold, an Italian Design Miami Cuban Link Chain Necklace - Gold, or an Italian Gold Miami Cuban Link Chain Necklace - Gold. For a recipe, you could make Turkey Tomato Cheese Pizza, Broccolini Quinoa Pilaf, Bruschetta Style Pork & Pasta, Salmon Quinoa Risotto, Italian Tuna Pasta, Roasted Brussels Sprouts With Garlic, Asparagus Lemon Risotto, Italian Steamed Artichokes, Crispy Italian Cauliflower Poppers Appetizer, or Pappa Al Pomodoro.'
```


## 谢谢！


```python
natural_language_api_tools[1].run(
    "Tell the LangChain audience to 'enjoy the meal' in Italian, please!"
)
```



```output
"In Italian, you can say 'Buon appetito' to someone to wish them to enjoy their meal. This phrase is commonly used in Italy when someone is about to eat, often at the beginning of a meal. It's similar to saying 'Bon appétit' in French or 'Guten Appetit' in German."
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
