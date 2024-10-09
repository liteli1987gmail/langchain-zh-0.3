---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/graph_semantic.ipynb
sidebar_position: 1
---
# 如何在图数据库上添加语义层

您可以使用数据库查询从图数据库（如Neo4j）中检索信息。
一种选择是使用大型语言模型（LLMs）生成Cypher语句。
虽然该选项提供了出色的灵活性，但解决方案可能脆弱，并且无法始终生成精确的Cypher语句。
我们可以将Cypher模板作为工具实现为语义层，以便LLM代理可以与之交互，而不是生成Cypher语句。

![graph_semantic.png](../../static/img/graph_semantic.png)

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
<!--IMPORTS:[{"imported": "Neo4jGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neo4j_graph.Neo4jGraph.html", "title": "How to add a semantic layer over graph database"}]-->
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


## 使用Cypher模板的自定义工具

语义层由各种工具组成，这些工具暴露给大型语言模型（LLM），以便它可以与知识图谱进行交互。
它们可以具有不同的复杂性。您可以将语义层中的每个工具视为一个函数。

我们将实现的功能是检索有关电影或其演员的信息。


```python
<!--IMPORTS:[{"imported": "AsyncCallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.AsyncCallbackManagerForToolRun.html", "title": "How to add a semantic layer over graph database"}, {"imported": "CallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManagerForToolRun.html", "title": "How to add a semantic layer over graph database"}, {"imported": "BaseTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.BaseTool.html", "title": "How to add a semantic layer over graph database"}]-->
from typing import Optional, Type

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.tools import BaseTool

# Import things that are needed generically
from pydantic import BaseModel, Field

description_query = """
MATCH (m:Movie|Person)
WHERE m.title CONTAINS $candidate OR m.name CONTAINS $candidate
MATCH (m)-[r:ACTED_IN|HAS_GENRE]-(t)
WITH m, type(r) as type, collect(coalesce(t.name, t.title)) as names
WITH m, type+": "+reduce(s="", n IN names | s + n + ", ") as types
WITH m, collect(types) as contexts
WITH m, "type:" + labels(m)[0] + "\ntitle: "+ coalesce(m.title, m.name) 
       + "\nyear: "+coalesce(m.released,"") +"\n" +
       reduce(s="", c in contexts | s + substring(c, 0, size(c)-2) +"\n") as context
RETURN context LIMIT 1
"""


def get_information(entity: str) -> str:
    try:
        data = graph.query(description_query, params={"candidate": entity})
        return data[0]["context"]
    except IndexError:
        return "No information was found"
```

您可以观察到我们已经定义了用于检索信息的Cypher语句。
因此，我们可以避免生成Cypher语句，并仅使用LLM代理填充输入参数。
为了向大型语言模型代理提供关于何时使用工具及其输入参数的额外信息，我们将函数包装为工具。


```python
<!--IMPORTS:[{"imported": "AsyncCallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.AsyncCallbackManagerForToolRun.html", "title": "How to add a semantic layer over graph database"}, {"imported": "CallbackManagerForToolRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManagerForToolRun.html", "title": "How to add a semantic layer over graph database"}, {"imported": "BaseTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.BaseTool.html", "title": "How to add a semantic layer over graph database"}]-->
from typing import Optional, Type

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.tools import BaseTool

# Import things that are needed generically
from pydantic import BaseModel, Field


class InformationInput(BaseModel):
    entity: str = Field(description="movie or a person mentioned in the question")


class InformationTool(BaseTool):
    name = "Information"
    description = (
        "useful for when you need to answer questions about various actors or movies"
    )
    args_schema: Type[BaseModel] = InformationInput

    def _run(
        self,
        entity: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool."""
        return get_information(entity)

    async def _arun(
        self,
        entity: str,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        return get_information(entity)
```

## OpenAI 代理

LangChain表达式语言使得定义一个与图数据库在语义层上交互的代理变得非常方便。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to add a semantic layer over graph database"}, {"imported": "format_to_openai_function_messages", "source": "langchain.agents.format_scratchpad", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.format_scratchpad.openai_functions.format_to_openai_function_messages.html", "title": "How to add a semantic layer over graph database"}, {"imported": "OpenAIFunctionsAgentOutputParser", "source": "langchain.agents.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.output_parsers.openai_functions.OpenAIFunctionsAgentOutputParser.html", "title": "How to add a semantic layer over graph database"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to add a semantic layer over graph database"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to add a semantic layer over graph database"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add a semantic layer over graph database"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to add a semantic layer over graph database"}, {"imported": "convert_to_openai_function", "source": "langchain_core.utils.function_calling", "docs": "https://python.langchain.com/api_reference/core/utils/langchain_core.utils.function_calling.convert_to_openai_function.html", "title": "How to add a semantic layer over graph database"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add a semantic layer over graph database"}]-->
from typing import List, Tuple

from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.utils.function_calling import convert_to_openai_function
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
tools = [InformationTool()]

llm_with_tools = llm.bind(functions=[convert_to_openai_function(t) for t in tools])

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that finds information about movies "
            " and recommends them. If tools require follow up questions, "
            "make sure to ask the user for clarification. Make sure to include any "
            "available options that need to be clarified in the follow up questions "
            "Do only the things the user specifically requested. ",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)


def _format_chat_history(chat_history: List[Tuple[str, str]]):
    buffer = []
    for human, ai in chat_history:
        buffer.append(HumanMessage(content=human))
        buffer.append(AIMessage(content=ai))
    return buffer


agent = (
    {
        "input": lambda x: x["input"],
        "chat_history": lambda x: _format_chat_history(x["chat_history"])
        if x.get("chat_history")
        else [],
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```


```python
agent_executor.invoke({"input": "Who played in Casino?"})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Information` with `{'entity': 'Casino'}`


[0m[36;1m[1;3mtype:Movie
title: Casino
year: 1995-11-22
ACTED_IN: Joe Pesci, Robert De Niro, Sharon Stone, James Woods
[0m[32;1m[1;3mThe movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.[0m

[1m> Finished chain.[0m
```


```output
{'input': 'Who played in Casino?',
 'output': 'The movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

