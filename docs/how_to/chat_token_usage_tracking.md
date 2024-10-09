---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chat_token_usage_tracking.ipynb
---
# 如何跟踪聊天模型中的令牌使用情况

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)

:::

跟踪令牌使用情况以计算成本是将您的应用投入生产的重要部分。本指南介绍了如何从您的LangChain模型调用中获取此信息。

本指南需要 `langchain-openai >= 0.1.9`。


```python
%pip install --upgrade --quiet langchain langchain-openai
```

## 使用 LangSmith

您可以使用 [LangSmith](https://www.langchain.com/langsmith) 来帮助跟踪您 LLM 应用中的令牌使用情况。请参阅 [LangSmith 快速入门指南](https://docs.smith.langchain.com/)。

## 使用 AIMessage.usage_metadata

一些大模型供应商在聊天生成响应中返回令牌使用信息。当可用时，这些信息将包含在相应模型生成的 `AIMessage` 对象中。

LangChain 的 `AIMessage` 对象包含一个 [usage_metadata](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.usage_metadata) 属性。当填充时，该属性将是一个具有标准键（例如，`"input_tokens"` 和 `"output_tokens"`）的 [UsageMetadata](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.UsageMetadata.html) 字典。

示例：

**OpenAI**：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to track token usage in ChatModels"}]-->
# # !pip install -qU langchain-openai

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
openai_response = llm.invoke("hello")
openai_response.usage_metadata
```



```output
{'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
```


**Anthropic**：


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to track token usage in ChatModels"}]-->
# !pip install -qU langchain-anthropic

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-haiku-20240307")
anthropic_response = llm.invoke("hello")
anthropic_response.usage_metadata
```



```output
{'input_tokens': 8, 'output_tokens': 12, 'total_tokens': 20}
```


### 使用 AIMessage.response_metadata

模型响应中的元数据也包含在 AIMessage 的 [response_metadata](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.response_metadata) 属性中。这些数据通常不是标准化的。请注意，不同的大模型供应商采用不同的约定来表示令牌计数：


```python
print(f'OpenAI: {openai_response.response_metadata["token_usage"]}\n')
print(f'Anthropic: {anthropic_response.response_metadata["usage"]}')
```
```output
OpenAI: {'completion_tokens': 9, 'prompt_tokens': 8, 'total_tokens': 17}

Anthropic: {'input_tokens': 8, 'output_tokens': 12}
```
### 流式处理

某些大模型供应商在流式上下文中支持令牌计数元数据。

#### OpenAI

例如，OpenAI将在流结束时返回一条消息 [chunk](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html)，其中包含令牌使用信息。此行为由 `langchain-openai >= 0.1.9` 支持，并可以通过设置 `stream_usage=True` 来启用。此属性在实例化 `ChatOpenAI` 时也可以设置。

:::note
默认情况下，流中的最后一条消息块将在消息的 `response_metadata` 属性中包含一个 `"finish_reason"`。如果我们在流式模式中包含令牌使用信息，则将在流的末尾添加一个包含使用元数据的额外块，使得 `"finish_reason"` 出现在倒数第二条消息块上。
:::



```python
llm = ChatOpenAI(model="gpt-4o-mini")

aggregate = None
for chunk in llm.stream("hello", stream_usage=True):
    print(chunk)
    aggregate = chunk if aggregate is None else aggregate + chunk
```
```output
content='' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='Hello' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='!' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' How' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' can' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' I' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' assist' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' you' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' today' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='?' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='' response_metadata={'finish_reason': 'stop', 'model_name': 'gpt-4o-mini'} id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623' usage_metadata={'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
```
请注意，使用元数据将包含在各个消息块的总和中：


```python
print(aggregate.content)
print(aggregate.usage_metadata)
```
```output
Hello! How can I assist you today?
{'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
```
要禁用 OpenAI 的流式令牌计数，请将 `stream_usage` 设置为 False，或从参数中省略它：


```python
aggregate = None
for chunk in llm.stream("hello"):
    print(chunk)
```
```output
content='' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='Hello' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='!' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' How' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' can' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' I' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' assist' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' you' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' today' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='?' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='' response_metadata={'finish_reason': 'stop', 'model_name': 'gpt-4o-mini'} id='run-8e758550-94b0-4cca-a298-57482793c25d'
```
您还可以通过在实例化聊天模型时设置 `stream_usage` 来启用流式令牌使用。这在将聊天模型纳入 LangChain [链](/docs/concepts#langchain-expression-language-lcel) 时非常有用：可以在 [流式中间步骤](/docs/how_to/streaming#using-stream-events) 或使用诸如 [LangSmith](https://docs.smith.langchain.com/) 的跟踪软件时监控使用元数据。

请参见下面的示例，我们返回结构化为所需模式的输出，但仍然可以观察到从中间步骤流式传输的令牌使用情况。


```python
from pydantic import BaseModel, Field


class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")


llm = ChatOpenAI(
    model="gpt-4o-mini",
    stream_usage=True,
)
# Under the hood, .with_structured_output binds tools to the
# chat model and appends a parser.
structured_llm = llm.with_structured_output(Joke)

async for event in structured_llm.astream_events("Tell me a joke", version="v2"):
    if event["event"] == "on_chat_model_end":
        print(f'Token usage: {event["data"]["output"].usage_metadata}\n')
    elif event["event"] == "on_chain_end":
        print(event["data"]["output"])
    else:
        pass
```
```output
Token usage: {'input_tokens': 79, 'output_tokens': 23, 'total_tokens': 102}

setup='Why was the math book sad?' punchline='Because it had too many problems.'
```
令牌使用情况在来自聊天模型的有效负载中也可以在相应的 [LangSmith 跟踪](https://smith.langchain.com/public/fe6513d5-7212-4045-82e0-fefa28bc7656/r) 中看到。

## 使用回调

还有一些特定于API的回调上下文管理器，可以让您跟踪多个调用中的令牌使用情况。目前仅在OpenAI API和Bedrock Anthropic API中实现。

### OpenAI

让我们首先看一个极其简单的示例，跟踪单个聊天模型调用的令牌使用情况。


```python
<!--IMPORTS:[{"imported": "get_openai_callback", "source": "langchain_community.callbacks.manager", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.manager.get_openai_callback.html", "title": "How to track token usage in ChatModels"}]-->
# !pip install -qU langchain-community wikipedia

from langchain_community.callbacks.manager import get_openai_callback

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    stream_usage=True,
)

with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    print(cb)
```
```output
Tokens Used: 27
	Prompt Tokens: 11
	Completion Tokens: 16
Successful Requests: 1
Total Cost (USD): $2.95e-05
```
上下文管理器中的任何内容都会被跟踪。以下是使用它按顺序跟踪多个调用的示例。


```python
with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    result2 = llm.invoke("Tell me a joke")
    print(cb.total_tokens)
```
```output
54
```

```python
with get_openai_callback() as cb:
    for chunk in llm.stream("Tell me a joke"):
        pass
    print(cb)
```
```output
Tokens Used: 27
	Prompt Tokens: 11
	Completion Tokens: 16
Successful Requests: 1
Total Cost (USD): $2.95e-05
```
如果使用了包含多个步骤的链或代理，它将跟踪所有这些步骤。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "How to track token usage in ChatModels"}, {"imported": "create_tool_calling_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.tool_calling_agent.base.create_tool_calling_agent.html", "title": "How to track token usage in ChatModels"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "How to track token usage in ChatModels"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to track token usage in ChatModels"}]-->
from langchain.agents import AgentExecutor, create_tool_calling_agent, load_tools
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're a helpful assistant"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)
tools = load_tools(["wikipedia"])
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```


```python
with get_openai_callback() as cb:
    response = agent_executor.invoke(
        {
            "input": "What's a hummingbird's scientific name and what's the fastest bird species?"
        }
    )
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost (USD): ${cb.total_cost}")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `wikipedia` with `{'query': 'hummingbird scientific name'}`


[0m[36;1m[1;3mPage: Hummingbird
Summary: Hummingbirds are birds native to the Americas and comprise the biological family Trochilidae. With approximately 366 species and 113 genera, they occur from Alaska to Tierra del Fuego, but most species are found in Central and South America. As of 2024, 21 hummingbird species are listed as endangered or critically endangered, with numerous species declining in population.
Hummingbirds have varied specialized characteristics to enable rapid, maneuverable flight: exceptional metabolic capacity, adaptations to high altitude, sensitive visual and communication abilities, and long-distance migration in some species. Among all birds, male hummingbirds have the widest diversity of plumage color, particularly in blues, greens, and purples. Hummingbirds are the smallest mature birds, measuring 7.5–13 cm (3–5 in) in length. The smallest is the 5 cm (2.0 in) bee hummingbird, which weighs less than 2.0 g (0.07 oz), and the largest is the 23 cm (9 in) giant hummingbird, weighing 18–24 grams (0.63–0.85 oz). Noted for long beaks, hummingbirds are specialized for feeding on flower nectar, but all species also consume small insects.
They are known as hummingbirds because of the humming sound created by their beating wings, which flap at high frequencies audible to other birds and humans. They hover at rapid wing-flapping rates, which vary from around 12 beats per second in the largest species to 80 per second in small hummingbirds.
Hummingbirds have the highest mass-specific metabolic rate of any homeothermic animal. To conserve energy when food is scarce and at night when not foraging, they can enter torpor, a state similar to hibernation, and slow their metabolic rate to 1⁄15 of its normal rate. While most hummingbirds do not migrate, the rufous hummingbird has one of the longest migrations among birds, traveling twice per year between Alaska and Mexico, a distance of about 3,900 miles (6,300 km).
Hummingbirds split from their sister group, the swifts and treeswifts, around 42 million years ago. The oldest known fossil hummingbird is Eurotrochilus, from the Rupelian Stage of Early Oligocene Europe.

Page: Rufous hummingbird
Summary: The rufous hummingbird (Selasphorus rufus) is a small hummingbird, about 8 cm (3.1 in) long with a long, straight and slender bill. These birds are known for their extraordinary flight skills, flying 2,000 mi (3,200 km) during their migratory transits. It is one of nine species in the genus Selasphorus.



Page: Allen's hummingbird
Summary: Allen's hummingbird (Selasphorus sasin) is a species of hummingbird that breeds in the western United States. It is one of seven species in the genus Selasphorus.[0m[32;1m[1;3m
Invoking: `wikipedia` with `{'query': 'fastest bird species'}`


[0m[36;1m[1;3mPage: List of birds by flight speed
Summary: This is a list of the fastest flying birds in the world. A bird's velocity is necessarily variable; a hunting bird will reach much greater speeds while diving to catch prey than when flying horizontally. The bird that can achieve the greatest airspeed is the peregrine falcon (Falco peregrinus), able to exceed 320 km/h (200 mph) in its dives. A close relative of the common swift, the white-throated needletail (Hirundapus caudacutus), is commonly reported as the fastest bird in level flight with a reported top speed of 169 km/h (105 mph). This record remains unconfirmed as the measurement methods have never been published or verified. The record for the fastest confirmed level flight by a bird is 111.5 km/h (69.3 mph) held by the common swift.

Page: Fastest animals
Summary: This is a list of the fastest animals in the world, by types of animal.

Page: Falcon
Summary: Falcons () are birds of prey in the genus Falco, which includes about 40 species. Falcons are widely distributed on all continents of the world except Antarctica, though closely related raptors did occur there in the Eocene.
Adult falcons have thin, tapered wings, which enable them to fly at high speed and change direction rapidly. Fledgling falcons, in their first year of flying, have longer flight feathers, which make their configuration more like that of a general-purpose bird such as a broad wing. This makes flying easier while learning the exceptional skills required to be effective hunters as adults.
The falcons are the largest genus in the Falconinae subfamily of Falconidae, which itself also includes another subfamily comprising caracaras and a few other species. All these birds kill with their beaks, using a tomial "tooth" on the side of their beaks—unlike the hawks, eagles, and other birds of prey in the Accipitridae, which use their feet.
The largest falcon is the gyrfalcon at up to 65 cm in length.  The smallest falcon species is the pygmy falcon, which measures just 20 cm.  As with hawks and owls, falcons exhibit sexual dimorphism, with the females typically larger than the males, thus allowing a wider range of prey species.
Some small falcons with long, narrow wings are called "hobbies" and some which hover while hunting are called "kestrels".
As is the case with many birds of prey, falcons have exceptional powers of vision; the visual acuity of one species has been measured at 2.6 times that of a normal human. Peregrine falcons have been recorded diving at speeds of 320 km/h (200 mph), making them the fastest-moving creatures on Earth; the fastest recorded dive attained a vertical speed of 390 km/h (240 mph).[0m[32;1m[1;3mThe scientific name for a hummingbird is Trochilidae. The fastest bird species in level flight is the common swift, which holds the record for the fastest confirmed level flight by a bird at 111.5 km/h (69.3 mph). The peregrine falcon is known to exceed speeds of 320 km/h (200 mph) in its dives, making it the fastest bird in terms of diving speed.[0m

[1m> Finished chain.[0m
Total Tokens: 1675
Prompt Tokens: 1538
Completion Tokens: 137
Total Cost (USD): $0.0009745000000000001
```
### Bedrock Anthropic

`get_bedrock_anthropic_callback`的工作方式非常相似：


```python
<!--IMPORTS:[{"imported": "get_bedrock_anthropic_callback", "source": "langchain_community.callbacks.manager", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.manager.get_bedrock_anthropic_callback.html", "title": "How to track token usage in ChatModels"}]-->
# !pip install langchain-aws
from langchain_aws import ChatBedrock
from langchain_community.callbacks.manager import get_bedrock_anthropic_callback

llm = ChatBedrock(model_id="anthropic.claude-v2")

with get_bedrock_anthropic_callback() as cb:
    result = llm.invoke("Tell me a joke")
    result2 = llm.invoke("Tell me a joke")
    print(cb)
```
```output
Tokens Used: 96
	Prompt Tokens: 26
	Completion Tokens: 70
Successful Requests: 2
Total Cost (USD): $0.001888
```
## 下一步

您现在已经看到了一些如何跟踪支持的大模型供应商的令牌使用情况的示例。

接下来，请查看本节中其他关于聊天模型的使用指南，例如 [如何让模型返回结构化输出](/docs/how_to/structured_output) 或 [如何为聊天模型添加缓存](/docs/how_to/chat_model_caching)。
