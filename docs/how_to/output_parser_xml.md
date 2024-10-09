---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_xml.ipynb
---
# 如何解析 XML 输出

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [输出解析器](/docs/concepts/#output-parsers)
- [提示词模板](/docs/concepts/#prompt-templates)
- [结构化输出](/docs/how_to/structured_output)
- [将可运行项串联在一起](/docs/how_to/sequence/)

:::

来自不同提供商的大型语言模型通常在特定数据上训练时具有不同的优势。这也意味着某些模型在生成 JSON 以外格式的输出时可能“更好”且更可靠。

本指南向您展示如何使用 [`XMLOutputParser`](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html) 提示模型生成 XML 输出，然后将该输出解析为可用格式。

:::note
请记住，大型语言模型是泄漏的抽象！您必须使用具有足够容量的 LLM 来生成格式良好的 XML。
:::

在以下示例中，我们使用Anthropic的Claude-2模型（https://docs.anthropic.com/claude/docs），这是一个针对XML标签进行优化的模型。


```python
%pip install -qU langchain langchain-anthropic

import os
from getpass import getpass

if "ANTHROPIC_API_KEY" not in os.environ:
    os.environ["ANTHROPIC_API_KEY"] = getpass()
```

让我们从一个简单的请求开始。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to parse XML output"}, {"imported": "XMLOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html", "title": "How to parse XML output"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to parse XML output"}]-->
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import XMLOutputParser
from langchain_core.prompts import PromptTemplate

model = ChatAnthropic(model="claude-2.1", max_tokens_to_sample=512, temperature=0.1)

actor_query = "Generate the shortened filmography for Tom Hanks."

output = model.invoke(
    f"""{actor_query}
Please enclose the movies in <movie></movie> tags"""
)

print(output.content)
```
```output
Here is the shortened filmography for Tom Hanks, with movies enclosed in XML tags:

<movie>Splash</movie>
<movie>Big</movie>
<movie>A League of Their Own</movie>
<movie>Sleepless in Seattle</movie>
<movie>Forrest Gump</movie>
<movie>Toy Story</movie>
<movie>Apollo 13</movie>
<movie>Saving Private Ryan</movie>
<movie>Cast Away</movie>
<movie>The Da Vinci Code</movie>
```
这实际上效果很好！但将 XML 解析为更易于使用的格式会更好。我们可以使用 `XMLOutputParser` 来为提示添加默认格式说明，并将输出的 XML 解析为字典：


```python
parser = XMLOutputParser()

# We will add these instructions to the prompt below
parser.get_format_instructions()
```



```output
'The output should be formatted as a XML file.\n1. Output should conform to the tags below. \n2. If tags are not given, make them on your own.\n3. Remember to always open and close all the tags.\n\nAs an example, for the tags ["foo", "bar", "baz"]:\n1. String "<foo>\n   <bar>\n      <baz></baz>\n   </bar>\n</foo>" is a well-formatted instance of the schema. \n2. String "<foo>\n   <bar>\n   </foo>" is a badly-formatted instance.\n3. String "<foo>\n   <tag>\n   </tag>\n</foo>" is a badly-formatted instance.\n\nHere are the output tags:\n\`\`\`\nNone\n\`\`\`'
```



```python
prompt = PromptTemplate(
    template="""{query}\n{format_instructions}""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

output = chain.invoke({"query": actor_query})
print(output)
```
```output
{'filmography': [{'movie': [{'title': 'Big'}, {'year': '1988'}]}, {'movie': [{'title': 'Forrest Gump'}, {'year': '1994'}]}, {'movie': [{'title': 'Toy Story'}, {'year': '1995'}]}, {'movie': [{'title': 'Saving Private Ryan'}, {'year': '1998'}]}, {'movie': [{'title': 'Cast Away'}, {'year': '2000'}]}]}
```
我们还可以添加一些标签，以便根据我们的需求定制输出。您可以并且应该在提示的其他部分尝试添加自己的格式提示，以增强或替换默认说明：


```python
parser = XMLOutputParser(tags=["movies", "actor", "film", "name", "genre"])

# We will add these instructions to the prompt below
parser.get_format_instructions()
```



```output
'The output should be formatted as a XML file.\n1. Output should conform to the tags below. \n2. If tags are not given, make them on your own.\n3. Remember to always open and close all the tags.\n\nAs an example, for the tags ["foo", "bar", "baz"]:\n1. String "<foo>\n   <bar>\n      <baz></baz>\n   </bar>\n</foo>" is a well-formatted instance of the schema. \n2. String "<foo>\n   <bar>\n   </foo>" is a badly-formatted instance.\n3. String "<foo>\n   <tag>\n   </tag>\n</foo>" is a badly-formatted instance.\n\nHere are the output tags:\n\`\`\`\n[\'movies\', \'actor\', \'film\', \'name\', \'genre\']\n\`\`\`'
```



```python
prompt = PromptTemplate(
    template="""{query}\n{format_instructions}""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)


chain = prompt | model | parser

output = chain.invoke({"query": actor_query})

print(output)
```
```output
{'movies': [{'actor': [{'name': 'Tom Hanks'}, {'film': [{'name': 'Forrest Gump'}, {'genre': 'Drama'}]}, {'film': [{'name': 'Cast Away'}, {'genre': 'Adventure'}]}, {'film': [{'name': 'Saving Private Ryan'}, {'genre': 'War'}]}]}]}
```
这个输出解析器还支持部分块的流式处理。以下是一个示例：


```python
for s in chain.stream({"query": actor_query}):
    print(s)
```
```output
{'movies': [{'actor': [{'name': 'Tom Hanks'}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Forrest Gump'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'Drama'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Cast Away'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'Adventure'}]}]}]}
{'movies': [{'actor': [{'film': [{'name': 'Saving Private Ryan'}]}]}]}
{'movies': [{'actor': [{'film': [{'genre': 'War'}]}]}]}
```
## 下一步

您现在已经学会了如何提示模型返回 XML。接下来，请查看 [获取结构化输出的更广泛指南](/docs/how_to/structured_output)，了解其他相关技术。
