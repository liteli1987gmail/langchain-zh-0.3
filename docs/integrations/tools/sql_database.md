---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/sql_database.ipynb
---
# SQLDatabase 工具包

这将帮助您开始使用 SQL 数据库 [工具包](/docs/concepts/#toolkits)。有关所有 `SQLDatabaseToolkit` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.sql.toolkit.SQLDatabaseToolkit.html)。

`SQLDatabaseToolkit` 中的工具旨在与 `SQL` 数据库进行交互。

一个常见的应用是使代理能够使用关系数据库中的数据回答问题，可能以迭代的方式进行（例如，从错误中恢复）。

**⚠️ 安全提示 ⚠️**

构建 SQL 数据库的问答系统需要执行模型生成的 SQL 查询。这会带来固有的风险。确保您的数据库连接权限始终根据您的链/代理的需求尽可能狭窄。这将减轻但不会消除构建模型驱动系统的风险。有关一般安全最佳实践的更多信息，请 [查看这里](/docs/security)。

## 设置

如果您希望从单个工具的运行中获得自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

该工具包位于 `langchain-community` 包中：


```python
%pip install --upgrade --quiet  langchain-community
```

为了演示，我们将访问 LangChain [Hub](https://smith.langchain.com/hub) 中的一个提示。我们还需要 `langgraph` 来演示如何使用该工具包与代理。这并不是使用该工具包的必要条件。


```python
%pip install --upgrade --quiet langchainhub langgraph
```

## 实例化

 `SQLDatabaseToolkit` 工具包需要：

- 一个 [SQLDatabase](https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) 对象；
- 一个大型语言模型或聊天模型（用于实例化 [QuerySQLCheckerTool](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.sql_database.tool.QuerySQLCheckerTool.html) 工具）。

下面，我们将使用这些对象实例化工具包。让我们首先创建一个数据库对象。

本指南使用基于 [这些说明](https://database.guide/2-sample-databases-sqlite/) 的示例 `Chinook` 数据库。

下面我们将使用 `requests` 库来拉取 `.sql` 文件并创建一个内存中的 SQLite 数据库。请注意，这种方法轻量，但是短暂的且不线程安全。如果您愿意，可以按照说明将文件保存为 `Chinook.db` 并通过 `db = SQLDatabase.from_uri("sqlite:///Chinook.db")` 实例化数据库。


```python
<!--IMPORTS:[{"imported": "SQLDatabase", "source": "langchain_community.utilities.sql_database", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html", "title": "SQLDatabase Toolkit"}]-->
import sqlite3

import requests
from langchain_community.utilities.sql_database import SQLDatabase
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool


def get_engine_for_chinook_db():
    """Pull sql file, populate in-memory database, and create engine."""
    url = "https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql"
    response = requests.get(url)
    sql_script = response.text

    connection = sqlite3.connect(":memory:", check_same_thread=False)
    connection.executescript(sql_script)
    return create_engine(
        "sqlite://",
        creator=lambda: connection,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )


engine = get_engine_for_chinook_db()

db = SQLDatabase(engine)
```

我们还需要一个大型语言模型或聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />


我们现在可以实例化工具包：


```python
<!--IMPORTS:[{"imported": "SQLDatabaseToolkit", "source": "langchain_community.agent_toolkits.sql.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.sql.toolkit.SQLDatabaseToolkit.html", "title": "SQLDatabase Toolkit"}]-->
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit

toolkit = SQLDatabaseToolkit(db=db, llm=llm)
```

## 工具

查看可用工具：


```python
toolkit.get_tools()
```



```output
[QuerySQLDataBaseTool(description="Input to this tool is a detailed and correct SQL query, output is a result from the database. If the query is not correct, an error message will be returned. If an error is returned, rewrite the query, check the query, and try again. If you encounter an issue with Unknown column 'xxxx' in 'field list', use sql_db_schema to query the correct table fields.", db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x105e02860>),
 InfoSQLDatabaseTool(description='Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables. Be sure that the tables actually exist by calling sql_db_list_tables first! Example Input: table1, table2, table3', db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x105e02860>),
 ListSQLDatabaseTool(db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x105e02860>),
 QuerySQLCheckerTool(description='Use this tool to double check if your query is correct before executing it. Always use this tool before executing a query with sql_db_query!', db=<langchain_community.utilities.sql_database.SQLDatabase object at 0x105e02860>, llm=ChatOpenAI(client=<openai.resources.chat.completions.Completions object at 0x1148a97b0>, async_client=<openai.resources.chat.completions.AsyncCompletions object at 0x1148aaec0>, temperature=0.0, openai_api_key=SecretStr('**********'), openai_proxy=''), llm_chain=LLMChain(prompt=PromptTemplate(input_variables=['dialect', 'query'], template='\n{query}\nDouble check the {dialect} query above for common mistakes, including:\n- Using NOT IN with NULL values\n- Using UNION when UNION ALL should have been used\n- Using BETWEEN for exclusive ranges\n- Data type mismatch in predicates\n- Properly quoting identifiers\n- Using the correct number of arguments for functions\n- Casting to the correct data type\n- Using the proper columns for joins\n\nIf there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.\n\nOutput the final SQL query only.\n\nSQL Query: '), llm=ChatOpenAI(client=<openai.resources.chat.completions.Completions object at 0x1148a97b0>, async_client=<openai.resources.chat.completions.AsyncCompletions object at 0x1148aaec0>, temperature=0.0, openai_api_key=SecretStr('**********'), openai_proxy='')))]
```


API参考：

- [QuerySQLDataBaseTool](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.sql_database.tool.QuerySQLDataBaseTool.html)
- [InfoSQLDatabaseTool](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.sql_database.tool.InfoSQLDatabaseTool.html)
- [ListSQLDatabaseTool](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.sql_database.tool.ListSQLDatabaseTool.html)
- [QuerySQLCheckerTool](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.sql_database.tool.QuerySQLCheckerTool.html)

## 在代理中使用

根据[SQL问答教程](/docs/tutorials/sql_qa/#agents)，下面我们为一个简单的问答代理配备我们工具包中的工具。首先，我们提取一个相关的提示词并用其所需参数填充它：


```python
from langchain import hub

prompt_template = hub.pull("langchain-ai/sql-agent-system-prompt")

assert len(prompt_template.messages) == 1
print(prompt_template.input_variables)
```
```output
['dialect', 'top_k']
```

```python
system_message = prompt_template.format(dialect="SQLite", top_k=5)
```

然后我们实例化代理：


```python
from langgraph.prebuilt import create_react_agent

agent_executor = create_react_agent(
    llm, toolkit.get_tools(), state_modifier=system_message
)
```

并向其发出查询：


```python
example_query = "Which country's customers spent the most?"

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

Which country's customers spent the most?
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_list_tables (call_eiheSxiL0s90KE50XyBnBtJY)
 Call ID: call_eiheSxiL0s90KE50XyBnBtJY
  Args:
=================================[1m Tool Message [0m=================================
Name: sql_db_list_tables

Album, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_schema (call_YKwGWt4UUVmxxY7vjjBDzFLJ)
 Call ID: call_YKwGWt4UUVmxxY7vjjBDzFLJ
  Args:
    table_names: Customer, Invoice, InvoiceLine
=================================[1m Tool Message [0m=================================
Name: sql_db_schema


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
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_query (call_7WBDcMxl1h7MnI05njx1q8V9)
 Call ID: call_7WBDcMxl1h7MnI05njx1q8V9
  Args:
    query: SELECT c.Country, SUM(i.Total) AS TotalSpent FROM Customer c JOIN Invoice i ON c.CustomerId = i.CustomerId GROUP BY c.Country ORDER BY TotalSpent DESC LIMIT 1
=================================[1m Tool Message [0m=================================
Name: sql_db_query

[('USA', 523.0600000000003)]
==================================[1m Ai Message [0m==================================

Customers from the USA spent the most, with a total amount spent of $523.06.
```
我们还可以观察到代理从错误中恢复：


```python
example_query = "Who are the top 3 best selling artists?"

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

Who are the top 3 best selling artists?
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_query (call_9F6Bp2vwsDkeLW6FsJFqLiet)
 Call ID: call_9F6Bp2vwsDkeLW6FsJFqLiet
  Args:
    query: SELECT artist_name, SUM(quantity) AS total_sold FROM sales GROUP BY artist_name ORDER BY total_sold DESC LIMIT 3
=================================[1m Tool Message [0m=================================
Name: sql_db_query

Error: (sqlite3.OperationalError) no such table: sales
[SQL: SELECT artist_name, SUM(quantity) AS total_sold FROM sales GROUP BY artist_name ORDER BY total_sold DESC LIMIT 3]
(Background on this error at: https://sqlalche.me/e/20/e3q8)
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_list_tables (call_Gx5adzWnrBDIIxzUDzsn83zO)
 Call ID: call_Gx5adzWnrBDIIxzUDzsn83zO
  Args:
=================================[1m Tool Message [0m=================================
Name: sql_db_list_tables

Album, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_schema (call_ftywrZgEgGWLrnk9dYC0xtZv)
 Call ID: call_ftywrZgEgGWLrnk9dYC0xtZv
  Args:
    table_names: Artist, Album, InvoiceLine
=================================[1m Tool Message [0m=================================
Name: sql_db_schema


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
==================================[1m Ai Message [0m==================================
Tool Calls:
  sql_db_query (call_i6n3lmS7E2ZivN758VOayTiy)
 Call ID: call_i6n3lmS7E2ZivN758VOayTiy
  Args:
    query: SELECT Artist.Name AS artist_name, SUM(InvoiceLine.Quantity) AS total_sold FROM Artist JOIN Album ON Artist.ArtistId = Album.ArtistId JOIN Track ON Album.AlbumId = Track.AlbumId JOIN InvoiceLine ON Track.TrackId = InvoiceLine.TrackId GROUP BY Artist.Name ORDER BY total_sold DESC LIMIT 3
=================================[1m Tool Message [0m=================================
Name: sql_db_query

[('Iron Maiden', 140), ('U2', 107), ('Metallica', 91)]
==================================[1m Ai Message [0m==================================

The top 3 best selling artists are:
1. Iron Maiden - 140 units sold
2. U2 - 107 units sold
3. Metallica - 91 units sold
```
## 特定功能

`SQLDatabaseToolkit`实现了一个[.get_context](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.sql.toolkit.SQLDatabaseToolkit.html#langchain_community.agent_toolkits.sql.toolkit.SQLDatabaseToolkit.get_context)方法，方便在提示词或其他上下文中使用。

**⚠️ 免责声明 ⚠️** : 代理可能会生成插入/更新/删除查询。当这不是预期时，请使用自定义提示词或创建没有写权限的SQL用户。

最终用户可能会通过询问一个简单的问题，例如“运行尽可能大的查询”，来过载您的SQL数据库。生成的查询可能如下所示：

```sql
SELECT * FROM "public"."users"
    JOIN "public"."user_permissions" ON "public"."users".id = "public"."user_permissions".user_id
    JOIN "public"."projects" ON "public"."users".id = "public"."projects".user_id
    JOIN "public"."events" ON "public"."projects".id = "public"."events".project_id;
```

对于一个事务性SQL数据库，如果上述表格之一包含数百万行，查询可能会对使用同一数据库的其他应用程序造成麻烦。

大多数面向数据仓库的数据库支持用户级配额，以限制资源使用。

## API 参考

有关所有 SQLDatabaseToolkit 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.sql.toolkit.SQLDatabaseToolkit.html)。


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
