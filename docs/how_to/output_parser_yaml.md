---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_yaml.ipynb
---
# 如何解析 YAML 输出

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [输出解析器](/docs/concepts/#output-parsers)
- [提示词模板](/docs/concepts/#prompt-templates)
- [结构化输出](/docs/how_to/structured_output)
- [将可运行项串联在一起](/docs/how_to/sequence/)

:::

来自不同提供商的大型语言模型通常根据其训练的特定数据具有不同的优势。这也意味着某些模型在生成 JSON 以外格式的输出时可能“更好”且更可靠。

此输出解析器允许用户指定任意模式，并查询大型语言模型以获取符合该模式的输出，使用 YAML 格式化其响应。

:::note
请记住，大型语言模型是泄漏的抽象！您必须使用具有足够容量的 LLM 来生成格式良好的 YAML。
:::



```python
%pip install -qU langchain langchain-openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

我们使用 [Pydantic](https://docs.pydantic.dev) 和 [`YamlOutputParser`](https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser) 来声明我们的数据模型，并为模型提供更多上下文，以便生成正确类型的 YAML：


```python
<!--IMPORTS:[{"imported": "YamlOutputParser", "source": "langchain.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html", "title": "How to parse YAML output"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to parse YAML output"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to parse YAML output"}]-->
from langchain.output_parsers import YamlOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")


model = ChatOpenAI(temperature=0)

# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = YamlOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```



```output
Joke(setup="Why couldn't the bicycle find its way home?", punchline='Because it lost its bearings!')
```


解析器将自动解析输出的 YAML，并使用数据创建 Pydantic 模型。我们可以看到解析器的 `format_instructions`，这些指令会被添加到提示中：


```python
parser.get_format_instructions()
```



```output
'The output should be formatted as a YAML instance that conforms to the given JSON schema below.\n\n# Examples\n## Schema\n\`\`\`\n{"title": "Players", "description": "A list of players", "type": "array", "items": {"$ref": "#/definitions/Player"}, "definitions": {"Player": {"title": "Player", "type": "object", "properties": {"name": {"title": "Name", "description": "Player name", "type": "string"}, "avg": {"title": "Avg", "description": "Batting average", "type": "number"}}, "required": ["name", "avg"]}}}\n\`\`\`\n## Well formatted instance\n\`\`\`\n- name: John Doe\n  avg: 0.3\n- name: Jane Maxfield\n  avg: 1.4\n\`\`\`\n\n## Schema\n\`\`\`\n{"properties": {"habit": { "description": "A common daily habit", "type": "string" }, "sustainable_alternative": { "description": "An environmentally friendly alternative to the habit", "type": "string"}}, "required": ["habit", "sustainable_alternative"]}\n\`\`\`\n## Well formatted instance\n\`\`\`\nhabit: Using disposable water bottles for daily hydration.\nsustainable_alternative: Switch to a reusable water bottle to reduce plastic waste and decrease your environmental footprint.\n\`\`\` \n\nPlease follow the standard YAML formatting conventions with an indent of 2 spaces and make sure that the data types adhere strictly to the following JSON schema: \n\`\`\`\n{"properties": {"setup": {"title": "Setup", "description": "question to set up a joke", "type": "string"}, "punchline": {"title": "Punchline", "description": "answer to resolve the joke", "type": "string"}}, "required": ["setup", "punchline"]}\n\`\`\`\n\nMake sure to always enclose the YAML output in triple backticks (\`\`\`). Please do not add anything other than valid YAML output!'
```


您可以并且应该尝试在提示的其他部分添加自己的格式提示，以增强或替换默认指令。

## 下一步

您现在已经学习了如何提示模型返回 XML。接下来，请查看 [获取结构化输出的更广泛指南](/docs/how_to/structured_output)，了解其他相关技术。
