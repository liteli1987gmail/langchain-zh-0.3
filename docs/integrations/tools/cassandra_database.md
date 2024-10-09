---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/cassandra_database.ipynb
---
# Cassandra 数据库工具包

>`Apache Cassandra®` 是一种广泛使用的数据库，用于存储事务应用数据。大型语言模型中函数和工具的引入为生成式 AI 应用中的现有数据开辟了一些令人兴奋的用例。

>`Cassandra 数据库` 工具包使 AI 工程师能够高效地将代理与 Cassandra 数据集成，提供
>以下功能：
> - 通过优化查询实现快速数据访问。大多数查询应在个位数毫秒或更短时间内运行。
> - 模式自省以增强大型语言模型的推理能力
> - 与各种 Cassandra 部署的兼容性，包括 Apache Cassandra®、DataStax Enterprise™ 和 DataStax Astra™
> - 目前，该工具包仅限于 SELECT 查询和模式自省操作。（安全第一）

有关创建 Cassandra DB 代理的更多信息，请参见 [CQL 代理使用手册](https://github.com/langchain-ai/langchain/blob/master/cookbook/cql_agent.ipynb)

## 快速开始
- 安装 `cassio` 库
- 为您要连接的 Cassandra 数据库设置环境变量
- 初始化 `CassandraDatabase`
- 使用 `toolkit.get_tools()` 将工具传递给您的代理
- 放轻松，看看它为您完成所有工作

## 操作理论

`Cassandra 查询语言 (CQL)` 是与 Cassandra 数据库交互的主要 *以人为中心* 的方式。虽然在生成查询时提供了一定的灵活性，但它需要对 Cassandra 数据建模最佳实践的了解。LLM 函数调用使代理能够推理并选择工具以满足请求。使用 LLM 的代理在选择适当的工具包或工具链时应使用 Cassandra 特定的逻辑。这减少了在 LLM 被迫提供自上而下解决方案时引入的随机性。您希望 LLM 完全不受限制地访问您的数据库吗？是的。可能不行。为此，我们提供了一个提示，用于在为代理构建问题时使用：

您是一个 Apache Cassandra 专家查询分析机器人，具有以下功能
和规则：
- 您将接受最终用户关于查找特定内容的问题
数据库中的数据。
- 您将检查数据库的模式并创建查询路径。
- 您将为用户提供正确的查询，以找到他们正在寻找的数据。
并展示查询路径提供的步骤。
- 您将使用最佳实践来查询Apache Cassandra，使用分区键
和聚簇列。
- 避免在查询中使用ALLOW FILTERING。
- 目标是找到查询路径，因此可能需要查询其他表以获取
最终答案。

以下是JSON格式的查询路径示例：

```json
 {
  "query_paths": [
    {
      "description": "Direct query to users table using email",
      "steps": [
        {
          "table": "user_credentials",
          "query": 
             "SELECT userid FROM user_credentials WHERE email = 'example@example.com';"
        },
        {
          "table": "users",
          "query": "SELECT * FROM users WHERE userid = ?;"
        }
      ]
    }
  ]
}
```

## 提供的工具

### `cassandra_db_schema`
收集连接数据库或特定模式的所有模式信息。对于代理在确定行动时至关重要。

### `cassandra_db_select_table_data`
从特定的键空间和表中选择数据。代理可以传递用于谓词的参数以及返回记录数量的限制。

### `cassandra_db_query`
代理完全形成的查询字符串的实验性替代方案，而不是参数的 `cassandra_db_select_table_data`。*警告*：这可能导致不寻常的查询，可能性能不佳（甚至无法工作）。这可能在未来的版本中被移除。如果它做了一些很酷的事情，我们也想知道。你永远不知道！

## 环境设置

安装以下 Python 模块：

```bash
pip install ipykernel python-dotenv cassio langchain_openai langchain langchain-community langchainhub
```

### .env 文件
连接是通过 `cassio` 使用 `auto=True` 参数，笔记本使用 OpenAI。您应该相应地创建一个 `.env` 文件。

对于 Cassandra，设置：
```bash
CASSANDRA_CONTACT_POINTS
CASSANDRA_USERNAME
CASSANDRA_PASSWORD
CASSANDRA_KEYSPACE
```

对于 Astra，设置：
```bash
ASTRA_DB_APPLICATION_TOKEN
ASTRA_DB_DATABASE_ID
ASTRA_DB_KEYSPACE
```

例如：

```bash
# Connection to Astra:
ASTRA_DB_DATABASE_ID=a1b2c3d4-...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_KEYSPACE=notebooks

# Also set 
OPENAI_API_KEY=sk-....
```

(您也可以修改下面的代码以直接连接 `cassio`。)


```python
from dotenv import load_dotenv

load_dotenv(override=True)
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Cassandra Database Toolkit"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "Cassandra Database Toolkit"}, {"imported": "CassandraDatabaseToolkit", "source": "langchain_community.agent_toolkits.cassandra_database.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.cassandra_database.toolkit.CassandraDatabaseToolkit.html", "title": "Cassandra Database Toolkit"}, {"imported": "CassandraDatabase", "source": "langchain_community.utilities.cassandra_database", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.cassandra_database.CassandraDatabase.html", "title": "Cassandra Database Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Cassandra Database Toolkit"}]-->
# Import necessary libraries
import os

import cassio
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.agent_toolkits.cassandra_database.toolkit import (
    CassandraDatabaseToolkit,
)
from langchain_community.tools.cassandra_database.prompt import QUERY_PATH_PROMPT
from langchain_community.utilities.cassandra_database import CassandraDatabase
from langchain_openai import ChatOpenAI
```

## 连接到 Cassandra 数据库


```python
cassio.init(auto=True)
session = cassio.config.resolve_session()
if not session:
    raise Exception(
        "Check environment configuration or manually configure cassio connection parameters"
    )
```


```python
# Test data pep

session = cassio.config.resolve_session()

session.execute("""DROP KEYSPACE IF EXISTS langchain_agent_test; """)

session.execute(
    """
CREATE KEYSPACE if not exists langchain_agent_test 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_credentials (
    user_email text PRIMARY KEY,
    user_id UUID,
    password TEXT
);
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_videos ( 
    user_id UUID,
    video_id UUID,
    title TEXT,
    description TEXT,
    PRIMARY KEY (user_id, video_id)
);
"""
)

user_id = "522b1fe2-2e36-4cef-a667-cd4237d08b89"
video_id = "27066014-bad7-9f58-5a30-f63fe03718f6"

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_credentials (user_id, user_email) 
    VALUES ({user_id}, 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.users (id, name, email) 
    VALUES ({user_id}, 'Patrick McFadin', 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_videos (user_id, video_id, title)
    VALUES ({user_id}, {video_id}, 'Use Langflow to Build a LangChain LLM Application in 5 Minutes');
"""
)

session.set_keyspace("langchain_agent_test")
```


```python
# Create a CassandraDatabase instance
# Uses the cassio session to connect to the database
db = CassandraDatabase()
```


```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(temperature=0, model="gpt-4-1106-preview")
toolkit = CassandraDatabaseToolkit(db=db)

tools = toolkit.get_tools()

print("Available tools:")
for tool in tools:
    print(tool.name + "\t- " + tool.description)
```
```output
Available tools:
cassandra_db_schema	- 
    Input to this tool is a keyspace name, output is a table description 
    of Apache Cassandra tables.
    If the query is not correct, an error message will be returned.
    If an error is returned, report back to the user that the keyspace 
    doesn't exist and stop.
    
cassandra_db_query	- 
    Execute a CQL query against the database and get back the result.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.
    
cassandra_db_select_table_data	- 
    Tool for getting data from a table in an Apache Cassandra database. 
    Use the WHERE clause to specify the predicate for the query that uses the 
    primary key. A blank predicate will return all rows. Avoid this if possible. 
    Use the limit to specify the number of rows to return. A blank limit will 
    return all rows.
```

```python
prompt = hub.pull("hwchase17/openai-tools-agent")

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
```


```python
input = (
    QUERY_PATH_PROMPT
    + "\n\nHere is your task: Find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the langchain_agent_test keyspace."
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

response = agent_executor.invoke({"input": input})

print(response["output"])
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `cassandra_db_schema` with `{'keyspace': 'langchain_agent_test'}`


[0m[36;1m[1;3mTable Name: user_credentials
- Keyspace: langchain_agent_test
- Columns
  - password (text)
  - user_email (text)
  - user_id (uuid)
- Partition Keys: (user_email)
- Clustering Keys: 

Table Name: user_videos
- Keyspace: langchain_agent_test
- Columns
  - description (text)
  - title (text)
  - user_id (uuid)
  - video_id (uuid)
- Partition Keys: (user_id)
- Clustering Keys: (video_id asc)


Table Name: users
- Keyspace: langchain_agent_test
- Columns
  - email (text)
  - id (uuid)
  - name (text)
- Partition Keys: (id)
- Clustering Keys: 

[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_credentials', 'predicate': "user_email = 'patrick@datastax.com'", 'limit': 1}`


[0m[38;5;200m[1;3mRow(user_email='patrick@datastax.com', password=None, user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'))[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_videos', 'predicate': 'user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89', 'limit': 10}`


[0m[38;5;200m[1;3mRow(user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'), video_id=UUID('27066014-bad7-9f58-5a30-f63fe03718f6'), description='DataStax Academy is a free resource for learning Apache Cassandra.', title='DataStax Academy')[0m[32;1m[1;3mTo find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\`\`\`json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\`\`\`

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.[0m

[1m> Finished chain.[0m
To find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\`\`\`json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\`\`\`

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
