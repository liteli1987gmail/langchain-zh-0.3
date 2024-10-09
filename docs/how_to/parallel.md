---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/parallel.ipynb
sidebar_position: 1
keywords: [RunnableParallel, RunnableMap, LCEL]
---
# 如何并行调用运行接口

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接运行接口](/docs/how_to/sequence)

:::

[`RunnableParallel`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html) 原语本质上是一个字典，其值是运行接口（或可以被强制转换为运行接口的事物，如函数）。它并行运行所有值，并且每个值都使用 `RunnableParallel` 的整体输入进行调用。最终返回值是一个字典，包含每个值在其适当键下的结果。

## 使用 `RunnableParallels` 格式化

`RunnableParallels` 对于并行化操作非常有用，但也可以用于操纵一个运行接口的输出，以匹配序列中下一个运行接口的输入格式。您可以使用它们来拆分或分叉链，以便多个组件可以并行处理输入。稍后，其他组件可以连接或合并结果，以合成最终响应。这种类型的链创建了一个计算图，如下所示：

```text
     Input
      / \
     /   \
 Branch1 Branch2
     \   /
      \ /
      Combine
```

下面，提示的输入预计是一个包含键 "context" 和 "question" 的映射。用户输入的只是问题。因此，我们需要使用检索器获取上下文，并将用户输入传递到 "question" 键下。



```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to invoke runnables in parallel"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to invoke runnables in parallel"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to invoke runnables in parallel"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to invoke runnables in parallel"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to invoke runnables in parallel"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to invoke runnables in parallel"}]-->
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""

# The prompt expects input with keys for "context" and "question"
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("where did harrison work?")
```



```output
'Harrison worked at Kensho.'
```


:::tip
请注意，当将 RunnableParallel 与另一个 Runnable 组合时，我们甚至不需要将字典包装在 RunnableParallel 类中——类型转换会为我们处理。在链的上下文中，这些是等效的：
:::

```
{"context": retriever, "question": RunnablePassthrough()}
```

```
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

请参阅 [强制转换更多信息](/docs/how_to/sequence/#coercion) 部分。

## 使用 itemgetter 作为简写

请注意，当与 RunnableParallel 结合使用时，您可以使用 Python 的 `itemgetter` 作为简写来从映射中提取数据。有关 itemgetter 的更多信息，请参见 [Python 文档](https://docs.python.org/3/library/operator.html#operator.itemgetter)。

在下面的示例中，我们使用 itemgetter 从映射中提取特定键：


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to invoke runnables in parallel"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to invoke runnables in parallel"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to invoke runnables in parallel"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to invoke runnables in parallel"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to invoke runnables in parallel"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to invoke runnables in parallel"}]-->
from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}

Answer in the following language: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "where did harrison work", "language": "italian"})
```



```output
'Harrison ha lavorato a Kensho.'
```


## 并行化步骤

RunnableParallels 使得并行执行多个 Runnables 变得简单，并将这些 Runnables 的输出作为映射返回。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to invoke runnables in parallel"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to invoke runnables in parallel"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to invoke runnables in parallel"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
poem_chain = (
    ChatPromptTemplate.from_template("write a 2-line poem about {topic}") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "bear"})
```



```output
{'joke': AIMessage(content="Why don't bears like fast food? Because they can't catch it!", response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 13, 'total_tokens': 28}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_d9767fc5b9', 'finish_reason': 'stop', 'logprobs': None}, id='run-fe024170-c251-4b7a-bfd4-64a3737c67f2-0'),
 'poem': AIMessage(content='In the quiet of the forest, the bear roams free\nMajestic and wild, a sight to see.', response_metadata={'token_usage': {'completion_tokens': 24, 'prompt_tokens': 15, 'total_tokens': 39}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-2707913e-a743-4101-b6ec-840df4568a76-0')}
```


## 并行性

RunnableParallel 也适用于并行运行独立进程，因为映射中的每个 Runnable 都是并行执行的。例如，我们可以看到之前的 `joke_chain`、`poem_chain` 和 `map_chain` 的运行时间大致相同，即使 `map_chain` 同时执行了其他两个。


```python
%%timeit

joke_chain.invoke({"topic": "bear"})
```
```output
610 ms ± 64 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "bear"})
```
```output
599 ms ± 73.3 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "bear"})
```
```output
643 ms ± 77.8 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
## 下一步

您现在知道了一些使用 `RunnableParallel` 格式化和并行化链步骤的方法。

要了解更多信息，请参阅本节中关于可运行项的其他使用指南。
