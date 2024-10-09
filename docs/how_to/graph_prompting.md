---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/graph_prompting.ipynb
sidebar_position: 2
---
# 如何最佳提示 Graph-RAG

在本指南中，我们将讨论提示策略，以改善图数据库查询生成。我们将主要关注获取与数据库相关的信息的方法。

## 设置

首先，获取所需的包并设置环境变量：


```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```
```output
Note: you may need to restart the kernel to use updated packages.
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
<!--IMPORTS:[{"imported": "Neo4jGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neo4j_graph.Neo4jGraph.html", "title": "How to best prompt for Graph-RAG"}]-->
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


# 过滤图模式

有时，您可能需要在生成Cypher语句时专注于图模式的特定子集。
假设我们正在处理以下图模式：


```python
graph.refresh_schema()
print(graph.schema)
```
```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```
假设我们想要从传递给大型语言模型的模式表示中排除_Genre_节点。
我们可以使用GraphCypherQAChain链的`exclude`参数来实现这一点。


```python
<!--IMPORTS:[{"imported": "GraphCypherQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher.GraphCypherQAChain.html", "title": "How to best prompt for Graph-RAG"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to best prompt for Graph-RAG"}]-->
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, exclude_types=["Genre"], verbose=True
)
```


```python
print(chain.graph_schema)
```
```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```
## 少量示例

在提示中包含自然语言问题转换为有效Cypher查询的示例，通常会提高模型性能，尤其是对于复杂查询。

假设我们有以下示例：


```python
examples = [
    {
        "question": "How many artists are there?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)",
    },
    {
        "question": "Which actors played in the movie Casino?",
        "query": "MATCH (m:Movie {{title: 'Casino'}})<-[:ACTED_IN]-(a) RETURN a.name",
    },
    {
        "question": "How many movies has Tom Hanks acted in?",
        "query": "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
    },
    {
        "question": "List all the genres of the movie Schindler's List",
        "query": "MATCH (m:Movie {{title: 'Schindler\\'s List'}})-[:IN_GENRE]->(g:Genre) RETURN g.name",
    },
    {
        "question": "Which actors have worked in movies from both the comedy and action genres?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
    },
    {
        "question": "Which directors have made movies with at least three different actors named 'John'?",
        "query": "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
    },
    {
        "question": "Identify movies where directors also played a role in the film.",
        "query": "MATCH (p:Person)-[:DIRECTED]->(m:Movie), (p)-[:ACTED_IN]->(m) RETURN m.title, p.name",
    },
    {
        "question": "Find the actor with the highest number of movies in the database.",
        "query": "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1",
    },
]
```

我们可以像这样创建一个少量示例提示：


```python
<!--IMPORTS:[{"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to best prompt for Graph-RAG"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to best prompt for Graph-RAG"}]-->
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template(
    "User input: {question}\nCypher query: {query}"
)
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.\n\nHere is the schema information\n{schema}.\n\nBelow are a number of examples of questions and their corresponding Cypher queries.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```


```python
print(prompt.format(question="How many artists are there?", schema="foo"))
```
```output
You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.

Here is the schema information
foo.

Below are a number of examples of questions and their corresponding Cypher queries.

User input: How many artists are there?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: Which actors played in the movie Casino?
Cypher query: MATCH (m:Movie {title: 'Casino'})<-[:ACTED_IN]-(a) RETURN a.name

User input: How many movies has Tom Hanks acted in?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: List all the genres of the movie Schindler's List
Cypher query: MATCH (m:Movie {title: 'Schindler\'s List'})-[:IN_GENRE]->(g:Genre) RETURN g.name

User input: Which actors have worked in movies from both the comedy and action genres?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: How many artists are there?
Cypher query:
```
## 动态少量示例

如果我们有足够的示例，我们可能只想在提示中包含最相关的示例，或者因为它们不适合模型的上下文窗口，或者因为长尾示例会分散模型的注意力。具体来说，给定任何输入，我们希望包含与该输入最相关的示例。

我们可以使用示例选择器来实现这一点。在这种情况下，我们将使用[语义相似性示例选择器](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html)，它将把示例存储在我们选择的向量数据库中。在运行时，它将执行输入与我们的示例之间的相似性搜索，并返回最语义相似的示例：


```python
<!--IMPORTS:[{"imported": "Neo4jVector", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.neo4j_vector.Neo4jVector.html", "title": "How to best prompt for Graph-RAG"}, {"imported": "SemanticSimilarityExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html", "title": "How to best prompt for Graph-RAG"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to best prompt for Graph-RAG"}]-->
from langchain_community.vectorstores import Neo4jVector
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    Neo4jVector,
    k=5,
    input_keys=["question"],
)
```


```python
example_selector.select_examples({"question": "how many artists are there?"})
```



```output
[{'query': 'MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)',
  'question': 'How many artists are there?'},
 {'query': "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
  'question': 'How many movies has Tom Hanks acted in?'},
 {'query': "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
  'question': 'Which actors have worked in movies from both the comedy and action genres?'},
 {'query': "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
  'question': "Which directors have made movies with at least three different actors named 'John'?"},
 {'query': 'MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1',
  'question': 'Find the actor with the highest number of movies in the database.'}]
```


要使用它，我们可以直接将示例选择器传递给我们的少量示例提示模板：


```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.\n\nHere is the schema information\n{schema}.\n\nBelow are a number of examples of questions and their corresponding Cypher queries.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```


```python
print(prompt.format(question="how many artists are there?", schema="foo"))
```
```output
You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.

Here is the schema information
foo.

Below are a number of examples of questions and their corresponding Cypher queries.

User input: How many artists are there?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: How many movies has Tom Hanks acted in?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: Which actors have worked in movies from both the comedy and action genres?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: Which directors have made movies with at least three different actors named 'John'?
Cypher query: MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name

User input: Find the actor with the highest number of movies in the database.
Cypher query: MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1

User input: how many artists are there?
Cypher query:
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, cypher_prompt=prompt, verbose=True
)
```


```python
chain.invoke("How many actors are in the graph?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)[0m
Full Context:
[32;1m[1;3m[{'count(DISTINCT a)': 967}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'How many actors are in the graph?',
 'result': 'There are 967 actors in the graph.'}
```

