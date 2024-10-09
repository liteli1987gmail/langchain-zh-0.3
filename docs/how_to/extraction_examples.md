---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/extraction_examples.ipynb
---
# 如何在提取时使用参考示例

通过向大型语言模型提供参考示例，提取的质量通常可以得到改善。

数据提取试图生成文本及其他非结构化或半结构化格式中信息的结构化表示。[工具调用](/docs/concepts#functiontool-calling) 大型语言模型特性通常在此上下文中使用。本指南演示如何构建少量示例的工具调用，以帮助引导提取和类似应用的行为。

:::tip
虽然本指南专注于如何使用示例与工具调用模型，但该技术是普遍适用的，并且可以工作
也适用于基于JSON或提示的技术。
:::

LangChain在包含工具调用的LLM消息上实现了[工具调用属性](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.tool_calls)。有关更多详细信息，请参阅我们的[工具调用使用指南](/docs/how_to/tool_calling)。为了构建数据提取的参考示例，我们构建了一个包含以下序列的聊天历史：

- [HumanMessage](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html) 包含示例输入；
- [AIMessage](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html) 包含示例工具调用；
- [ToolMessage](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html) 包含示例工具输出。

LangChain采用这种约定来在不同的LLM大模型供应商之间结构化工具调用的对话。

首先，我们构建一个提示词模板，其中包含这些消息的占位符：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use reference examples when doing extraction"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to use reference examples when doing extraction"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked "
            "to extract, return null for the attribute's value.",
        ),
        # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        MessagesPlaceholder("examples"),  # <-- EXAMPLES!
        # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
        ("human", "{text}"),
    ]
)
```

测试模板：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to use reference examples when doing extraction"}]-->
from langchain_core.messages import (
    HumanMessage,
)

prompt.invoke(
    {"text": "this is some text", "examples": [HumanMessage(content="testing 1 2 3")]}
)
```



```output
ChatPromptValue(messages=[SystemMessage(content="You are an expert extraction algorithm. Only extract relevant information from the text. If you do not know the value of an attribute asked to extract, return null for the attribute's value.", additional_kwargs={}, response_metadata={}), HumanMessage(content='testing 1 2 3', additional_kwargs={}, response_metadata={}), HumanMessage(content='this is some text', additional_kwargs={}, response_metadata={})])
```


## 定义模式

让我们重用来自[提取教程](/docs/tutorials/extraction)的人员模式。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use reference examples when doing extraction"}]-->
from typing import List, Optional

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(..., description="The name of the person")
    hair_color: Optional[str] = Field(
        ..., description="The color of the person's hair if known"
    )
    height_in_meters: Optional[str] = Field(..., description="Height in METERs")


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

## 定义参考示例

示例可以定义为输入-输出对的列表。

每个示例包含一个示例`输入`文本和一个示例`输出`，显示应该从文本中提取的内容。

:::important
这有点复杂，所以可以选择跳过。

示例的格式需要与所使用的API匹配（例如，工具调用或JSON模式等）。

在这里，格式化的示例将与工具调用API所期望的格式匹配，因为这正是我们正在使用的。
:::


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to use reference examples when doing extraction"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to use reference examples when doing extraction"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to use reference examples when doing extraction"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to use reference examples when doing extraction"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to use reference examples when doing extraction"}]-->
import uuid
from typing import Dict, List, TypedDict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from pydantic import BaseModel, Field


class Example(TypedDict):
    """A representation of an example consisting of text input and expected tool calls.

    For extraction, the tool calls are represented as instances of pydantic model.
    """

    input: str  # This is the example text
    tool_calls: List[BaseModel]  # Instances of pydantic model that should be extracted


def tool_example_to_messages(example: Example) -> List[BaseMessage]:
    """Convert an example into a list of messages that can be fed into an LLM.

    This code is an adapter that converts our example to a list of messages
    that can be fed into a chat model.

    The list of messages per example corresponds to:

    1) HumanMessage: contains the content from which content should be extracted.
    2) AIMessage: contains the extracted information from the model
    3) ToolMessage: contains confirmation to the model that the model requested a tool correctly.

    The ToolMessage is required because some of the chat models are hyper-optimized for agents
    rather than for an extraction use case.
    """
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    tool_calls = []
    for tool_call in example["tool_calls"]:
        tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "args": tool_call.dict(),
                # The name of the function right now corresponds
                # to the name of the pydantic model
                # This is implicit in the API right now,
                # and will be improved over time.
                "name": tool_call.__class__.__name__,
            },
        )
    messages.append(AIMessage(content="", tool_calls=tool_calls))
    tool_outputs = example.get("tool_outputs") or [
        "You have correctly called this tool."
    ] * len(tool_calls)
    for output, tool_call in zip(tool_outputs, tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages
```

接下来，让我们定义我们的示例，然后将它们转换为消息格式。


```python
examples = [
    (
        "The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it.",
        Data(people=[]),
    ),
    (
        "Fiona traveled far from France to Spain.",
        Data(people=[Person(name="Fiona", height_in_meters=None, hair_color=None)]),
    ),
]


messages = []

for text, tool_call in examples:
    messages.extend(
        tool_example_to_messages({"input": text, "tool_calls": [tool_call]})
    )
```

让我们测试一下提示词


```python
example_prompt = prompt.invoke({"text": "this is some text", "examples": messages})

for message in example_prompt.messages:
    print(f"{message.type}: {message}")
```
```output
system: content="You are an expert extraction algorithm. Only extract relevant information from the text. If you do not know the value of an attribute asked to extract, return null for the attribute's value." additional_kwargs={} response_metadata={}
human: content="The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it." additional_kwargs={} response_metadata={}
ai: content='' additional_kwargs={} response_metadata={} tool_calls=[{'name': 'Data', 'args': {'people': []}, 'id': '240159b1-1405-4107-a07c-3c6b91b3d5b7', 'type': 'tool_call'}]
tool: content='You have correctly called this tool.' tool_call_id='240159b1-1405-4107-a07c-3c6b91b3d5b7'
human: content='Fiona traveled far from France to Spain.' additional_kwargs={} response_metadata={}
ai: content='' additional_kwargs={} response_metadata={} tool_calls=[{'name': 'Data', 'args': {'people': [{'name': 'Fiona', 'hair_color': None, 'height_in_meters': None}]}, 'id': '3fc521e4-d1d2-4c20-bf40-e3d72f1068da', 'type': 'tool_call'}]
tool: content='You have correctly called this tool.' tool_call_id='3fc521e4-d1d2-4c20-bf40-e3d72f1068da'
human: content='this is some text' additional_kwargs={} response_metadata={}
```
## 创建一个提取器

让我们选择一个大型语言模型。因为我们使用的是工具调用，我们需要一个支持工具调用功能的模型。请查看[这个表格](/docs/integrations/chat)以获取可用的大型语言模型。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  openaiParams={`model="gpt-4-0125-preview", temperature=0`}
/>


根据[提取教程](/docs/tutorials/extraction)，我们使用`.with_structured_output`方法根据所需的模式来结构化模型输出：


```python
runnable = prompt | llm.with_structured_output(
    schema=Data,
    method="function_calling",
    include_raw=False,
)
```

## 没有示例 😿

请注意，即使是有能力的模型在**非常简单**的测试案例中也可能失败！


```python
for _ in range(5):
    text = "The solar system is large, but earth has only 1 moon."
    print(runnable.invoke({"text": text, "examples": []}))
```
```output
people=[Person(name='earth', hair_color='null', height_in_meters='null')]
``````output
people=[Person(name='earth', hair_color='null', height_in_meters='null')]
``````output
people=[]
``````output
people=[Person(name='earth', hair_color='null', height_in_meters='null')]
``````output
people=[]
```
## 示例 😻

参考示例有助于修复失败！


```python
for _ in range(5):
    text = "The solar system is large, but earth has only 1 moon."
    print(runnable.invoke({"text": text, "examples": messages}))
```
```output
people=[]
``````output
people=[]
``````output
people=[]
``````output
people=[]
``````output
people=[]
```
请注意，我们可以在 [Langsmith trace](https://smith.langchain.com/public/4c436bc2-a1ce-440b-82f5-093947542e40/r) 中看到少量示例作为工具调用。

我们在正样本上保持性能：


```python
runnable.invoke(
    {
        "text": "My name is Harrison. My hair is black.",
        "examples": messages,
    }
)
```



```output
Data(people=[Person(name='Harrison', hair_color='black', height_in_meters=None)])
```

