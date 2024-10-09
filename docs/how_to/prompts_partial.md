---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/prompts_partial.ipynb
sidebar_position: 4
---
# 如何部分格式化提示词模板

:::info Prerequisites

本指南假设您熟悉以下概念：
- [提示词模板](/docs/concepts/#prompt-templates)

:::

就像部分绑定函数的参数一样，部分格式化提示词模板也是有意义的 - 例如，传入所需值的一个子集，以创建一个新的提示词模板，该模板只期望剩余值的子集。

LangChain 以两种方式支持这一点：

1. 使用字符串值进行部分格式化。
2. 使用返回字符串值的函数进行部分格式化。

在下面的示例中，我们将讨论这两种用例的动机以及如何在 LangChain 中实现。

## 使用字符串的部分格式化

想要部分格式化提示词模板的一个常见用例是，如果您在其他变量之前获得了某些变量的访问权限。例如，假设您有一个提示词模板，需要两个变量，`foo` 和 `baz`。如果您在链中早期获得了 `foo` 值，但稍后才获得 `baz` 值，那么将两个变量传递整个链可能会很不方便。相反，您可以使用 `foo` 值部分格式化提示词模板，然后将部分格式化的提示词模板传递下去并仅使用它。下面是一个实现此操作的示例：



```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to partially format prompt templates"}]-->
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```
```output
foobaz
```
您还可以仅使用部分变量初始化提示词。



```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```
```output
foobaz
```
## 使用函数进行部分应用

另一个常见的用法是与函数进行部分应用。使用场景是当您有一个变量，您知道总是想以一种常见的方式获取它。一个典型的例子是日期或时间。想象一下，您有一个提示词，您总是希望它包含当前日期。您不能在提示词中硬编码它，并且将其与其他输入变量一起传递是不方便的。在这种情况下，能够使用一个始终返回当前日期的函数来部分应用提示词是很方便的。



```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")


prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```
```output
Tell me a funny joke about the day 04/21/2024, 19:43:57
```
您还可以仅使用部分变量初始化提示词，这在此工作流程中通常更有意义。



```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```
```output
Tell me a funny joke about the day 04/21/2024, 19:43:57
```
## 下一步

您现在已经学习了如何将变量部分应用于您的提示词模板。

接下来，请查看本节中关于提示词模板的其他使用指南，例如 [向您的提示词模板添加少量示例](/docs/how_to/few_shot_examples_chat)。
