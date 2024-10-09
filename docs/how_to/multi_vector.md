---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/multi_vector.ipynb
---
# 如何使用每个文档的多个向量进行检索

通常，将每个文档存储多个向量是非常有用的。这在多个用例中是有益的。例如，我们可以嵌入文档的多个块，并将这些嵌入与父文档关联，从而允许对块的检索命中返回更大的文档。

LangChain 实现了一个基础的 [MultiVectorRetriever](https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_vector.MultiVectorRetriever.html)，简化了这个过程。大部分复杂性在于如何为每个文档创建多个向量。这个笔记本涵盖了一些创建这些向量的常见方法以及如何使用 `MultiVectorRetriever`。

为每个文档创建多个向量的方法包括：

- 较小的块：将文档拆分为较小的块，并嵌入这些块（这就是 [ParentDocumentRetriever](https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.parent_document_retriever.ParentDocumentRetriever.html)）。
- 摘要：为每个文档创建摘要，将其与文档一起嵌入（或替代文档）。
- 假设性问题：创建每个文档适合回答的假设性问题，将这些问题与文档一起嵌入（或替代文档）。

请注意，这也启用了另一种添加嵌入的方法 - 手动添加。这是有用的，因为您可以明确添加应该导致文档被检索的问题或查询，从而给予您更多的控制权。

下面我们将通过一个示例进行演示。首先，我们实例化一些文档。我们将在一个（内存中的）[Chroma](/docs/integrations/providers/chroma/) 向量存储中使用 [OpenAI](https://python.langchain.com/docs/integrations/text_embedding/openai/) 嵌入对它们进行索引，但任何 LangChain 向量存储或嵌入模型都可以满足要求。


```python
%pip install --upgrade --quiet  langchain-chroma langchain langchain-openai > /dev/null
```


```python
<!--IMPORTS:[{"imported": "InMemoryByteStore", "source": "langchain.storage", "docs": "https://python.langchain.com/api_reference/core/stores/langchain_core.stores.InMemoryByteStore.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to retrieve using multiple vectors per document"}]-->
from langchain.storage import InMemoryByteStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

loaders = [
    TextLoader("paul_graham_essay.txt"),
    TextLoader("state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000)
docs = text_splitter.split_documents(docs)

# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
```

## 更小的块

通常情况下，检索较大信息块是有用的，但嵌入较小的块。这允许嵌入尽可能准确地捕捉语义含义，同时将尽可能多的上下文传递给下游。请注意，这正是[ParentDocumentRetriever](https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.parent_document_retriever.ParentDocumentRetriever.html)所做的。在这里，我们展示了其背后的工作原理。

我们将区分向量存储，它索引（子）文档的嵌入，以及文档存储，它存放“父”文档并将其与标识符关联。


```python
<!--IMPORTS:[{"imported": "MultiVectorRetriever", "source": "langchain.retrievers.multi_vector", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_vector.MultiVectorRetriever.html", "title": "How to retrieve using multiple vectors per document"}]-->
import uuid

from langchain.retrievers.multi_vector import MultiVectorRetriever

# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"

# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)

doc_ids = [str(uuid.uuid4()) for _ in docs]
```

接下来，我们通过拆分原始文档生成“子”文档。请注意，我们将文档标识符存储在相应[Document](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html)对象的`metadata`中。


```python
# The splitter to use to create smaller chunks
child_text_splitter = RecursiveCharacterTextSplitter(chunk_size=400)

sub_docs = []
for i, doc in enumerate(docs):
    _id = doc_ids[i]
    _sub_docs = child_text_splitter.split_documents([doc])
    for _doc in _sub_docs:
        _doc.metadata[id_key] = _id
    sub_docs.extend(_sub_docs)
```

最后，我们在向量存储和文档存储中索引文档：


```python
retriever.vectorstore.add_documents(sub_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

仅向量存储将检索小块：


```python
retriever.vectorstore.similarity_search("justice breyer")[0]
```



```output
Document(page_content='Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.', metadata={'doc_id': '064eca46-a4c4-4789-8e3b-583f9597e54f', 'source': 'state_of_the_union.txt'})
```


而检索器将返回较大的父文档：


```python
len(retriever.invoke("justice breyer")[0].page_content)
```



```output
9875
```


检索器在向量数据库上执行的默认搜索类型是相似性搜索。LangChain向量存储还支持通过[Max Marginal Relevance](https://python.langchain.com/api_reference/core/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.max_marginal_relevance_search)进行搜索。这可以通过检索器的`search_type`参数进行控制：


```python
<!--IMPORTS:[{"imported": "SearchType", "source": "langchain.retrievers.multi_vector", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_vector.SearchType.html", "title": "How to retrieve using multiple vectors per document"}]-->
from langchain.retrievers.multi_vector import SearchType

retriever.search_type = SearchType.mmr

len(retriever.invoke("justice breyer")[0].page_content)
```



```output
9875
```


## 将摘要与文档关联以进行检索

摘要可能能够更准确地提炼出一个块的内容，从而导致更好的检索。在这里，我们展示如何创建摘要，然后嵌入这些摘要。

我们构建一个简单的 [链](/docs/how_to/sequence)，它将接收一个输入 [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 对象，并使用大型语言模型生成摘要。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to retrieve using multiple vectors per document"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to retrieve using multiple vectors per document"}]-->
import uuid

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

chain = (
    {"doc": lambda x: x.page_content}
    | ChatPromptTemplate.from_template("Summarize the following document:\n\n{doc}")
    | llm
    | StrOutputParser()
)
```

请注意，我们可以对文档进行 [批处理](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable)：


```python
summaries = chain.batch(docs, {"max_concurrency": 5})
```

然后我们可以像之前一样初始化一个 `MultiVectorRetriever`，在我们的向量存储中索引摘要，并在我们的文档存储中保留原始文档：


```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="summaries", embedding_function=OpenAIEmbeddings())
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]

summary_docs = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(summaries)
]

retriever.vectorstore.add_documents(summary_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```


```python
# # We can also add the original chunks to the vectorstore if we so want
# for i, doc in enumerate(docs):
#     doc.metadata[id_key] = doc_ids[i]
# retriever.vectorstore.add_documents(docs)
```

查询向量存储将返回摘要：


```python
sub_docs = retriever.vectorstore.similarity_search("justice breyer")

sub_docs[0]
```



```output
Document(page_content="President Biden recently nominated Judge Ketanji Brown Jackson to serve on the United States Supreme Court, emphasizing her qualifications and broad support. The President also outlined a plan to secure the border, fix the immigration system, protect women's rights, support LGBTQ+ Americans, and advance mental health services. He highlighted the importance of bipartisan unity in passing legislation, such as the Violence Against Women Act. The President also addressed supporting veterans, particularly those impacted by exposure to burn pits, and announced plans to expand benefits for veterans with respiratory cancers. Additionally, he proposed a plan to end cancer as we know it through the Cancer Moonshot initiative. President Biden expressed optimism about the future of America and emphasized the strength of the American people in overcoming challenges.", metadata={'doc_id': '84015b1b-980e-400a-94d8-cf95d7e079bd'})
```


而检索器将返回更大的源文档：


```python
retrieved_docs = retriever.invoke("justice breyer")

len(retrieved_docs[0].page_content)
```



```output
9194
```


## 假设查询

大型语言模型还可以用于生成一系列假设性问题，这些问题可以针对特定文档提出，可能与 [RAG](/docs/tutorials/rag) 应用中的相关查询具有密切的语义相似性。这些问题可以嵌入并与文档关联，以改善检索。

下面，我们使用 [with_structured_output](/docs/how_to/structured_output/) 方法将大型语言模型的输出结构化为字符串列表。


```python
from typing import List

from pydantic import BaseModel, Field


class HypotheticalQuestions(BaseModel):
    """Generate hypothetical questions."""

    questions: List[str] = Field(..., description="List of questions")


chain = (
    {"doc": lambda x: x.page_content}
    # Only asking for 3 hypothetical questions, but this could be adjusted
    | ChatPromptTemplate.from_template(
        "Generate a list of exactly 3 hypothetical questions that the below document could be used to answer:\n\n{doc}"
    )
    | ChatOpenAI(max_retries=0, model="gpt-4o").with_structured_output(
        HypotheticalQuestions
    )
    | (lambda x: x.questions)
)
```

在单个文档上调用链演示了它输出一个问题列表：


```python
chain.invoke(docs[0])
```



```output
["What impact did the IBM 1401 have on the author's early programming experiences?",
 "How did the transition from using the IBM 1401 to microcomputers influence the author's programming journey?",
 "What role did Lisp play in shaping the author's understanding and approach to AI?"]
```


然后我们可以对所有文档进行批处理，并像之前一样组装我们的向量存储和文档存储：


```python
# Batch chain over documents to generate hypothetical questions
hypothetical_questions = chain.batch(docs, {"max_concurrency": 5})


# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="hypo-questions", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]


# Generate Document objects from hypothetical questions
question_docs = []
for i, question_list in enumerate(hypothetical_questions):
    question_docs.extend(
        [Document(page_content=s, metadata={id_key: doc_ids[i]}) for s in question_list]
    )


retriever.vectorstore.add_documents(question_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

请注意，查询底层向量存储将检索与输入查询在语义上相似的假设问题：


```python
sub_docs = retriever.vectorstore.similarity_search("justice breyer")

sub_docs
```



```output
[Document(page_content='What might be the potential benefits of nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to the United States Supreme Court?', metadata={'doc_id': '43292b74-d1b8-4200-8a8b-ea0cb57fbcdb'}),
 Document(page_content='How might the Bipartisan Infrastructure Law impact the economic competition between the U.S. and China?', metadata={'doc_id': '66174780-d00c-4166-9791-f0069846e734'}),
 Document(page_content='What factors led to the creation of Y Combinator?', metadata={'doc_id': '72003c4e-4cc9-4f09-a787-0b541a65b38c'}),
 Document(page_content='How did the ability to publish essays online change the landscape for writers and thinkers?', metadata={'doc_id': 'e8d2c648-f245-4bcc-b8d3-14e64a164b64'})]
```


调用检索器将返回相应的文档：


```python
retrieved_docs = retriever.invoke("justice breyer")
len(retrieved_docs[0].page_content)
```



```output
9194
```

