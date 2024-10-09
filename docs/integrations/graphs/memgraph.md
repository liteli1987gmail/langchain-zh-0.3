---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/memgraph.ipynb
---
# Memgraph

>[Memgraph](https://github.com/memgraph/memgraph) 是一个开源图数据库，兼容 `Neo4j`。
>该数据库使用 `Cypher` 图查询语言，
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) 是一种声明式图查询语言，允许在属性图中进行表达性和高效的数据查询。

本笔记本展示了如何使用大型语言模型（LLMs）为 [Memgraph](https://github.com/memgraph/memgraph) 数据库提供自然语言接口。


## 设置

要完成本教程，您需要安装 [Docker](https://www.docker.com/get-started/) 和 [Python 3.x](https://www.python.org/)。

确保您有一个正在运行的 Memgraph 实例。要快速首次运行 Memgraph 平台（Memgraph 数据库 + MAGE 库 + Memgraph Lab），请执行以下操作：

在 Linux/MacOS 上：
```
curl https://install.memgraph.com | sh
```

在Windows上：
```
iwr https://windows.memgraph.com | iex
```

这两个命令运行一个脚本，该脚本将Docker Compose文件下载到您的系统，并在两个单独的容器中构建和启动`memgraph-mage`和`memgraph-lab` Docker服务。

有关安装过程的更多信息，请参阅[Memgraph文档](https://memgraph.com/docs/getting-started/install-memgraph)。

现在您可以开始使用`Memgraph`了！

首先安装并导入所有必要的包。我们将使用名为[pip](https://pip.pypa.io/en/stable/installation/)的包管理器，并使用`--user`标志，以确保正确的权限。如果您安装了Python 3.4或更高版本，pip默认包含在内。您可以使用以下命令安装所有所需的包：


```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

您可以在此笔记本中运行提供的代码块，或使用单独的Python文件来尝试Memgraph和LangChain。


```python
<!--IMPORTS:[{"imported": "GraphCypherQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher.GraphCypherQAChain.html", "title": "Memgraph"}, {"imported": "MemgraphGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.memgraph_graph.MemgraphGraph.html", "title": "Memgraph"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Memgraph"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Memgraph"}]-->
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

我们正在使用Python库[GQLAlchemy](https://github.com/memgraph/gqlalchemy)在Memgraph数据库和Python脚本之间建立连接。您也可以使用Neo4j驱动程序与正在运行的Memgraph实例建立连接，因为它与Memgraph兼容。要使用GQLAlchemy执行查询，我们可以按如下方式设置Memgraph实例：


```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## 填充数据库
您可以轻松地使用Cypher查询语言填充您的新空数据库。如果您还不完全理解每一行，也不用担心，您可以从文档[这里](https://memgraph.com/docs/cypher-manual/)学习Cypher。运行以下脚本将在数据库上执行种子查询，提供有关视频游戏的数据，包括发布者、可用平台和类型等详细信息。这些数据将作为我们工作的基础。


```python
# Creating and executing the seeding query
query = """
    MERGE (g:Game {name: "Baldur's Gate 3"})
    WITH g, ["PlayStation 5", "Mac OS", "Windows", "Xbox Series X/S"] AS platforms,
            ["Adventure", "Role-Playing Game", "Strategy"] AS genres
    FOREACH (platform IN platforms |
        MERGE (p:Platform {name: platform})
        MERGE (g)-[:AVAILABLE_ON]->(p)
    )
    FOREACH (genre IN genres |
        MERGE (gn:Genre {name: genre})
        MERGE (g)-[:HAS_GENRE]->(gn)
    )
    MERGE (p:Publisher {name: "Larian Studios"})
    MERGE (g)-[:PUBLISHED_BY]->(p);
"""

memgraph.execute(query)
```

## 刷新图形模式

您已准备好使用以下脚本实例化 Memgraph-LangChain 图。此接口将允许我们使用 LangChain 查询数据库，自动创建生成 Cypher 查询所需的图模式。


```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

如有必要，您可以手动刷新图模式，如下所示。


```python
graph.refresh_schema()
```

为了熟悉数据并验证更新的图模式，您可以使用以下语句打印它。


```python
print(graph.schema)
```

```
Node properties are the following:
Node name: 'Game', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Platform', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Genre', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Publisher', Node properties: [{'property': 'name', 'type': 'str'}]

Relationship properties are the following:

The relationships are the following:
['(:Game)-[:AVAILABLE_ON]->(:Platform)']
['(:Game)-[:HAS_GENRE]->(:Genre)']
['(:Game)-[:PUBLISHED_BY]->(:Publisher)']
```

## 查询数据库

要与 OpenAI API 交互，您必须使用 Python [os](https://docs.python.org/3/library/os.html) 包将您的 API 密钥配置为环境变量。这确保了请求的正确授权。您可以在 [这里](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) 找到有关获取 API 密钥的更多信息。


```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

您应该使用以下脚本创建图链，该脚本将在基于您的图数据的问题回答过程中使用。虽然默认使用 GPT-3.5-turbo，但您也可以考虑尝试其他模型，如 [GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4)，以显著改善 Cypher 查询和结果。我们将使用您之前配置的 OpenAI 聊天密钥。我们将温度设置为零，以确保可预测和一致的答案。此外，我们将使用我们的 Memgraph-LangChain 图，并将详细参数设置为 True（默认值为 False），以接收有关查询生成的更详细消息。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

现在您可以开始提问了！


```python
response = chain.run("Which platforms is Baldur's Gate 3 available on?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform)
RETURN p.name
Full Context:
[{'p.name': 'PlayStation 5'}, {'p.name': 'Mac OS'}, {'p.name': 'Windows'}, {'p.name': 'Xbox Series X/S'}]

> Finished chain.
Baldur's Gate 3 is available on PlayStation 5, Mac OS, Windows, and Xbox Series X/S.
```


```python
response = chain.run("Is Baldur's Gate 3 available on Windows?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(:Platform {name: 'Windows'})
RETURN true
Full Context:
[{'true': True}]

> Finished chain.
Yes, Baldur's Gate 3 is available on Windows.
```

## 链修改器

要修改链的行为并获取更多上下文或附加信息，您可以修改链的参数。

#### 返回直接查询结果
`return_direct` 修饰符指定是否返回执行的 Cypher 查询的直接结果或处理后的自然语言响应。


```python
# Return the result of querying the graph directly
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```


```python
response = chain.run("Which studio published Baldur's Gate 3?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:PUBLISHED_BY]->(p:Publisher)
RETURN p.name

> Finished chain.
[{'p.name': 'Larian Studios'}]
```

#### 返回查询中间步骤
`return_intermediate_steps` 链修饰符通过在初始查询结果之外包含查询的中间步骤来增强返回的响应。


```python
# Return all the intermediate steps of query execution
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```


```python
response = chain("Is Baldur's Gate 3 an Adventure game?")
print(f"Intermediate steps: {response['intermediate_steps']}")
print(f"Final response: {response['result']}")
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})
RETURN g, genre
Full Context:
[{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]

> Finished chain.
Intermediate steps: [{'query': "MATCH (g:Game {name: 'Baldur\\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})\nRETURN g, genre"}, {'context': [{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]}]
Final response: Yes, Baldur's Gate 3 is an Adventure game.
```

#### 限制查询结果的数量
`top_k` 修饰符可用于限制查询结果的最大数量。


```python
# Limit the maximum number of results returned by query
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```


```python
response = chain.run("What genres are associated with Baldur's Gate 3?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(g:Genre)
RETURN g.name
Full Context:
[{'g.name': 'Adventure'}, {'g.name': 'Role-Playing Game'}]

> Finished chain.
Baldur's Gate 3 is associated with the genres Adventure and Role-Playing Game.
```

# 高级查询

随着解决方案复杂性的增加，您可能会遇到需要仔细处理的不同用例。确保您应用程序的可扩展性对于保持顺畅的用户流程至关重要，而不会出现任何问题。

让我们再次实例化我们的链，并尝试询问一些用户可能会问的问题。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```


```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PS5'})
RETURN g.name, p.name
Full Context:
[]

> Finished chain.
I'm sorry, but I don't have the information to answer your question.
```

生成的 Cypher 查询看起来不错，但我们没有收到任何信息作为响应。这说明了在使用大型语言模型时常见的挑战——用户提问的方式与数据存储方式之间的错位。在这种情况下，用户的感知与实际数据存储之间的差异可能导致不匹配。提示词优化，即精炼模型的提示词以更好地理解这些差异的过程，是解决此问题的有效方案。通过提示词优化，模型在生成精确和相关的查询方面获得了更高的能力，从而成功检索所需的数据。

### 提示词优化

为了解决这个问题，我们可以调整QA链的初始Cypher提示。这涉及到为大型语言模型提供指导，说明用户如何引用特定平台，例如在我们的案例中提到的PS5。我们使用LangChain [提示词模板](/docs/how_to#prompt-templates)来实现这一点，创建一个修改过的初始提示。然后将这个修改后的提示作为参数提供给我们优化后的Memgraph-LangChain实例。


```python
CYPHER_GENERATION_TEMPLATE = """
Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
If the user asks about PS5, Play Station 5 or PS 5, that is the platform called PlayStation 5.

The question is:
{question}
"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)
```


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    cypher_prompt=CYPHER_GENERATION_PROMPT,
    graph=graph,
    verbose=True,
    model_name="gpt-3.5-turbo",
)
```


```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PlayStation 5'})
RETURN g.name, p.name
Full Context:
[{'g.name': "Baldur's Gate 3", 'p.name': 'PlayStation 5'}]

> Finished chain.
Yes, Baldur's Gate 3 is available on PlayStation 5.
```

现在，随着修订后的初始Cypher提示，其中包含有关平台命名的指导，我们获得了更准确和相关的结果，这些结果与用户查询更紧密地对齐。

这种方法允许进一步改善您的QA链。您可以轻松地将额外的提示优化数据集成到您的链中，从而增强您应用程序的整体用户体验。
