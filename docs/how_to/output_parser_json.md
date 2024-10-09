---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_json.ipynb
---
# 如何解析 JSON 输出

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [输出解析器](/docs/concepts/#output-parsers)
- [提示词模板](/docs/concepts/#prompt-templates)
- [结构化输出](/docs/how_to/structured_output)
- [将可运行项串联在一起](/docs/how_to/sequence/)

:::

虽然一些大模型供应商支持 [内置方式返回结构化输出](/docs/how_to/structured_output)，但并非所有都支持。我们可以使用输出解析器帮助用户通过提示指定任意 JSON 架构，查询模型以获取符合该架构的输出，最后将该架构解析为 JSON。

:::note
请记住，大型语言模型是泄漏的抽象！您必须使用具有足够容量的 LLM 来生成格式良好的 JSON。
:::

[`JsonOutputParser`](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html) 是一个内置选项，用于提示和解析 JSON 输出。虽然它的功能与 [`PydanticOutputParser`](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html) 类似，但它还支持流式返回部分 JSON 对象。

这是一个示例，展示了如何与 [Pydantic](https://docs.pydantic.dev/) 一起使用，以方便地声明预期的模式：


```python
%pip install -qU langchain langchain-openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "JsonOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html", "title": "How to parse JSON output"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to parse JSON output"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to parse JSON output"}]-->
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

model = ChatOpenAI(temperature=0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")


# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = JsonOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```



```output
{'setup': "Why couldn't the bicycle stand up by itself?",
 'punchline': 'Because it was two tired!'}
```


请注意，我们将 `format_instructions` 从解析器直接传递到提示中。您可以并且应该尝试在提示的其他部分添加自己的格式提示，以增强或替换默认指令：


```python
parser.get_format_instructions()
```



```output
'The output should be formatted as a JSON instance that conforms to the JSON schema below.\n\nAs an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}\nthe object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.\n\nHere is the output schema:\n\`\`\`\n{"properties": {"setup": {"title": "Setup", "description": "question to set up a joke", "type": "string"}, "punchline": {"title": "Punchline", "description": "answer to resolve the joke", "type": "string"}}, "required": ["setup", "punchline"]}\n\`\`\`'
```


## 流式处理

如上所述，`JsonOutputParser` 和 `PydanticOutputParser` 之间的一个关键区别是 `JsonOutputParser` 输出解析器支持流式部分块。以下是其样子：


```python
for s in chain.stream({"query": joke_query}):
    print(s)
```
```output
{}
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why couldn'}
{'setup': "Why couldn't"}
{'setup': "Why couldn't the"}
{'setup': "Why couldn't the bicycle"}
{'setup': "Why couldn't the bicycle stand"}
{'setup': "Why couldn't the bicycle stand up"}
{'setup': "Why couldn't the bicycle stand up by"}
{'setup': "Why couldn't the bicycle stand up by itself"}
{'setup': "Why couldn't the bicycle stand up by itself?"}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': ''}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because'}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because it'}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because it was'}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because it was two'}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because it was two tired'}
{'setup': "Why couldn't the bicycle stand up by itself?", 'punchline': 'Because it was two tired!'}
```
## 无需 Pydantic

您也可以在不使用 Pydantic 的情况下使用 `JsonOutputParser`。这将提示模型返回 JSON，但不会提供关于模式应是什么的具体信息。


```python
joke_query = "Tell me a joke."

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```



```output
{'response': "Sure! Here's a joke for you: Why couldn't the bicycle stand up by itself? Because it was two tired!"}
```


## 下一步

您现在已经学习了一种提示模型返回结构化 JSON 的方法。接下来，请查看 [获取结构化输出的更广泛指南](/docs/how_to/structured_output) 以了解其他技术。
