---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chatbots_tools.ipynb
---
# 如何将工具添加到聊天机器人

:::info Prerequisites

本指南假设您熟悉以下概念：

- [聊天机器人](/docs/concepts/#messages)
- [代理](/docs/tutorials/agents)
- [聊天历史](/docs/concepts/#chat-history)

:::

本节将介绍如何创建对话代理：能够使用工具与其他系统和API交互的聊天机器人。

## 设置

在本指南中，我们将使用一个[工具调用代理](/docs/how_to/agent_executor)，该代理配备一个用于搜索网络的工具。默认将由[Tavily](/docs/integrations/tools/tavily_search)提供支持，但您可以将其更换为任何类似的工具。本节的其余部分将假设您正在使用Tavily。

您需要在Tavily网站上[注册一个账户](https://tavily.com/)，并安装以下软件包：


```python
%pip install --upgrade --quiet langchain-community langchain-openai tavily-python

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

您还需要将您的 OpenAI 密钥设置为 `OPENAI_API_KEY`，并将您的 Tavily API 密钥设置为 `TAVILY_API_KEY`。

## 创建代理

我们的最终目标是创建一个能够在需要时查找信息并以对话方式回应用户问题的代理。

首先，让我们初始化 Tavily 和一个能够调用工具的 OpenAI 聊天模型：


```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "How to add tools to chatbots"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add tools to chatbots"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# Choose the LLM that will drive the agent
# Only certain models support this
chat = ChatOpenAI(model="gpt-4o-mini", temperature=0)
```

为了使我们的代理具有对话能力，我们还必须选择一个带有聊天历史占位符的提示词。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add tools to chatbots"}]-->
from langchain_core.prompts import ChatPromptTemplate

# Adapted from https://smith.langchain.com/hub/jacob/tool-calling-agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        ("placeholder", "{messages}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)
```

太好了！现在让我们组装我们的代理：


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to add tools to chatbots"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to add tools to chatbots"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent

agent = create_tool_calling_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## 运行代理

现在我们已经设置好代理，让我们尝试与它互动！它可以处理不需要查找的琐碎查询：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to add tools to chatbots"}]-->
from langchain_core.messages import HumanMessage

agent_executor.invoke({"messages": [HumanMessage(content="I'm Nemo!")]})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```


```output
{'messages': [HumanMessage(content="I'm Nemo!")],
 'output': "Hello Nemo! It's great to meet you. How can I assist you today?"}
```


或者，如果需要，它可以使用传递的搜索工具获取最新信息：


```python
agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="What is the current conservation status of the Great Barrier Reef?"
            )
        ],
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'current conservation status of the Great Barrier Reef'}`


[0m[36;1m[1;3m[{'url': 'https://www.abc.net.au/news/2022-08-04/great-barrier-reef-report-says-coral-recovering-after-bleaching/101296186', 'content': 'Great Barrier Reef hit with widespread and severe bleaching event\n\'Devastating\': Over 90pc of reefs on Great Barrier Reef suffered bleaching over summer, report reveals\nTop Stories\nJailed Russian opposition leader Alexei Navalny is dead, says prison service\nTaylor Swift puts an Aussie twist on a classic as she packs the MCG for the biggest show of her career — as it happened\nMelbourne comes alive with Swifties, as even those without tickets turn up to soak in the atmosphere\nAustralian Border Force investigates after arrival of more than 20 men by boat north of Broome\nOpenAI launches video model that can instantly create short clips from text prompts\nAntoinette Lattouf loses bid to force ABC to produce emails calling for her dismissal\nCategory one cyclone makes landfall in Gulf of Carpentaria off NT-Queensland border\nWhy the RBA may be forced to cut before the Fed\nBrisbane records \'wettest day since 2022\', as woman dies in floodwaters near Mount Isa\n$45m Sydney beachside home once owned by late radio star is demolished less than a year after sale\nAnnabel Sutherland\'s historic double century puts Australia within reach of Test victory over South Africa\nAlmighty defensive effort delivers Indigenous victory in NRL All Stars clash\nLisa Wilkinson feared she would have to sell home to pay legal costs of Bruce Lehrmann\'s defamation case, court documents reveal\nSupermarkets as you know them are disappearing from our cities\nNRL issues Broncos\' Reynolds, Carrigan with breach notices after public scrap\nPopular Now\nJailed Russian opposition leader Alexei Navalny is dead, says prison service\nTaylor Swift puts an Aussie twist on a classic as she packs the MCG for the biggest show of her career — as it happened\n$45m Sydney beachside home once owned by late radio star is demolished less than a year after sale\nAustralian Border Force investigates after arrival of more than 20 men by boat north of Broome\nDealer sentenced for injecting children as young as 12 with methylamphetamine\nMelbourne comes alive with Swifties, as even those without tickets turn up to soak in the atmosphere\nTop Stories\nJailed Russian opposition leader Alexei Navalny is dead, says prison service\nTaylor Swift puts an Aussie twist on a classic as she packs the MCG for the biggest show of her career — as it happened\nMelbourne comes alive with Swifties, as even those without tickets turn up to soak in the atmosphere\nAustralian Border Force investigates after arrival of more than 20 men by boat north of Broome\nOpenAI launches video model that can instantly create short clips from text prompts\nJust In\nJailed Russian opposition leader Alexei Navalny is dead, says prison service\nMelbourne comes alive with Swifties, as even those without tickets turn up to soak in the atmosphere\nTraveller alert after one-year-old in Adelaide reported with measles\nAntoinette Lattouf loses bid to force ABC to produce emails calling for her dismissal\nFooter\nWe acknowledge Aboriginal and Torres Strait Islander peoples as the First Australians and Traditional Custodians of the lands where we live, learn, and work.\n Increased coral cover could come at a cost\nThe rapid growth in coral cover appears to have come at the expense of the diversity of coral on the reef, with most of the increases accounted for by fast-growing branching coral called Acropora.\n Documents obtained by the ABC under Freedom of Information laws revealed the Morrison government had forced AIMS to rush the report\'s release and orchestrated a "leak" of the material to select media outlets ahead of the reef being considered for inclusion on the World Heritage In Danger list.\n The reef\'s status and potential inclusion on the In Danger list were due to be discussed at the 45th session of the World Heritage Committee in Russia in June this year, but the meeting was indefinitely postponed due to the war in Ukraine.\n More from ABC\nEditorial Policies\nGreat Barrier Reef coral cover at record levels after mass-bleaching events, report shows\nGreat Barrier Reef coral cover at record levels after mass-bleaching events, report shows\nRecord coral cover is being seen across much of the Great Barrier Reef as it recovers from past storms and mass-bleaching events.'}][0m[32;1m[1;3mThe Great Barrier Reef is currently showing signs of recovery, with record coral cover being seen across much of the reef. This recovery comes after past storms and mass-bleaching events. However, the rapid growth in coral cover appears to have come at the expense of the diversity of coral on the reef, with most of the increases accounted for by fast-growing branching coral called Acropora. There were discussions about the reef's potential inclusion on the World Heritage In Danger list, but the meeting to consider this was indefinitely postponed due to the war in Ukraine.

You can read more about it in this article: [Great Barrier Reef hit with widespread and severe bleaching event](https://www.abc.net.au/news/2022-08-04/great-barrier-reef-report-says-coral-recovering-after-bleaching/101296186)[0m

[1m> Finished chain.[0m
```


```output
{'messages': [HumanMessage(content='What is the current conservation status of the Great Barrier Reef?')],
 'output': "The Great Barrier Reef is currently showing signs of recovery, with record coral cover being seen across much of the reef. This recovery comes after past storms and mass-bleaching events. However, the rapid growth in coral cover appears to have come at the expense of the diversity of coral on the reef, with most of the increases accounted for by fast-growing branching coral called Acropora. There were discussions about the reef's potential inclusion on the World Heritage In Danger list, but the meeting to consider this was indefinitely postponed due to the war in Ukraine.\n\nYou can read more about it in this article: [Great Barrier Reef hit with widespread and severe bleaching event](https://www.abc.net.au/news/2022-08-04/great-barrier-reef-report-says-coral-recovering-after-bleaching/101296186)"}
```


## 对话响应

因为我们的提示词包含了聊天历史消息的占位符，我们的代理也可以考虑之前的互动，并像标准聊天机器人一样进行对话回应：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to add tools to chatbots"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to add tools to chatbots"}]-->
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="I'm Nemo!"),
            AIMessage(content="Hello Nemo! How can I assist you today?"),
            HumanMessage(content="What is my name?"),
        ],
    }
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo![0m

[1m> Finished chain.[0m
```


```output
{'messages': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content='Hello Nemo! How can I assist you today?'),
  HumanMessage(content='What is my name?')],
 'output': 'Your name is Nemo!'}
```


如果需要，您还可以将代理执行器包装在一个 [`RunnableWithMessageHistory`](/docs/how_to/message_history/) 类中，以内部管理历史消息。我们可以这样重新声明它：


```python
agent = create_tool_calling_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

然后，因为我们的代理执行器有多个输出，我们在初始化包装器时也必须设置 `output_messages_key` 属性：


```python
<!--IMPORTS:[{"imported": "ChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.ChatMessageHistory.html", "title": "How to add tools to chatbots"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "How to add tools to chatbots"}]-->
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

conversational_agent_executor = RunnableWithMessageHistory(
    agent_executor,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="messages",
    output_messages_key="output",
)

conversational_agent_executor.invoke(
    {"messages": [HumanMessage("I'm Nemo!")]},
    {"configurable": {"session_id": "unused"}},
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHi Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```


```output
{'messages': [HumanMessage(content="I'm Nemo!")],
 'output': "Hi Nemo! It's great to meet you. How can I assist you today?"}
```


然后如果我们重新运行我们的包装代理执行器：


```python
conversational_agent_executor.invoke(
    {"messages": [HumanMessage("What is my name?")]},
    {"configurable": {"session_id": "unused"}},
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo! How can I assist you today, Nemo?[0m

[1m> Finished chain.[0m
```


```output
{'messages': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content="Hi Nemo! It's great to meet you. How can I assist you today?"),
  HumanMessage(content='What is my name?')],
 'output': 'Your name is Nemo! How can I assist you today, Nemo?'}
```


这个 [LangSmith 跟踪](https://smith.langchain.com/public/1a9f712a-7918-4661-b3ff-d979bcc2af42/r) 显示了内部发生的事情。

## 进一步阅读

其他类型的代理也可以支持对话回应 - 更多信息，请查看 [代理部分](/docs/tutorials/agents)。

有关工具使用的更多信息，您还可以查看 [这个用例部分](/docs/how_to#tools)。
