---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/graph_mapping.ipynb
sidebar_position: 1
---
# 如何将值映射到图数据库

在本指南中，我们将讨论通过将用户输入的值映射到数据库来改善图数据库查询生成的策略。
使用内置图链时，LLM 知道图模式，但对存储在数据库中的属性值没有任何信息。
因此，我们可以在图数据库 QA 系统中引入一个新步骤，以准确映射值。

## 设置

首先，获取所需的包并设置环境变量：


```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

在本指南中，我们默认使用OpenAI模型，但您可以将其更换为您选择的大模型供应商。


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```
```output
 ········
```
接下来，我们需要定义Neo4j凭据。
请按照[这些安装步骤](https://neo4j.com/docs/operations-manual/current/installation/)设置Neo4j数据库。


```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

下面的示例将创建与Neo4j数据库的连接，并用关于电影及其演员的示例数据填充它。


```python
<!--IMPORTS:[{"imported": "Neo4jGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neo4j_graph.Neo4jGraph.html", "title": "How to map values to a graph database"}]-->
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph()

# Import movie information

movies_query = """
LOAD CSV WITH HEADERS FROM 
'https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/movies/movies_small.csv'
AS row
MERGE (m:Movie {id:row.movieId})
SET m.released = date(row.released),
    m.title = row.title,
    m.imdbRating = toFloat(row.imdbRating)
FOREACH (director in split(row.director, '|') | 
    MERGE (p:Person {name:trim(director)})
    MERGE (p)-[:DIRECTED]->(m))
FOREACH (actor in split(row.actors, '|') | 
    MERGE (p:Person {name:trim(actor)})
    MERGE (p)-[:ACTED_IN]->(m))
FOREACH (genre in split(row.genres, '|') | 
    MERGE (g:Genre {name:trim(genre)})
    MERGE (m)-[:IN_GENRE]->(g))
"""

graph.query(movies_query)
```



```output
[]
```


## 检测用户输入中的实体
我们需要提取要映射到图数据库的实体/值的类型。在这个例子中，我们处理的是电影图，因此我们可以将电影和人物映射到数据库。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to map values to a graph database"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to map values to a graph database"}]-->
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Entities(BaseModel):
    """Identifying information about entities."""

    names: List[str] = Field(
        ...,
        description="All the person or movies appearing in the text",
    )


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are extracting person and movies from the text.",
        ),
        (
            "human",
            "Use the given format to extract information from the following "
            "input: {question}",
        ),
    ]
)


entity_chain = prompt | llm.with_structured_output(Entities)
```

我们可以测试实体提取链。


```python
entities = entity_chain.invoke({"question": "Who played in Casino movie?"})
entities
```



```output
Entities(names=['Casino'])
```


我们将利用一个简单的`CONTAINS`子句将实体匹配到数据库。在实际操作中，您可能希望使用模糊搜索或全文索引以允许轻微的拼写错误。


```python
match_query = """MATCH (p:Person|Movie)
WHERE p.name CONTAINS $value OR p.title CONTAINS $value
RETURN coalesce(p.name, p.title) AS result, labels(p)[0] AS type
LIMIT 1
"""


def map_to_database(entities: Entities) -> Optional[str]:
    result = ""
    for entity in entities.names:
        response = graph.query(match_query, {"value": entity})
        try:
            result += f"{entity} maps to {response[0]['result']} {response[0]['type']} in database\n"
        except IndexError:
            pass
    return result


map_to_database(entities)
```



```output
'Casino maps to Casino Movie in database\n'
```


## 自定义Cypher生成链

我们需要定义一个自定义Cypher提示，该提示将实体映射信息与模式和用户问题结合起来，以构建Cypher语句。
我们将使用LangChain表达式 (LCEL)来完成这个任务。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to map values to a graph database"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to map values to a graph database"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Generate Cypher statement based on natural language input
cypher_template = """Based on the Neo4j graph schema below, write a Cypher query that would answer the user's question:
{schema}
Entities in the question map to the following database values:
{entities_list}
Question: {question}
Cypher query:"""

cypher_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question, convert it to a Cypher query. No pre-amble.",
        ),
        ("human", cypher_template),
    ]
)

cypher_response = (
    RunnablePassthrough.assign(names=entity_chain)
    | RunnablePassthrough.assign(
        entities_list=lambda x: map_to_database(x["names"]),
        schema=lambda _: graph.get_schema,
    )
    | cypher_prompt
    | llm.bind(stop=["\nCypherResult:"])
    | StrOutputParser()
)
```


```python
cypher = cypher_response.invoke({"question": "Who played in Casino movie?"})
cypher
```



```output
'MATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor)\nRETURN actor.name'
```


## 基于数据库结果生成答案

现在我们有了一个生成Cypher语句的链，我们需要对数据库执行该Cypher语句，并将数据库结果发送回大型语言模型以生成最终答案。
同样，我们将使用LCEL。


```python
<!--IMPORTS:[{"imported": "CypherQueryCorrector", "source": "langchain_community.chains.graph_qa.cypher_utils", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher_utils.CypherQueryCorrector.html", "title": "How to map values to a graph database"}, {"imported": "Schema", "source": "langchain_community.chains.graph_qa.cypher_utils", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher_utils.Schema.html", "title": "How to map values to a graph database"}]-->
from langchain_community.chains.graph_qa.cypher_utils import (
    CypherQueryCorrector,
    Schema,
)

# Cypher validation tool for relationship directions
corrector_schema = [
    Schema(el["start"], el["type"], el["end"])
    for el in graph.structured_schema.get("relationships")
]
cypher_validation = CypherQueryCorrector(corrector_schema)

# Generate natural language response based on database results
response_template = """Based on the the question, Cypher query, and Cypher response, write a natural language response:
Question: {question}
Cypher query: {query}
Cypher Response: {response}"""

response_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question and Cypher response, convert it to a natural"
            " language answer. No pre-amble.",
        ),
        ("human", response_template),
    ]
)

chain = (
    RunnablePassthrough.assign(query=cypher_response)
    | RunnablePassthrough.assign(
        response=lambda x: graph.query(cypher_validation(x["query"])),
    )
    | response_prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke({"question": "Who played in Casino movie?"})
```



```output
'Robert De Niro, James Woods, Joe Pesci, and Sharon Stone played in the movie "Casino".'
```

