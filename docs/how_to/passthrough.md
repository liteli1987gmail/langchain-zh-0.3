---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/passthrough.ipynb
sidebar_position: 5
keywords: [RunnablePassthrough, LCEL]
---
# 如何将参数从一个步骤传递到下一个步骤

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)
- [并行调用可运行项](/docs/how_to/parallel/)
- [自定义函数](/docs/how_to/functions/)

:::


在组合多个步骤的链时，有时您希望将前一步的数据原样传递，以便作为后续步骤的输入。[`RunnablePassthrough`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html) 类允许您做到这一点，通常与 [RunnableParallel](/docs/how_to/parallel/) 一起使用，以将数据传递到您构建的链中的后续步骤。

请参见下面的示例：


```python
%pip install -qU langchain langchain-openai

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to pass through arguments from one step to the next"}]-->
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```



```output
{'passed': {'num': 1}, 'modified': 2}
```


如上所示，`passed` 键被调用了 `RunnablePassthrough()`，因此它简单地传递了 `{'num': 1}`。

我们还在映射中设置了第二个键 `modified`。这使用了一个 lambda 来设置一个值，将 num 加 1，结果是 `modified` 键的值为 `2`。

## 检索示例

在下面的示例中，我们看到一个更真实的用例，其中我们在链中使用 `RunnablePassthrough` 和 `RunnableParallel` 来正确格式化输入到提示中：


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to pass through arguments from one step to the next"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to pass through arguments from one step to the next"}]-->
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


这里提示的输入预期是一个包含键 "context" 和 "question" 的映射。用户输入的只是问题。因此，我们需要使用我们的检索器获取上下文，并将用户输入传递到 "question" 键下。`RunnablePassthrough` 允许我们将用户的问题传递给提示和模型。

## 下一步

现在你已经学会了如何通过你的链传递数据，以帮助格式化流经你链的数据。

要了解更多，请参阅本节中关于可运行项的其他使用指南。
