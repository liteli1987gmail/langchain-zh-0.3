---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/assign.ipynb
sidebar_position: 6
keywords: [RunnablePassthrough, assign, LCEL]
---
# 如何向链的状态添加值

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)
- [并行调用可运行项](/docs/how_to/parallel/)
- [自定义函数](/docs/how_to/functions/)
- [数据传递](/docs/how_to/passthrough)

:::

链的一个替代方法是 [数据传递](/docs/how_to/passthrough) 步骤时保持链状态的当前值不变，同时在给定键下分配一个新值。 [`RunnablePassthrough.assign()`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html#langchain_core.runnables.passthrough.RunnablePassthrough.assign) 静态方法接受一个输入值，并将额外的参数添加到分配函数中。

这在常见的 [LangChain表达式](/docs/concepts/#langchain-expression-language) 模式中非常有用，该模式是逐步创建一个字典以用作后续步骤的输入。

这是一个示例：


```python
%pip install --upgrade --quiet langchain langchain-openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to add values to a chain's state"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add values to a chain's state"}]-->
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```



```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```


让我们来分析一下这里发生了什么。

- 链的输入是 `{"num": 1}`。这被传递给 `RunnableParallel`，它以该输入并行调用传入的可运行项。
- `extra` 键下的值被调用。`RunnablePassthrough.assign()` 保留输入字典中的原始键 (`{"num": 1}`)，并分配一个名为 `mult` 的新键。其值为 `lambda x: x["num"] * 3)`，即 `3`。因此，结果是 `{"num": 1, "mult": 3}`。
- `{"num": 1, "mult": 3}` 被返回给 `RunnableParallel` 调用，并被设置为 `extra` 键的值。
- 与此同时，`modified` 键被调用。结果是 `2`，因为 lambda 从其输入中提取一个名为 `"num"` 的键并加一。

因此，结果是 `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}`。

## 流式处理

此方法的一个方便特性是，它允许值在可用时立即传递。为了展示这一点，我们将使用 `RunnablePassthrough.assign()` 在检索链中立即返回源文档：


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to add values to a chain's state"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to add values to a chain's state"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add values to a chain's state"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add values to a chain's state"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add values to a chain's state"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to add values to a chain's state"}]-->
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
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("where did harrison work?")

for chunk in stream:
    print(chunk)
```
```output
{'question': 'where did harrison work?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```
我们可以看到第一个块包含原始的 `"question"`，因为它是立即可用的。第二个块包含 `"context"`，因为检索器第二个完成。最后，来自 `generation_chain` 的输出在可用时以块的形式流入。

## 下一步

现在你已经学会了如何通过你的链传递数据，以帮助格式化流经你链的数据。

要了解更多，请参阅本节中关于可运行项的其他使用指南。
