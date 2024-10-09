---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/sql_csv.ipynb
---
# 如何在CSV上进行问答

大型语言模型（LLMs）非常适合构建各种数据源上的问答系统。在本节中，我们将介绍如何在存储在CSV文件中的数据上构建问答系统。与使用SQL数据库一样，处理CSV文件的关键是让LLM访问查询和与数据交互的工具。实现这一点的两种主要方法是：

* **推荐**：将CSV文件加载到SQL数据库中，并使用[SQL教程](/docs/tutorials/sql_qa)中概述的方法。
* 让LLM访问一个Python环境，在其中可以使用像Pandas这样的库与数据进行交互。

我们将在本指南中涵盖这两种方法。

## ⚠️ 安全提示 ⚠️

上述两种方法都存在重大风险。使用SQL需要执行模型生成的SQL查询。使用像Pandas这样的库需要让模型执行Python代码。由于严格限制SQL连接权限和清理SQL查询比沙箱化Python环境更容易，**我们强烈建议通过SQL与CSV数据进行交互。** 有关一般安全最佳实践的更多信息，请[查看这里](/docs/security)。

## 设置
本指南的依赖项：


```python
%pip install -qU langchain langchain-openai langchain-community langchain-experimental pandas
```

设置所需的环境变量：


```python
# Using LangSmith is recommended but not required. Uncomment below lines to use.
# import os
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

如果您还没有，请下载[Titanic数据集](https://www.kaggle.com/datasets/yasserh/titanic-dataset)：


```python
!wget https://web.stanford.edu/class/archive/cs/cs109/cs109.1166/stuff/titanic.csv -O titanic.csv
```


```python
import pandas as pd

df = pd.read_csv("titanic.csv")
print(df.shape)
print(df.columns.tolist())
```
```output
(887, 8)
['Survived', 'Pclass', 'Name', 'Sex', 'Age', 'Siblings/Spouses Aboard', 'Parents/Children Aboard', 'Fare']
```
## SQL

使用SQL与CSV数据交互是推荐的方法，因为它比任意Python更容易限制权限和清理查询。

大多数SQL数据库都很容易将CSV文件加载为表（[DuckDB](https://duckdb.org/docs/data/csv/overview.html)，[SQLite](https://www.sqlite.org/csv.html)等）。完成此操作后，您可以使用[SQL教程](/docs/tutorials/sql_qa)中概述的所有链和代理创建技术。以下是我们如何使用SQLite的快速示例：


```python
<!--IMPORTS:[{"imported": "SQLDatabase", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html", "title": "How to do question answering over CSVs"}]-->
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

engine = create_engine("sqlite:///titanic.db")
df.to_sql("titanic", engine, index=False)
```



```output
887
```



```python
db = SQLDatabase(engine=engine)
print(db.dialect)
print(db.get_usable_table_names())
print(db.run("SELECT * FROM titanic WHERE Age < 2;"))
```
```output
sqlite
['titanic']
[(1, 2, 'Master. Alden Gates Caldwell', 'male', 0.83, 0, 2, 29.0), (0, 3, 'Master. Eino Viljami Panula', 'male', 1.0, 4, 1, 39.6875), (1, 3, 'Miss. Eleanor Ileen Johnson', 'female', 1.0, 1, 1, 11.1333), (1, 2, 'Master. Richard F Becker', 'male', 1.0, 2, 1, 39.0), (1, 1, 'Master. Hudson Trevor Allison', 'male', 0.92, 1, 2, 151.55), (1, 3, 'Miss. Maria Nakid', 'female', 1.0, 0, 2, 15.7417), (0, 3, 'Master. Sidney Leonard Goodwin', 'male', 1.0, 5, 2, 46.9), (1, 3, 'Miss. Helene Barbara Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 3, 'Miss. Eugenie Baclini', 'female', 0.75, 2, 1, 19.2583), (1, 2, 'Master. Viljo Hamalainen', 'male', 0.67, 1, 1, 14.5), (1, 3, 'Master. Bertram Vere Dean', 'male', 1.0, 1, 2, 20.575), (1, 3, 'Master. Assad Alexander Thomas', 'male', 0.42, 0, 1, 8.5167), (1, 2, 'Master. Andre Mallet', 'male', 1.0, 0, 2, 37.0042), (1, 2, 'Master. George Sibley Richards', 'male', 0.83, 1, 1, 18.75)]
```
并创建一个[SQL代理](/docs/tutorials/sql_qa)与之交互：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "create_sql_agent", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.sql.base.create_sql_agent.html", "title": "How to do question answering over CSVs"}]-->
from langchain_community.agent_toolkits import create_sql_agent

agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```


```python
agent_executor.invoke({"input": "what's the average age of survivors"})
```
```output


[1m> Entering new SQL Agent Executor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with `{}`


[0m[38;5;200m[1;3mtitanic[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `{'table_names': 'titanic'}`


[0m[33;1m[1;3m
CREATE TABLE titanic (
	"Survived" BIGINT, 
	"Pclass" BIGINT, 
	"Name" TEXT, 
	"Sex" TEXT, 
	"Age" FLOAT, 
	"Siblings/Spouses Aboard" BIGINT, 
	"Parents/Children Aboard" BIGINT, 
	"Fare" FLOAT
)

/*
3 rows from titanic table:
Survived	Pclass	Name	Sex	Age	Siblings/Spouses Aboard	Parents/Children Aboard	Fare
0	3	Mr. Owen Harris Braund	male	22.0	1	0	7.25
1	1	Mrs. John Bradley (Florence Briggs Thayer) Cumings	female	38.0	1	0	71.2833
1	3	Miss. Laina Heikkinen	female	26.0	0	0	7.925
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `{'query': 'SELECT AVG(Age) AS Average_Age FROM titanic WHERE Survived = 1'}`


[0m[36;1m[1;3m[(28.408391812865496,)][0m[32;1m[1;3mThe average age of survivors in the Titanic dataset is approximately 28.41 years.[0m

[1m> Finished chain.[0m
```


```output
{'input': "what's the average age of survivors",
 'output': 'The average age of survivors in the Titanic dataset is approximately 28.41 years.'}
```


这种方法很容易推广到多个CSV，因为我们可以将每个CSV加载到数据库中作为自己的表。请参见下面的[多个CSV](/docs/how_to/sql_csv#multiple-csvs)部分。

## Pandas

除了SQL，我们还可以使用数据分析库如pandas和大型语言模型的代码生成能力与CSV数据交互。同样，**除非您有广泛的安全措施，否则这种方法不适合生产用例**。因此，我们的代码执行工具和构造函数位于`langchain-experimental`包中。

### Chain

大多数大型语言模型已经在足够的 pandas Python 代码上进行了训练，因此它们可以仅通过请求生成代码：


```python
ai_msg = llm.invoke(
    "I have a pandas DataFrame 'df' with columns 'Age' and 'Fare'. Write code to compute the correlation between the two columns. Return Markdown for a Python code snippet and nothing else."
)
print(ai_msg.content)
```
```output
\`\`\`python
correlation = df['Age'].corr(df['Fare'])
correlation
\`\`\`
```
我们可以将这种能力与一个执行 Python 的工具结合起来，创建一个简单的数据分析链。我们首先想将我们的 CSV 表加载为数据框，并让工具访问这个数据框：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to do question answering over CSVs"}, {"imported": "PythonAstREPLTool", "source": "langchain_experimental.tools", "docs": "https://python.langchain.com/api_reference/experimental/tools/langchain_experimental.tools.python.tool.PythonAstREPLTool.html", "title": "How to do question answering over CSVs"}]-->
import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from langchain_experimental.tools import PythonAstREPLTool

df = pd.read_csv("titanic.csv")
tool = PythonAstREPLTool(locals={"df": df})
tool.invoke("df['Fare'].mean()")
```



```output
32.30542018038331
```


为了帮助确保我们正确使用 Python 工具，我们将使用 [工具调用](/docs/how_to/tool_calling)：


```python
llm_with_tools = llm.bind_tools([tool], tool_choice=tool.name)
response = llm_with_tools.invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
response
```



```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_SBrK246yUbdnJemXFC8Iod05', 'function': {'arguments': '{"query":"df.corr()[\'Age\'][\'Fare\']"}', 'name': 'python_repl_ast'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 125, 'total_tokens': 138}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-1fd332ba-fa72-4351-8182-d464e7368311-0', tool_calls=[{'name': 'python_repl_ast', 'args': {'query': "df.corr()['Age']['Fare']"}, 'id': 'call_SBrK246yUbdnJemXFC8Iod05'}])
```



```python
response.tool_calls
```



```output
[{'name': 'python_repl_ast',
  'args': {'query': "df.corr()['Age']['Fare']"},
  'id': 'call_SBrK246yUbdnJemXFC8Iod05'}]
```


我们将添加一个工具输出解析器，以将函数调用提取为字典：


```python
<!--IMPORTS:[{"imported": "JsonOutputKeyToolsParser", "source": "langchain_core.output_parsers.openai_tools", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser.html", "title": "How to do question answering over CSVs"}]-->
from langchain_core.output_parsers.openai_tools import JsonOutputKeyToolsParser

parser = JsonOutputKeyToolsParser(key_name=tool.name, first_tool_only=True)
(llm_with_tools | parser).invoke(
    "I have a dataframe 'df' and want to know the correlation between the 'Age' and 'Fare' columns"
)
```



```output
{'query': "df[['Age', 'Fare']].corr()"}
```


并结合一个提示，以便我们可以仅指定一个问题，而无需在每次调用时指定数据框信息：


```python
system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

\`\`\`
{df.head().to_markdown()}
\`\`\`

Given a user question, write the Python code to answer it. \
Return ONLY the valid Python code and nothing else. \
Don't assume you have access to any libraries other than built-in Python ones and pandas."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])
code_chain = prompt | llm_with_tools | parser
code_chain.invoke({"question": "What's the correlation between age and fare"})
```



```output
{'query': "df[['Age', 'Fare']].corr()"}
```


最后，我们将添加我们的 Python 工具，以便生成的代码实际上被执行：


```python
chain = prompt | llm_with_tools | parser | tool
chain.invoke({"question": "What's the correlation between age and fare"})
```



```output
0.11232863699941621
```


就这样，我们有了一个简单的数据分析链。我们可以通过查看 LangSmith 跟踪来了解中间步骤：https://smith.langchain.com/public/b1309290-7212-49b7-bde2-75b39a32b49a/r

我们可以在最后添加一个额外的 LLM 调用，以生成对话响应，这样我们就不仅仅是用工具输出进行响应。为此，我们想在提示中添加一个聊天历史 `MessagesPlaceholder`：


```python
<!--IMPORTS:[{"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to do question answering over CSVs"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to do question answering over CSVs"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to do question answering over CSVs"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to do question answering over CSVs"}]-->
from operator import itemgetter

from langchain_core.messages import ToolMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough

system = f"""You have access to a pandas dataframe `df`. \
Here is the output of `df.head().to_markdown()`:

\`\`\`
{df.head().to_markdown()}
\`\`\`

Given a user question, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas.
Respond directly to the question once you have enough information to answer it."""
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            system,
        ),
        ("human", "{question}"),
        # This MessagesPlaceholder allows us to optionally append an arbitrary number of messages
        # at the end of the prompt using the 'chat_history' arg.
        MessagesPlaceholder("chat_history", optional=True),
    ]
)


def _get_chat_history(x: dict) -> list:
    """Parse the chain output up to this point into a list of chat history messages to insert in the prompt."""
    ai_msg = x["ai_msg"]
    tool_call_id = x["ai_msg"].additional_kwargs["tool_calls"][0]["id"]
    tool_msg = ToolMessage(tool_call_id=tool_call_id, content=str(x["tool_output"]))
    return [ai_msg, tool_msg]


chain = (
    RunnablePassthrough.assign(ai_msg=prompt | llm_with_tools)
    .assign(tool_output=itemgetter("ai_msg") | parser | tool)
    .assign(chat_history=_get_chat_history)
    .assign(response=prompt | llm | StrOutputParser())
    .pick(["tool_output", "response"])
)
```


```python
chain.invoke({"question": "What's the correlation between age and fare"})
```



```output
{'tool_output': 0.11232863699941616,
 'response': 'The correlation between age and fare is approximately 0.1123.'}
```


这是此运行的 LangSmith 跟踪：https://smith.langchain.com/public/14e38d70-45b1-4b81-8477-9fd2b7c07ea6/r

### 代理

对于复杂的问题，LLM能够在保持之前执行的输入和输出的同时，迭代执行代码是非常有帮助的。这就是代理的作用。它们允许LLM决定工具需要被调用多少次，并跟踪到目前为止它所做的执行。[create_pandas_dataframe_agent](https://python.langchain.com/api_reference/experimental/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html)是一个内置代理，使得处理数据框变得简单：


```python
<!--IMPORTS:[{"imported": "create_pandas_dataframe_agent", "source": "langchain_experimental.agents", "docs": "https://python.langchain.com/api_reference/experimental/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html", "title": "How to do question answering over CSVs"}]-->
from langchain_experimental.agents import create_pandas_dataframe_agent

agent = create_pandas_dataframe_agent(llm, df, agent_type="openai-tools", verbose=True)
agent.invoke(
    {
        "input": "What's the correlation between age and fare? is that greater than the correlation between fare and survival?"
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Age', 'Fare']].corr().iloc[0,1]"}`


[0m[36;1m[1;3m0.11232863699941621[0m[32;1m[1;3m
Invoking: `python_repl_ast` with `{'query': "df[['Fare', 'Survived']].corr().iloc[0,1]"}`


[0m[36;1m[1;3m0.2561785496289603[0m[32;1m[1;3mThe correlation between Age and Fare is approximately 0.112, and the correlation between Fare and Survival is approximately 0.256.

Therefore, the correlation between Fare and Survival (0.256) is greater than the correlation between Age and Fare (0.112).[0m

[1m> Finished chain.[0m
```


```output
{'input': "What's the correlation between age and fare? is that greater than the correlation between fare and survival?",
 'output': 'The correlation between Age and Fare is approximately 0.112, and the correlation between Fare and Survival is approximately 0.256.\n\nTherefore, the correlation between Fare and Survival (0.256) is greater than the correlation between Age and Fare (0.112).'}
```


这是此次运行的LangSmith追踪记录：https://smith.langchain.com/public/6a86aee2-4f22-474a-9264-bd4c7283e665/r

### 多个CSV文件 {#multiple-csvs}

要处理多个CSV文件（或数据框），我们只需将多个数据框传递给我们的Python工具。我们的`create_pandas_dataframe_agent`构造函数可以开箱即用地做到这一点，我们可以传入一个数据框列表，而不仅仅是一个。如果我们自己构建链，可以这样做：


```python
df_1 = df[["Age", "Fare"]]
df_2 = df[["Fare", "Survived"]]

tool = PythonAstREPLTool(locals={"df_1": df_1, "df_2": df_2})
llm_with_tool = llm.bind_tools(tools=[tool], tool_choice=tool.name)
df_template = """\`\`\`python
{df_name}.head().to_markdown()
>>> {df_head}
\`\`\`"""
df_context = "\n\n".join(
    df_template.format(df_head=_df.head().to_markdown(), df_name=df_name)
    for _df, df_name in [(df_1, "df_1"), (df_2, "df_2")]
)

system = f"""You have access to a number of pandas dataframes. \
Here is a sample of rows from each dataframe and the python code that was used to generate the sample:

{df_context}

Given a user question about the dataframes, write the Python code to answer it. \
Don't assume you have access to any libraries other than built-in Python ones and pandas. \
Make sure to refer only to the variables mentioned above."""
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{question}")])

chain = prompt | llm_with_tool | parser | tool
chain.invoke(
    {
        "question": "return the difference in the correlation between age and fare and the correlation between fare and survival"
    }
)
```



```output
0.14384991262954416
```


这是此次运行的LangSmith追踪记录：https://smith.langchain.com/public/cc2a7d7f-7c5a-4e77-a10c-7b5420fcd07f/r

### 沙盒代码执行

有许多工具，如[E2B](/docs/integrations/tools/e2b_data_analysis)和[Bearly](/docs/integrations/tools/bearly)，提供Python代码执行的沙盒环境，以便于更安全的代码执行链和代理。

## 下一步

对于更高级的数据分析应用，我们建议查看：

* [SQL教程](/docs/tutorials/sql_qa)：处理SQL数据库和CSV文件的许多挑战对于任何结构化数据类型都是通用的，因此即使您使用Pandas进行CSV数据分析，阅读SQL技术也是有用的。
* [工具使用](/docs/how_to/tool_calling): 关于在使用调用工具的链和代理时的一般最佳实践的指南
* [代理](/docs/tutorials/agents): 理解构建大型语言模型代理的基本原理。
* 集成: 像 [E2B](/docs/integrations/tools/e2b_data_analysis) 和 [Bearly](/docs/integrations/tools/bearly) 的沙盒环境，像 [SQLDatabase](https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.sql_database.SQLDatabase.html#langchain_community.utilities.sql_database.SQLDatabase) 的实用工具，相关代理如 [Spark DataFrame 代理](/docs/integrations/tools/spark_sql)。
