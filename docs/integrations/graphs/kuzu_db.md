---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/kuzu_db.ipynb
---
# Kuzu

> [Kùzu](https://kuzudb.com) 是一个可嵌入的属性图数据库管理系统，旨在实现查询速度和可扩展性。
>
> Kùzu 具有宽松的 (MIT) 开源许可证，并实现了 [Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))，这是一种声明式图查询语言，允许在属性图中进行富有表现力和高效的数据查询。
> 它使用列式存储，其查询处理器包含新颖的连接算法，使其能够在不牺牲查询性能的情况下扩展到非常大的图。
>
> 本笔记本展示了如何使用大型语言模型 (LLMs) 为 [Kùzu](https://kuzudb.com) 数据库提供基于 Cypher 的自然语言接口。

## 设置

Kùzu 是一个嵌入式数据库（它在进程内运行），因此无需管理服务器。
只需通过其 Python 包安装它：

```bash
pip install kuzu
```

在本地机器上创建一个数据库并连接到它：


```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

首先，我们为一个简单的电影数据库创建模式：


```python
conn.execute("CREATE NODE TABLE Movie (name STRING, PRIMARY KEY(name))")
conn.execute(
    "CREATE NODE TABLE Person (name STRING, birthDate STRING, PRIMARY KEY(name))"
)
conn.execute("CREATE REL TABLE ActedIn (FROM Person TO Movie)")
```



```output
<kuzu.query_result.QueryResult at 0x103a72290>
```


然后我们可以插入一些数据。


```python
conn.execute("CREATE (:Person {name: 'Al Pacino', birthDate: '1940-04-25'})")
conn.execute("CREATE (:Person {name: 'Robert De Niro', birthDate: '1943-08-17'})")
conn.execute("CREATE (:Movie {name: 'The Godfather'})")
conn.execute("CREATE (:Movie {name: 'The Godfather: Part II'})")
conn.execute(
    "CREATE (:Movie {name: 'The Godfather Coda: The Death of Michael Corleone'})"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather Coda: The Death of Michael Corleone' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Robert De Niro' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
```



```output
<kuzu.query_result.QueryResult at 0x103a9e750>
```


## 创建 `KuzuQAChain`

我们现在可以创建 `KuzuGraph` 和 `KuzuQAChain`。要创建 `KuzuGraph`，我们只需将数据库对象传递给 `KuzuGraph` 构造函数。


```python
<!--IMPORTS:[{"imported": "KuzuQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.kuzu.KuzuQAChain.html", "title": "Kuzu"}, {"imported": "KuzuGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.kuzu_graph.KuzuGraph.html", "title": "Kuzu"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Kuzu"}]-->
from langchain.chains import KuzuQAChain
from langchain_community.graphs import KuzuGraph
from langchain_openai import ChatOpenAI
```


```python
graph = KuzuGraph(db)
```


```python
chain = KuzuQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    graph=graph,
    verbose=True,
)
```

## 刷新图形模式信息

如果数据库的模式发生变化，您可以刷新生成 Cypher 语句所需的模式信息。
您还可以显示 Kùzu 图的模式，如下所示。


```python
# graph.refresh_schema()
```


```python
print(graph.get_schema)
```
```output
Node properties: [{'properties': [('name', 'STRING')], 'label': 'Movie'}, {'properties': [('name', 'STRING'), ('birthDate', 'STRING')], 'label': 'Person'}]
Relationships properties: [{'properties': [], 'label': 'ActedIn'}]
Relationships: ['(:Person)-[:ActedIn]->(:Movie)']
```
## 查询图形

我们现在可以使用 `KuzuQAChain` 向图形提问。


```python
chain.invoke("Who acted in The Godfather: Part II?")
```
```output


[1m> Entering new KuzuQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie)
WHERE m.name = 'The Godfather: Part II'
RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}, {'p.name': 'Robert De Niro'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who acted in The Godfather: Part II?',
 'result': 'Al Pacino, Robert De Niro acted in The Godfather: Part II.'}
```



```python
chain.invoke("Robert De Niro played in which movies?")
```
```output


[1m> Entering new KuzuQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie)
WHERE p.name = 'Robert De Niro'
RETURN m.name[0m
Full Context:
[32;1m[1;3m[{'m.name': 'The Godfather: Part II'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Robert De Niro played in which movies?',
 'result': 'Robert De Niro played in The Godfather: Part II.'}
```



```python
chain.invoke("How many actors played in the Godfather: Part II?")
```
```output


[1m> Entering new KuzuQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Person)-[:ActedIn]->(:Movie {name: 'Godfather: Part II'})
RETURN count(*)[0m
Full Context:
[32;1m[1;3m[{'COUNT_STAR()': 0}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'How many actors played in the Godfather: Part II?',
 'result': "I don't know the answer."}
```



```python
chain.invoke("Who is the oldest actor who played in The Godfather: Part II?")
```
```output


[1m> Entering new KuzuQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie {name: 'The Godfather: Part II'})
RETURN p.name
ORDER BY p.birthDate ASC
LIMIT 1[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}][0m

[1m> Finished chain.[0m
```


```output
{'query': 'Who is the oldest actor who played in The Godfather: Part II?',
 'result': 'Al Pacino is the oldest actor who played in The Godfather: Part II.'}
```


## 为 Cypher 和答案生成使用不同的 LLM

您可以分别指定 `cypher_llm` 和 `qa_llm`，以便为 Cypher 生成和答案生成使用不同的 LLM。


```python
chain = KuzuQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-4"),
    graph=graph,
    verbose=True,
)
```
```output
/Users/prrao/code/langchain/.venv/lib/python3.11/site-packages/langchain_core/_api/deprecation.py:119: LangChainDeprecationWarning: The class `LLMChain` was deprecated in LangChain 0.1.17 and will be removed in 0.3.0. Use RunnableSequence, e.g., `prompt | llm` instead.
  warn_deprecated(
```

```python
chain.invoke("How many actors played in The Godfather: Part II?")
```
```output


[1m> Entering new KuzuQAChain chain...[0m
``````output
/Users/prrao/code/langchain/.venv/lib/python3.11/site-packages/langchain_core/_api/deprecation.py:119: LangChainDeprecationWarning: The method `Chain.run` was deprecated in langchain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
``````output
Generated Cypher:
[32;1m[1;3mMATCH (:Person)-[:ActedIn]->(:Movie {name: 'The Godfather: Part II'})
RETURN count(*)[0m
Full Context:
[32;1m[1;3m[{'COUNT_STAR()': 2}][0m
``````output
/Users/prrao/code/langchain/.venv/lib/python3.11/site-packages/langchain_core/_api/deprecation.py:119: LangChainDeprecationWarning: The method `Chain.__call__` was deprecated in langchain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
``````output

[1m> Finished chain.[0m
```


```output
{'query': 'How many actors played in The Godfather: Part II?',
 'result': 'Two actors played in The Godfather: Part II.'}
```

