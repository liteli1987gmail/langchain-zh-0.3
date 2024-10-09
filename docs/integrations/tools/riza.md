---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/riza.ipynb
---
# Riza 代码解释器

> Riza 代码解释器是一个基于WASM的隔离环境，用于运行由AI代理生成的Python或JavaScript。

在这个笔记本中，我们将创建一个使用Python解决LLM无法独立解决的问题的代理示例：
计算单词 "strawberry" 中'r'的数量。

在开始之前，请从[Riza仪表板](https://dashboard.riza.io)获取API密钥。有关更多指南和完整的API参考
请访问[Riza 代码解释器API文档](https://docs.riza.io)。

确保您已安装必要的依赖项。


```python
%pip install --upgrade --quiet langchain-community rizaio
```

将您的API密钥设置为环境变量。


```python
%env ANTHROPIC_API_KEY=<your_anthropic_api_key_here>
%env RIZA_API_KEY=<your_riza_api_key_here>
```


```python
<!--IMPORTS:[{"imported": "ExecPython", "source": "langchain_community.tools.riza.command", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.riza.command.ExecPython.html", "title": "Riza Code Interpreter"}]-->
from langchain_community.tools.riza.command import ExecPython
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Riza Code Interpreter"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "Riza Code Interpreter"}, {"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "Riza Code Interpreter"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Riza Code Interpreter"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
```

初始化`ExecPython`工具。


```python
tools = [ExecPython()]
```

使用Anthropic的Claude Haiku模型初始化代理。


```python
llm = ChatAnthropic(model="claude-3-haiku-20240307", temperature=0)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Make sure to use a tool if you need to solve a problem.",
        ),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

agent = create_tool_calling_agent(llm, tools, prompt_template)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```


```python
# Ask a tough question
result = agent_executor.invoke({"input": "how many rs are in strawberry?"})
print(result["output"][0]["text"])
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `riza_exec_python` with `{'code': 'word = "strawberry"\nprint(word.count("r"))'}`
responded: [{'id': 'toolu_01JwPLAAqqCNCjVuEnK8Fgut', 'input': {}, 'name': 'riza_exec_python', 'type': 'tool_use', 'index': 0, 'partial_json': '{"code": "word = \\"strawberry\\"\\nprint(word.count(\\"r\\"))"}'}]

[0m[36;1m[1;3m3
[0m[32;1m[1;3m[{'text': '\n\nThe word "strawberry" contains 3 "r" characters.', 'type': 'text', 'index': 0}][0m

[1m> Finished chain.[0m


The word "strawberry" contains 3 "r" characters.
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
