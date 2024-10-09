---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/configure.ipynb
sidebar_position: 7
keywords: [ConfigurableField, configurable_fields, ConfigurableAlternatives, configurable_alternatives, LCEL]
---
# 如何配置运行链内部

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)
- [绑定运行时参数](/docs/how_to/binding/)

:::

有时您可能想要尝试多种不同的方式在您的链中进行操作，甚至向最终用户展示这些方式。
这可以包括调整温度等参数，甚至将一个模型替换为另一个模型。
为了使这一体验尽可能简单，我们定义了两种方法。

- 一个 `configurable_fields` 方法。它允许您配置可运行项的特定字段。
- 这与可运行项上的 [`.bind`](/docs/how_to/binding) 方法相关，但允许您在运行时为链中的特定步骤指定参数，而不是事先指定。
- 一个 `configurable_alternatives` 方法。通过这个方法，您可以列出任何特定可运行项的替代选项，这些选项可以在运行时设置，并将其替换为指定的替代选项。

## 可配置字段

让我们通过一个示例来演示如何在运行时配置聊天模型字段，例如温度：


```python
%pip install --upgrade --quiet langchain langchain-openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to configure runtime chain internals"}, {"imported": "ConfigurableField", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html", "title": "How to configure runtime chain internals"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to configure runtime chain internals"}]-->
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0).configurable_fields(
    temperature=ConfigurableField(
        id="llm_temperature",
        name="LLM Temperature",
        description="The temperature of the LLM",
    )
)

model.invoke("pick a random number")
```



```output
AIMessage(content='17', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 11, 'total_tokens': 12}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ba26a0da-0a69-4533-ab7f-21178a73d303-0')
```


上面，我们将 `temperature` 定义为一个 [`ConfigurableField`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html#langchain_core.runnables.utils.ConfigurableField)，可以在运行时设置。为此，我们使用 [`with_config`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_config) 方法，如下所示：


```python
model.with_config(configurable={"llm_temperature": 0.9}).invoke("pick a random number")
```



```output
AIMessage(content='12', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 11, 'total_tokens': 12}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ba8422ad-be77-4cb1-ac45-ad0aae74e3d9-0')
```


请注意，字典中传递的 `llm_temperature` 条目与 `ConfigurableField` 的 `id` 具有相同的键。

我们也可以这样做，以影响链中仅一个步骤：


```python
prompt = PromptTemplate.from_template("Pick a random number above {x}")
chain = prompt | model

chain.invoke({"x": 0})
```



```output
AIMessage(content='27', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 14, 'total_tokens': 15}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ecd4cadd-1b72-4f92-b9a0-15e08091f537-0')
```



```python
chain.with_config(configurable={"llm_temperature": 0.9}).invoke({"x": 0})
```



```output
AIMessage(content='35', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 14, 'total_tokens': 15}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-a916602b-3460-46d3-a4a8-7c926ec747c0-0')
```


### 使用 HubRunnables

这对于允许切换提示词非常有用


```python
<!--IMPORTS:[{"imported": "HubRunnable", "source": "langchain.runnables.hub", "docs": "https://python.langchain.com/api_reference/langchain/runnables/langchain.runnables.hub.HubRunnable.html", "title": "How to configure runtime chain internals"}]-->
from langchain.runnables.hub import HubRunnable

prompt = HubRunnable("rlm/rag-prompt").configurable_fields(
    owner_repo_commit=ConfigurableField(
        id="hub_commit",
        name="Hub Commit",
        description="The Hub commit to pull from",
    )
)

prompt.invoke({"question": "foo", "context": "bar"})
```



```output
ChatPromptValue(messages=[HumanMessage(content="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: foo \nContext: bar \nAnswer:")])
```



```python
prompt.with_config(configurable={"hub_commit": "rlm/rag-prompt-llama"}).invoke(
    {"question": "foo", "context": "bar"}
)
```



```output
ChatPromptValue(messages=[HumanMessage(content="[INST]<<SYS>> You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.<</SYS>> \nQuestion: foo \nContext: bar \nAnswer: [/INST]")])
```


## 可配置的替代方案



`configurable_alternatives()` 方法允许我们用替代方案替换链中的步骤。下面，我们将一个聊天模型替换为另一个：


```python
%pip install --upgrade --quiet langchain-anthropic

import os
from getpass import getpass

if "ANTHROPIC_API_KEY" not in os.environ:
    os.environ["ANTHROPIC_API_KEY"] = getpass()
```
```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to configure runtime chain internals"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to configure runtime chain internals"}, {"imported": "ConfigurableField", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html", "title": "How to configure runtime chain internals"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to configure runtime chain internals"}]-->
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import ConfigurableField
from langchain_openai import ChatOpenAI

llm = ChatAnthropic(
    model="claude-3-haiku-20240307", temperature=0
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="llm"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="anthropic",
    # This adds a new option, with name `openai` that is equal to `ChatOpenAI()`
    openai=ChatOpenAI(),
    # This adds a new option, with name `gpt4` that is equal to `ChatOpenAI(model="gpt-4")`
    gpt4=ChatOpenAI(model="gpt-4"),
    # You can add more configuration options here
)
prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | llm

# By default it will call Anthropic
chain.invoke({"topic": "bears"})
```



```output
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to come up with a simple, silly pun-based joke about bears. Puns and wordplay are a common way to create humorous bear jokes. Let me know if you'd like to hear another one!", response_metadata={'id': 'msg_018edUHh5fUbWdiimhrC3dZD', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 80}}, id='run-775bc58c-28d7-4e6b-a268-48fa6661f02f-0')
```



```python
# We can use `.with_config(configurable={"llm": "openai"})` to specify an llm to use
chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "bears"})
```



```output
AIMessage(content="Why don't bears like fast food?\n\nBecause they can't catch it!", response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 13, 'total_tokens': 28}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-7bdaa992-19c9-4f0d-9a0c-1f326bc992d4-0')
```



```python
# If we use the `default_key` then it uses the default
chain.with_config(configurable={"llm": "anthropic"}).invoke({"topic": "bears"})
```



```output
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to come up with a simple, silly pun-based joke about bears. Puns and wordplay are a common way to create humorous bear jokes. Let me know if you'd like to hear another one!", response_metadata={'id': 'msg_01BZvbmnEPGBtcxRWETCHkct', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 80}}, id='run-59b6ee44-a1cd-41b8-a026-28ee67cdd718-0')
```


### 使用提示词

我们可以做类似的事情，但在提示词之间交替



```python
llm = ChatAnthropic(model="claude-3-haiku-20240307", temperature=0)
prompt = PromptTemplate.from_template(
    "Tell me a joke about {topic}"
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="prompt"),
    # This sets a default_key.
    # If we specify this key, the default prompt (asking for a joke, as initialized above) will be used
    default_key="joke",
    # This adds a new option, with name `poem`
    poem=PromptTemplate.from_template("Write a short poem about {topic}"),
    # You can add more configuration options here
)
chain = prompt | llm

# By default it will write a joke
chain.invoke({"topic": "bears"})
```



```output
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!", response_metadata={'id': 'msg_01DtM1cssjNFZYgeS3gMZ49H', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 28}}, id='run-8199af7d-ea31-443d-b064-483693f2e0a1-0')
```



```python
# We can configure it write a poem
chain.with_config(configurable={"prompt": "poem"}).invoke({"topic": "bears"})
```



```output
AIMessage(content="Here is a short poem about bears:\n\nMajestic bears, strong and true,\nRoaming the forests, wild and free.\nPowerful paws, fur soft and brown,\nCommanding respect, nature's crown.\n\nForaging for berries, fishing streams,\nProtecting their young, fierce and keen.\nMighty bears, a sight to behold,\nGuardians of the wilderness, untold.\n\nIn the wild they reign supreme,\nEmbodying nature's grand theme.\nBears, a symbol of strength and grace,\nCaptivating all who see their face.", response_metadata={'id': 'msg_01Wck3qPxrjURtutvtodaJFn', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 134}}, id='run-69414a1e-51d7-4bec-a307-b34b7d61025e-0')
```


### 使用提示词和大型语言模型

我们还可以配置多个选项！
这是一个同时使用提示词和大型语言模型的示例。


```python
llm = ChatAnthropic(
    model="claude-3-haiku-20240307", temperature=0
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="llm"),
    # This sets a default_key.
    # If we specify this key, the default LLM (ChatAnthropic initialized above) will be used
    default_key="anthropic",
    # This adds a new option, with name `openai` that is equal to `ChatOpenAI()`
    openai=ChatOpenAI(),
    # This adds a new option, with name `gpt4` that is equal to `ChatOpenAI(model="gpt-4")`
    gpt4=ChatOpenAI(model="gpt-4"),
    # You can add more configuration options here
)
prompt = PromptTemplate.from_template(
    "Tell me a joke about {topic}"
).configurable_alternatives(
    # This gives this field an id
    # When configuring the end runnable, we can then use this id to configure this field
    ConfigurableField(id="prompt"),
    # This sets a default_key.
    # If we specify this key, the default prompt (asking for a joke, as initialized above) will be used
    default_key="joke",
    # This adds a new option, with name `poem`
    poem=PromptTemplate.from_template("Write a short poem about {topic}"),
    # You can add more configuration options here
)
chain = prompt | llm

# We can configure it write a poem with OpenAI
chain.with_config(configurable={"prompt": "poem", "llm": "openai"}).invoke(
    {"topic": "bears"}
)
```



```output
AIMessage(content="In the forest deep and wide,\nBears roam with grace and pride.\nWith fur as dark as night,\nThey rule the land with all their might.\n\nIn winter's chill, they hibernate,\nIn spring they emerge, hungry and great.\nWith claws sharp and eyes so keen,\nThey hunt for food, fierce and lean.\n\nBut beneath their tough exterior,\nLies a gentle heart, warm and superior.\nThey love their cubs with all their might,\nProtecting them through day and night.\n\nSo let us admire these majestic creatures,\nIn awe of their strength and features.\nFor in the wild, they reign supreme,\nThe mighty bears, a timeless dream.", response_metadata={'token_usage': {'completion_tokens': 133, 'prompt_tokens': 13, 'total_tokens': 146}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-5eec0b96-d580-49fd-ac4e-e32a0803b49b-0')
```



```python
# We can always just configure only one if we want
chain.with_config(configurable={"llm": "openai"}).invoke({"topic": "bears"})
```



```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 13, 'total_tokens': 26}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-c1b14c9c-4988-49b8-9363-15bfd479973a-0')
```


### 保存配置

我们还可以轻松地将配置好的链保存为它们自己的对象


```python
openai_joke = chain.with_config(configurable={"llm": "openai"})

openai_joke.invoke({"topic": "bears"})
```



```output
AIMessage(content="Why did the bear break up with his girlfriend? \nBecause he couldn't bear the relationship anymore!", response_metadata={'token_usage': {'completion_tokens': 20, 'prompt_tokens': 13, 'total_tokens': 33}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-391ebd55-9137-458b-9a11-97acaff6a892-0')
```


## 下一步

您现在知道如何在运行时配置链的内部步骤。

要了解更多，请参阅本节中关于可运行项的其他使用指南，包括：

- 使用 [.bind()](/docs/how_to/binding) 作为设置可运行项运行时参数的更简单方法
