---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/functions.ipynb
sidebar_position: 3
keywords: [RunnableLambda, LCEL]
---
# 如何运行自定义函数

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)

:::

您可以将任意函数用作 [可运行项](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable)。这对于格式化或当您需要其他LangChain组件未提供的功能时非常有用，作为可运行项使用的自定义函数称为 [`RunnableLambdas`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html)。

请注意，这些函数的所有输入需要是一个单一的参数。如果您有一个接受多个参数的函数，您应该编写一个包装器，接受一个单一的字典输入并将其解包为多个参数。

本指南将涵盖：

- 如何使用 `RunnableLambda` 构造函数和便利的 `@chain` 装饰器显式创建可运行项
- 在链中使用时将自定义函数强制转换为可运行项
- 如何在您的自定义函数中接受和使用运行元数据
- 如何通过让自定义函数返回生成器来进行流式处理

## 使用构造函数

下面，我们使用 `RunnableLambda` 构造函数显式包装我们的自定义逻辑：


```python
%pip install -qU langchain langchain_openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to run custom functions"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to run custom functions"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to run custom functions"}]-->
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI


def length_function(text):
    return len(text)


def _multiple_length_function(text1, text2):
    return len(text1) * len(text2)


def multiple_length_function(_dict):
    return _multiple_length_function(_dict["text1"], _dict["text2"])


model = ChatOpenAI()

prompt = ChatPromptTemplate.from_template("what is {a} + {b}")

chain1 = prompt | model

chain = (
    {
        "a": itemgetter("foo") | RunnableLambda(length_function),
        "b": {"text1": itemgetter("foo"), "text2": itemgetter("bar")}
        | RunnableLambda(multiple_length_function),
    }
    | prompt
    | model
)

chain.invoke({"foo": "bar", "bar": "gah"})
```



```output
AIMessage(content='3 + 9 equals 12.', response_metadata={'token_usage': {'completion_tokens': 8, 'prompt_tokens': 14, 'total_tokens': 22}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-73728de3-e483-49e3-ad54-51bd9570e71a-0')
```


## 方便的 `@chain` 装饰器

您还可以通过添加 `@chain` 装饰器将任意函数转换为链。这在功能上等同于将函数包装在 `RunnableLambda` 构造函数中，如上所示。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to run custom functions"}, {"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to run custom functions"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import chain

prompt1 = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
prompt2 = ChatPromptTemplate.from_template("What is the subject of this joke: {joke}")


@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})


custom_chain.invoke("bears")
```



```output
'The subject of the joke is the bear and his girlfriend.'
```


上面使用 `@chain` 装饰器将 `custom_chain` 转换为可运行的，我们通过 `.invoke()` 方法调用它。

如果您使用 [LangSmith](https://docs.smith.langchain.com/) 进行追踪，您应该会看到其中有一个 `custom_chain` 追踪，OpenAI 的调用嵌套在下面。

## 链中的自动强制转换

在使用管道操作符 (`|`) 的链中使用自定义函数时，您可以省略 `RunnableLambda` 或 `@chain` 构造函数，并依赖强制转换。以下是一个简单的示例，函数接受模型的输出并返回前五个字母：


```python
prompt = ChatPromptTemplate.from_template("tell me a story about {topic}")

model = ChatOpenAI()

chain_with_coerced_function = prompt | model | (lambda x: x.content[:5])

chain_with_coerced_function.invoke({"topic": "bears"})
```



```output
'Once '
```


请注意，我们不需要将自定义函数 `(lambda x: x.content[:5])` 包装在 `RunnableLambda` 构造函数中，因为管道操作符左侧的 `model` 已经是一个可运行的。自定义函数被 **强制转换** 为可运行的。有关更多信息，请参见 [本节](/docs/how_to/sequence/#coercion)。

## 传递运行元数据

可运行的 lambda 可以选择性地接受一个 [RunnableConfig](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html#langchain_core.runnables.config.RunnableConfig) 参数，您可以使用它将回调、标签和其他配置信息传递给嵌套运行。


```python
<!--IMPORTS:[{"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to run custom functions"}, {"imported": "get_openai_callback", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.manager.get_openai_callback.html", "title": "How to run custom functions"}]-->
import json

from langchain_core.runnables import RunnableConfig


def parse_or_fix(text: str, config: RunnableConfig):
    fixing_chain = (
        ChatPromptTemplate.from_template(
            "Fix the following text:\n\n\`\`\`text\n{input}\n\`\`\`\nError: {error}"
            " Don't narrate, just respond with the fixed data."
        )
        | model
        | StrOutputParser()
    )
    for _ in range(3):
        try:
            return json.loads(text)
        except Exception as e:
            text = fixing_chain.invoke({"input": text, "error": e}, config)
    return "Failed to parse"


from langchain_community.callbacks import get_openai_callback

with get_openai_callback() as cb:
    output = RunnableLambda(parse_or_fix).invoke(
        "{foo: bar}", {"tags": ["my-tag"], "callbacks": [cb]}
    )
    print(output)
    print(cb)
```
```output
{'foo': 'bar'}
Tokens Used: 62
	Prompt Tokens: 56
	Completion Tokens: 6
Successful Requests: 1
Total Cost (USD): $9.6e-05
```

```python
<!--IMPORTS:[{"imported": "get_openai_callback", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.manager.get_openai_callback.html", "title": "How to run custom functions"}]-->
from langchain_community.callbacks import get_openai_callback

with get_openai_callback() as cb:
    output = RunnableLambda(parse_or_fix).invoke(
        "{foo: bar}", {"tags": ["my-tag"], "callbacks": [cb]}
    )
    print(output)
    print(cb)
```
```output
{'foo': 'bar'}
Tokens Used: 62
	Prompt Tokens: 56
	Completion Tokens: 6
Successful Requests: 1
Total Cost (USD): $9.6e-05
```
## 流式处理

:::note
[RunnableLambda](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html) 最适合不需要支持流式处理的代码。如果您需要支持流式处理（即能够对输入块进行操作并生成输出块），请使用 [RunnableGenerator](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableGenerator.html)，如下例所示。
:::

您可以在链中使用生成器函数（即使用 `yield` 关键字的函数，并且表现得像迭代器）。

这些生成器的签名应为 `Iterator[Input] -> Iterator[Output]`。或者对于异步生成器：`AsyncIterator[Input] -> AsyncIterator[Output]`。

这些对于以下情况很有用：
- 实现自定义输出解析器
- 修改前一步的输出，同时保留流式处理能力

这是一个用于逗号分隔列表的自定义输出解析器的示例。首先，我们创建一个生成这样的列表的链：


```python
from typing import Iterator, List

prompt = ChatPromptTemplate.from_template(
    "Write a comma-separated list of 5 animals similar to: {animal}. Do not include numbers"
)

str_chain = prompt | model | StrOutputParser()

for chunk in str_chain.stream({"animal": "bear"}):
    print(chunk, end="", flush=True)
```
```output
lion, tiger, wolf, gorilla, panda
```
接下来，我们定义一个自定义函数，该函数将聚合当前流式输出，并在模型生成列表中的下一个逗号时返回它：


```python
# This is a custom parser that splits an iterator of llm tokens
# into a list of strings separated by commas
def split_into_list(input: Iterator[str]) -> Iterator[List[str]]:
    # hold partial input until we get a comma
    buffer = ""
    for chunk in input:
        # add current chunk to buffer
        buffer += chunk
        # while there are commas in the buffer
        while "," in buffer:
            # split buffer on comma
            comma_index = buffer.index(",")
            # yield everything before the comma
            yield [buffer[:comma_index].strip()]
            # save the rest for the next iteration
            buffer = buffer[comma_index + 1 :]
    # yield the last chunk
    yield [buffer.strip()]


list_chain = str_chain | split_into_list

for chunk in list_chain.stream({"animal": "bear"}):
    print(chunk, flush=True)
```
```output
['lion']
['tiger']
['wolf']
['gorilla']
['raccoon']
```
调用它会返回一个完整的值数组：


```python
list_chain.invoke({"animal": "bear"})
```



```output
['lion', 'tiger', 'wolf', 'gorilla', 'raccoon']
```


## 异步版本

如果您在`async`环境中工作，这里是上述示例的`async`版本：


```python
from typing import AsyncIterator


async def asplit_into_list(
    input: AsyncIterator[str],
) -> AsyncIterator[List[str]]:  # async def
    buffer = ""
    async for (
        chunk
    ) in input:  # `input` is a `async_generator` object, so use `async for`
        buffer += chunk
        while "," in buffer:
            comma_index = buffer.index(",")
            yield [buffer[:comma_index].strip()]
            buffer = buffer[comma_index + 1 :]
    yield [buffer.strip()]


list_chain = str_chain | asplit_into_list

async for chunk in list_chain.astream({"animal": "bear"}):
    print(chunk, flush=True)
```
```output
['lion']
['tiger']
['wolf']
['gorilla']
['panda']
```

```python
await list_chain.ainvoke({"animal": "bear"})
```



```output
['lion', 'tiger', 'wolf', 'gorilla', 'panda']
```


## 下一步

现在您已经学习了几种在链中使用自定义逻辑的方法，以及如何实现流式处理。

要了解更多信息，请参阅本节中关于可运行项的其他使用指南。
