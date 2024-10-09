---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/classification.ipynb
title: Tagging
sidebar_class_name: hidden
---
[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/tagging.ipynb)

# 将文本分类为标签

标记意味着用以下类别给文档打标签：

- 情感
- 语言
- 风格（正式、非正式等）
- 涉及主题
- 政治倾向

![Image description](../../static/img/tagging.png)

## 概述

标记有几个组件：

* `function`: 像[提取](/docs/tutorials/extraction)一样，标记使用[函数](https://openai.com/blog/function-calling-and-other-api-updates)来指定模型应该如何标记文档
* `schema`: 定义我们希望如何标记文档

## 快速开始

让我们看看如何在LangChain中使用OpenAI工具调用进行标记的一个非常简单的示例。我们将使用OpenAI模型支持的[`with_structured_output`](/docs/how_to/structured_output)方法：


```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

让我们在我们的模式中指定一个具有几个属性及其预期类型的Pydantic模型。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Classify Text into Labels"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Classify Text into Labels"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)


class Classification(BaseModel):
    sentiment: str = Field(description="The sentiment of the text")
    aggressiveness: int = Field(
        description="How aggressive the text is on a scale from 1 to 10"
    )
    language: str = Field(description="The language the text is written in")


# LLM
llm = ChatOpenAI(temperature=0, model="gpt-4o-mini").with_structured_output(
    Classification
)

tagging_chain = tagging_prompt | llm
```


```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
tagging_chain.invoke({"input": inp})
```



```output
Classification(sentiment='positive', aggressiveness=1, language='Spanish')
```


如果我们想要JSON输出，我们可以直接调用`.dict()`


```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
res = tagging_chain.invoke({"input": inp})
res.dict()
```



```output
{'sentiment': 'negative', 'aggressiveness': 8, 'language': 'Spanish'}
```


正如我们在示例中看到的，它正确地解释了我们想要的内容。

结果各不相同，因此我们可能会得到，例如，不同语言的情感（'positive'，'enojado'等）。

我们将在下一节中看到如何控制这些结果。

## 更细致的控制

仔细的模式定义使我们对模型的输出有更多控制。

具体来说，我们可以定义：

- 每个属性的可能值
- 描述以确保模型理解该属性
- 必需返回的属性

让我们重新声明我们的 Pydantic 模型，以控制之前提到的每个方面，使用枚举：


```python
class Classification(BaseModel):
    sentiment: str = Field(..., enum=["happy", "neutral", "sad"])
    aggressiveness: int = Field(
        ...,
        description="describes how aggressive the statement is, the higher the number the more aggressive",
        enum=[1, 2, 3, 4, 5],
    )
    language: str = Field(
        ..., enum=["spanish", "english", "french", "german", "italian"]
    )
```


```python
tagging_prompt = ChatPromptTemplate.from_template(
    """
Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

Passage:
{input}
"""
)

llm = ChatOpenAI(temperature=0, model="gpt-4o-mini").with_structured_output(
    Classification
)

chain = tagging_prompt | llm
```

现在答案将以我们期望的方式受到限制！


```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
chain.invoke({"input": inp})
```



```output
Classification(sentiment='happy', aggressiveness=1, language='spanish')
```



```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
chain.invoke({"input": inp})
```



```output
Classification(sentiment='sad', aggressiveness=5, language='spanish')
```



```python
inp = "Weather is ok here, I can go outside without much more than a coat"
chain.invoke({"input": inp})
```



```output
Classification(sentiment='neutral', aggressiveness=2, language='english')
```


[LangSmith 跟踪](https://smith.langchain.com/public/38294e04-33d8-4c5a-ae92-c2fe68be8332/r) 让我们窥探内部：

![Image description](../../static/img/tagging_trace.png)

### 更深入

* 您可以使用 [元数据标记器](/docs/integrations/document_transformers/openai_metadata_tagger) 文档转换器从 LangChain `Document` 中提取元数据。
* 这涵盖了与标记链相同的基本功能，只是应用于 LangChain `Document`。
