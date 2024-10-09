---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/diffbot.ipynb
---
# Diffbot

>[Diffbot](https://docs.diffbot.com/docs/getting-started-with-diffbot) 是一套基于机器学习的产品，旨在简化网页数据的结构化处理。
>
>Diffbot 的 [自然语言处理 API](https://www.diffbot.com/products/natural-language/) 允许从非结构化文本数据中提取实体、关系和语义信息。
[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/graphs/diffbot.ipynb)

## 用例

文本数据通常包含丰富的关系和洞察，可用于各种分析、推荐引擎或知识管理应用。

通过将 `Diffbot 的 NLP API` 与 `Neo4j`（图数据库）结合，您可以基于从文本中提取的信息创建强大且动态的图结构。这些图结构是完全可查询的，并且可以集成到各种应用中。

这种组合允许使用案例，例如：

* 从文本文件、网站或社交媒体源构建知识图谱（如 [Diffbot 的知识图谱](https://www.diffbot.com/products/knowledge-graph/)）。
* 基于数据中的语义关系生成推荐。
* 创建理解实体之间关系的高级搜索功能。
* 构建分析仪表板，允许用户探索数据中的隐藏关系。

## 概述

LangChain 提供与图数据库交互的工具：

1. `使用图转换器和存储集成从文本构建知识图谱`
2. `使用链进行查询创建和执行查询图数据库`
3. `使用代理与图数据库交互，以实现强大而灵活的查询`

## 设置

首先，获取所需的包并设置环境变量：


```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### Diffbot NLP API

`Diffbot的NLP API` 是一个用于从非结构化文本数据中提取实体、关系和语义上下文的工具。
提取的信息可以用于构建知识图谱。
要使用该API，您需要从[Diffbot获取一个免费的API令牌](https://app.diffbot.com/get-started/)。


```python
<!--IMPORTS:[{"imported": "DiffbotGraphTransformer", "source": "langchain_experimental.graph_transformers.diffbot", "docs": "https://python.langchain.com/api_reference/experimental/graph_transformers/langchain_experimental.graph_transformers.diffbot.DiffbotGraphTransformer.html", "title": "Diffbot"}]-->
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

这段代码获取关于“沃伦·巴菲特”的维基百科文章，然后使用`DiffbotGraphTransformer`提取实体和关系。
`DiffbotGraphTransformer`输出一个结构化数据`GraphDocument`，可以用于填充图数据库。
请注意，由于Diffbot的[每个API请求的字符限制](https://docs.diffbot.com/reference/introduction-to-natural-language-api)，避免了文本分块。


```python
<!--IMPORTS:[{"imported": "WikipediaLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.wikipedia.WikipediaLoader.html", "title": "Diffbot"}]-->
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## 将数据加载到知识图谱中

您需要有一个正在运行的Neo4j实例。一个选项是在他们的Aura云服务中创建一个[免费的Neo4j数据库实例](https://neo4j.com/cloud/platform/aura-graph-database/)。您也可以使用[Neo4j桌面应用程序](https://neo4j.com/download/)在本地运行数据库，或者运行一个docker容器。您可以通过执行以下脚本来运行本地docker容器：
```
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```    
如果您使用docker容器，您需要等待几秒钟以便数据库启动。


```python
<!--IMPORTS:[{"imported": "Neo4jGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neo4j_graph.Neo4jGraph.html", "title": "Diffbot"}]-->
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "password"

graph = Neo4jGraph(url=url, username=username, password=password)
```

可以使用 `add_graph_documents` 方法将 `GraphDocuments` 加载到知识图中。


```python
graph.add_graph_documents(graph_documents)
```

## 刷新图形模式信息
如果数据库的模式发生变化，可以刷新生成 Cypher 语句所需的模式信息。


```python
graph.refresh_schema()
```

## 查询图形
现在我们可以使用图形 Cypher QA 链来询问图形的问题。建议使用 **gpt-4** 来构建 Cypher 查询，以获得最佳体验。


```python
<!--IMPORTS:[{"imported": "GraphCypherQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.cypher.GraphCypherQAChain.html", "title": "Diffbot"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Diffbot"}]-->
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```


```python
chain.run("Which university did Warren Buffett attend?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```


```output
'Warren Buffett attended the University of Nebraska.'
```



```python
chain.run("Who is or was working at Berkshire Hathaway?")
```
```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```


```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```

