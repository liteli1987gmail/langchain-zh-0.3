---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/stuff_docs_chain.ipynb
---
# 从 StuffDocumentsChain 迁移

[StuffDocumentsChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html) 通过将文档连接成一个单一的上下文窗口来组合文档。这是一种简单有效的策略，用于问题回答、摘要和其他目的。

[create_stuff_documents_chain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html) 是推荐的替代方案。它的功能与 `StuffDocumentsChain` 相同，但对流式处理和批量功能的支持更好。由于它是 [LCEL 原语](/docs/concepts/#langchain-expression-language-lcel) 的简单组合，因此更容易扩展并融入其他 LangChain 应用程序。

下面我们将通过一个简单的示例来介绍 `StuffDocumentsChain` 和 `create_stuff_documents_chain`。

让我们首先加载一个聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />

## 示例

让我们通过一个示例来分析一组文档。我们首先生成一些简单的文档以作说明：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Migrating from StuffDocumentsChain"}]-->
from langchain_core.documents import Document

documents = [
    Document(page_content="Apples are red", metadata={"title": "apple_book"}),
    Document(page_content="Blueberries are blue", metadata={"title": "blueberry_book"}),
    Document(page_content="Bananas are yelow", metadata={"title": "banana_book"}),
]
```

### 旧版

<details open>

下面我们展示了一个使用 `StuffDocumentsChain` 的实现。我们为摘要任务定义了提示词模板，并为此目的实例化了一个 [LLMChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html) 对象。我们定义了文档如何格式化为提示，并确保各种提示中的键保持一致。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating from StuffDocumentsChain"}, {"imported": "StuffDocumentsChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html", "title": "Migrating from StuffDocumentsChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from StuffDocumentsChain"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Migrating from StuffDocumentsChain"}]-->
from langchain.chains import LLMChain, StuffDocumentsChain
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

# This controls how each document will be formatted. Specifically,
# it will be passed to `format_document` - see that function for more
# details.
document_prompt = PromptTemplate(
    input_variables=["page_content"], template="{page_content}"
)
document_variable_name = "context"
# The prompt here should take as an input variable the
# `document_variable_name`
prompt = ChatPromptTemplate.from_template("Summarize this content: {context}")

llm_chain = LLMChain(llm=llm, prompt=prompt)
chain = StuffDocumentsChain(
    llm_chain=llm_chain,
    document_prompt=document_prompt,
    document_variable_name=document_variable_name,
)
```

我们现在可以调用我们的链：


```python
result = chain.invoke(documents)
result["output_text"]
```



```output
'This content describes the colors of different fruits: apples are red, blueberries are blue, and bananas are yellow.'
```



```python
for chunk in chain.stream(documents):
    print(chunk)
```
```output
{'input_documents': [Document(metadata={'title': 'apple_book'}, page_content='Apples are red'), Document(metadata={'title': 'blueberry_book'}, page_content='Blueberries are blue'), Document(metadata={'title': 'banana_book'}, page_content='Bananas are yelow')], 'output_text': 'This content describes the colors of different fruits: apples are red, blueberries are blue, and bananas are yellow.'}
```
</details>

### LCEL

<details open>

下面我们展示了一个使用 `create_stuff_documents_chain` 的实现：


```python
<!--IMPORTS:[{"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Migrating from StuffDocumentsChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from StuffDocumentsChain"}]-->
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Summarize this content: {context}")
chain = create_stuff_documents_chain(llm, prompt)
```

调用链后，我们获得了与之前类似的结果：


```python
result = chain.invoke({"context": documents})
result
```



```output
'This content describes the colors of different fruits: apples are red, blueberries are blue, and bananas are yellow.'
```


请注意，此实现支持输出令牌的流式处理：


```python
for chunk in chain.stream({"context": documents}):
    print(chunk, end=" | ")
```
```output
 | This |  content |  describes |  the |  colors |  of |  different |  fruits | : |  apples |  are |  red | , |  blue | berries |  are |  blue | , |  and |  bananas |  are |  yellow | . |  |
```
</details>

## 下一步

查看 [LCEL 概念文档](/docs/concepts/#langchain-expression-language-lcel) 以获取更多背景信息。

查看这些 [操作指南](/docs/how_to/#qa-with-rag) 以获取有关使用 RAG 进行问答任务的更多信息。

请查看[这个教程](/docs/tutorials/summarization/)以获取更多基于大型语言模型的摘要策略。
