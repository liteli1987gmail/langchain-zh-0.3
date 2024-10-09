---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/graphql.ipynb
---
# GraphQL

>[GraphQL](https://graphql.org/) 是一种用于API的查询语言，以及执行这些查询以访问数据的运行时。`GraphQL` 提供了API中数据的完整且易于理解的描述，使客户端能够精确请求所需的数据，而不多也不少，便于随着时间的推移演变API，并启用强大的开发者工具。

通过在提供给代理的工具列表中包含 `BaseGraphQLTool`，您可以授予代理从GraphQL API查询数据的能力，以满足您的任何需求。

此Jupyter Notebook演示了如何将 `GraphQLAPIWrapper` 组件与代理一起使用。

在此示例中，我们将使用可在以下端点访问的公共 `Star Wars GraphQL API`：https://swapi-graphql.netlify.app/.netlify/functions/index。

首先，您需要安装 `httpx` 和 `gql` Python包。


```python
pip install httpx gql > /dev/null
```


```python
%pip install --upgrade --quiet  langchain-community
```

现在，让我们创建一个带有指定星球大战API端点的BaseGraphQLTool实例，并用该工具初始化一个代理。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "GraphQL"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "GraphQL"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "GraphQL"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "GraphQL"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["graphql"],
    graphql_endpoint="https://swapi-graphql.netlify.app/.netlify/functions/index",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

现在，我们可以使用代理对星球大战GraphQL API进行查询。让我们请代理列出所有星球大战电影及其上映日期。


```python
graphql_fields = """allFilms {
    films {
      title
      director
      releaseDate
      speciesConnection {
        species {
          name
          classification
          homeworld {
            name
          }
        }
      }
    }
  }

"""

suffix = "Search for the titles of all the stawars films stored in the graphql database that has this schema "


agent.run(suffix + graphql_fields)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to query the graphql database to get the titles of all the star wars films
Action: query_graphql
Action Input: query { allFilms { films { title } } }[0m
Observation: [36;1m[1;3m"{\n  \"allFilms\": {\n    \"films\": [\n      {\n        \"title\": \"A New Hope\"\n      },\n      {\n        \"title\": \"The Empire Strikes Back\"\n      },\n      {\n        \"title\": \"Return of the Jedi\"\n      },\n      {\n        \"title\": \"The Phantom Menace\"\n      },\n      {\n        \"title\": \"Attack of the Clones\"\n      },\n      {\n        \"title\": \"Revenge of the Sith\"\n      }\n    ]\n  }\n}"[0m
Thought:[32;1m[1;3m I now know the titles of all the star wars films
Final Answer: The titles of all the star wars films are: A New Hope, The Empire Strikes Back, Return of the Jedi, The Phantom Menace, Attack of the Clones, and Revenge of the Sith.[0m

[1m> Finished chain.[0m
```


```output
'The titles of all the star wars films are: A New Hope, The Empire Strikes Back, Return of the Jedi, The Phantom Menace, Attack of the Clones, and Revenge of the Sith.'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
