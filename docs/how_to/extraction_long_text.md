---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/extraction_long_text.ipynb
---
# 如何处理长文本以进行提取

在处理文件时，例如PDF，您可能会遇到超出语言模型上下文窗口的文本。要处理这些文本，请考虑以下策略：

1. **更换大型语言模型** 选择一个支持更大上下文窗口的不同大型语言模型。
2. **暴力法** 将文档分块，并从每个块中提取内容。
3. **检索增强生成** 将文档分块，索引这些块，并仅从看起来“相关”的子集块中提取内容。

请记住，这些策略有不同的权衡，最佳策略可能取决于您正在设计的应用程序！

本指南演示了如何实现策略2和3。

## 设置

首先，我们将安装本指南所需的依赖项：


```python
%pip install -qU langchain-community lxml faiss-cpu langchain-openai
```
```output
Note: you may need to restart the kernel to use updated packages.
```
现在我们需要一些示例数据！让我们下载一篇关于[汽车的维基百科文章](https://en.wikipedia.org/wiki/Car)并将其加载为LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html)。


```python
<!--IMPORTS:[{"imported": "BSHTMLLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html", "title": "How to handle long text when doing extraction"}]-->
import re

import requests
from langchain_community.document_loaders import BSHTMLLoader

# Download the content
response = requests.get("https://en.wikipedia.org/wiki/Car")
# Write it to a file
with open("car.html", "w", encoding="utf-8") as f:
    f.write(response.text)
# Load it with an HTML parser
loader = BSHTMLLoader("car.html")
document = loader.load()[0]
# Clean up code
# Replace consecutive new lines with a single new line
document.page_content = re.sub("\n\n+", "\n", document.page_content)
```


```python
print(len(document.page_content))
```
```output
80427
```
## 定义模式

根据[提取教程](/docs/tutorials/extraction)，我们将使用Pydantic来定义我们希望提取的信息的模式。在这种情况下，我们将提取一个“关键发展”的列表（例如，重要的历史事件），其中包括年份和描述。

请注意，我们还包括一个`evidence`键，并指示模型逐字提供文章中相关的文本句子。这使我们能够将提取结果与（模型对）原始文档文本的重构进行比较。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to handle long text when doing extraction"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to handle long text when doing extraction"}]-->
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field


class KeyDevelopment(BaseModel):
    """Information about a development in the history of cars."""

    year: int = Field(
        ..., description="The year when there was an important historic development."
    )
    description: str = Field(
        ..., description="What happened in this year? What was the development?"
    )
    evidence: str = Field(
        ...,
        description="Repeat in verbatim the sentence(s) from which the year and description information were extracted",
    )


class ExtractionData(BaseModel):
    """Extracted information about key developments in the history of cars."""

    key_developments: List[KeyDevelopment]


# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert at identifying key historic development in text. "
            "Only extract important historic developments. Extract nothing if no important information can be found in the text.",
        ),
        ("human", "{text}"),
    ]
)
```

## 创建提取器

让我们选择一个大型语言模型（LLM）。因为我们使用的是工具调用，我们需要一个支持工具调用功能的模型。请参见[此表](/docs/integrations/chat)以获取可用的LLM。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  openaiParams={`model="gpt-4-0125-preview", temperature=0`}
/>



```python
extractor = prompt | llm.with_structured_output(
    schema=ExtractionData,
    include_raw=False,
)
```

## 粗暴的强制方法

将文档分割成块，使每个块适合大型语言模型的上下文窗口。


```python
<!--IMPORTS:[{"imported": "TokenTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.TokenTextSplitter.html", "title": "How to handle long text when doing extraction"}]-->
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(
    # Controls the size of each chunk
    chunk_size=2000,
    # Controls overlap between chunks
    chunk_overlap=20,
)

texts = text_splitter.split_text(document.page_content)
```

使用 [batch](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html) 功能在每个块上**并行**运行提取！

:::tip
您可以经常使用 .batch() 来并行化提取！`.batch` 在底层使用线程池来帮助您并行化工作负载。

如果您的模型通过API暴露，这可能会加快您的提取流程！
:::


```python
# Limit just to the first 3 chunks
# so the code can be re-run quickly
first_few = texts[:3]

extractions = extractor.batch(
    [{"text": text} for text in first_few],
    {"max_concurrency": 5},  # limit the concurrency by passing max concurrency!
)
```

### 合并结果

在从各个块中提取数据后，我们需要将提取结果合并在一起。


```python
key_developments = []

for extraction in extractions:
    key_developments.extend(extraction.key_developments)

key_developments[:10]
```



```output
[KeyDevelopment(year=1769, description='Nicolas-Joseph Cugnot built the first full-scale, self-propelled mechanical vehicle, a steam-powered tricycle.', evidence='Nicolas-Joseph Cugnot is widely credited with building the first full-scale, self-propelled mechanical vehicle in about 1769; he created a steam-powered tricycle.'),
 KeyDevelopment(year=1807, description="Nicéphore Niépce and his brother Claude created what was probably the world's first internal combustion engine.", evidence="In 1807, Nicéphore Niépce and his brother Claude created what was probably the world's first internal combustion engine (which they called a Pyréolophore), but installed it in a boat on the river Saone in France."),
 KeyDevelopment(year=1886, description='Carl Benz patented the Benz Patent-Motorwagen, marking the birth of the modern car.', evidence='In November 1881, French inventor Gustave Trouvé demonstrated a three-wheeled car powered by electricity at the International Exposition of Electricity. Although several other German engineers (including Gottlieb Daimler, Wilhelm Maybach, and Siegfried Marcus) were working on cars at about the same time, the year 1886 is regarded as the birth year of the modern car—a practical, marketable automobile for everyday use—when the German Carl Benz patented his Benz Patent-Motorwagen; he is generally acknowledged as the inventor of the car.'),
 KeyDevelopment(year=1886, description='Carl Benz began promotion of his vehicle, marking the introduction of the first commercially available automobile.', evidence='Benz began promotion of the vehicle on 3 July 1886.'),
 KeyDevelopment(year=1888, description="Bertha Benz undertook the first road trip by car to prove the road-worthiness of her husband's invention.", evidence="In August 1888, Bertha Benz, the wife and business partner of Carl Benz, undertook the first road trip by car, to prove the road-worthiness of her husband's invention."),
 KeyDevelopment(year=1896, description='Benz designed and patented the first internal-combustion flat engine, called boxermotor.', evidence='In 1896, Benz designed and patented the first internal-combustion flat engine, called boxermotor.'),
 KeyDevelopment(year=1897, description='The first motor car in central Europe and one of the first factory-made cars in the world, the Präsident automobil, was produced by Nesselsdorfer Wagenbau.', evidence='The first motor car in central Europe and one of the first factory-made cars in the world, was produced by Czech company Nesselsdorfer Wagenbau (later renamed to Tatra) in 1897, the Präsident automobil.'),
 KeyDevelopment(year=1901, description='Ransom Olds started large-scale, production-line manufacturing of affordable cars at his Oldsmobile factory in Lansing, Michigan.', evidence='Large-scale, production-line manufacturing of affordable cars was started by Ransom Olds in 1901 at his Oldsmobile factory in Lansing, Michigan.'),
 KeyDevelopment(year=1913, description="Henry Ford introduced the world's first moving assembly line for cars at the Highland Park Ford Plant.", evidence="This concept was greatly expanded by Henry Ford, beginning in 1913 with the world's first moving assembly line for cars at the Highland Park Ford Plant.")]
```


## 基于RAG的方法

另一个简单的想法是将文本分块，但不是从每个块中提取信息，而是专注于最相关的块。

:::caution
识别哪些块是相关的可能很困难。

例如，在我们这里使用的`car`文章中，文章的大部分内容包含关键的开发信息。因此，通过使用
**RAG**，我们可能会丢弃很多相关信息。

我们建议您尝试使用您的用例，并确定这种方法是否有效。
:::

要实现基于RAG的方法：

1. 将您的文档分块并进行索引（例如，在向量存储中）；
2. 在`extractor`链前添加一个使用向量存储的检索步骤。

这是一个依赖于`FAISS`向量存储的简单示例。


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to handle long text when doing extraction"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to handle long text when doing extraction"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to handle long text when doing extraction"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to handle long text when doing extraction"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to handle long text when doing extraction"}]-->
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

texts = text_splitter.split_text(document.page_content)
vectorstore = FAISS.from_texts(texts, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1}
)  # Only extract from first document
```

在这种情况下，RAG提取器只关注顶部文档。


```python
rag_extractor = {
    "text": retriever | (lambda docs: docs[0].page_content)  # fetch content of top doc
} | extractor
```


```python
results = rag_extractor.invoke("Key developments associated with cars")
```


```python
for key_development in results.key_developments:
    print(key_development)
```
```output
year=2006 description='Car-sharing services in the US experienced double-digit growth in revenue and membership.' evidence='in the US, some car-sharing services have experienced double-digit growth in revenue and membership growth between 2006 and 2007.'
year=2020 description='56 million cars were manufactured worldwide, with China producing the most.' evidence='In 2020, there were 56 million cars manufactured worldwide, down from 67 million the previous year. The automotive industry in China produces by far the most (20 million in 2020).'
```
## 常见问题

不同的方法在成本、速度和准确性方面各有利弊。

注意这些问题：

* 内容分块意味着如果信息分散在多个块中，LLM 可能无法提取信息。
* 大块重叠可能导致相同的信息被提取两次，因此要准备好去重！
* LLM 可能会编造数据。如果在大量文本中寻找单一事实并使用暴力破解的方法，您可能会得到更多编造的数据。
