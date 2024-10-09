---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/prompts_composition.ipynb
sidebar_position: 5
---
# 如何组合提示词

:::info Prerequisites

本指南假设您对以下概念有所了解：
- [提示词模板](/docs/concepts/#prompt-templates)

:::

LangChain 提供了一个用户友好的界面，用于将提示词的不同部分组合在一起。您可以使用字符串提示词或聊天提示词来实现这一点。以这种方式构建提示词可以方便地重用组件。

## 字符串提示词组合

在处理字符串提示词时，每个模板是连接在一起的。您可以直接使用提示词或字符串（列表中的第一个元素需要是一个提示词）。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to compose prompts together"}]-->
from langchain_core.prompts import PromptTemplate

prompt = (
    PromptTemplate.from_template("Tell me a joke about {topic}")
    + ", make it funny"
    + "\n\nand in {language}"
)

prompt
```



```output
PromptTemplate(input_variables=['language', 'topic'], template='Tell me a joke about {topic}, make it funny\n\nand in {language}')
```



```python
prompt.format(topic="sports", language="spanish")
```



```output
'Tell me a joke about sports, make it funny\n\nand in spanish'
```


## 聊天提示词组成

聊天提示词由一系列消息组成。与上面的示例类似，我们可以连接聊天提示词模板。每个新元素都是最终提示词中的一条新消息。

首先，让我们用一个 [`SystemMessage`](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html) 初始化一个 [`ChatPromptTemplate`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html)。


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to compose prompts together"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to compose prompts together"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to compose prompts together"}]-->
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

prompt = SystemMessage(content="You are a nice pirate")
```

然后，您可以轻松创建一个管道，将其与其他消息 *或* 消息模板结合起来。
当没有变量需要格式化时使用 `Message`，当有变量需要格式化时使用 `MessageTemplate`。您也可以仅使用一个字符串（注意：这将自动推断为一个 [`HumanMessagePromptTemplate`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html)）。


```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

在底层，这会创建一个 ChatPromptTemplate 类的实例，因此您可以像之前一样使用它！


```python
new_prompt.format_messages(input="i said hi")
```



```output
[SystemMessage(content='You are a nice pirate'),
 HumanMessage(content='hi'),
 AIMessage(content='what?'),
 HumanMessage(content='i said hi')]
```


## 使用 PipelinePrompt

LangChain 包含一个名为 [`PipelinePromptTemplate`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html) 的类，当您想重用提示词的部分时，这个类非常有用。PipelinePrompt 由两个主要部分组成：

- 最终提示词：返回的最终提示词
- 管道提示词：一个元组列表，由字符串名称和提示词模板组成。每个提示词模板将被格式化，然后作为具有相同名称的变量传递给未来的提示词模板。


```python
<!--IMPORTS:[{"imported": "PipelinePromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html", "title": "How to compose prompts together"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to compose prompts together"}]-->
from langchain_core.prompts import PipelinePromptTemplate, PromptTemplate

full_template = """{introduction}

{example}

{start}"""
full_prompt = PromptTemplate.from_template(full_template)

introduction_template = """You are impersonating {person}."""
introduction_prompt = PromptTemplate.from_template(introduction_template)

example_template = """Here's an example of an interaction:

Q: {example_q}
A: {example_a}"""
example_prompt = PromptTemplate.from_template(example_template)

start_template = """Now, do this for real!

Q: {input}
A:"""
start_prompt = PromptTemplate.from_template(start_template)

input_prompts = [
    ("introduction", introduction_prompt),
    ("example", example_prompt),
    ("start", start_prompt),
]
pipeline_prompt = PipelinePromptTemplate(
    final_prompt=full_prompt, pipeline_prompts=input_prompts
)

pipeline_prompt.input_variables
```



```output
['person', 'example_a', 'example_q', 'input']
```



```python
print(
    pipeline_prompt.format(
        person="Elon Musk",
        example_q="What's your favorite car?",
        example_a="Tesla",
        input="What's your favorite social media site?",
    )
)
```
```output
You are impersonating Elon Musk.

Here's an example of an interaction:

Q: What's your favorite car?
A: Tesla

Now, do this for real!

Q: What's your favorite social media site?
A:
```
## 下一步

您现在已经学习了如何组合提示词。

接下来，请查看本节中关于提示词模板的其他使用指南，例如[向您的提示词模板添加少量示例](/docs/how_to/few_shot_examples_chat)。
