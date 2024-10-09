---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/sql_large_db.ipynb
---
# 如何在进行SQL问答时处理大型数据库

为了对数据库编写有效的查询，我们需要向模型提供表名、表结构和特征值，以便进行查询。当表、列和/或高基数列数量众多时，我们无法在每个提示中提供数据库的完整信息。相反，我们必须找到动态插入提示中仅最相关信息的方法。

在本指南中，我们演示了识别相关信息的方法，并将其输入到查询生成步骤中。我们将涵盖：

1. 识别相关的表子集；
2. 识别相关的列值子集。


## 设置

首先，获取所需的包并设置环境变量：


```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```


```python
# Uncomment the below to use LangSmith. Not required.
# import os
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

下面的示例将使用与Chinook数据库的SQLite连接。请按照[这些安装步骤](https://database.guide/2-sample-databases-sqlite/)在与此笔记本相同的目录中创建`Chinook.db`：

* 将[此文件](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)保存为`Chinook_Sqlite.sql`
* 运行`sqlite3 Chinook.db`
* 运行`.read Chinook_Sqlite.sql`
* 测试`SELECT * FROM Artist LIMIT 10;`

现在，`Chinook.db`在我们的目录中，我们可以使用SQLAlchemy驱动的[SQLDatabase](https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html)类与之交互：


```python
<!--IMPORTS:[{"imported": "SQLDatabase", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html", "title": "How to deal with large databases when doing SQL question-answering"}]-->
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
print(db.dialect)
print(db.get_usable_table_names())
print(db.run("SELECT * FROM Artist LIMIT 10;"))
```
```output
sqlite
['Album', 'Artist', 'Customer', 'Employee', 'Genre', 'Invoice', 'InvoiceLine', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
[(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains'), (6, 'Antônio Carlos Jobim'), (7, 'Apocalyptica'), (8, 'Audioslave'), (9, 'BackBeat'), (10, 'Billy Cobham')]
```
## 多个表

我们在提示中需要包含的主要信息之一是相关表的模式。当我们有很多表时，无法将所有模式放入单个提示中。在这种情况下，我们可以先提取与用户输入相关的表名，然后仅包含它们的模式。

一种简单可靠的方法是使用[工具调用](/docs/how_to/tool_calling)。下面，我们展示如何使用此功能以获得符合所需格式的输出（在这种情况下，是表名列表）。我们使用聊天模型的`.bind_tools`方法将工具绑定为Pydantic格式，并将其输入到输出解析器中，以从模型的响应中重建对象。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "PydanticToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html", "title": "How to deal with large databases when doing SQL question-answering"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to deal with large databases when doing SQL question-answering"}]-->
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class Table(BaseModel):
    """Table in SQL database."""

    name: str = Field(description="Name of table in SQL database.")


table_names = "\n".join(db.get_usable_table_names())
system = f"""Return the names of ALL the SQL tables that MIGHT be relevant to the user question. \
The tables are:

{table_names}

Remember to include ALL POTENTIALLY RELEVANT tables, even if you're not sure that they're needed."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{input}"),
    ]
)
llm_with_tools = llm.bind_tools([Table])
output_parser = PydanticToolsParser(tools=[Table])

table_chain = prompt | llm_with_tools | output_parser

table_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```



```output
[Table(name='Genre')]
```


这效果很好！不过，正如我们下面所看到的，我们实际上还需要其他几个表。仅根据用户问题，模型很难知道这一点。在这种情况下，我们可以考虑通过将表分组来简化模型的工作。我们只需让模型在“音乐”和“商业”类别之间进行选择，然后从那里选择所有相关表：


```python
system = """Return the names of any SQL tables that are relevant to the user question.
The tables are:

Music
Business
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{input}"),
    ]
)

category_chain = prompt | llm_with_tools | output_parser
category_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```



```output
[Table(name='Music'), Table(name='Business')]
```



```python
from typing import List


def get_tables(categories: List[Table]) -> List[str]:
    tables = []
    for category in categories:
        if category.name == "Music":
            tables.extend(
                [
                    "Album",
                    "Artist",
                    "Genre",
                    "MediaType",
                    "Playlist",
                    "PlaylistTrack",
                    "Track",
                ]
            )
        elif category.name == "Business":
            tables.extend(["Customer", "Employee", "Invoice", "InvoiceLine"])
    return tables


table_chain = category_chain | get_tables
table_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```



```output
['Album',
 'Artist',
 'Genre',
 'MediaType',
 'Playlist',
 'PlaylistTrack',
 'Track',
 'Customer',
 'Employee',
 'Invoice',
 'InvoiceLine']
```


现在我们有了一个可以输出任何查询相关表格的链，我们可以将其与我们的 [create_sql_query_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) 结合使用，该链可以接受一个 `table_names_to_use` 列表，以确定在提示中包含哪些表模式：


```python
<!--IMPORTS:[{"imported": "create_sql_query_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html", "title": "How to deal with large databases when doing SQL question-answering"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to deal with large databases when doing SQL question-answering"}]-->
from operator import itemgetter

from langchain.chains import create_sql_query_chain
from langchain_core.runnables import RunnablePassthrough

query_chain = create_sql_query_chain(llm, db)
# Convert "question" key to the "input" key expected by current table_chain.
table_chain = {"input": itemgetter("question")} | table_chain
# Set table_names_to_use using table_chain.
full_chain = RunnablePassthrough.assign(table_names_to_use=table_chain) | query_chain
```


```python
query = full_chain.invoke(
    {"question": "What are all the genres of Alanis Morisette songs"}
)
print(query)
```
```output
SELECT DISTINCT "g"."Name"
FROM "Genre" g
JOIN "Track" t ON "g"."GenreId" = "t"."GenreId"
JOIN "Album" a ON "t"."AlbumId" = "a"."AlbumId"
JOIN "Artist" ar ON "a"."ArtistId" = "ar"."ArtistId"
WHERE "ar"."Name" = 'Alanis Morissette'
LIMIT 5;
```

```python
db.run(query)
```



```output
"[('Rock',)]"
```


我们可以在 [这里](https://smith.langchain.com/public/4fbad408-3554-4f33-ab47-1e510a1b52a3/r) 查看此运行的 LangSmith 跟踪。

我们已经看到如何在链中动态地将一部分表模式包含在提示中。解决此问题的另一种可能方法是让代理自行决定何时查找表，通过给它一个工具来实现。您可以在 [SQL: Agents](/docs/tutorials/agents) 指南中看到一个示例。

## 高基数列

为了过滤包含专有名词（如地址、歌曲名称或艺术家）的列，我们首先需要仔细检查拼写，以便正确过滤数据。

一种简单的策略是创建一个包含数据库中所有不同专有名词的向量存储。然后，我们可以查询该向量存储每个用户输入，并将最相关的专有名词注入提示中。

首先，我们需要每个实体的唯一值，为此我们定义一个函数，将结果解析为元素列表：


```python
import ast
import re


def query_as_list(db, query):
    res = db.run(query)
    res = [el for sub in ast.literal_eval(res) for el in sub if el]
    res = [re.sub(r"\b\d+\b", "", string).strip() for string in res]
    return res


proper_nouns = query_as_list(db, "SELECT Name FROM Artist")
proper_nouns += query_as_list(db, "SELECT Title FROM Album")
proper_nouns += query_as_list(db, "SELECT Name FROM Genre")
len(proper_nouns)
proper_nouns[:5]
```



```output
['AC/DC', 'Accept', 'Aerosmith', 'Alanis Morissette', 'Alice In Chains']
```


现在我们可以将所有值嵌入并存储在向量数据库中：


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to deal with large databases when doing SQL question-answering"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to deal with large databases when doing SQL question-answering"}]-->
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

并组建一个查询构建链，该链首先从数据库中检索值并将其插入提示中：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to deal with large databases when doing SQL question-answering"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to deal with large databases when doing SQL question-answering"}]-->
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

system = """You are a SQLite expert. Given an input question, create a syntactically
correct SQLite query to run. Unless otherwise specificed, do not return more than
{top_k} rows.

Only return the SQL query with no markup or explanation.

Here is the relevant table info: {table_info}

Here is a non-exhaustive list of possible feature values. If filtering on a feature
value make sure to check its spelling against this list first:

{proper_nouns}
"""

prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{input}")])

query_chain = create_sql_query_chain(llm, db, prompt=prompt)
retriever_chain = (
    itemgetter("question")
    | retriever
    | (lambda docs: "\n".join(doc.page_content for doc in docs))
)
chain = RunnablePassthrough.assign(proper_nouns=retriever_chain) | query_chain
```

为了尝试我们的链，让我们看看当我们尝试过滤“elenis moriset”，这是对 Alanis Morissette 的拼写错误时，会发生什么情况，分别在没有检索和有检索的情况下：


```python
# Without retrieval
query = query_chain.invoke(
    {"question": "What are all the genres of elenis moriset songs", "proper_nouns": ""}
)
print(query)
db.run(query)
```
```output
SELECT DISTINCT g.Name 
FROM Track t
JOIN Album a ON t.AlbumId = a.AlbumId
JOIN Artist ar ON a.ArtistId = ar.ArtistId
JOIN Genre g ON t.GenreId = g.GenreId
WHERE ar.Name = 'Elenis Moriset';
```


```output
''
```



```python
# Without retrieval
query = query_chain.invoke(
    {"question": "What are all the genres of elenis moriset songs", "proper_nouns": ""}
)
print(query)
db.run(query)
```
```output
SELECT DISTINCT Genre.Name
FROM Genre
JOIN Track ON Genre.GenreId = Track.GenreId
JOIN Album ON Track.AlbumId = Album.AlbumId
JOIN Artist ON Album.ArtistId = Artist.ArtistId
WHERE Artist.Name = 'Elenis Moriset'
```


```output
''
```



```python
# With retrieval
query = chain.invoke({"question": "What are all the genres of elenis moriset songs"})
print(query)
db.run(query)
```
```output
SELECT DISTINCT g.Name
FROM Genre g
JOIN Track t ON g.GenreId = t.GenreId
JOIN Album a ON t.AlbumId = a.AlbumId
JOIN Artist ar ON a.ArtistId = ar.ArtistId
WHERE ar.Name = 'Alanis Morissette';
```


```output
"[('Rock',)]"
```


我们可以看到，通过检索，我们能够将“Elenis Moriset”的拼写纠正为“Alanis Morissette”，并获得有效的结果。

解决此问题的另一种可能方法是让代理自行决定何时查找专有名词。您可以在[SQL: Agents](/docs/tutorials/agents)指南中看到一个示例。
