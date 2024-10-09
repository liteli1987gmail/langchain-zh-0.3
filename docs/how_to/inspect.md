---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/inspect.ipynb
---
# 如何检查可运行项

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [链接可运行项](/docs/how_to/sequence/)

:::

一旦您使用[LangChain表达式](/docs/concepts/#langchain-expression-language)创建了一个可运行项，您可能会想要检查它，以更好地了解发生了什么。此笔记本涵盖了一些执行此操作的方法。

本指南展示了一些您可以以编程方式检查链内部步骤的方法。如果您更感兴趣的是调试链中的问题，请参见[本节](/docs/how_to/debugging)。

首先，让我们创建一个示例链。我们将创建一个进行检索的链：


```python
%pip install -qU langchain langchain-openai faiss-cpu tiktoken
```


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to inspect runnables"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to inspect runnables"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to inspect runnables"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to inspect runnables"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to inspect runnables"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to inspect runnables"}]-->
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

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## 获取图形

您可以使用 `get_graph()` 方法获取可运行的图形表示:


```python
chain.get_graph()
```

## 打印图形

虽然这不是特别清晰，但您可以使用 `print_ascii()` 方法以更易于理解的方式显示该图形:


```python
chain.get_graph().print_ascii()
```
```output
           +---------------------------------+         
           | Parallel<context,question>Input |         
           +---------------------------------+         
                    **               **                
                 ***                   ***             
               **                         **           
+----------------------+              +-------------+  
| VectorStoreRetriever |              | Passthrough |  
+----------------------+              +-------------+  
                    **               **                
                      ***         ***                  
                         **     **                     
           +----------------------------------+        
           | Parallel<context,question>Output |        
           +----------------------------------+        
                             *                         
                             *                         
                             *                         
                  +--------------------+               
                  | ChatPromptTemplate |               
                  +--------------------+               
                             *                         
                             *                         
                             *                         
                      +------------+                   
                      | ChatOpenAI |                   
                      +------------+                   
                             *                         
                             *                         
                             *                         
                   +-----------------+                 
                   | StrOutputParser |                 
                   +-----------------+                 
                             *                         
                             *                         
                             *                         
                +-----------------------+              
                | StrOutputParserOutput |              
                +-----------------------+
```
## 获取提示词

您可能想查看在链中使用的提示词，可以使用 `get_prompts()` 方法:


```python
chain.get_prompts()
```



```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```


## 下一步

您现在已经学习了如何检查您组合的 LCEL 链。

接下来，请查看本节中关于可运行的其他使用手册，或查看与 [调试您的链](/docs/how_to/debugging) 相关的使用手册。
