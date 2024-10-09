---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/arxiv.ipynb
sidebar_label: Arxiv
---
# ArxivRetriever

>[arXiv](https://arxiv.org/) 是一个开放获取的档案库，包含200万篇学术文章，涵盖物理学、数学、计算机科学、定量生物学、定量金融、统计学、电气工程与系统科学以及经济学等领域。

本笔记本展示了如何将来自 Arxiv.org 的科学文章检索到下游使用的 [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 格式中。

有关所有 `ArxivRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.arxiv.ArxivRetriever.html)。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="external_retrievers" item="ArxivRetriever" />

## 设置

如果您希望从单个查询中获得自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

这个检索器位于 `LangChain 社区` 包中。我们还需要 [arxiv](https://pypi.org/project/arxiv/) 依赖：


```python
%pip install -qU langchain-community arxiv
```

## 实例化

`ArxivRetriever` 参数包括：
- 可选的 `load_max_docs`：默认值=100。用于限制下载文档的数量。下载所有100个文档需要时间，因此在实验中使用较小的数字。目前有300的硬限制。
- 可选的 `load_all_available_meta`：默认值=False。默认情况下，仅下载最重要的字段：`Published`（文档发布/最后更新的日期）、`Title`、`Authors`、`Summary`。如果为True，则还会下载其他字段。
- `get_full_documents`：布尔值，默认值为False。决定是否获取文档的完整文本。

有关更多详细信息，请参见 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.arxiv.ArxivRetriever.html)。


```python
<!--IMPORTS:[{"imported": "ArxivRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.arxiv.ArxivRetriever.html", "title": "ArxivRetriever"}]-->
from langchain_community.retrievers import ArxivRetriever

retriever = ArxivRetriever(
    load_max_docs=2,
    get_ful_documents=True,
)
```

## 用法

`ArxivRetriever` 支持通过文章标识符进行检索：


```python
docs = retriever.invoke("1605.08386")
```


```python
docs[0].metadata  # meta-information of the Document
```



```output
{'Entry ID': 'http://arxiv.org/abs/1605.08386v1',
 'Published': datetime.date(2016, 5, 26),
 'Title': 'Heat-bath random walks with Markov bases',
 'Authors': 'Caprice Stanley, Tobias Windisch'}
```



```python
docs[0].page_content[:400]  # a content of the Document
```



```output
'Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a ge'
```


`ArxivRetriever` 还支持基于自然语言文本的检索：


```python
docs = retriever.invoke("What is the ImageBind model?")
```


```python
docs[0].metadata
```



```output
{'Entry ID': 'http://arxiv.org/abs/2305.05665v2',
 'Published': datetime.date(2023, 5, 31),
 'Title': 'ImageBind: One Embedding Space To Bind Them All',
 'Authors': 'Rohit Girdhar, Alaaeldin El-Nouby, Zhuang Liu, Mannat Singh, Kalyan Vasudev Alwala, Armand Joulin, Ishan Misra'}
```


## 在链中使用

与其他检索器一样，`ArxivRetriever` 可以通过 [链](/docs/how_to/sequence/) 集成到大型语言模型应用中。

我们需要一个大型语言模型或聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "ArxivRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ArxivRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "ArxivRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
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
chain.invoke("What is the ImageBind model?")
```



```output
'The ImageBind model is an approach to learn a joint embedding across six different modalities - images, text, audio, depth, thermal, and IMU data. It shows that only image-paired data is sufficient to bind the modalities together and can leverage large scale vision-language models for zero-shot capabilities and emergent applications such as cross-modal retrieval, composing modalities with arithmetic, cross-modal detection and generation.'
```


## API 参考

有关所有 `ArxivRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.arxiv.ArxivRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
