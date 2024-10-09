---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/arxiv.ipynb
---
# ArXiv

本笔记介绍如何使用代理与`arxiv`工具。

首先，您需要安装`arxiv` Python包。


```python
%pip install --upgrade --quiet  langchain-community arxiv
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "ArXiv"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.react.agent.create_react_agent.html", "title": "ArXiv"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "ArXiv"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "ArXiv"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, load_tools
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.0)
tools = load_tools(
    ["arxiv"],
)
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```


```python
agent_executor.invoke(
    {
        "input": "What's the paper 1605.08386 about?",
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should use the arxiv tool to search for the paper with the given identifier.
Action: arxiv
Action Input: 1605.08386[0m[36;1m[1;3mPublished: 2016-05-26
Title: Heat-bath random walks with Markov bases
Authors: Caprice Stanley, Tobias Windisch
Summary: Graphs on lattice points are studied whose edges come from a finite set of
allowed moves of arbitrary length. We show that the diameter of these graphs on
fibers of a fixed integer matrix can be bounded from above by a constant. We
then study the mixing behaviour of heat-bath random walks on these graphs. We
also state explicit conditions on the set of moves so that the heat-bath random
walk, a generalization of the Glauber dynamics, is an expander in fixed
dimension.[0m[32;1m[1;3mThe paper "1605.08386" is titled "Heat-bath random walks with Markov bases" and is authored by Caprice Stanley and Tobias Windisch. It was published on May 26, 2016. The paper discusses the study of graphs on lattice points with edges coming from a finite set of allowed moves. It explores the diameter of these graphs and the mixing behavior of heat-bath random walks on them. The paper also discusses conditions for the heat-bath random walk to be an expander in fixed dimension.
Final Answer: The paper "1605.08386" is about heat-bath random walks with Markov bases.[0m

[1m> Finished chain.[0m
```


```output
{'input': "What's the paper 1605.08386 about?",
 'output': 'The paper "1605.08386" is about heat-bath random walks with Markov bases.'}
```


## ArXiv API 包装器

该工具使用 `API 包装器`。下面，我们将探讨它提供的一些功能。


```python
<!--IMPORTS:[{"imported": "ArxivAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.arxiv.ArxivAPIWrapper.html", "title": "ArXiv"}]-->
from langchain_community.utilities import ArxivAPIWrapper
```

您可以使用 ArxivAPIWrapper 获取有关科学文章或文章的信息。查询文本限制为 300 个字符。

ArxivAPIWrapper 返回以下文章字段：
- 出版日期
- 标题
- 作者
- 摘要

以下查询返回有关 arxiv ID 为 "1605.08386" 的一篇文章的信息。


```python
arxiv = ArxivAPIWrapper()
docs = arxiv.run("1605.08386")
docs
```



```output
'Published: 2016-05-26\nTitle: Heat-bath random walks with Markov bases\nAuthors: Caprice Stanley, Tobias Windisch\nSummary: Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.'
```


现在，我们想要获取有关一位作者 `Caprice Stanley` 的信息。

此查询返回有关三篇文章的信息。默认情况下，查询仅返回三篇顶级文章的信息。


```python
docs = arxiv.run("Caprice Stanley")
docs
```



```output
'Published: 2017-10-10\nTitle: On Mixing Behavior of a Family of Random Walks Determined by a Linear Recurrence\nAuthors: Caprice Stanley, Seth Sullivant\nSummary: We study random walks on the integers mod $G_n$ that are determined by an\ninteger sequence $\\{ G_n \\}_{n \\geq 1}$ generated by a linear recurrence\nrelation. Fourier analysis provides explicit formulas to compute the\neigenvalues of the transition matrices and we use this to bound the mixing time\nof the random walks.\n\nPublished: 2016-05-26\nTitle: Heat-bath random walks with Markov bases\nAuthors: Caprice Stanley, Tobias Windisch\nSummary: Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.\n\nPublished: 2003-03-18\nTitle: Calculation of fluxes of charged particles and neutrinos from atmospheric showers\nAuthors: V. Plyaskin\nSummary: The results on the fluxes of charged particles and neutrinos from a\n3-dimensional (3D) simulation of atmospheric showers are presented. An\nagreement of calculated fluxes with data on charged particles from the AMS and\nCAPRICE detectors is demonstrated. Predictions on neutrino fluxes at different\nexperimental sites are compared with results from other calculations.'
```


现在，我们正在尝试查找有关不存在的文章的信息。在这种情况下，响应为“未找到好的 Arxiv 结果”。


```python
docs = arxiv.run("1605.08386WWW")
docs
```



```output
'No good Arxiv Result was found'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
