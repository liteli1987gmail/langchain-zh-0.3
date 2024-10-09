---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/neo4j_cypher.ipynb
---
# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/) 是由 `Neo4j, Inc` 开发的图数据库管理系统。

>`Neo4j` 存储的数据元素是节点、连接它们的边以及节点和边的属性。其开发者将其描述为一个符合 ACID 的事务数据库，具有原生图存储和处理功能，`Neo4j` 提供非开源的“社区版”，其许可证为 GNU 通用公共许可证的修改版，并且在线备份和高可用性扩展在闭源商业许可证下授权。Neo 还以闭源商业条款授权这些扩展的 `Neo4j`。

>本笔记本展示了如何使用大型语言模型 (LLMs) 为图数据库提供自然语言接口，您可以使用 `Cypher` 查询语言进行查询。

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) 是一种声明式图查询语言，允许在属性图中进行表达性和高效的数据查询。


## 设置

您需要有一个正在运行的 `Neo4j` 实例。一个选项是在他们的 Aura 云服务中创建一个 [免费的 Neo4j 数据库实例](https://neo4j.com/cloud/platform/aura-graph-database/)。您也可以使用 [Neo4j Desktop 应用程序](https://neo4j.com/download/) 在本地运行数据库，或者运行一个 docker 容器。
您可以通过执行以下脚本来运行本地 docker 容器：

```
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

如果您正在使用docker容器，您需要等待几秒钟以便数据库启动。


```python
<!--IMPORTS:[{"imported": "GraphCypherQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher.GraphCypherQAChain.html", "title": "Neo4j"}, {"imported": "Neo4jGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neo4j_graph.Neo4jGraph.html", "title": "Neo4j"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Neo4j"}]-->
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```


```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## 填充数据库

假设您的数据库是空的，您可以使用Cypher查询语言填充它。以下Cypher语句是幂等的，这意味着如果您运行一次或多次，数据库信息将保持不变。


```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun", runtime: 120})
WITH m
UNWIND ["Tom Cruise", "Val Kilmer", "Anthony Edwards", "Meg Ryan"] AS actor
MERGE (a:Actor {name:actor})
MERGE (a)-[:ACTED_IN]->(m)
"""
)
```



```output
[]
```


## 刷新图形模式信息
如果数据库的模式发生变化，您可以刷新生成Cypher语句所需的模式信息。


```python
graph.refresh_schema()
```


```python
print(graph.schema)
```
```output
Node properties:
Movie {runtime: INTEGER, name: STRING}
Actor {name: STRING}
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```
## 增强的模式信息
选择增强的模式版本使系统能够自动扫描数据库中的示例值并计算一些分布指标。例如，如果节点属性具有少于10个不同的值，我们将返回模式中的所有可能值。否则，每个节点和关系属性仅返回一个示例值。


```python
enhanced_graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    enhanced_schema=True,
)
print(enhanced_graph.schema)
```
```output
Node properties:
- **Movie**
  - `runtime`: INTEGER Min: 120, Max: 120
  - `name`: STRING Available options: ['Top Gun']
- **Actor**
  - `name`: STRING Available options: ['Tom Cruise', 'Val Kilmer', 'Anthony Edwards', 'Meg Ryan']
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```
## 查询图形

我们现在可以使用图形Cypher QA链来询问图形的问题


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```


```python
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
```


## 限制结果数量
您可以使用 `top_k` 参数限制 Cypher QA Chain 的结果数量。
默认值为 10。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```


```python
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer played in Top Gun.'}
```


## 返回中间结果
您可以使用 `return_intermediate_steps` 参数从 Cypher QA Chain 返回中间步骤。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```


```python
result = chain.invoke({"query": "Who played in Top Gun?"})
print(f"Intermediate steps: {result['intermediate_steps']}")
print(f"Final answer: {result['result']}")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}]}]
Final answer: Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.
```
## 返回直接结果
您可以使用 `return_direct` 参数从 Cypher QA Chain 返回直接结果。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```


```python
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': [{'a.name': 'Tom Cruise'},
  {'a.name': 'Val Kilmer'},
  {'a.name': 'Anthony Edwards'},
  {'a.name': 'Meg Ryan'}]}
```


## 在 Cypher 生成提示中添加示例
您可以定义希望 LLM 为特定问题生成的 Cypher 语句。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts.prompt", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Neo4j"}]-->
from langchain_core.prompts.prompt import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Examples: Here are a few examples of generated Cypher statements for particular questions:
# How many people played in Top Gun?
MATCH (m:Movie {{name:"Top Gun"}})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors

The question is:
{question}"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    graph=graph,
    verbose=True,
    cypher_prompt=CYPHER_GENERATION_PROMPT,
)
```


```python
chain.invoke({"query": "How many people played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (m:Movie {name:"Top Gun"})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberOfActors': 4}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'How many people played in Top Gun?',
 'result': 'There were 4 actors in Top Gun.'}
```


## 为 Cypher 和答案生成使用不同的 LLM
您可以使用 `cypher_llm` 和 `qa_llm` 参数定义不同的 LLM。


```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```


```python
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
```


## 忽略指定的节点和关系类型

您可以使用 `include_types` 或 `exclude_types` 在生成 Cypher 语句时忽略图模式的部分。


```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
    exclude_types=["Movie"],
)
```


```python
# Inspect graph schema
print(chain.graph_schema)
```
```output
Node properties are the following:
Actor {name: STRING}
Relationship properties are the following:

The relationships are the following:
```
## 验证生成的 Cypher 语句
您可以使用 `validate_cypher` 参数来验证和纠正生成的 Cypher 语句中的关系方向。


```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```


```python
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
```


## 将数据库结果作为工具/函数输出提供上下文

您可以使用 `use_function_response` 参数将数据库结果的上下文作为工具/函数输出传递给大型语言模型 (LLM)。这种方法提高了响应的准确性和相关性，因为 LLM 更加紧密地遵循提供的上下文。
_您需要使用支持原生函数调用的 LLM 才能使用此功能_。


```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    use_function_response=True,
)
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'The main actors in Top Gun are Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan.'}
```


您可以通过提供 `function_response_system` 来提供自定义系统消息，以指导模型如何生成答案。

_请注意，在使用 `use_function_response` 时，`qa_prompt` 将无效_


```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    use_function_response=True,
    function_response_system="Respond as a pirate!",
)
chain.invoke({"query": "Who played in Top Gun?"})
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Tom Cruise'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': "Arrr matey! In the film Top Gun, ye be seein' Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan sailin' the high seas of the sky! Aye, they be a fine crew of actors, they be!"}
```

