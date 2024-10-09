---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/llm_router_chain.ipynb
---
# 从LLMRouterChain迁移

[`LLMRouterChain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.router.llm_router.LLMRouterChain.html) 将输入查询路由到多个目标之一——也就是说，给定一个输入查询，它使用大型语言模型从目标链列表中进行选择，并将其输入传递给选定的链。

`LLMRouterChain` 不支持常见的 [聊天模型](/docs/concepts/#chat-models) 特性，例如消息角色和 [工具调用](/docs/concepts/#functiontool-calling)。在底层，`LLMRouterChain` 通过指示大型语言模型生成JSON格式的文本来路由查询，并解析出预期的目标。

考虑一个来自 [MultiPromptChain](/docs/versions/migrating_chains/multi_prompt_chain) 的示例，它使用 `LLMRouterChain`。以下是一个（示例）默认提示：


```python
from langchain.chains.router.multi_prompt import MULTI_PROMPT_ROUTER_TEMPLATE

destinations = """
animals: prompt for animal expert
vegetables: prompt for a vegetable expert
"""

router_template = MULTI_PROMPT_ROUTER_TEMPLATE.format(destinations=destinations)

print(router_template.replace("`", "'"))  # for rendering purposes
```
```output
Given a raw text input to a language model select the model prompt best suited for the input. You will be given the names of the available prompts and a description of what the prompt is best suited for. You may also revise the original input if you think that revising it will ultimately lead to a better response from the language model.

<< FORMATTING >>
Return a markdown code snippet with a JSON object formatted to look like:
'''json
{{
    "destination": string \ name of the prompt to use or "DEFAULT"
    "next_inputs": string \ a potentially modified version of the original input
}}
'''

REMEMBER: "destination" MUST be one of the candidate prompt names specified below OR it can be "DEFAULT" if the input is not well suited for any of the candidate prompts.
REMEMBER: "next_inputs" can just be the original input if you don't think any modifications are needed.

<< CANDIDATE PROMPTS >>

animals: prompt for animal expert
vegetables: prompt for a vegetable expert


<< INPUT >>
{input}

<< OUTPUT (must include '''json at the start of the response) >>
<< OUTPUT (must end with ''') >>
```
大部分行为是通过单个自然语言提示来决定的。支持[工具调用](/docs/how_to/tool_calling/)功能的聊天模型在此任务中具有许多优势：

- 支持聊天提示模板，包括带有`system`和其他角色的消息；
- 工具调用模型经过微调以生成结构化输出；
- 支持可运行的方法，如流式处理和异步操作。

现在让我们将`LLMRouterChain`与使用工具调用的LCEL实现并排比较。请注意，对于本指南，我们将使用`langchain-openai >= 0.1.20`：


```python
%pip install -qU langchain-core langchain-openai
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 传统

<details open>


```python
<!--IMPORTS:[{"imported": "LLMRouterChain", "source": "langchain.chains.router.llm_router", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.router.llm_router.LLMRouterChain.html", "title": "Migrating from LLMRouterChain"}, {"imported": "RouterOutputParser", "source": "langchain.chains.router.llm_router", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.router.llm_router.RouterOutputParser.html", "title": "Migrating from LLMRouterChain"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Migrating from LLMRouterChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMRouterChain"}]-->
from langchain.chains.router.llm_router import LLMRouterChain, RouterOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

router_prompt = PromptTemplate(
    # Note: here we use the prompt template from above. Generally this would need
    # to be customized.
    template=router_template,
    input_variables=["input"],
    output_parser=RouterOutputParser(),
)

chain = LLMRouterChain.from_llm(llm, router_prompt)
```


```python
result = chain.invoke({"input": "What color are carrots?"})

print(result["destination"])
```
```output
vegetables
```
</details>

## LCEL

<details open>


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from LLMRouterChain"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Migrating from LLMRouterChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMRouterChain"}]-->
from operator import itemgetter
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict

llm = ChatOpenAI(model="gpt-4o-mini")

route_system = "Route the user's query to either the animal or vegetable expert."
route_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", route_system),
        ("human", "{input}"),
    ]
)


# Define schema for output:
class RouteQuery(TypedDict):
    """Route query to destination expert."""

    destination: Literal["animal", "vegetable"]


# Instead of writing formatting instructions into the prompt, we
# leverage .with_structured_output to coerce the output into a simple
# schema.
chain = route_prompt | llm.with_structured_output(RouteQuery)
```


```python
result = chain.invoke({"input": "What color are carrots?"})

print(result["destination"])
```
```output
vegetable
```
</details>

## 下一步

有关使用提示模板、大型语言模型和输出解析器构建的更多详细信息，请参见[本教程](/docs/tutorials/llm_chain)。

查看[LCEL概念文档](/docs/concepts/#langchain-expression-language-lcel)以获取更多背景信息。
