---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/summarize_stuff.ipynb
sidebar_position: 3
keywords: [summarize, summarization, stuff, create_stuff_documents_chain]
---

# 如何在一次 LLM 调用中总结文本

大型语言模型可以从文本中总结和提炼所需的信息，包括大量文本。在许多情况下，特别是对于具有更大上下文窗口的模型，这可以通过一次 LLM 调用充分实现。

LangChain 实现了一个简单的 [预构建链](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html)，该链将提示与所需的上下文“填充”以进行总结和其他目的。在本指南中，我们演示如何使用该链。

## 加载聊天模型

让我们首先加载一个聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
/>


## 加载文档

接下来，我们需要一些文档来进行总结。下面，我们生成一些玩具文档以作说明。请参阅文档加载器的 [使用指南](/docs/how_to/#document-loaders) 和 [集成页面](/docs/integrations/document_loaders/) 以获取其他数据来源。[总结教程](/docs/tutorials/summarization) 还包括一个总结博客文章的示例。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to summarize text in a single LLM call"}]-->
from langchain_core.documents import Document

documents = [
    Document(page_content="Apples are red", metadata={"title": "apple_book"}),
    Document(page_content="Blueberries are blue", metadata={"title": "blueberry_book"}),
    Document(page_content="Bananas are yelow", metadata={"title": "banana_book"}),
]
```

## 加载链

下面，我们定义一个简单的提示，并使用我们的聊天模型和文档实例化链：


```python
<!--IMPORTS:[{"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "How to summarize text in a single LLM call"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to summarize text in a single LLM call"}]-->
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Summarize this content: {context}")
chain = create_stuff_documents_chain(llm, prompt)
```

## 调用链

因为链是一个 [运行接口](/docs/concepts/#runnable-interface)，它实现了通常的调用方法：


```python
result = chain.invoke({"context": documents})
result
```



```output
'The content describes the colors of three fruits: apples are red, blueberries are blue, and bananas are yellow.'
```


### 流式处理

请注意，链还支持单个输出标记的流式处理：


```python
for chunk in chain.stream({"context": documents}):
    print(chunk, end="|")
```
```output
|The| content| describes| the| colors| of| three| fruits|:| apples| are| red|,| blueberries| are| blue|,| and| bananas| are| yellow|.||
```
## 下一步

请参阅摘要 [使用手册](/docs/how_to/#summarization) 以获取额外的摘要策略，包括针对更大文本量设计的策略。

另请参阅 [本教程](/docs/tutorials/summarization) 以获取有关摘要的更多详细信息。
