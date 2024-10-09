---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/dynamic_chain.ipynb
---
# 如何创建动态（自构建）链

:::info Prerequisites

本指南假设您熟悉以下内容：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [如何将任何函数转换为可运行的](/docs/how_to/functions)

:::

有时我们希望在运行时构建链的部分，这取决于链的输入（[路由](/docs/how_to/routing/)是最常见的例子）。我们可以使用RunnableLambda的一个非常有用的属性来创建动态链，即如果RunnableLambda返回一个Runnable，则该Runnable会被调用。让我们看一个例子。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
/>



```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to create a dynamic (self-constructing) chain"}]-->
# | echo: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229")
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to create a dynamic (self-constructing) chain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to create a dynamic (self-constructing) chain"}, {"imported": "Runnable", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html", "title": "How to create a dynamic (self-constructing) chain"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to create a dynamic (self-constructing) chain"}, {"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to create a dynamic (self-constructing) chain"}]-->
from operator import itemgetter

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnablePassthrough, chain

contextualize_instructions = """Convert the latest user question into a standalone question given the chat history. Don't answer the question, return the question and nothing else (no descriptive text)."""
contextualize_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_instructions),
        ("placeholder", "{chat_history}"),
        ("human", "{question}"),
    ]
)
contextualize_question = contextualize_prompt | llm | StrOutputParser()

qa_instructions = (
    """Answer the user question given the following context:\n\n{context}."""
)
qa_prompt = ChatPromptTemplate.from_messages(
    [("system", qa_instructions), ("human", "{question}")]
)


@chain
def contextualize_if_needed(input_: dict) -> Runnable:
    if input_.get("chat_history"):
        # NOTE: This is returning another Runnable, not an actual output.
        return contextualize_question
    else:
        return RunnablePassthrough() | itemgetter("question")


@chain
def fake_retriever(input_: dict) -> str:
    return "egypt's population in 2024 is about 111 million"


full_chain = (
    RunnablePassthrough.assign(question=contextualize_if_needed).assign(
        context=fake_retriever
    )
    | qa_prompt
    | llm
    | StrOutputParser()
)

full_chain.invoke(
    {
        "question": "what about egypt",
        "chat_history": [
            ("human", "what's the population of indonesia"),
            ("ai", "about 276 million"),
        ],
    }
)
```



```output
"According to the context provided, Egypt's population in 2024 is estimated to be about 111 million."
```


这里的关键是 `contextualize_if_needed` 返回另一个运行接口，而不是实际的输出。这个返回的运行接口在完整链被执行时会被运行。

从追踪中我们可以看到，由于我们传入了聊天历史，我们在完整链中执行了 contextualize_question 链： https://smith.langchain.com/public/9e0ae34c-4082-4f3f-beed-34a2a2f4c991/r

请注意，返回的运行接口的流式处理、批处理等功能都得到了保留。


```python
for chunk in contextualize_if_needed.stream(
    {
        "question": "what about egypt",
        "chat_history": [
            ("human", "what's the population of indonesia"),
            ("ai", "about 276 million"),
        ],
    }
):
    print(chunk)
```
```output
What
 is
 the
 population
 of
 Egypt
?
```