---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/mlx.ipynb
---
# MLX

本笔记展示了如何开始使用 `MLX` 大型语言模型作为聊天模型。

特别是，我们将：
1. 利用 [MLXPipeline](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/mlx_pipeline.py)，
2. 利用 `ChatMLX` 类使这些大型语言模型能够与 LangChain 的 [聊天消息](https://python.langchain.com/docs/modules/model_io/chat/#messages) 抽象接口。
3. 演示如何使用开源大型语言模型来驱动 `ChatAgent` 流水线



```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

## 1. 实例化一个大型语言模型

有三个大型语言模型选项可供选择。


```python
<!--IMPORTS:[{"imported": "MLXPipeline", "source": "langchain_community.llms.mlx_pipeline", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.mlx_pipeline.MLXPipeline.html", "title": "MLX"}]-->
from langchain_community.llms.mlx_pipeline import MLXPipeline

llm = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

## 2. 实例化 `ChatMLX` 以应用聊天模板

实例化聊天模型和一些要传递的消息。


```python
<!--IMPORTS:[{"imported": "ChatMLX", "source": "langchain_community.chat_models.mlx", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.mlx.ChatMLX.html", "title": "MLX"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "MLX"}]-->
from langchain_community.chat_models.mlx import ChatMLX
from langchain_core.messages import HumanMessage

messages = [
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatMLX(llm=llm)
```

检查聊天消息是如何格式化以进行大型语言模型调用的。


```python
chat_model._to_chat_prompt(messages)
```

调用模型。


```python
res = chat_model.invoke(messages)
print(res.content)
```

## 3. 作为代理进行测试！

在这里，我们将测试 `gemma-2b-it` 作为一个零-shot `ReAct` 代理。下面的示例取自 [这里](https://python.langchain.com/docs/modules/agents/agent_types/react#using-chat-models)。

> 注意：要运行此部分，您需要将 [SerpAPI Token](https://serpapi.com/) 保存为环境变量：`SERPAPI_API_KEY`


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "MLX"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "MLX"}, {"imported": "format_log_to_str", "source": "langchain.agents.format_scratchpad", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.format_scratchpad.log.format_log_to_str.html", "title": "MLX"}, {"imported": "ReActJsonSingleInputOutputParser", "source": "langchain.agents.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.output_parsers.react_json_single_input.ReActJsonSingleInputOutputParser.html", "title": "MLX"}, {"imported": "render_text_description", "source": "langchain.tools.render", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.render.render_text_description.html", "title": "MLX"}, {"imported": "SerpAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.serpapi.SerpAPIWrapper.html", "title": "MLX"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, load_tools
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parsers import (
    ReActJsonSingleInputOutputParser,
)
from langchain.tools.render import render_text_description
from langchain_community.utilities import SerpAPIWrapper
```

使用 `react-json` 风格的提示配置代理，并访问搜索引擎和计算器。


```python
# setup tools
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# setup ReAct style prompt
prompt = hub.pull("hwchase17/react-json")
prompt = prompt.partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)

# define the agent
chat_model_with_stop = chat_model.bind(stop=["\nObservation"])
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_log_to_str(x["intermediate_steps"]),
    }
    | prompt
    | chat_model_with_stop
    | ReActJsonSingleInputOutputParser()
)

# instantiate AgentExecutor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```


```python
agent_executor.invoke(
    {
        "input": "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
    }
)
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
