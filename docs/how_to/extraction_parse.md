---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/extraction_parse.ipynb
---
# 如何单独使用提示词（不调用工具）进行提取

生成结构化输出不需要工具调用功能。能够很好地遵循提示指令的大型语言模型可以被要求以给定格式输出信息。

这种方法依赖于设计良好的提示词，然后解析大型语言模型的输出，以使其能够很好地提取信息。

要在没有工具调用功能的情况下提取数据：

1. 指示大型语言模型生成遵循预期格式的文本（例如，具有特定模式的JSON）；
2. 使用 [输出解析器](/docs/concepts#output-parsers) 将模型响应结构化为所需的Python对象。

首先我们选择一个大型语言模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="model" />


:::tip
本教程旨在简单，但通常应该包含参考示例以挤出性能！
:::

## 使用PydanticOutputParser

以下示例使用内置的 `PydanticOutputParser` 来解析聊天模型的输出。


```python
<!--IMPORTS:[{"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "How to use prompting alone (no tool calling) to do extraction"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use prompting alone (no tool calling) to do extraction"}]-->
from typing import List, Optional

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, validator


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

让我们看看发送到模型的信息


```python
query = "Anna is 23 years old and she is 6 feet tall"
```


```python
print(prompt.format_prompt(query=query).to_string())
```
```output
System: Answer the user query. Wrap the output in `json` tags
The output should be formatted as a JSON instance that conforms to the JSON schema below.

As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.

Here is the output schema:
\`\`\`
{"$defs": {"Person": {"description": "Information about a person.", "properties": {"name": {"description": "The name of the person", "title": "Name", "type": "string"}, "height_in_meters": {"description": "The height of the person expressed in meters.", "title": "Height In Meters", "type": "number"}}, "required": ["name", "height_in_meters"], "title": "Person", "type": "object"}}, "description": "Identifying information about all people in a text.", "properties": {"people": {"items": {"$ref": "#/$defs/Person"}, "title": "People", "type": "array"}}, "required": ["people"]}
\`\`\`
Human: Anna is 23 years old and she is 6 feet tall
```
定义好提示词后，我们只需将提示词、模型和输出解析器串联在一起：


```python
chain = prompt | model | parser
chain.invoke({"query": query})
```



```output
People(people=[Person(name='Anna', height_in_meters=1.83)])
```


查看相关的 [Langsmith 跟踪](https://smith.langchain.com/public/92ed52a3-92b9-45af-a663-0a9c00e5e396/r)。

请注意，模式在两个地方出现：

1. 在提示词中，通过 `parser.get_format_instructions()`；
2. 在链中，接收格式化的输出并将其结构化为 Python 对象（在这种情况下，是 Pydantic 对象 `People`）。

## 自定义解析

如果需要，可以使用 `LangChain` 和 `LCEL` 轻松创建自定义提示词和解析器。

要创建自定义解析器，定义一个函数将模型的输出（通常是一个 [AIMessage](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html)）解析为您选择的对象。

请参见下面的 JSON 解析器的简单实现。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to use prompting alone (no tool calling) to do extraction"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to use prompting alone (no tool calling) to do extraction"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use prompting alone (no tool calling) to do extraction"}]-->
import json
import re
from typing import List, Optional

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, validator


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


```python
query = "Anna is 23 years old and she is 6 feet tall"
print(prompt.format_prompt(query=query).to_string())
```
```output
System: Answer the user query. Output your answer as JSON that  matches the given schema: \`\`\`json
{'$defs': {'Person': {'description': 'Information about a person.', 'properties': {'name': {'description': 'The name of the person', 'title': 'Name', 'type': 'string'}, 'height_in_meters': {'description': 'The height of the person expressed in meters.', 'title': 'Height In Meters', 'type': 'number'}}, 'required': ['name', 'height_in_meters'], 'title': 'Person', 'type': 'object'}}, 'description': 'Identifying information about all people in a text.', 'properties': {'people': {'items': {'$ref': '#/$defs/Person'}, 'title': 'People', 'type': 'array'}}, 'required': ['people'], 'title': 'People', 'type': 'object'}
\`\`\`. Make sure to wrap the answer in \`\`\`json and \`\`\` tags
Human: Anna is 23 years old and she is 6 feet tall
```

```python
chain = prompt | model | extract_json
chain.invoke({"query": query})
```
```output
/Users/bagatur/langchain/.venv/lib/python3.11/site-packages/pydantic/_internal/_fields.py:201: UserWarning: Field name "schema" in "PromptInput" shadows an attribute in parent "BaseModel"
  warnings.warn(
```


```output
[{'people': [{'name': 'Anna', 'height_in_meters': 1.83}]}]
```


## 其他库

如果您正在寻找使用解析方法进行提取，请查看 [Kor](https://eyurtsev.github.io/kor/) 库。它是由 `LangChain` 的维护者之一编写的，
它有助于构建一个考虑示例的提示，允许控制格式（例如，JSON 或 CSV），并以 TypeScript 表达模式。它似乎工作得很好！
