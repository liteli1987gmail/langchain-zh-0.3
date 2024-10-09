---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/sql_query_checking.ipynb
---
# 如何在 SQL 问答中进行查询验证

任何 SQL 链或代理中最容易出错的部分可能就是编写有效且安全的 SQL 查询。在本指南中，我们将讨论一些验证查询和处理无效查询的策略。

我们将涵盖：

1. 在查询生成中添加一个“查询验证器”步骤；
2. 提示工程以减少错误发生的频率。

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

现在，`Chinook.db`在我们的目录中，我们可以使用SQLAlchemy驱动的`SQLDatabase`类与之接口：


```python
<!--IMPORTS:[{"imported": "SQLDatabase", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html", "title": "How to do query validation as part of SQL question-answering"}]-->
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
## 查询检查器

也许最简单的策略是让模型本身检查原始查询中的常见错误。假设我们有以下SQL查询链：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "create_sql_query_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html", "title": "How to do query validation as part of SQL question-answering"}]-->
from langchain.chains import create_sql_query_chain

chain = create_sql_query_chain(llm, db)
```

我们想要验证它的输出。我们可以通过用第二个提示和模型调用扩展链来做到这一点：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to do query validation as part of SQL question-answering"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to do query validation as part of SQL question-answering"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

system = """Double check the user's {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

If there are any of the above mistakes, rewrite the query.
If there are no mistakes, just reproduce the original query with no further commentary.

Output the final SQL query only."""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{query}")]
).partial(dialect=db.dialect)
validation_chain = prompt | llm | StrOutputParser()

full_chain = {"query": chain} | validation_chain
```


```python
query = full_chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
print(query)
```
```output
SELECT AVG(i.Total) AS AverageInvoice
FROM Invoice i
JOIN Customer c ON i.CustomerId = c.CustomerId
WHERE c.Country = 'USA'
AND c.Fax IS NULL
AND i.InvoiceDate >= '2003-01-01' 
AND i.InvoiceDate < '2010-01-01'
```
注意我们可以在[Langsmith追踪](https://smith.langchain.com/public/8a743295-a57c-4e4c-8625-bc7e36af9d74/r)中看到链的两个步骤。


```python
db.run(query)
```



```output
'[(6.632999999999998,)]'
```


这种方法明显的缺点是我们需要进行两次模型调用而不是一次来生成查询。为了绕过这个问题，我们可以尝试在一次模型调用中执行查询生成和查询检查：


```python
system = """You are a {dialect} expert. Given an input question, create a syntactically correct {dialect} query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most {top_k} results using the LIMIT clause as per {dialect}. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
{table_info}

Write an initial draft of the query. Then double check the {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>
"""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{input}")]
).partial(dialect=db.dialect)


def parse_final_answer(output: str) -> str:
    return output.split("Final answer: ")[1]


chain = create_sql_query_chain(llm, db, prompt=prompt) | parse_final_answer
prompt.pretty_print()
```
```output
================================[1m System Message [0m================================

You are a [33;1m[1;3m{dialect}[0m expert. Given an input question, create a syntactically correct [33;1m[1;3m{dialect}[0m query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most [33;1m[1;3m{top_k}[0m results using the LIMIT clause as per [33;1m[1;3m{dialect}[0m. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
[33;1m[1;3m{table_info}[0m

Write an initial draft of the query. Then double check the [33;1m[1;3m{dialect}[0m query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>


================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

```python
query = chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
print(query)
```
```output


SELECT AVG(i."Total") AS "AverageInvoice"
FROM "Invoice" i
JOIN "Customer" c ON i."CustomerId" = c."CustomerId"
WHERE c."Country" = 'USA'
AND c."Fax" IS NULL
AND i."InvoiceDate" BETWEEN '2003-01-01' AND '2010-01-01';
```

```python
db.run(query)
```



```output
'[(6.632999999999998,)]'
```


## 人工参与

在某些情况下，我们的数据足够敏感，以至于我们永远不想在没有人类先批准的情况下执行SQL查询。请访问[工具使用：人工参与](/docs/how_to/tools_human)页面，了解如何为任何工具、链或代理添加人工参与。

## 错误处理

在某些时候，模型会犯错误并生成无效的SQL查询。或者我们的数据库会出现问题。或者模型API会宕机。我们希望在这些情况下为我们的链和代理添加一些错误处理行为，以便优雅地失败，甚至可能自动恢复。要了解如何使用工具进行错误处理，请访问[工具使用：错误处理](/docs/how_to/tools_error)页面。
