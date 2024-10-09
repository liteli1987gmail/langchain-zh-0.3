---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/zhipuai.ipynb
sidebar_label: ZHIPU AI
---
# ZHIPU AI

本笔记本展示了如何在LangChain中使用[ZHIPU AI API](https://open.bigmodel.cn/dev/api)与langchain.chat_models.ChatZhipuAI。

>[*GLM-4*](https://open.bigmodel.cn/)是一个与人类意图对齐的多语言大型语言模型，具备问答、多轮对话和代码生成的能力。新一代基础模型GLM-4的整体性能相比于上一代有了显著提升，支持更长的上下文；更强的多模态能力；支持更快的推理速度和更高的并发性，大大降低推理成本；同时，GLM-4增强了智能代理的能力。

## 开始使用
### 安装
首先，确保在您的Python环境中安装了zhipuai包。运行以下命令：


```python
#!pip install --upgrade httpx httpx-sse PyJWT
```

### 导入所需模块
安装后，将必要的模块导入到您的Python脚本中：


```python
<!--IMPORTS:[{"imported": "ChatZhipuAI", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.zhipuai.ChatZhipuAI.html", "title": "ZHIPU AI"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "ZHIPU AI"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ZHIPU AI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ZHIPU AI"}]-->
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### 设置您的API密钥
登录到[ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys)以获取访问我们模型的API密钥。


```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### 初始化ZHIPU AI聊天模型
以下是初始化聊天模型的方法：


```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### 基本用法
像这样使用系统和人类消息调用模型：


```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```


```python
response = chat.invoke(messages)
print(response.content)  # Displays the AI-generated poem
```

## 高级功能
### 流式支持
要进行持续交互，请使用流式处理功能：


```python
<!--IMPORTS:[{"imported": "CallbackManager", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "ZHIPU AI"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks.streaming_stdout", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ZHIPU AI"}]-->
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```


```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```


```python
streaming_chat(messages)
```

### 异步调用
对于非阻塞调用，请使用异步方法：


```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```


```python
response = await async_chat.agenerate([messages])
print(response)
```

### 与函数调用一起使用

GLM-4模型也可以与函数调用一起使用，使用以下代码运行一个简单的LangChain json_chat_agent。


```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "ZHIPU AI"}, {"imported": "create_json_chat_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.json_chat.base.create_json_chat_agent.html", "title": "ZHIPU AI"}, {"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "ZHIPU AI"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```


```python
agent_executor.invoke({"input": "what is LangChain?"})
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
