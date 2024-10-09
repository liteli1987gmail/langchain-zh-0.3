---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/apache_age.ipynb
---
# Apache AGE

>[Apache AGE](https://age.apache.org/) 是一个 PostgreSQL 扩展，提供图数据库功能。AGE 是 A Graph Extension 的缩写，灵感来源于 Bitnine 对 PostgreSQL 10 的分支 AgensGraph，这是一个多模型数据库。该项目的目标是创建一个可以同时处理关系型和图模型数据的单一存储，以便用户可以使用标准 ANSI SQL 以及图查询语言 openCypher。`Apache AGE` 存储的数据元素是节点、连接它们的边以及节点和边的属性。

>本笔记本展示了如何使用大型语言模型 (LLMs) 提供自然语言接口，以查询可以使用 `Cypher` 查询语言的图数据库。

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) 是一种声明式图查询语言，允许在属性图中进行表达性和高效的数据查询。


## 设置

您需要有一个运行中的 `Postgre` 实例，并安装 AGE 扩展。测试的一个选项是使用官方 AGE Docker 镜像运行 Docker 容器。
您可以通过执行以下脚本来运行本地 Docker 容器：

```
docker run \
    --name age  \
    -p 5432:5432 \
    -e POSTGRES_USER=postgresUser \
    -e POSTGRES_PASSWORD=postgresPW \
    -e POSTGRES_DB=postgresDB \
    -d \
    apache/age
```

关于在docker中运行的附加说明可以在[这里](https://hub.docker.com/r/apache/age)找到。


```python
<!--IMPORTS:[{"imported": "GraphCypherQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher.GraphCypherQAChain.html", "title": "Apache AGE"}, {"imported": "AGEGraph", "source": "langchain_community.graphs.age_graph", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.age_graph.AGEGraph.html", "title": "Apache AGE"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Apache AGE"}]-->
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs.age_graph import AGEGraph
from langchain_openai import ChatOpenAI
```


```python
conf = {
    "database": "postgresDB",
    "user": "postgresUser",
    "password": "postgresPW",
    "host": "localhost",
    "port": 5432,
}

graph = AGEGraph(graph_name="age_test", conf=conf)
```

## 初始化数据库

假设您的数据库是空的，您可以使用Cypher查询语言填充它。以下Cypher语句是幂等的，这意味着如果您运行一次或多次，数据库信息将保持不变。


```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun"})
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

        Node properties are the following:
        [{'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Actor'}, {'properties': [{'property': 'property_a', 'type': 'STRING'}], 'labels': 'LabelA'}, {'properties': [], 'labels': 'LabelB'}, {'properties': [], 'labels': 'LabelC'}, {'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Movie'}]
        Relationship properties are the following:
        [{'properties': [], 'type': 'ACTED_IN'}, {'properties': [{'property': 'rel_prop', 'type': 'STRING'}], 'type': 'REL_TYPE'}]
        The relationships are the following:
        ['(:`Actor`)-[:`ACTED_IN`]->(:`Movie`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelB`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelC`)']
```
## 查询图形

我们现在可以使用图形Cypher QA链来询问图形问题


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```


```python
chain.invoke("Who played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
``````output
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
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
chain.invoke("Who played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}][0m

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
result = chain("Who played in Top Gun?")
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
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}]}]
Final answer: Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.
```
## 返回直接结果
您可以使用 `return_direct` 参数从 Cypher QA Chain 返回直接结果。


```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```


```python
chain.invoke("Who played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': [{'name': 'Tom Cruise'},
  {'name': 'Val Kilmer'},
  {'name': 'Anthony Edwards'},
  {'name': 'Meg Ryan'}]}
```


## 在 Cypher 生成提示中添加示例
您可以定义希望 LLM 为特定问题生成的 Cypher 语句。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts.prompt", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Apache AGE"}]-->
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
MATCH (m:Movie {{title:"Top Gun"}})<-[:ACTED_IN]-()
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
chain.invoke("How many people played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
``````output
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-(:Actor)
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberofactors': 4}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'How many people played in Top Gun?',
 'result': "I don't know the answer."}
```


## 为 Cypher 和答案生成使用不同的 LLM
您可以使用 `cypher_llm` 和 `qa_llm` 参数来定义不同的 LLM


```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```


```python
chain.invoke("Who played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
``````output
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
```


## 忽略指定的节点和关系类型

您可以使用 `include_types` 或 `exclude_types` 来忽略生成 Cypher 语句时图模式的某些部分。


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
Actor {name: STRING},LabelA {property_a: STRING},LabelB {},LabelC {}
Relationship properties are the following:
ACTED_IN {},REL_TYPE {rel_prop: STRING}
The relationships are the following:
(:LabelA)-[:REL_TYPE]->(:LabelB),(:LabelA)-[:REL_TYPE]->(:LabelC)
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
chain.invoke("Who played in Top Gun?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```

