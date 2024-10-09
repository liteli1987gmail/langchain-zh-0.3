---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/ontotext.ipynb
---
# Ontotext GraphDB

>[Ontotext GraphDB](https://graphdb.ontotext.com/) 是一个符合 [RDF](https://www.w3.org/RDF/) 和 [SPARQL](https://www.w3.org/TR/sparql11-query/) 的图数据库和知识发现工具。

>本笔记本展示了如何使用大型语言模型 (LLMs) 提供自然语言查询 (NLQ 到 SPARQL，也称为 `text2sparql`) 以用于 `Ontotext GraphDB`。

## GraphDB LLM 功能

`GraphDB` 支持一些 LLM 集成功能，如 [这里](https://github.com/w3c/sparql-dev/issues/193) 所述：

[gpt-queries](https://graphdb.ontotext.com/documentation/10.5/gpt-queries.html)

* 魔法谓词，用于请求 LLM 提供文本、列表或表格，使用来自知识图谱 (KG) 的数据
* 查询解释
* 结果解释、总结、改写、翻译

[retrieval-graphdb-connector](https://graphdb.ontotext.com/documentation/10.5/retrieval-graphdb-connector.html)

* 在向量数据库中对知识图谱实体进行索引
* 支持任何文本嵌入算法和向量数据库
* 使用与GraphDB为Elastic、Solr、Lucene使用的相同强大连接器（索引）语言
* RDF数据更改自动同步到知识图谱实体索引
* 支持嵌套对象（GraphDB版本10.5中没有UI支持）
* 将知识图谱实体序列化为文本，如下所示（例如，对于葡萄酒数据集）：

```
Franvino:
- is a RedWine.
- made from grape Merlo.
- made from grape Cabernet Franc.
- has sugar dry.
- has year 2012.
```

[与图对话](https://graphdb.ontotext.com/documentation/10.5/talk-to-graph.html)

* 一个使用定义的知识图谱实体索引的简单聊天机器人


在本教程中，我们将不使用GraphDB LLM集成，而是使用自然语言查询生成`SPARQL`。我们将使用`星球大战API`（`SWAPI`）本体和数据集，您可以在[这里](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo/blob/main/starwars-data.trig)查看。


## 设置

您需要一个正在运行的GraphDB实例。本教程展示了如何使用[GraphDB Docker镜像](https://hub.docker.com/r/ontotext/graphdb)在本地运行数据库。它提供了一个docker compose设置，将星球大战数据集填充到GraphDB中。所有必要的文件，包括此笔记本，可以从[GitHub仓库langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo)下载。

* 安装[Docker](https://docs.docker.com/get-docker/)。本教程是使用Docker版本`24.0.7`创建的，该版本捆绑了[Docker Compose](https://docs.docker.com/compose/)。对于早期的Docker版本，您可能需要单独安装Docker Compose。
* 在您机器上的本地文件夹中克隆[GitHub仓库langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo)。
* 使用以下脚本从同一文件夹启动GraphDB
  
```
docker build --tag graphdb .
docker compose up -d graphdb
```

您需要等待几秒钟以便数据库在`http://localhost:7200/`上启动。星球大战数据集`starwars-data.trig`会自动加载到`langchain`仓库中。可以使用本地SPARQL端点`http://localhost:7200/repositories/langchain`来运行查询。您还可以从您喜欢的网页浏览器打开GraphDB工作台`http://localhost:7200/sparql`，在这里您可以交互式地进行查询。
* 设置工作环境

如果您使用 `conda`，请创建并激活一个新的 conda 环境（例如 `conda create -n graph_ontotext_graphdb_qa python=3.9.18`）。

安装以下库：

```
pip install jupyter==1.0.0
pip install openai==1.6.1
pip install rdflib==7.0.0
pip install langchain-openai==0.0.2
pip install langchain>=0.1.5
```

使用 Jupyter 运行
```
jupyter notebook
```

## 指定本体

为了使大型语言模型能够生成 SPARQL，它需要了解知识图谱模式（本体）。可以通过 `OntotextGraphDBGraph` 类的两个参数之一提供：

* `query_ontology`：在 SPARQL 端点上执行的 `CONSTRUCT` 查询，返回知识图谱模式语句。我们建议将本体存储在其自己的命名图中，这将使获取相关语句变得更容易（如下例所示）。不支持 `DESCRIBE` 查询，因为 `DESCRIBE` 返回对称简明有界描述（SCBD），即也包括传入的类链接。在实例数量达到百万的大型图中，这样做效率不高。请查看 https://github.com/eclipse-rdf4j/rdf4j/issues/4857
* `local_file`：本地 RDF 本体文件。支持的 RDF 格式有 `Turtle`、`RDF/XML`、`JSON-LD`、`N-Triples`、`Notation-3`、`Trig`、`Trix`、`N-Quads`。

在任何情况下，本体转储应：

* 包含足够的关于类、属性、属性附加到类的信息（使用 rdfs:domain、schema:domainIncludes 或 OWL 限制）和分类法（重要个体）。
* 不包含过于冗长和无关的定义和示例，这些内容对 SPARQL 构建没有帮助。


```python
<!--IMPORTS:[{"imported": "OntotextGraphDBGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.ontotext_graphdb_graph.OntotextGraphDBGraph.html", "title": "Ontotext GraphDB"}]-->
from langchain_community.graphs import OntotextGraphDBGraph

# feeding the schema using a user construct query

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    query_ontology="CONSTRUCT {?s ?p ?o} FROM <https://swapi.co/ontology/> WHERE {?s ?p ?o}",
)
```


```python
# feeding the schema using a local RDF file

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    local_file="/path/to/langchain_graphdb_tutorial/starwars-ontology.nt",  # change the path here
)
```

无论如何，本体（模式）以 `Turtle` 格式提供给大型语言模型，因为带有适当前缀的 `Turtle` 是最紧凑且最容易被大型语言模型记住的。

《星球大战》的本体有点不寻常，因为它包含了很多关于类的特定三元组，例如物种 `:Aleena` 生活在 `<planet/38>` 上，它们是 `:Reptile` 的子类，具有某些典型特征（平均身高、平均寿命、皮肤颜色），并且特定个体（角色）是该类的代表：


```
@prefix : <https://swapi.co/vocabulary/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Aleena a owl:Class, :Species ;
    rdfs:label "Aleena" ;
    rdfs:isDefinedBy <https://swapi.co/ontology/> ;
    rdfs:subClassOf :Reptile, :Sentient ;
    :averageHeight 80.0 ;
    :averageLifespan "79" ;
    :character <https://swapi.co/resource/aleena/47> ;
    :film <https://swapi.co/resource/film/4> ;
    :language "Aleena" ;
    :planet <https://swapi.co/resource/planet/38> ;
    :skinColor "blue", "gray" .

    ...

 ```


为了保持本教程的简单性，我们使用未加密的 GraphDB。如果 GraphDB 是加密的，您应该在初始化 `OntotextGraphDBGraph` 之前设置环境变量 'GRAPHDB_USERNAME' 和 'GRAPHDB_PASSWORD'。

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```


## 针对《星球大战》数据集的问题回答

我们现在可以使用 `OntotextGraphDBQAChain` 来提问。


```python
<!--IMPORTS:[{"imported": "OntotextGraphDBQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.ontotext_graphdb.OntotextGraphDBQAChain.html", "title": "Ontotext GraphDB"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Ontotext GraphDB"}]-->
import os

from langchain.chains import OntotextGraphDBQAChain
from langchain_openai import ChatOpenAI

# We'll be using an OpenAI model which requires an OpenAI API Key.
# However, other models are available as well:
# https://python.langchain.com/docs/integrations/chat/

# Set the environment variable `OPENAI_API_KEY` to your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-***"

# Any available OpenAI model can be used here.
# We use 'gpt-4-1106-preview' because of the bigger context window.
# The 'gpt-4-1106-preview' model_name will deprecate in the future and will change to 'gpt-4-turbo' or similar,
# so be sure to consult with the OpenAI API https://platform.openai.com/docs/models for the correct naming.

chain = OntotextGraphDBQAChain.from_llm(
    ChatOpenAI(temperature=0, model_name="gpt-4-1106-preview"),
    graph=graph,
    verbose=True,
)
```

让我们问一个简单的问题。


```python
chain.invoke({chain.input_key: "What is the climate on Tatooine?"})[chain.output_key]
```
```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?planet rdfs:label "Tatooine" ;
          :climate ?climate .
}[0m

[1m> Finished chain.[0m
```


```output
'The climate on Tatooine is arid.'
```


还有一个稍微复杂一点的问题。


```python
chain.invoke({chain.input_key: "What is the climate on Luke Skywalker's home planet?"})[
    chain.output_key
]
```
```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?character rdfs:label "Luke Skywalker" .
  ?character :homeworld ?planet .
  ?planet :climate ?climate .
}[0m

[1m> Finished chain.[0m
```


```output
"The climate on Luke Skywalker's home planet is arid."
```


我们还可以问更复杂的问题，比如


```python
chain.invoke(
    {
        chain.input_key: "What is the average box office revenue for all the Star Wars movies?"
    }
)[chain.output_key]
```
```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT (AVG(?boxOffice) AS ?averageBoxOffice)
WHERE {
  ?film a :Film .
  ?film :boxOffice ?boxOfficeValue .
  BIND(xsd:decimal(?boxOfficeValue) AS ?boxOffice)
}
[0m

[1m> Finished chain.[0m
```


```output
'The average box office revenue for all the Star Wars movies is approximately 754.1 million dollars.'
```


## 链修改器

Ontotext GraphDB QA 链允许对提示进行优化，以进一步改善您的 QA 链并增强您应用程序的整体用户体验。


### "SPARQL 生成" 提示

该提示用于根据用户问题和知识图谱（KG）模式生成 SPARQL 查询。

- `sparql_generation_prompt`

默认值：
  ````python
    GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
    Write a SPARQL SELECT query for querying a graph database.
    The ontology schema delimited by triple backticks in Turtle format is:
    ```
    {schema}
    ```
    Use only the classes and properties provided in the schema to construct the SPARQL query.
    Do not use any classes or properties that are not explicitly provided in the SPARQL query.
    Include all necessary prefixes.
    Do not include any explanations or apologies in your responses.
    Do not wrap the query in backticks.
    Do not include any text except the SPARQL query generated.
    The question delimited by triple backticks is:
    ```
    {prompt}
    ```
    """
    GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
        input_variables=["schema", "prompt"],
        template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
    )
  ````

### "SPARQL 修复" 提示

有时，LLM 可能会生成带有语法错误或缺失前缀等的 SPARQL 查询。该链将尝试通过提示 LLM 进行一定次数的修正。

- `sparql_fix_prompt`

默认值：
  ````python
    GRAPHDB_SPARQL_FIX_TEMPLATE = """
    This following SPARQL query delimited by triple backticks
    ```
    {generated_sparql}
    ```
    is not valid.
    The error delimited by triple backticks is
    ```
    {error_message}
    ```
    Give me a correct version of the SPARQL query.
    Do not change the logic of the query.
    Do not include any explanations or apologies in your responses.
    Do not wrap the query in backticks.
    Do not include any text except the SPARQL query generated.
    The ontology schema delimited by triple backticks in Turtle format is:
    ```
    {schema}
    ```
    """
    
    GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
        input_variables=["error_message", "generated_sparql", "schema"],
        template=GRAPHDB_SPARQL_FIX_TEMPLATE,
    )
  ````

- `max_fix_retries`
  
默认值：`5`

### "回答"提示

该提示用于根据从数据库返回的结果和初始用户问题来回答问题。默认情况下，LLM被指示仅使用返回结果中的信息。如果结果集为空，LLM应告知无法回答该问题。

- `qa_prompt`
  
默认值：
  ````python
    GRAPHDB_QA_TEMPLATE = """Task: Generate a natural language response from the results of a SPARQL query.
    You are an assistant that creates well-written and human understandable answers.
    The information part contains the information provided, which you can use to construct an answer.
    The information provided is authoritative, you must never doubt it or try to use your internal knowledge to correct it.
    Make your response sound like the information is coming from an AI assistant, but don't add any information.
    Don't use internal knowledge to answer the question, just say you don't know if no information is available.
    Information:
    {context}
    
    Question: {prompt}
    Helpful Answer:"""
    GRAPHDB_QA_PROMPT = PromptTemplate(
        input_variables=["context", "prompt"], template=GRAPHDB_QA_TEMPLATE
    )
  ````

一旦你完成了与GraphDB的QA交互，可以通过运行以下命令关闭Docker环境
``
docker compose down -v --remove-orphans
``
从包含Docker compose文件的目录中运行。
