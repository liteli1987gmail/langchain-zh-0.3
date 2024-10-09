---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/memorize.ipynb
---
# 记忆

对大型语言模型进行微调，以使用无监督学习记忆信息。

此工具需要支持微调的大型语言模型。目前，仅支持 `langchain.llms import GradientLLM`。

## 导入


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Memorize"}, {"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Memorize"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Memorize"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Memorize"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Memorize"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Memorize"}, {"imported": "GradientLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gradient_ai.GradientLLM.html", "title": "Memorize"}]-->
import os

from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import GradientLLM
```

## 设置环境 API 密钥
确保从 Gradient AI 获取您的 API 密钥。您将获得 $10 的免费积分以测试和微调不同的模型。


```python
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
if not os.environ.get("GRADIENT_MODEL_ADAPTER_ID", None):
    # `ID` listed in `$ gradient model list --workspace-id "$GRADIENT_WORKSPACE_ID"`
    os.environ["GRADIENT_MODEL_ID"] = getpass("gradient.ai model id:")
```

可选：验证您的环境变量 ```GRADIENT_ACCESS_TOKEN``` 和 ```GRADIENT_WORKSPACE_ID``` 以获取当前部署的模型。

## 创建 `GradientLLM` 实例
您可以指定不同的参数，例如模型名称、生成的最大令牌、温度等。


```python
llm = GradientLLM(
    model_id=os.environ["GRADIENT_MODEL_ID"],
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
)
```

## 加载工具


```python
tools = load_tools(["memorize"], llm=llm)
```

## 初始化代理


```python
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    # memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
)
```

## 运行代理
让代理记住一段文本。


```python
agent.run(
    "Please remember the fact in detail:\nWith astonishing dexterity, Zara Tubikova set a world record by solving a 4x4 Rubik's Cube variation blindfolded in under 20 seconds, employing only their feet."
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should memorize this fact.
Action: Memorize
Action Input: Zara T[0m
Observation: [36;1m[1;3mTrain complete. Loss: 1.6853971333333335[0m
Thought:[32;1m[1;3mI now know the final answer.
Final Answer: Zara Tubikova set a world[0m

[1m> Finished chain.[0m
```


```output
'Zara Tubikova set a world'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
