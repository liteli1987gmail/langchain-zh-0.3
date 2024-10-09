---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/wikipedia.ipynb
sidebar_label: Wikipedia
---
# WikipediaRetriever

## 概述
>[维基百科](https://wikipedia.org/) 是一个由志愿者社区（称为维基人）编写和维护的多语言免费在线百科全书，通过开放协作和使用名为MediaWiki的基于维基的编辑系统。`维基百科` 是历史上最大和阅读量最多的参考书籍。

本笔记本展示了如何将来自`wikipedia.org`的维基页面检索到下游使用的[文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html)格式中。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="external_retrievers" item="WikipediaRetriever" />

## 设置
如果您想从单个工具的运行中获取自动跟踪，您还可以通过取消下面的注释来设置您的[LangSmith](https://docs.smith.langchain.com/) API密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

集成位于 `langchain-community` 包中。我们还需要安装 `wikipedia` python 包。


```python
%pip install -qU langchain_community wikipedia
```

## 实例化

现在我们可以实例化我们的检索器：

`WikipediaRetriever` 参数包括：
- 可选 `lang`：默认值为 "en"。用于在维基百科的特定语言部分进行搜索
- 可选 `load_max_docs`：默认值为 100。用于限制下载的文档数量。下载所有 100 个文档需要时间，因此在实验中使用较小的数字。目前有 300 的硬限制。
- 可选 `load_all_available_meta`：默认值为 False。默认情况下，仅下载最重要的字段：`Published`（文档发布/最后更新的日期）、`title`、`Summary`。如果为 True，则还会下载其他字段。

`get_relevant_documents()` 有一个参数，`query`：用于在维基百科中查找文档的自由文本


```python
<!--IMPORTS:[{"imported": "WikipediaRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.wikipedia.WikipediaRetriever.html", "title": "WikipediaRetriever"}]-->
from langchain_community.retrievers import WikipediaRetriever

retriever = WikipediaRetriever()
```

## 使用


```python
docs = retriever.invoke("TOKYO GHOUL")
```


```python
print(docs[0].page_content[:400])
```
```output
Tokyo Ghoul (Japanese: 東京喰種（トーキョーグール）, Hepburn: Tōkyō Gūru) is a Japanese dark fantasy manga series written and illustrated by Sui Ishida. It was serialized in Shueisha's seinen manga magazine Weekly Young Jump from September 2011 to September 2014, with its chapters collected in 14 tankōbon volumes. The story is set in an alternate version of Tokyo where humans coexist with ghouls, beings who loo
```
## 在链中使用
与其他检索器一样，`WikipediaRetriever` 可以通过 [链](/docs/how_to/sequence/) 集成到大型语言模型应用中。

我们需要一个大型语言模型或聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "WikipediaRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "WikipediaRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "WikipediaRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

prompt = ChatPromptTemplate.from_template(
    """
    Answer the question based only on the context provided.
    Context: {context}
    Question: {question}
    """
)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke(
    "Who is the main character in `Tokyo Ghoul` and does he transform into a ghoul?"
)
```



```output
'The main character in Tokyo Ghoul is Ken Kaneki, who transforms into a ghoul after receiving an organ transplant from a ghoul named Rize.'
```


## API 参考

有关所有 `WikipediaRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.wikipedia.WikipediaRetriever.html#langchain-community-retrievers-wikipedia-wikipediaretriever)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
