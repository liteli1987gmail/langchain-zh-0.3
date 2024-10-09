---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/fleet_context.ipynb
---
# Fleet AI 上下文

>[Fleet AI 上下文](https://www.fleet.so/context) 是一个包含1200个最受欢迎和最宽松的Python库及其文档的高质量嵌入数据集。
>
> `Fleet AI`团队的使命是嵌入世界上最重要的数据。他们首先嵌入了1200个Python库，以便利用最新知识进行代码生成。他们很友好地分享了[LangChain文档](/docs/introduction)和[API参考](https://api.python.langchain.com/en/latest/api_reference.html)的嵌入。

让我们看看如何使用这些嵌入来驱动文档检索系统，并最终形成一个简单的代码生成链！


```python
%pip install --upgrade --quiet  langchain fleet-context langchain-openai pandas faiss-cpu # faiss-gpu for CUDA supported GPU
```


```python
<!--IMPORTS:[{"imported": "MultiVectorRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_vector.MultiVectorRetriever.html", "title": "Fleet AI Context"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Fleet AI Context"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Fleet AI Context"}, {"imported": "BaseStore", "source": "langchain_core.stores", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.BaseStore.html", "title": "Fleet AI Context"}, {"imported": "VectorStore", "source": "langchain_core.vectorstores", "docs": "https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.base.VectorStore.html", "title": "Fleet AI Context"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Fleet AI Context"}]-->
from operator import itemgetter
from typing import Any, Optional, Type

import pandas as pd
from langchain.retrievers import MultiVectorRetriever
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.stores import BaseStore
from langchain_core.vectorstores import VectorStore
from langchain_openai import OpenAIEmbeddings


def load_fleet_retriever(
    df: pd.DataFrame,
    *,
    vectorstore_cls: Type[VectorStore] = FAISS,
    docstore: Optional[BaseStore] = None,
    **kwargs: Any,
):
    vectorstore = _populate_vectorstore(df, vectorstore_cls)
    if docstore is None:
        return vectorstore.as_retriever(**kwargs)
    else:
        _populate_docstore(df, docstore)
        return MultiVectorRetriever(
            vectorstore=vectorstore, docstore=docstore, id_key="parent", **kwargs
        )


def _populate_vectorstore(
    df: pd.DataFrame,
    vectorstore_cls: Type[VectorStore],
) -> VectorStore:
    if not hasattr(vectorstore_cls, "from_embeddings"):
        raise ValueError(
            f"Incompatible vector store class {vectorstore_cls}."
            "Must implement `from_embeddings` class method."
        )
    texts_embeddings = []
    metadatas = []
    for _, row in df.iterrows():
        texts_embeddings.append((row.metadata["text"], row["dense_embeddings"]))
        metadatas.append(row.metadata)
    return vectorstore_cls.from_embeddings(
        texts_embeddings,
        OpenAIEmbeddings(model="text-embedding-ada-002"),
        metadatas=metadatas,
    )


def _populate_docstore(df: pd.DataFrame, docstore: BaseStore) -> None:
    parent_docs = []
    df = df.copy()
    df["parent"] = df.metadata.apply(itemgetter("parent"))
    for parent_id, group in df.groupby("parent"):
        sorted_group = group.iloc[
            group.metadata.apply(itemgetter("section_index")).argsort()
        ]
        text = "".join(sorted_group.metadata.apply(itemgetter("text")))
        metadata = {
            k: sorted_group.iloc[0].metadata[k] for k in ("title", "type", "url")
        }
        text = metadata["title"] + "\n" + text
        metadata["id"] = parent_id
        parent_docs.append(Document(page_content=text, metadata=metadata))
    docstore.mset(((d.metadata["id"], d) for d in parent_docs))
```

## 检索器块

作为嵌入过程的一部分，Fleet AI团队首先对长文档进行分块，然后再进行嵌入。这意味着向量对应于LangChain文档中的页面部分，而不是整个页面。默认情况下，当我们从这些嵌入中启动检索器时，我们将检索这些嵌入块。

我们将使用Fleet Context的`download_embeddings()`来获取LangChain的文档嵌入。您可以在https://fleet.so/context查看所有支持的库的文档。


```python
from context import download_embeddings

df = download_embeddings("langchain")
vecstore_retriever = load_fleet_retriever(df)
```


```python
vecstore_retriever.invoke("How does the multi vector retriever work")
```

## 其他包

您可以从[这个Dropbox链接](https://www.dropbox.com/scl/fo/54t2e7fogtixo58pnlyub/h?rlkey=tne16wkssgf01jor0p1iqg6p9&dl=0)下载并使用其他嵌入。

## 检索父文档

Fleet AI提供的嵌入包含元数据，指示哪些嵌入块对应于同一原始文档页面。如果我们愿意，可以使用这些信息来检索整个父文档，而不仅仅是嵌入块。在底层，我们将使用MultiVectorRetriever和BaseStore对象来搜索相关块，然后将它们映射到其父文档。


```python
<!--IMPORTS:[{"imported": "InMemoryStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryStore.html", "title": "Fleet AI Context"}]-->
from langchain.storage import InMemoryStore

parent_retriever = load_fleet_retriever(
    "https://www.dropbox.com/scl/fi/4rescpkrg9970s3huz47l/libraries_langchain_release.parquet?rlkey=283knw4wamezfwiidgpgptkep&dl=1",
    docstore=InMemoryStore(),
)
```


```python
parent_retriever.invoke("How does the multi vector retriever work")
```

## 将其放入链中

让我们尝试在一个简单的链中使用我们的检索系统！


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Fleet AI Context"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Fleet AI Context"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Fleet AI Context"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Fleet AI Context"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a great software engineer who is very familiar \
with Python. Given a user question or request about a new Python library called LangChain and \
parts of the LangChain documentation, answer the question or generate the requested code. \
Your answers must be accurate, should include code whenever possible, and should assume anything \
about LangChain which is note explicitly stated in the LangChain documentation. If the required \
information is not available, just say so.

LangChain Documentation
------------------

{context}""",
        ),
        ("human", "{question}"),
    ]
)

model = ChatOpenAI(model="gpt-3.5-turbo-16k")

chain = (
    {
        "question": RunnablePassthrough(),
        "context": parent_retriever
        | (lambda docs: "\n\n".join(d.page_content for d in docs)),
    }
    | prompt
    | model
    | StrOutputParser()
)
```


```python
for chunk in chain.invoke(
    "How do I create a FAISS vector store retriever that returns 10 documents per search query"
):
    print(chunk, end="", flush=True)
```


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
