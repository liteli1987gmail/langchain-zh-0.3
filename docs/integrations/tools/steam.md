---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/steam.ipynb
---
# Steam 工具包

>[Steam (维基百科)](https://en.wikipedia.org/wiki/Steam_(service)) 是由 `Valve Corporation` 开发的视频游戏数字发行服务和商店。它为Valve的游戏自动提供更新，并扩展到分发第三方游戏。`Steam` 提供各种功能，如与Valve反作弊措施的游戏服务器匹配、社交网络和游戏流媒体服务。

>[Steam](https://store.steampowered.com/about/) 是玩、讨论和创建游戏的终极目的地。

Steam工具包有两个工具：
- `游戏详情`
- `推荐游戏`

本笔记本提供了使用Steam API与LangChain结合的操作指南，以根据您当前的Steam游戏库存检索Steam游戏推荐或收集您提供的某些Steam游戏的信息。

## 设置

我们需要安装两个Python库。

## 导入


```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## 分配环境变量
要使用此工具包，请准备好您的 OpenAI API 密钥、Steam API 密钥（来自 [这里](https://steamcommunity.com/dev/apikey)）和您自己的 SteamID。一旦您获得了 Steam API 密钥，可以将其作为环境变量输入到下面。
工具包将读取 "STEAM_KEY" API 密钥作为环境变量以进行身份验证，因此请在此设置。您还需要设置您的 "OPENAI_API_KEY" 和 "STEAM_ID"。


```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## 初始化：
初始化 LLM、SteamWebAPIWrapper、SteamToolkit，最重要的是初始化 langchain 代理以处理您的查询！
## 示例


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Steam Toolkit"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Steam Toolkit"}, {"imported": "SteamToolkit", "source": "langchain_community.agent_toolkits.steam.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.steam.toolkit.SteamToolkit.html", "title": "Steam Toolkit"}, {"imported": "SteamWebAPIWrapper", "source": "langchain_community.utilities.steam", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.steam.SteamWebAPIWrapper.html", "title": "Steam Toolkit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Steam Toolkit"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.steam.toolkit import SteamToolkit
from langchain_community.utilities.steam import SteamWebAPIWrapper
from langchain_openai import OpenAI
```


```python
llm = OpenAI(temperature=0)
Steam = SteamWebAPIWrapper()
toolkit = SteamToolkit.from_steam_api_wrapper(Steam)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```


```python
out = agent("can you give the information about the game Terraria")
print(out)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find the game details
Action: Get Games Details
Action Input: Terraria[0m
Observation: [36;1m[1;3mThe id is: 105600
The link is: https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13
The price is: $9.99
The summary of the game is: Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a world of your own?   Key features: Sandbox Play  Randomly generated worlds Free Content Updates 
The supported languages of the game are: English, French, Italian, German, Spanish - Spain, Polish, Portuguese - Brazil, Russian, Simplified Chinese
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Terraria is a game with an id of 105600, a link of https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13, a price of $9.99, a summary of "Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a[0m

[1m> Finished chain.[0m
{'input': 'can you give the information about the game Terraria', 'output': 'Terraria is a game with an id of 105600, a link of https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13, a price of $9.99, a summary of "Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a'}
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
