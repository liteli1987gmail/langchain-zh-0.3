---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/extraction.ipynb
sidebar_position: 4
---
# 构建提取链

:::info Prerequisites

本指南假设读者熟悉以下概念：

- [聊天模型](/docs/concepts/#chat-models)
- [工具](/docs/concepts/#tools)
- [工具调用](/docs/concepts/#function-tool-calling)

:::

在本教程中，我们将构建一个链，以从非结构化文本中提取结构化信息。

:::important
本教程仅适用于支持 **工具调用** 的模型
:::

## 设置

### Jupyter Notebook

本指南（以及文档中的大多数其他指南）使用 [Jupyter notebooks](https://jupyter.org/)，并假设读者也是如此。Jupyter notebooks 非常适合学习如何使用大型语言模型系统，因为很多时候事情可能会出错（意外输出、API故障等），在交互环境中阅读指南是更好理解它们的好方法。

这些教程可能最方便在 Jupyter notebook 中运行。有关如何安装的说明，请参见 [这里](https://jupyter.org/install)。

### 安装

要安装 LangChain，请运行：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from "@theme/CodeBlock";

<Tabs>
  <TabItem value="pip" label="Pip" default>
    <CodeBlock language="bash">pip install langchain</CodeBlock>
  </TabItem>
  <TabItem value="conda" label="Conda">
    <CodeBlock language="bash">conda install langchain -c conda-forge</CodeBlock>
  </TabItem>
</Tabs>



有关更多详细信息，请参见我们的 [安装指南](/docs/how_to/installation)。

### LangSmith

您使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型（LLM）。
随着这些应用程序变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。
最好的方法是使用 [LangSmith](https://smith.langchain.com)。

在您通过上述链接注册后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 模式

首先，我们需要描述我们想从文本中提取的信息。

我们将使用 Pydantic 定义一个示例模式来提取个人信息。


```python
from typing import Optional

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
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the person's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )
```

定义模式时有两个最佳实践：

1. 记录 **属性** 和 **模式** 本身：这些信息会发送给大型语言模型，并用于提高信息提取的质量。
2. 不要强迫大型语言模型编造信息！在上面，我们对属性使用了 `Optional`，允许大型语言模型在不知道答案时输出 `None`。

:::important
为了获得最佳性能，请妥善记录模式，并确保模型在文本中没有信息可提取时不会被强迫返回结果。
:::

## 提取器

让我们使用上面定义的模式创建一个信息提取器。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build an Extraction Chain"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Build an Extraction Chain"}]-->
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field

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
            "If you do not know the value of an attribute asked to extract, "
            "return null for the attribute's value.",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

我们需要使用支持函数/工具调用的模型。

请查看[文档](/docs/concepts#function-tool-calling)，了解可以与此API一起使用的一些模型的列表。


```python
<!--IMPORTS:[{"imported": "ChatMistralAI", "source": "langchain_mistralai", "docs": "https://python.langchain.com/api_reference/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html", "title": "Build an Extraction Chain"}]-->
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```
```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: The method `ChatMistralAI.with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```
让我们测试一下


```python
text = "Alan Smith is 6 feet tall and has blond hair."
runnable.invoke({"text": text})
```



```output
Person(name='Alan Smith', hair_color='blond', height_in_meters='1.83')
```


:::important 

提取是生成性的 🤯

大型语言模型是生成模型，因此它们可以做一些非常酷的事情，比如正确提取以米为单位的人身高
尽管提供的是以英尺为单位的！
:::

我们可以在这里看到LangSmith的追踪记录：https://smith.langchain.com/public/44b69a63-3b3b-47b8-8a6d-61b46533f015/r

## 多个实体

在**大多数情况下**，您应该提取一个实体列表，而不是单个实体。

这可以通过使用pydantic轻松实现，通过将模型嵌套在彼此内部。


```python
from typing import List, Optional

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
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the person's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

:::important
提取可能在这里并不完美。请继续查看如何使用 **参考示例** 来提高提取质量，并查看 **指南** 部分！
:::


```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "My name is Jeff, my hair is black and i am 6 feet tall. Anna has the same color hair as me."
runnable.invoke({"text": text})
```



```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```


:::tip
当模式适应提取 **多个实体** 时，它也允许模型在没有相关信息的情况下提取 **无实体**。
通过提供一个空列表来实现。

这通常是一个 **好** 的事情！它允许在实体上指定 **必需** 属性，而不必强制模型检测该实体。
:::

我们可以在这里看到 LangSmith 跟踪信息： https://smith.langchain.com/public/7173764d-5e76-45fe-8496-84460bd9cdef/r

## 下一步

现在您已经了解了使用 LangChain 进行提取的基础知识，您可以继续进行其余的使用手册：

- [添加示例](/docs/how_to/extraction_examples)：了解如何使用 **参考示例** 来提高性能。
- [处理长文本](/docs/how_to/extraction_long_text)：如果文本不适合 LLM 的上下文窗口，您应该怎么做？
- [使用解析方法](/docs/how_to/extraction_parse)：使用基于提示的方法提取不支持 **工具/函数调用** 的模型。
