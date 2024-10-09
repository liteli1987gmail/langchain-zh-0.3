---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/qa_citations.ipynb
---
# 如何让 RAG 应用添加引用

本指南回顾了让模型引用其在生成响应时参考的源文档的哪些部分的方法。

我们将涵盖五种方法：

1. 使用工具调用引用文档 ID；
2. 使用工具调用引用文档 ID 并提供文本片段；
3. 直接提示；
4. 检索后处理（即，压缩检索到的上下文以使其更相关）；
5. 生成后处理（即，发出第二个 LLM 调用以用引用注释生成的答案）。

我们通常建议使用适合您用例的列表中的第一个项目。也就是说，如果您的模型支持工具调用，请尝试方法 1 或 2；否则，如果这些方法失败，请继续向下查看列表。

让我们首先创建一个简单的 RAG 链。首先，我们将使用 [WikipediaRetriever](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.wikipedia.WikipediaRetriever.html) 从维基百科检索。

## 设置

首先，我们需要安装一些依赖项并为我们将要使用的模型设置环境变量。


```python
%pip install -qU langchain langchain-openai langchain-anthropic langchain-community wikipedia
```


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass()

# Uncomment if you want to log to LangSmith
# os.environ["LANGCHAIN_TRACING_V2"] = "true
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

让我们首先选择一个大型语言模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
<!--IMPORTS:[{"imported": "WikipediaRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.wikipedia.WikipediaRetriever.html", "title": "How to get a RAG application to add citations"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to get a RAG application to add citations"}]-->
from langchain_community.retrievers import WikipediaRetriever
from langchain_core.prompts import ChatPromptTemplate

system_prompt = (
    "You're a helpful AI assistant. Given a user question "
    "and some Wikipedia article snippets, answer the user "
    "question. If none of the articles answer the question, "
    "just say you don't know."
    "\n\nHere are the Wikipedia articles: "
    "{context}"
)

retriever = WikipediaRetriever(top_k_results=6, doc_content_chars_max=2000)
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)
prompt.pretty_print()
```
```output
================================[1m System Message [0m================================

You're a helpful AI assistant. Given a user question and some Wikipedia article snippets, answer the user question. If none of the articles answer the question, just say you don't know.

Here are the Wikipedia articles: [33;1m[1;3m{context}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```
现在我们已经有了模型、检索器和提示词，让我们将它们全部连接在一起。我们需要添加一些逻辑，将检索到的文档格式化为可以传递给提示词的字符串。按照[添加引用](/docs/how_to/qa_citations)到RAG应用程序的指南，我们将使我们的链返回答案和检索到的文档。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to get a RAG application to add citations"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to get a RAG application to add citations"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to get a RAG application to add citations"}]-->
from typing import List

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


def format_docs(docs: List[Document]):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
    | prompt
    | llm
    | StrOutputParser()
)

retrieve_docs = (lambda x: x["input"]) | retriever

chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})
```


```python
print(result.keys())
```
```output
dict_keys(['input', 'context', 'answer'])
```

```python
print(result["context"][0])
```
```output
page_content='The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in). Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.\nThe cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran. It lives in a variety of habitats such as savannahs in the Serengeti, arid mountain ranges in the Sahara, and hilly desert terrain.\nThe cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk. It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson\'s gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year. After a gestation of nearly three months, females give birth to a litter of three or four cubs. Cheetah cubs are highly vulnerable to predation by other large carnivores. They are weaned a' metadata={'title': 'Cheetah', 'summary': 'The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in). Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.\nThe cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran. It lives in a variety of habitats such as savannahs in the Serengeti, arid mountain ranges in the Sahara, and hilly desert terrain.\nThe cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk. It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson\'s gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year. After a gestation of nearly three months, females give birth to a litter of three or four cubs. Cheetah cubs are highly vulnerable to predation by other large carnivores. They are weaned at around four months and are independent by around 20 months of age.\nThe cheetah is threatened by habitat loss, conflict with humans, poaching and high susceptibility to diseases. In 2016, the global cheetah population was estimated at 7,100 individuals in the wild; it is listed as Vulnerable on the IUCN Red List. It has been widely depicted in art, literature, advertising, and animation. It was tamed in ancient Egypt and trained for hunting ungulates in the Arabian Peninsula and India. It has been kept in zoos since the early 19th century.', 'source': 'https://en.wikipedia.org/wiki/Cheetah'}
```

```python
print(result["answer"])
```
```output
Cheetahs are capable of running at speeds of 93 to 104 km/h (58 to 65 mph). They have evolved specialized adaptations for speed, including a light build, long thin legs, and a long tail.
```
LangSmith 跟踪： https://smith.langchain.com/public/0472c5d1-49dc-4c1c-8100-61910067d7ed/r

## 函数调用

如果您选择的LLM实现了[工具调用](/docs/concepts#functiontool-calling)功能，您可以使用它使模型指定在生成答案时引用的提供文档。LangChain工具调用模型实现了`.with_structured_output`方法，这将强制生成遵循所需模式（例如，参见[这里](https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)）。

### 引用文档

要使用标识符引用文档，我们将标识符格式化到提示词中，然后使用`.with_structured_output`强制LLM在其输出中引用这些标识符。

首先，我们为输出定义一个模式。`.with_structured_output`支持多种格式，包括JSON模式和Pydantic。这里我们将使用Pydantic：


```python
from pydantic import BaseModel, Field


class CitedAnswer(BaseModel):
    """Answer the user question based only on the given sources, and cite the sources used."""

    answer: str = Field(
        ...,
        description="The answer to the user question, which is based only on the given sources.",
    )
    citations: List[int] = Field(
        ...,
        description="The integer IDs of the SPECIFIC sources which justify the answer.",
    )
```

让我们看看当我们传入我们的函数和用户输入时模型的输出是什么样的：


```python
structured_llm = llm.with_structured_output(CitedAnswer)

example_q = """What Brian's height?

Source: 1
Information: Suzy is 6'2"

Source: 2
Information: Jeremiah is blonde

Source: 3
Information: Brian is 3 inches shorter than Suzy"""
result = structured_llm.invoke(example_q)

result
```



```output
CitedAnswer(answer='Brian\'s height is 5\'11".', citations=[1, 3])
```


或者作为一个字典：


```python
result.dict()
```



```output
{'answer': 'Brian\'s height is 5\'11".', 'citations': [1, 3]}
```


现在我们将源标识符结构化到提示中，以便与我们的链进行复制。我们将进行三项更改：

1. 更新提示以包含源标识符；
2. 使用 `structured_llm`（即 `llm.with_structured_output(CitedAnswer)`）；
3. 移除 `StrOutputParser`，以保留输出中的 Pydantic 对象。


```python
def format_docs_with_id(docs: List[Document]) -> str:
    formatted = [
        f"Source ID: {i}\nArticle Title: {doc.metadata['title']}\nArticle Snippet: {doc.page_content}"
        for i, doc in enumerate(docs)
    ]
    return "\n\n" + "\n\n".join(formatted)


rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs_with_id(x["context"])))
    | prompt
    | structured_llm
)

retrieve_docs = (lambda x: x["input"]) | retriever

chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})
```


```python
print(result["answer"])
```
```output
answer='Cheetahs can run at speeds of 93 to 104 km/h (58 to 65 mph). They are known as the fastest land animals.' citations=[0]
```
我们可以检查索引为 0 的文档，模型引用了该文档：


```python
print(result["context"][0])
```
```output
page_content='The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in). Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.\nThe cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran. It lives in a variety of habitats such as savannahs in the Serengeti, arid mountain ranges in the Sahara, and hilly desert terrain.\nThe cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk. It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson\'s gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year. After a gestation of nearly three months, females give birth to a litter of three or four cubs. Cheetah cubs are highly vulnerable to predation by other large carnivores. They are weaned a' metadata={'title': 'Cheetah', 'summary': 'The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in). Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.\nThe cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran. It lives in a variety of habitats such as savannahs in the Serengeti, arid mountain ranges in the Sahara, and hilly desert terrain.\nThe cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk. It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson\'s gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year. After a gestation of nearly three months, females give birth to a litter of three or four cubs. Cheetah cubs are highly vulnerable to predation by other large carnivores. They are weaned at around four months and are independent by around 20 months of age.\nThe cheetah is threatened by habitat loss, conflict with humans, poaching and high susceptibility to diseases. In 2016, the global cheetah population was estimated at 7,100 individuals in the wild; it is listed as Vulnerable on the IUCN Red List. It has been widely depicted in art, literature, advertising, and animation. It was tamed in ancient Egypt and trained for hunting ungulates in the Arabian Peninsula and India. It has been kept in zoos since the early 19th century.', 'source': 'https://en.wikipedia.org/wiki/Cheetah'}
```
LangSmith 跟踪： https://smith.langchain.com/public/aff39dc7-3e09-4d64-8083-87026d975534/r

### 引用片段

为了返回文本片段（也许还包括源标识符），我们可以使用相同的方法。唯一的变化是构建一个更复杂的输出模式，这里使用 Pydantic，包括一个“引用”和一个源标识符。

*附注：请注意，如果我们将文档拆分，使得我们有许多只有一句或两句的文档，而不是几篇长文档，引用文档大致相当于引用片段，并且可能对模型更容易，因为模型只需要返回每个片段的标识符，而不是实际文本。可能值得尝试这两种方法并进行评估。*


```python
class Citation(BaseModel):
    source_id: int = Field(
        ...,
        description="The integer ID of a SPECIFIC source which justifies the answer.",
    )
    quote: str = Field(
        ...,
        description="The VERBATIM quote from the specified source that justifies the answer.",
    )


class QuotedAnswer(BaseModel):
    """Answer the user question based only on the given sources, and cite the sources used."""

    answer: str = Field(
        ...,
        description="The answer to the user question, which is based only on the given sources.",
    )
    citations: List[Citation] = Field(
        ..., description="Citations from the given sources that justify the answer."
    )
```


```python
rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs_with_id(x["context"])))
    | prompt
    | llm.with_structured_output(QuotedAnswer)
)

retrieve_docs = (lambda x: x["input"]) | retriever

chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})
```

在这里我们看到模型从源 0 中提取了一个相关的文本片段：


```python
result["answer"]
```



```output
QuotedAnswer(answer='Cheetahs can run at speeds of 93 to 104 km/h (58 to 65 mph).', citations=[Citation(source_id=0, quote='The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.')])
```


LangSmith 跟踪: https://smith.langchain.com/public/0f638cc9-8409-4a53-9010-86ac28144129/r

## 直接提示

许多模型不支持函数调用。我们可以通过直接提示实现类似的结果。让我们尝试指示模型生成结构化的 XML 作为输出：


```python
xml_system = """You're a helpful AI assistant. Given a user question and some Wikipedia article snippets, \
answer the user question and provide citations. If none of the articles answer the question, just say you don't know.

Remember, you must return both an answer and citations. A citation consists of a VERBATIM quote that \
justifies the answer and the ID of the quote article. Return a citation for every quote across all articles \
that justify the answer. Use the following format for your final output:

<cited_answer>
    <answer></answer>
    <citations>
        <citation><source_id></source_id><quote></quote></citation>
        <citation><source_id></source_id><quote></quote></citation>
        ...
    </citations>
</cited_answer>

Here are the Wikipedia articles:{context}"""
xml_prompt = ChatPromptTemplate.from_messages(
    [("system", xml_system), ("human", "{input}")]
)
```

我们现在对我们的链进行类似的小更新：

1. 我们更新格式化函数以将检索到的上下文包裹在 XML 标签中；
2. 我们不使用 `.with_structured_output`（例如，因为模型不存在该功能）；
3. 我们使用 [XMLOutputParser](https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html) 代替 `StrOutputParser` 将答案解析为字典。


```python
<!--IMPORTS:[{"imported": "XMLOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.xml.XMLOutputParser.html", "title": "How to get a RAG application to add citations"}]-->
from langchain_core.output_parsers import XMLOutputParser


def format_docs_xml(docs: List[Document]) -> str:
    formatted = []
    for i, doc in enumerate(docs):
        doc_str = f"""\
    <source id=\"{i}\">
        <title>{doc.metadata['title']}</title>
        <article_snippet>{doc.page_content}</article_snippet>
    </source>"""
        formatted.append(doc_str)
    return "\n\n<sources>" + "\n".join(formatted) + "</sources>"


rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs_xml(x["context"])))
    | xml_prompt
    | llm
    | XMLOutputParser()
)

retrieve_docs = (lambda x: x["input"]) | retriever

chain = RunnablePassthrough.assign(context=retrieve_docs).assign(
    answer=rag_chain_from_docs
)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})
```

请注意，引用再次被结构化到答案中：


```python
result["answer"]
```



```output
{'cited_answer': [{'answer': 'Cheetahs are capable of running at 93 to 104 km/h (58 to 65 mph).'},
  {'citations': [{'citation': [{'source_id': '0'},
      {'quote': 'The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.'}]}]}]}
```


LangSmith 跟踪: https://smith.langchain.com/public/a3636c70-39c6-4c8f-bc83-1c7a174c237e/r

## 检索后处理

另一种方法是对我们检索到的文档进行后处理，以压缩内容，使源内容已经足够简洁，以至于我们不需要模型引用特定的来源或范围。例如，我们可以将每个文档分解为一两句话，嵌入这些内容并仅保留最相关的部分。LangChain 有一些内置组件可以实现这一点。在这里，我们将使用一个 [RecursiveCharacterTextSplitter](https://python.langchain.com/api_reference/text_splitters/text_splitter/langchain_text_splitters.RecursiveCharacterTextSplitter.html#langchain_text_splitters.RecursiveCharacterTextSplitter)，它通过在分隔子字符串上进行分割来创建指定大小的块，以及一个 [EmbeddingsFilter](https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.embeddings_filter.EmbeddingsFilter.html#langchain.retrievers.document_compressors.embeddings_filter.EmbeddingsFilter)，它仅保留具有最相关嵌入的文本。

这种方法有效地用一个更新的检索器替换了我们原来的检索器，该检索器压缩了文档。首先，我们构建检索器：


```python
<!--IMPORTS:[{"imported": "EmbeddingsFilter", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.embeddings_filter.EmbeddingsFilter.html", "title": "How to get a RAG application to add citations"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to get a RAG application to add citations"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to get a RAG application to add citations"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to get a RAG application to add citations"}]-->
from langchain.retrievers.document_compressors import EmbeddingsFilter
from langchain_core.runnables import RunnableParallel
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=0,
    separators=["\n\n", "\n", ".", " "],
    keep_separator=False,
)
compressor = EmbeddingsFilter(embeddings=OpenAIEmbeddings(), k=10)


def split_and_filter(input) -> List[Document]:
    docs = input["docs"]
    question = input["question"]
    split_docs = splitter.split_documents(docs)
    stateful_docs = compressor.compress_documents(split_docs, question)
    return [stateful_doc for stateful_doc in stateful_docs]


new_retriever = (
    RunnableParallel(question=RunnablePassthrough(), docs=retriever) | split_and_filter
)
docs = new_retriever.invoke("How fast are cheetahs?")
for doc in docs:
    print(doc.page_content)
    print("\n\n")
```
```output
Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail



The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in)



2 mph), or 171 body lengths per second. The cheetah, the fastest land mammal, scores at only 16 body lengths per second, while Anna's hummingbird has the highest known length-specific velocity attained by any vertebrate



It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson's gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year



The cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran



The cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk



The Southeast African cheetah (Acinonyx jubatus jubatus) is the nominate cheetah subspecies native to East and Southern Africa. The Southern African cheetah lives mainly in the lowland areas and deserts of the Kalahari, the savannahs of Okavango Delta, and the grasslands of the Transvaal region in South Africa. In Namibia, cheetahs are mostly found in farmlands



Subpopulations have been called "South African cheetah" and "Namibian cheetah."



In India, four cheetahs of the subspecies are living in Kuno National Park in Madhya Pradesh after having been introduced there



Acinonyx jubatus velox proposed in 1913 by Edmund Heller on basis of a cheetah that was shot by Kermit Roosevelt in June 1909 in the Kenyan highlands.
Acinonyx rex proposed in 1927 by Reginald Innes Pocock on basis of a specimen from the Umvukwe Range in Rhodesia.
```
接下来，我们将其组装到我们的链中，如之前所示：


```python
rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
    | prompt
    | llm
    | StrOutputParser()
)

chain = RunnablePassthrough.assign(
    context=(lambda x: x["input"]) | new_retriever
).assign(answer=rag_chain_from_docs)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})

print(result["answer"])
```
```output
Cheetahs are capable of running at speeds between 93 to 104 km/h (58 to 65 mph), making them the fastest land animals.
```
请注意，文档内容现在已被压缩，尽管文档对象在其元数据中保留了原始内容的“摘要”键。这些摘要不会传递给模型；只有压缩后的内容会传递。


```python
result["context"][0].page_content  # passed to model
```



```output
'Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail'
```



```python
result["context"][0].metadata["summary"]  # original document
```



```output
'The cheetah (Acinonyx jubatus) is a large cat and the fastest land animal. It has a tawny to creamy white or pale buff fur that is marked with evenly spaced, solid black spots. The head is small and rounded, with a short snout and black tear-like facial streaks. It reaches 67–94 cm (26–37 in) at the shoulder, and the head-and-body length is between 1.1 and 1.5 m (3 ft 7 in and 4 ft 11 in). Adults weigh between 21 and 72 kg (46 and 159 lb). The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.\nThe cheetah was first described in the late 18th century. Four subspecies are recognised today that are native to Africa and central Iran. An African subspecies was introduced to India in 2022. It is now distributed mainly in small, fragmented populations in northwestern, eastern and southern Africa and central Iran. It lives in a variety of habitats such as savannahs in the Serengeti, arid mountain ranges in the Sahara, and hilly desert terrain.\nThe cheetah lives in three main social groups: females and their cubs, male "coalitions", and solitary males. While females lead a nomadic life searching for prey in large home ranges, males are more sedentary and instead establish much smaller territories in areas with plentiful prey and access to females. The cheetah is active during the day, with peaks during dawn and dusk. It feeds on small- to medium-sized prey, mostly weighing under 40 kg (88 lb), and prefers medium-sized ungulates such as impala, springbok and Thomson\'s gazelles. The cheetah typically stalks its prey within 60–100 m (200–330 ft) before charging towards it, trips it during the chase and bites its throat to suffocate it to death. It breeds throughout the year. After a gestation of nearly three months, females give birth to a litter of three or four cubs. Cheetah cubs are highly vulnerable to predation by other large carnivores. They are weaned at around four months and are independent by around 20 months of age.\nThe cheetah is threatened by habitat loss, conflict with humans, poaching and high susceptibility to diseases. In 2016, the global cheetah population was estimated at 7,100 individuals in the wild; it is listed as Vulnerable on the IUCN Red List. It has been widely depicted in art, literature, advertising, and animation. It was tamed in ancient Egypt and trained for hunting ungulates in the Arabian Peninsula and India. It has been kept in zoos since the early 19th century.'
```


LangSmith 跟踪： https://smith.langchain.com/public/a61304fa-e5a5-4c64-a268-b0aef1130d53/r

## 生成后处理

另一种方法是对我们的模型生成进行后处理。在这个例子中，我们将首先生成一个答案，然后要求模型用引用来注释它自己的答案。这种方法的缺点当然是它更慢且更昂贵，因为需要进行两次模型调用。

让我们将其应用于我们的初始链。


```python
class Citation(BaseModel):
    source_id: int = Field(
        ...,
        description="The integer ID of a SPECIFIC source which justifies the answer.",
    )
    quote: str = Field(
        ...,
        description="The VERBATIM quote from the specified source that justifies the answer.",
    )


class AnnotatedAnswer(BaseModel):
    """Annotate the answer to the user question with quote citations that justify the answer."""

    citations: List[Citation] = Field(
        ..., description="Citations from the given sources that justify the answer."
    )


structured_llm = llm.with_structured_output(AnnotatedAnswer)
```


```python
<!--IMPORTS:[{"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to get a RAG application to add citations"}]-->
from langchain_core.prompts import MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{question}"),
        MessagesPlaceholder("chat_history", optional=True),
    ]
)
answer = prompt | llm
annotation_chain = prompt | structured_llm

chain = (
    RunnableParallel(
        question=RunnablePassthrough(), docs=(lambda x: x["input"]) | retriever
    )
    .assign(context=format)
    .assign(ai_message=answer)
    .assign(
        chat_history=(lambda x: [x["ai_message"]]),
        answer=(lambda x: x["ai_message"].content),
    )
    .assign(annotations=annotation_chain)
    .pick(["answer", "docs", "annotations"])
)
```


```python
result = chain.invoke({"input": "How fast are cheetahs?"})
```


```python
print(result["answer"])
```
```output
Cheetahs are capable of running at speeds between 93 to 104 km/h (58 to 65 mph). Their specialized adaptations for speed, such as a light build, long thin legs, and a long tail, allow them to be the fastest land animals.
```

```python
result["annotations"]
```



```output
AnnotatedAnswer(citations=[Citation(source_id=0, quote='The cheetah is capable of running at 93 to 104 km/h (58 to 65 mph); it has evolved specialized adaptations for speed, including a light build, long thin legs and a long tail.')])
```


LangSmith 跟踪： https://smith.langchain.com/public/bf5e8856-193b-4ff2-af8d-c0f4fbd1d9cb/r
