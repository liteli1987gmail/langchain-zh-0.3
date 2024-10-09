---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/bittensor.ipynb
---
# Bittensor

>[Bittensor](https://bittensor.com/) 是一个类似于比特币的挖矿网络，包含内置激励机制，旨在鼓励矿工贡献计算能力和知识。
>
>`NIBittensorLLM` 由 [Neural Internet](https://neuralinternet.ai/) 开发，基于 `Bittensor` 提供支持。

>这个大型语言模型展示了去中心化人工智能的真正潜力，通过从 `Bittensor 协议` 中提供最佳响应，协议包含各种人工智能模型，如 `OpenAI`、`LLaMA2` 等。

用户可以在 [Validator Endpoint Frontend](https://api.neuralinternet.ai/) 查看他们的日志、请求和 API 密钥。然而，目前禁止对配置进行更改；否则，用户的查询将被阻止。

如果您遇到任何困难或有任何问题，请随时通过 [GitHub](https://github.com/Kunj-2206)、[Discord](https://discordapp.com/users/683542109248159777) 联系我们的开发者，或加入我们的 Discord 服务器以获取最新更新和查询 [Neural Internet](https://discord.gg/neuralinternet)。


## NIBittensorLLM 的不同参数和响应处理


```python
<!--IMPORTS:[{"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "Bittensor"}, {"imported": "NIBittensorLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.bittensor.NIBittensorLLM.html", "title": "Bittensor"}]-->
import json
from pprint import pprint

from langchain.globals import set_debug
from langchain_community.llms import NIBittensorLLM

set_debug(True)

# System parameter in NIBittensorLLM is optional but you can set whatever you want to perform with model
llm_sys = NIBittensorLLM(
    system_prompt="Your task is to determine response based on user prompt.Explain me like I am technical lead of a project"
)
sys_resp = llm_sys(
    "What is bittensor and What are the potential benefits of decentralized AI?"
)
print(f"Response provided by LLM with system prompt set is : {sys_resp}")

# The top_responses parameter can give multiple responses based on its parameter value
# This below code retrive top 10 miner's response all the response are in format of json

# Json response structure is
""" {
    "choices":  [
                    {"index": Bittensor's Metagraph index number,
                    "uid": Unique Identifier of a miner,
                    "responder_hotkey": Hotkey of a miner,
                    "message":{"role":"assistant","content": Contains actual response},
                    "response_ms": Time in millisecond required to fetch response from a miner} 
                ]
    } """

multi_response_llm = NIBittensorLLM(top_responses=10)
multi_resp = multi_response_llm.invoke("What is Neural Network Feeding Mechanism?")
json_multi_resp = json.loads(multi_resp)
pprint(json_multi_resp)
```

##  使用 NIBittensorLLM 与 LLMChain 和 PromptTemplate


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Bittensor"}, {"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "Bittensor"}, {"imported": "NIBittensorLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.bittensor.NIBittensorLLM.html", "title": "Bittensor"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Bittensor"}]-->
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import NIBittensorLLM
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)

# System parameter in NIBittensorLLM is optional but you can set whatever you want to perform with model
llm = NIBittensorLLM(
    system_prompt="Your task is to determine response based on user prompt."
)

llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What is bittensor?"

llm_chain.run(question)
```

##  使用 NIBittensorLLM 与对话代理和 Google 搜索工具


```python
<!--IMPORTS:[{"imported": "GoogleSearchAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.google_search.GoogleSearchAPIWrapper.html", "title": "Bittensor"}, {"imported": "Tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Bittensor"}]-->
from langchain_community.utilities import GoogleSearchAPIWrapper
from langchain_core.tools import Tool

search = GoogleSearchAPIWrapper()

tool = Tool(
    name="Google Search",
    description="Search Google for recent results.",
    func=search.run,
)
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Bittensor"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Bittensor"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Bittensor"}, {"imported": "NIBittensorLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.bittensor.NIBittensorLLM.html", "title": "Bittensor"}]-->
from langchain import hub
from langchain.agents import (
    AgentExecutor,
    create_react_agent,
)
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import NIBittensorLLM

tools = [tool]

prompt = hub.pull("hwchase17/react")


llm = NIBittensorLLM(
    system_prompt="Your task is to determine a response based on user prompt"
)

memory = ConversationBufferMemory(memory_key="chat_history")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory)

response = agent_executor.invoke({"input": prompt})
```


##  相关内容

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
