---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/pandas.ipynb
---
# Pandas 数据框

本笔记展示了如何使用代理与 `Pandas 数据框` 进行交互。它主要针对问答进行了优化。

**注意：此代理在后台调用 `Python` 代理，该代理执行 LLM 生成的 Python 代码 - 如果 LLM 生成的 Python 代码有害，这可能会很糟糕。请谨慎使用。**


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents.agent_types", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Pandas Dataframe"}, {"imported": "create_pandas_dataframe_agent", "source": "langchain_experimental.agents.agent_toolkits", "docs": "https://python.langchain.com/api_reference/experimental/agents/langchain_experimental.agents.agent_toolkits.pandas.base.create_pandas_dataframe_agent.html", "title": "Pandas Dataframe"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Pandas Dataframe"}]-->
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI
```


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Pandas Dataframe"}]-->
import pandas as pd
from langchain_openai import OpenAI

df = pd.read_csv(
    "https://raw.githubusercontent.com/pandas-dev/pandas/main/doc/data/titanic.csv"
)
```

## 使用 `ZERO_SHOT_REACT_DESCRIPTION`

这展示了如何使用 `ZERO_SHOT_REACT_DESCRIPTION` 代理类型初始化代理。


```python
agent = create_pandas_dataframe_agent(OpenAI(temperature=0), df, verbose=True)
```

## 使用 OpenAI 函数

这展示了如何使用 OPENAI_FUNCTIONS 代理类型初始化代理。请注意，这是一种替代方案。


```python
agent = create_pandas_dataframe_agent(
    ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613"),
    df,
    verbose=True,
    agent_type=AgentType.OPENAI_FUNCTIONS,
)
```


```python
agent.invoke("how many rows are there?")
```
```output


[1m> Entering new  chain...[0m
[32;1m[1;3m
Invoking: `python_repl_ast` with `df.shape[0]`


[0m[36;1m[1;3m891[0m[32;1m[1;3mThere are 891 rows in the dataframe.[0m

[1m> Finished chain.[0m
```


```output
'There are 891 rows in the dataframe.'
```



```python
agent.invoke("how many people have more than 3 siblings")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to count the number of people with more than 3 siblings
Action: python_repl_ast
Action Input: df[df['SibSp'] > 3].shape[0][0m
Observation: [36;1m[1;3m30[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: 30 people have more than 3 siblings.[0m

[1m> Finished chain.[0m
```


```output
'30 people have more than 3 siblings.'
```



```python
agent.invoke("whats the square root of the average age?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to calculate the average age first
Action: python_repl_ast
Action Input: df['Age'].mean()[0m
Observation: [36;1m[1;3m29.69911764705882[0m
Thought:[32;1m[1;3m I now need to calculate the square root of the average age
Action: python_repl_ast
Action Input: math.sqrt(df['Age'].mean())[0m
Observation: [36;1m[1;3mNameError("name 'math' is not defined")[0m
Thought:[32;1m[1;3m I need to import the math library
Action: python_repl_ast
Action Input: import math[0m
Observation: [36;1m[1;3m[0m
Thought:[32;1m[1;3m I now need to calculate the square root of the average age
Action: python_repl_ast
Action Input: math.sqrt(df['Age'].mean())[0m
Observation: [36;1m[1;3m5.449689683556195[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The square root of the average age is 5.449689683556195.[0m

[1m> Finished chain.[0m
```


```output
'The square root of the average age is 5.449689683556195.'
```


## 多数据框示例

接下来的部分展示了代理如何与作为列表传入的多个数据框进行交互。


```python
df1 = df.copy()
df1["Age"] = df1["Age"].fillna(df1["Age"].mean())
```


```python
agent = create_pandas_dataframe_agent(OpenAI(temperature=0), [df, df1], verbose=True)
agent.invoke("how many rows in the age column are different?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: I need to compare the age columns in both dataframes
Action: python_repl_ast
Action Input: len(df1[df1['Age'] != df2['Age']])[0m
Observation: [36;1m[1;3m177[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: 177 rows in the age column are different.[0m

[1m> Finished chain.[0m
```


```output
'177 rows in the age column are different.'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
