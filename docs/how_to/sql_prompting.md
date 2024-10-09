---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/sql_prompting.ipynb
---
# 如何在进行 SQL 问答时更好地提示

在本指南中，我们将讨论提示策略，以改善使用 [create_sql_query_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) 生成 SQL 查询。我们将主要关注在提示中获取相关的数据库特定信息的方法。

我们将涵盖：

- LangChain [SQLDatabase](https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) 的方言如何影响链的提示；
- 如何使用 `SQLDatabase.get_context` 将模式信息格式化到提示中；
- 如何构建和选择少量示例以协助模型。

## 设置

首先，获取所需的包并设置环境变量：


```python
%pip install --upgrade --quiet  langchain langchain-community langchain-experimental langchain-openai
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

现在，`Chinhook.db`在我们的目录中，我们可以使用SQLAlchemy驱动的`SQLDatabase`类与之接口：


```python
<!--IMPORTS:[{"imported": "SQLDatabase", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html", "title": "How to better prompt when doing SQL question-answering"}]-->
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db", sample_rows_in_table_info=3)
print(db.dialect)
print(db.get_usable_table_names())
print(db.run("SELECT * FROM Artist LIMIT 10;"))
```
```output
sqlite
['Album', 'Artist', 'Customer', 'Employee', 'Genre', 'Invoice', 'InvoiceLine', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
[(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains'), (6, 'Antônio Carlos Jobim'), (7, 'Apocalyptica'), (8, 'Audioslave'), (9, 'BackBeat'), (10, 'Billy Cobham')]
```
## 特定方言的提示

我们可以做的最简单的事情之一是使我们的提示特定于我们正在使用的SQL方言。当使用内置的[create_sql_query_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html)和[SQLDatabase](https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html)时，这会为您处理以下任何方言：


```python
from langchain.chains.sql_database.prompt import SQL_PROMPTS

list(SQL_PROMPTS)
```



```output
['crate',
 'duckdb',
 'googlesql',
 'mssql',
 'mysql',
 'mariadb',
 'oracle',
 'postgresql',
 'sqlite',
 'clickhouse',
 'prestodb']
```


例如，使用我们当前的数据库，我们可以看到我们将获得一个特定于SQLite的提示。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "create_sql_query_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sql_database.query.create_sql_query_chain.html", "title": "How to better prompt when doing SQL question-answering"}]-->
from langchain.chains import create_sql_query_chain

chain = create_sql_query_chain(llm, db)
chain.get_prompts()[0].pretty_print()
```
```output
You are a SQLite expert. Given an input question, first create a syntactically correct SQLite query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most 5 results using the LIMIT clause as per SQLite. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here

Only use the following tables:
[33;1m[1;3m{table_info}[0m

Question: [33;1m[1;3m{input}[0m
```
## 表定义和示例行

在大多数 SQL 链中，我们需要至少提供数据库模式的一部分给模型。没有这些信息，它将无法编写有效的查询。我们的数据库提供了一些便利的方法来给我们相关的上下文。具体来说，我们可以获取表名、它们的模式以及每个表的样本行。

在这里我们将使用 `SQLDatabase.get_context`，它提供可用的表及其模式：


```python
context = db.get_context()
print(list(context))
print(context["table_info"])
```
```output
['table_info', 'table_names']

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL, 
	"Title" NVARCHAR(160) NOT NULL, 
	"ArtistId" INTEGER NOT NULL, 
	PRIMARY KEY ("AlbumId"), 
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL, 
	"Name" NVARCHAR(120), 
	PRIMARY KEY ("ArtistId")
)

/*
3 rows from Artist table:
ArtistId	Name
1	AC/DC
2	Accept
3	Aerosmith
*/


CREATE TABLE "Customer" (
	"CustomerId" INTEGER NOT NULL, 
	"FirstName" NVARCHAR(40) NOT NULL, 
	"LastName" NVARCHAR(20) NOT NULL, 
	"Company" NVARCHAR(80), 
	"Address" NVARCHAR(70), 
	"City" NVARCHAR(40), 
	"State" NVARCHAR(40), 
	"Country" NVARCHAR(40), 
	"PostalCode" NVARCHAR(10), 
	"Phone" NVARCHAR(24), 
	"Fax" NVARCHAR(24), 
	"Email" NVARCHAR(60) NOT NULL, 
	"SupportRepId" INTEGER, 
	PRIMARY KEY ("CustomerId"), 
	FOREIGN KEY("SupportRepId") REFERENCES "Employee" ("EmployeeId")
)

/*
3 rows from Customer table:
CustomerId	FirstName	LastName	Company	Address	City	State	Country	PostalCode	Phone	Fax	Email	SupportRepId
1	Luís	Gonçalves	Embraer - Empresa Brasileira de Aeronáutica S.A.	Av. Brigadeiro Faria Lima, 2170	São José dos Campos	SP	Brazil	12227-000	+55 (12) 3923-5555	+55 (12) 3923-5566	luisg@embraer.com.br	3
2	Leonie	Köhler	None	Theodor-Heuss-Straße 34	Stuttgart	None	Germany	70174	+49 0711 2842222	None	leonekohler@surfeu.de	5
3	François	Tremblay	None	1498 rue Bélanger	Montréal	QC	Canada	H2G 1A7	+1 (514) 721-4711	None	ftremblay@gmail.com	3
*/


CREATE TABLE "Employee" (
	"EmployeeId" INTEGER NOT NULL, 
	"LastName" NVARCHAR(20) NOT NULL, 
	"FirstName" NVARCHAR(20) NOT NULL, 
	"Title" NVARCHAR(30), 
	"ReportsTo" INTEGER, 
	"BirthDate" DATETIME, 
	"HireDate" DATETIME, 
	"Address" NVARCHAR(70), 
	"City" NVARCHAR(40), 
	"State" NVARCHAR(40), 
	"Country" NVARCHAR(40), 
	"PostalCode" NVARCHAR(10), 
	"Phone" NVARCHAR(24), 
	"Fax" NVARCHAR(24), 
	"Email" NVARCHAR(60), 
	PRIMARY KEY ("EmployeeId"), 
	FOREIGN KEY("ReportsTo") REFERENCES "Employee" ("EmployeeId")
)

/*
3 rows from Employee table:
EmployeeId	LastName	FirstName	Title	ReportsTo	BirthDate	HireDate	Address	City	State	Country	PostalCode	Phone	Fax	Email
1	Adams	Andrew	General Manager	None	1962-02-18 00:00:00	2002-08-14 00:00:00	11120 Jasper Ave NW	Edmonton	AB	Canada	T5K 2N1	+1 (780) 428-9482	+1 (780) 428-3457	andrew@chinookcorp.com
2	Edwards	Nancy	Sales Manager	1	1958-12-08 00:00:00	2002-05-01 00:00:00	825 8 Ave SW	Calgary	AB	Canada	T2P 2T3	+1 (403) 262-3443	+1 (403) 262-3322	nancy@chinookcorp.com
3	Peacock	Jane	Sales Support Agent	2	1973-08-29 00:00:00	2002-04-01 00:00:00	1111 6 Ave SW	Calgary	AB	Canada	T2P 5M5	+1 (403) 262-3443	+1 (403) 262-6712	jane@chinookcorp.com
*/


CREATE TABLE "Genre" (
	"GenreId" INTEGER NOT NULL, 
	"Name" NVARCHAR(120), 
	PRIMARY KEY ("GenreId")
)

/*
3 rows from Genre table:
GenreId	Name
1	Rock
2	Jazz
3	Metal
*/


CREATE TABLE "Invoice" (
	"InvoiceId" INTEGER NOT NULL, 
	"CustomerId" INTEGER NOT NULL, 
	"InvoiceDate" DATETIME NOT NULL, 
	"BillingAddress" NVARCHAR(70), 
	"BillingCity" NVARCHAR(40), 
	"BillingState" NVARCHAR(40), 
	"BillingCountry" NVARCHAR(40), 
	"BillingPostalCode" NVARCHAR(10), 
	"Total" NUMERIC(10, 2) NOT NULL, 
	PRIMARY KEY ("InvoiceId"), 
	FOREIGN KEY("CustomerId") REFERENCES "Customer" ("CustomerId")
)

/*
3 rows from Invoice table:
InvoiceId	CustomerId	InvoiceDate	BillingAddress	BillingCity	BillingState	BillingCountry	BillingPostalCode	Total
1	2	2021-01-01 00:00:00	Theodor-Heuss-Straße 34	Stuttgart	None	Germany	70174	1.98
2	4	2021-01-02 00:00:00	Ullevålsveien 14	Oslo	None	Norway	0171	3.96
3	8	2021-01-03 00:00:00	Grétrystraat 63	Brussels	None	Belgium	1000	5.94
*/


CREATE TABLE "InvoiceLine" (
	"InvoiceLineId" INTEGER NOT NULL, 
	"InvoiceId" INTEGER NOT NULL, 
	"TrackId" INTEGER NOT NULL, 
	"UnitPrice" NUMERIC(10, 2) NOT NULL, 
	"Quantity" INTEGER NOT NULL, 
	PRIMARY KEY ("InvoiceLineId"), 
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"), 
	FOREIGN KEY("InvoiceId") REFERENCES "Invoice" ("InvoiceId")
)

/*
3 rows from InvoiceLine table:
InvoiceLineId	InvoiceId	TrackId	UnitPrice	Quantity
1	1	2	0.99	1
2	1	4	0.99	1
3	2	6	0.99	1
*/


CREATE TABLE "MediaType" (
	"MediaTypeId" INTEGER NOT NULL, 
	"Name" NVARCHAR(120), 
	PRIMARY KEY ("MediaTypeId")
)

/*
3 rows from MediaType table:
MediaTypeId	Name
1	MPEG audio file
2	Protected AAC audio file
3	Protected MPEG-4 video file
*/


CREATE TABLE "Playlist" (
	"PlaylistId" INTEGER NOT NULL, 
	"Name" NVARCHAR(120), 
	PRIMARY KEY ("PlaylistId")
)

/*
3 rows from Playlist table:
PlaylistId	Name
1	Music
2	Movies
3	TV Shows
*/


CREATE TABLE "PlaylistTrack" (
	"PlaylistId" INTEGER NOT NULL, 
	"TrackId" INTEGER NOT NULL, 
	PRIMARY KEY ("PlaylistId", "TrackId"), 
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"), 
	FOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")
)

/*
3 rows from PlaylistTrack table:
PlaylistId	TrackId
1	3402
1	3389
1	3390
*/


CREATE TABLE "Track" (
	"TrackId" INTEGER NOT NULL, 
	"Name" NVARCHAR(200) NOT NULL, 
	"AlbumId" INTEGER, 
	"MediaTypeId" INTEGER NOT NULL, 
	"GenreId" INTEGER, 
	"Composer" NVARCHAR(220), 
	"Milliseconds" INTEGER NOT NULL, 
	"Bytes" INTEGER, 
	"UnitPrice" NUMERIC(10, 2) NOT NULL, 
	PRIMARY KEY ("TrackId"), 
	FOREIGN KEY("MediaTypeId") REFERENCES "MediaType" ("MediaTypeId"), 
	FOREIGN KEY("GenreId") REFERENCES "Genre" ("GenreId"), 
	FOREIGN KEY("AlbumId") REFERENCES "Album" ("AlbumId")
)

/*
3 rows from Track table:
TrackId	Name	AlbumId	MediaTypeId	GenreId	Composer	Milliseconds	Bytes	UnitPrice
1	For Those About To Rock (We Salute You)	1	1	1	Angus Young, Malcolm Young, Brian Johnson	343719	11170334	0.99
2	Balls to the Wall	2	2	1	U. Dirkschneider, W. Hoffmann, H. Frank, P. Baltes, S. Kaufmann, G. Hoffmann	342562	5510424	0.99
3	Fast As a Shark	3	2	1	F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman	230619	3990994	0.99
*/
```
当我们没有太多或太宽的表时，我们可以将这些信息的全部插入到我们的提示中：


```python
prompt_with_context = chain.get_prompts()[0].partial(table_info=context["table_info"])
print(prompt_with_context.pretty_repr()[:1500])
```
```output
You are a SQLite expert. Given an input question, first create a syntactically correct SQLite query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most 5 results using the LIMIT clause as per SQLite. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here

Only use the following tables:

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL, 
	"Title" NVARCHAR(160) NOT NULL, 
	"ArtistId" INTEGER NOT NULL, 
	PRIMARY KEY ("AlbumId"), 
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL, 
	"Name" NVARCHAR(120)
```
当我们的数据库模式太大，无法放入模型的上下文窗口时，我们需要想出方法，根据用户输入仅将相关的表定义插入到提示中。有关更多信息，请查看 [许多表、宽表、高基数特征](/docs/how_to/sql_large_db) 指南。

## 少量示例

在提示中包含自然语言问题转换为有效 SQL 查询的示例，通常会提高模型性能，尤其是对于复杂查询。

假设我们有以下示例：


```python
examples = [
    {"input": "List all artists.", "query": "SELECT * FROM Artist;"},
    {
        "input": "Find all albums for the artist 'AC/DC'.",
        "query": "SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');",
    },
    {
        "input": "List all tracks in the 'Rock' genre.",
        "query": "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');",
    },
    {
        "input": "Find the total duration of all tracks.",
        "query": "SELECT SUM(Milliseconds) FROM Track;",
    },
    {
        "input": "List all customers from Canada.",
        "query": "SELECT * FROM Customer WHERE Country = 'Canada';",
    },
    {
        "input": "How many tracks are there in the album with ID 5?",
        "query": "SELECT COUNT(*) FROM Track WHERE AlbumId = 5;",
    },
    {
        "input": "Find the total number of invoices.",
        "query": "SELECT COUNT(*) FROM Invoice;",
    },
    {
        "input": "List all tracks that are longer than 5 minutes.",
        "query": "SELECT * FROM Track WHERE Milliseconds > 300000;",
    },
    {
        "input": "Who are the top 5 customers by total purchase?",
        "query": "SELECT CustomerId, SUM(Total) AS TotalPurchase FROM Invoice GROUP BY CustomerId ORDER BY TotalPurchase DESC LIMIT 5;",
    },
    {
        "input": "Which albums are from the year 2000?",
        "query": "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';",
    },
    {
        "input": "How many employees are there",
        "query": 'SELECT COUNT(*) FROM "Employee"',
    },
]
```

我们可以像这样创建一个少量示例的提示：


```python
<!--IMPORTS:[{"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to better prompt when doing SQL question-answering"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to better prompt when doing SQL question-answering"}]-->
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template("User input: {input}\nSQL query: {query}")
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than {top_k} rows.\n\nHere is the relevant table info: {table_info}\n\nBelow are a number of examples of questions and their corresponding SQL queries.",
    suffix="User input: {input}\nSQL query: ",
    input_variables=["input", "top_k", "table_info"],
)
```


```python
print(prompt.format(input="How many artists are there?", top_k=3, table_info="foo"))
```
```output
You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than 3 rows.

Here is the relevant table info: foo

Below are a number of examples of questions and their corresponding SQL queries.

User input: List all artists.
SQL query: SELECT * FROM Artist;

User input: Find all albums for the artist 'AC/DC'.
SQL query: SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');

User input: List all tracks in the 'Rock' genre.
SQL query: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

User input: Find the total duration of all tracks.
SQL query: SELECT SUM(Milliseconds) FROM Track;

User input: List all customers from Canada.
SQL query: SELECT * FROM Customer WHERE Country = 'Canada';

User input: How many artists are there?
SQL query:
```
## 动态少量示例

如果我们有足够的示例，我们可能只想在提示中包含最相关的示例，或者因为它们不适合模型的上下文窗口，或者因为长尾示例会分散模型的注意力。具体来说，给定任何输入，我们希望包含与该输入最相关的示例。

我们可以使用示例选择器来实现这一点。在这种情况下，我们将使用[语义相似性示例选择器](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html)，它将把示例存储在我们选择的向量数据库中。在运行时，它将对输入和我们的示例进行相似性搜索，并返回最语义相似的示例。

我们在这里默认使用OpenAI嵌入，但您可以将其更换为您选择的大模型供应商。


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to better prompt when doing SQL question-answering"}, {"imported": "SemanticSimilarityExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html", "title": "How to better prompt when doing SQL question-answering"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to better prompt when doing SQL question-answering"}]-->
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=5,
    input_keys=["input"],
)
```


```python
example_selector.select_examples({"input": "how many artists are there?"})
```



```output
[{'input': 'List all artists.', 'query': 'SELECT * FROM Artist;'},
 {'input': 'How many employees are there',
  'query': 'SELECT COUNT(*) FROM "Employee"'},
 {'input': 'How many tracks are there in the album with ID 5?',
  'query': 'SELECT COUNT(*) FROM Track WHERE AlbumId = 5;'},
 {'input': 'Which albums are from the year 2000?',
  'query': "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';"},
 {'input': "List all tracks in the 'Rock' genre.",
  'query': "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');"}]
```


要使用它，我们可以将示例选择器直接传递给我们的少量示例提示模板：


```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than {top_k} rows.\n\nHere is the relevant table info: {table_info}\n\nBelow are a number of examples of questions and their corresponding SQL queries.",
    suffix="User input: {input}\nSQL query: ",
    input_variables=["input", "top_k", "table_info"],
)
```


```python
print(prompt.format(input="how many artists are there?", top_k=3, table_info="foo"))
```
```output
You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than 3 rows.

Here is the relevant table info: foo

Below are a number of examples of questions and their corresponding SQL queries.

User input: List all artists.
SQL query: SELECT * FROM Artist;

User input: How many employees are there
SQL query: SELECT COUNT(*) FROM "Employee"

User input: How many tracks are there in the album with ID 5?
SQL query: SELECT COUNT(*) FROM Track WHERE AlbumId = 5;

User input: Which albums are from the year 2000?
SQL query: SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';

User input: List all tracks in the 'Rock' genre.
SQL query: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

User input: how many artists are there?
SQL query:
```
尝试一下，我们看到模型识别了相关的表：


```python
chain = create_sql_query_chain(llm, db, prompt)
chain.invoke({"question": "how many artists are there?"})
```



```output
'SELECT COUNT(*) FROM Artist;'
```

