---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/structured_output.ipynb
sidebar_position: 3
keywords: [structured output, json, information extraction, with_structured_output]
---
# 如何从模型返回结构化数据

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [函数/工具调用](/docs/concepts/#functiontool-calling)
:::

通常，模型返回符合特定模式的输出是非常有用的。一个常见的用例是从文本中提取数据以插入数据库或与其他下游系统一起使用。本指南涵盖了从模型获取结构化输出的一些策略。

## `.with_structured_output()` 方法

<span data-heading-keywords="with_structured_output"></span>

:::info Supported models

您可以在这里找到 [支持此方法的模型列表](/docs/integrations/chat/)。

:::

这是获取结构化输出最简单和最可靠的方法。`with_structured_output()` 针对提供结构化输出的原生 API 的模型实现，例如工具/函数调用或 JSON 模式，并在底层利用这些功能。

此方法接受一个模式作为输入，该模式指定所需输出属性的名称、类型和描述。该方法返回一个类似模型的可运行对象，除了输出字符串或消息外，它输出与给定模式对应的对象。模式可以指定为 TypedDict 类、[JSON Schema](https://json-schema.org/) 或 Pydantic 类。如果使用 TypedDict 或 JSON Schema，则可运行对象将返回一个字典；如果使用 Pydantic 类，则将返回一个 Pydantic 对象。

作为一个例子，让我们让模型生成一个笑话，并将设置与笑点分开：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
/>


### Pydantic 类

如果我们希望模型返回一个 Pydantic 对象，我们只需传入所需的 Pydantic 类。使用 Pydantic 的主要优点是模型生成的输出将会被验证。如果缺少任何必需字段或字段类型错误，Pydantic 将引发错误。


```python
from typing import Optional

from pydantic import BaseModel, Field


# Pydantic
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
    rating: Optional[int] = Field(
        default=None, description="How funny the joke is, from 1 to 10"
    )


structured_llm = llm.with_structured_output(Joke)

structured_llm.invoke("Tell me a joke about cats")
```



```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!', rating=7)
```


:::tip
除了 Pydantic 类的结构，Pydantic 类的名称、文档字符串以及参数的名称和提供的描述也非常重要。大多数情况下，`with_structured_output` 使用的是模型的函数/工具调用 API，您可以有效地将所有这些信息视为添加到模型提示中。
:::

### TypedDict 或 JSON Schema

如果您不想使用 Pydantic，明确不想对参数进行验证，或者希望能够流式处理模型输出，您可以使用 TypedDict 类定义您的模式。我们可以选择性地使用 LangChain 支持的特殊 `Annotated` 语法，允许您指定字段的默认值和描述。请注意，如果模型没有生成默认值，则默认值*不会*自动填充，它仅用于定义传递给模型的模式。

:::info Requirements

- 核心: `langchain-core>=0.2.26`
- 类型扩展: 强烈建议从 `typing_extensions` 导入 `Annotated` 和 `TypedDict`，而不是从 `typing` 导入，以确保在不同 Python 版本之间的一致行为。

:::


```python
from typing_extensions import Annotated, TypedDict


# TypedDict
class Joke(TypedDict):
    """Joke to tell user."""

    setup: Annotated[str, ..., "The setup of the joke"]

    # Alternatively, we could have specified setup as:

    # setup: str                    # no default, no description
    # setup: Annotated[str, ...]    # no default, no description
    # setup: Annotated[str, "foo"]  # default, no description

    punchline: Annotated[str, ..., "The punchline of the joke"]
    rating: Annotated[Optional[int], None, "How funny the joke is, from 1 to 10"]


structured_llm = llm.with_structured_output(Joke)

structured_llm.invoke("Tell me a joke about cats")
```



```output
{'setup': 'Why was the cat sitting on the computer?',
 'punchline': 'Because it wanted to keep an eye on the mouse!',
 'rating': 7}
```


同样，我们可以传入一个 [JSON Schema](https://json-schema.org/) 字典。这不需要任何导入或类，并且清楚地说明了每个参数的文档，代价是稍微冗长一些。


```python
json_schema = {
    "title": "joke",
    "description": "Joke to tell user.",
    "type": "object",
    "properties": {
        "setup": {
            "type": "string",
            "description": "The setup of the joke",
        },
        "punchline": {
            "type": "string",
            "description": "The punchline to the joke",
        },
        "rating": {
            "type": "integer",
            "description": "How funny the joke is, from 1 to 10",
            "default": None,
        },
    },
    "required": ["setup", "punchline"],
}
structured_llm = llm.with_structured_output(json_schema)

structured_llm.invoke("Tell me a joke about cats")
```



```output
{'setup': 'Why was the cat sitting on the computer?',
 'punchline': 'Because it wanted to keep an eye on the mouse!',
 'rating': 7}
```


### 在多个模式之间选择

让模型从多个模式中选择的最简单方法是创建一个具有联合类型属性的父模式：


```python
from typing import Union


# Pydantic
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
    rating: Optional[int] = Field(
        default=None, description="How funny the joke is, from 1 to 10"
    )


class ConversationalResponse(BaseModel):
    """Respond in a conversational manner. Be kind and helpful."""

    response: str = Field(description="A conversational response to the user's query")


class FinalResponse(BaseModel):
    final_output: Union[Joke, ConversationalResponse]


structured_llm = llm.with_structured_output(FinalResponse)

structured_llm.invoke("Tell me a joke about cats")
```



```output
FinalResponse(final_output=Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!', rating=7))
```



```python
structured_llm.invoke("How are you today?")
```



```output
FinalResponse(final_output=ConversationalResponse(response="I'm just a bunch of code, so I don't have feelings, but I'm here and ready to help you! How can I assist you today?"))
```


或者，您可以直接使用工具调用，让模型在选项之间进行选择，如果您的 [选择的模型支持它](/docs/integrations/chat/)。这涉及更多的解析和设置，但在某些情况下可以提高性能，因为您不必使用嵌套模式。有关更多详细信息，请参见 [此操作指南](/docs/how_to/tool_calling)。

### 流式处理

当输出类型为字典时（即，当模式被指定为TypedDict类或JSON Schema字典时），我们可以从我们的结构化模型中流式输出。

:::info

请注意，产生的内容已经是聚合的块，而不是增量。

:::


```python
from typing_extensions import Annotated, TypedDict


# TypedDict
class Joke(TypedDict):
    """Joke to tell user."""

    setup: Annotated[str, ..., "The setup of the joke"]
    punchline: Annotated[str, ..., "The punchline of the joke"]
    rating: Annotated[Optional[int], None, "How funny the joke is, from 1 to 10"]


structured_llm = llm.with_structured_output(Joke)

for chunk in structured_llm.stream("Tell me a joke about cats"):
    print(chunk)
```
```output
{}
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why was'}
{'setup': 'Why was the'}
{'setup': 'Why was the cat'}
{'setup': 'Why was the cat sitting'}
{'setup': 'Why was the cat sitting on'}
{'setup': 'Why was the cat sitting on the'}
{'setup': 'Why was the cat sitting on the computer'}
{'setup': 'Why was the cat sitting on the computer?'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': ''}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on the'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on the mouse'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on the mouse!'}
{'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on the mouse!', 'rating': 7}
```
### 少量示例提示

对于更复杂的模式，将少量示例添加到提示中非常有用。这可以通过几种方式实现。

最简单和最通用的方法是将示例添加到提示中的系统消息中：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to return structured data from a model"}]-->
from langchain_core.prompts import ChatPromptTemplate

system = """You are a hilarious comedian. Your specialty is knock-knock jokes. \
Return a joke which has the setup (the response to "Who's there?") and the final punchline (the response to "<setup> who?").

Here are some examples of jokes:

example_user: Tell me a joke about planes
example_assistant: {{"setup": "Why don't planes ever get tired?", "punchline": "Because they have rest wings!", "rating": 2}}

example_user: Tell me another joke about planes
example_assistant: {{"setup": "Cargo", "punchline": "Cargo 'vroom vroom', but planes go 'zoom zoom'!", "rating": 10}}

example_user: Now about caterpillars
example_assistant: {{"setup": "Caterpillar", "punchline": "Caterpillar really slow, but watch me turn into a butterfly and steal the show!", "rating": 5}}"""

prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{input}")])

few_shot_structured_llm = prompt | structured_llm
few_shot_structured_llm.invoke("what's something funny about woodpeckers")
```



```output
{'setup': 'Woodpecker',
 'punchline': "Woodpecker who? Woodpecker who can't find a tree is just a bird with a headache!",
 'rating': 7}
```


当结构化输出的底层方法是工具调用时，我们可以将示例作为显式工具调用传入。您可以查看您使用的模型是否在其API参考中使用工具调用。


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to return structured data from a model"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to return structured data from a model"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to return structured data from a model"}]-->
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

examples = [
    HumanMessage("Tell me a joke about planes", name="example_user"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {
                "name": "joke",
                "args": {
                    "setup": "Why don't planes ever get tired?",
                    "punchline": "Because they have rest wings!",
                    "rating": 2,
                },
                "id": "1",
            }
        ],
    ),
    # Most tool-calling models expect a ToolMessage(s) to follow an AIMessage with tool calls.
    ToolMessage("", tool_call_id="1"),
    # Some models also expect an AIMessage to follow any ToolMessages,
    # so you may need to add an AIMessage here.
    HumanMessage("Tell me another joke about planes", name="example_user"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {
                "name": "joke",
                "args": {
                    "setup": "Cargo",
                    "punchline": "Cargo 'vroom vroom', but planes go 'zoom zoom'!",
                    "rating": 10,
                },
                "id": "2",
            }
        ],
    ),
    ToolMessage("", tool_call_id="2"),
    HumanMessage("Now about caterpillars", name="example_user"),
    AIMessage(
        "",
        tool_calls=[
            {
                "name": "joke",
                "args": {
                    "setup": "Caterpillar",
                    "punchline": "Caterpillar really slow, but watch me turn into a butterfly and steal the show!",
                    "rating": 5,
                },
                "id": "3",
            }
        ],
    ),
    ToolMessage("", tool_call_id="3"),
]
system = """You are a hilarious comedian. Your specialty is knock-knock jokes. \
Return a joke which has the setup (the response to "Who's there?") \
and the final punchline (the response to "<setup> who?")."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("placeholder", "{examples}"), ("human", "{input}")]
)
few_shot_structured_llm = prompt | structured_llm
few_shot_structured_llm.invoke({"input": "crocodiles", "examples": examples})
```



```output
{'setup': 'Crocodile',
 'punchline': 'Crocodile be seeing you later, alligator!',
 'rating': 7}
```


有关使用工具调用时少量示例提示的更多信息，请参见[这里](/docs/how_to/function_calling/#Few-shot-prompting)。

### （高级）指定结构化输出的方法

对于支持多种结构化输出方式的模型（即，它们同时支持工具调用和JSON模式），您可以使用`method=`参数指定使用哪种方法。

:::info JSON mode

如果使用JSON模式，您仍然需要在模型提示中指定所需的模式。您传递给`with_structured_output`的模式仅用于解析模型输出，而不会像工具调用那样传递给模型。

要查看您使用的模型是否支持 JSON 模式，请检查其在 [API 参考](https://python.langchain.com/api_reference/langchain/index.html) 中的条目。

:::


```python
structured_llm = llm.with_structured_output(None, method="json_mode")

structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```



```output
{'setup': 'Why was the cat sitting on the computer?',
 'punchline': 'Because it wanted to keep an eye on the mouse!'}
```


### （高级）原始输出

大型语言模型在生成结构化输出方面并不完美，尤其是当模式变得复杂时。您可以通过传递 `include_raw=True` 来避免引发异常并自行处理原始输出。这会将输出格式更改为包含原始消息输出、`parsed` 值（如果成功）以及任何结果错误：


```python
structured_llm = llm.with_structured_output(Joke, include_raw=True)

structured_llm.invoke("Tell me a joke about cats")
```



```output
{'raw': AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_f25ZRmh8u5vHlOWfTUw8sJFZ', 'function': {'arguments': '{"setup":"Why was the cat sitting on the computer?","punchline":"Because it wanted to keep an eye on the mouse!","rating":7}', 'name': 'Joke'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 33, 'prompt_tokens': 93, 'total_tokens': 126}, 'model_name': 'gpt-4o-2024-05-13', 'system_fingerprint': 'fp_4e2b2da518', 'finish_reason': 'stop', 'logprobs': None}, id='run-d880d7e2-df08-4e9e-ad92-dfc29f2fd52f-0', tool_calls=[{'name': 'Joke', 'args': {'setup': 'Why was the cat sitting on the computer?', 'punchline': 'Because it wanted to keep an eye on the mouse!', 'rating': 7}, 'id': 'call_f25ZRmh8u5vHlOWfTUw8sJFZ', 'type': 'tool_call'}], usage_metadata={'input_tokens': 93, 'output_tokens': 33, 'total_tokens': 126}),
 'parsed': {'setup': 'Why was the cat sitting on the computer?',
  'punchline': 'Because it wanted to keep an eye on the mouse!',
  'rating': 7},
 'parsing_error': None}
```


## 直接提示和解析模型输出

并非所有模型都支持 `.with_structured_output()`，因为并非所有模型都具有工具调用或 JSON 模式支持。对于这些模型，您需要直接提示模型使用特定格式，并使用输出解析器从原始模型输出中提取结构化响应。

### 使用 `PydanticOutputParser`

以下示例使用内置的 [`PydanticOutputParser`](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html) 来解析被提示以匹配给定 Pydantic 模式的聊天模型的输出。请注意，我们直接将 `format_instructions` 添加到解析器的方法中的提示中：


```python
<!--IMPORTS:[{"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "How to return structured data from a model"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to return structured data from a model"}]-->
from typing import List

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Set up a parser
parser = PydanticOutputParser(pydantic_object=People)

# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
        ),
        ("human", "{query}"),
    ]
).partial(format_instructions=parser.get_format_instructions())
```

让我们看看发送到模型的信息：


```python
query = "Anna is 23 years old and she is 6 feet tall"

print(prompt.invoke(query).to_string())
```
```output
System: Answer the user query. Wrap the output in `json` tags
The output should be formatted as a JSON instance that conforms to the JSON schema below.

As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.

Here is the output schema:
\`\`\`
{"description": "Identifying information about all people in a text.", "properties": {"people": {"title": "People", "type": "array", "items": {"$ref": "#/definitions/Person"}}}, "required": ["people"], "definitions": {"Person": {"title": "Person", "description": "Information about a person.", "type": "object", "properties": {"name": {"title": "Name", "description": "The name of the person", "type": "string"}, "height_in_meters": {"title": "Height In Meters", "description": "The height of the person expressed in meters.", "type": "number"}}, "required": ["name", "height_in_meters"]}}}
\`\`\`
Human: Anna is 23 years old and she is 6 feet tall
```
现在让我们调用它：


```python
chain = prompt | llm | parser

chain.invoke({"query": query})
```



```output
People(people=[Person(name='Anna', height_in_meters=1.8288)])
```


有关使用输出解析器与结构化输出提示技术的深入探讨，请参见 [本指南](/docs/how_to/output_parser_structured)。

### 自定义解析

您还可以使用 [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language) 创建自定义提示和解析器，使用普通函数解析模型的输出：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to return structured data from a model"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to return structured data from a model"}]-->
import json
import re
from typing import List

from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Output your answer as JSON that  "
            "matches the given schema: \`\`\`json\n{schema}\n\`\`\`. "
            "Make sure to wrap the answer in \`\`\`json and \`\`\` tags",
        ),
        ("human", "{query}"),
    ]
).partial(schema=People.schema())


# Custom parser
def extract_json(message: AIMessage) -> List[dict]:
    """Extracts JSON content from a string where JSON is embedded between \`\`\`json and \`\`\` tags.

    Parameters:
        text (str): The text containing the JSON content.

    Returns:
        list: A list of extracted JSON strings.
    """
    text = message.content
    # Define the regular expression pattern to match JSON blocks
    pattern = r"\`\`\`json(.*?)\`\`\`"

    # Find all non-overlapping matches of the pattern in the string
    matches = re.findall(pattern, text, re.DOTALL)

    # Return the list of matched JSON strings, stripping any leading or trailing whitespace
    try:
        return [json.loads(match.strip()) for match in matches]
    except Exception:
        raise ValueError(f"Failed to parse: {message}")
```

这是发送给模型的提示：


```python
query = "Anna is 23 years old and she is 6 feet tall"

print(prompt.format_prompt(query=query).to_string())
```
```output
System: Answer the user query. Output your answer as JSON that  matches the given schema: \`\`\`json
{'title': 'People', 'description': 'Identifying information about all people in a text.', 'type': 'object', 'properties': {'people': {'title': 'People', 'type': 'array', 'items': {'$ref': '#/definitions/Person'}}}, 'required': ['people'], 'definitions': {'Person': {'title': 'Person', 'description': 'Information about a person.', 'type': 'object', 'properties': {'name': {'title': 'Name', 'description': 'The name of the person', 'type': 'string'}, 'height_in_meters': {'title': 'Height In Meters', 'description': 'The height of the person expressed in meters.', 'type': 'number'}}, 'required': ['name', 'height_in_meters']}}}
\`\`\`. Make sure to wrap the answer in \`\`\`json and \`\`\` tags
Human: Anna is 23 years old and she is 6 feet tall
```
当我们调用它时，它的样子是这样的：


```python
chain = prompt | llm | extract_json

chain.invoke({"query": query})
```



```output
[{'people': [{'name': 'Anna', 'height_in_meters': 1.8288}]}]
```

