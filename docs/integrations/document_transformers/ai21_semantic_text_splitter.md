---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/ai21_semantic_text_splitter.ipynb
---
# AI21语义文本分割器

本示例介绍如何在LangChain中使用AI21语义文本分割器。

## 安装


```python
pip install langchain-ai21
```

## 环境设置

我们需要获取一个 AI21 API 密钥并设置 AI21_API_KEY 环境变量：


```python
import os
from getpass import getpass

if "AI21_API_KEY" not in os.environ:
    os.environ["AI21_API_KEY"] = getpass()
```

## 示例用法

### 按语义意义分割文本

此示例演示如何使用 AI21SemanticTextSplitter 根据语义意义将文本分割成块。


```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
chunks = semantic_text_splitter.split_text(TEXT)

print(f"The text has been split into {len(chunks)} chunks.")
for chunk in chunks:
    print(chunk)
    print("====")
```

### 按语义意义分割文本并合并

此示例演示如何使用 AI21SemanticTextSplitter 根据语义意义将文本分割成块，然后根据 `chunk_size` 合并这些块。


```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter_chunks = AI21SemanticTextSplitter(chunk_size=1000)
chunks = semantic_text_splitter_chunks.split_text(TEXT)

print(f"The text has been split into {len(chunks)} chunks.")
for chunk in chunks:
    print(chunk)
    print("====")
```

### 将文本分割为文档

此示例演示如何使用 AI21SemanticTextSplitter 根据语义意义将文本分割为文档。元数据将包含每个文档的类型。


```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
documents = semantic_text_splitter.split_text_to_documents(TEXT)

print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"type: {doc.metadata['source_type']}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 创建带有元数据的文档

此示例演示了如何使用AI21SemanticTextSplitter从文本创建文档，并为每个文档添加自定义元数据。


```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
texts = [TEXT]
documents = semantic_text_splitter.create_documents(
    texts=texts, metadatas=[{"pikachu": "pika pika"}]
)

print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"metadata: {doc.metadata}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 将文本拆分为文档，带起始索引

此示例演示了如何使用AI21SemanticTextSplitter根据语义意义将文本拆分为文档。元数据将包含每个文档的起始索引。
**注意**，起始索引提供了块的顺序指示，而不是每个块的实际起始索引。


```python
from langchain_ai21 import AI21SemanticTextSplitter

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter(add_start_index=True)
documents = semantic_text_splitter.create_documents(texts=[TEXT])
print(f"The text has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"start_index: {doc.metadata['start_index']}")
    print(f"text: {doc.page_content}")
    print("====")
```

### 拆分文档

此示例演示了如何使用AI21SemanticTextSplitter根据语义意义将文档列表拆分为块。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "AI21SemanticTextSplitter"}]-->
from langchain_ai21 import AI21SemanticTextSplitter
from langchain_core.documents import Document

TEXT = (
    "We’ve all experienced reading long, tedious, and boring pieces of text - financial reports, "
    "legal documents, or terms and conditions (though, who actually reads those terms and conditions to be honest?).\n"
    "Imagine a company that employs hundreds of thousands of employees. In today's information "
    "overload age, nearly 30% of the workday is spent dealing with documents. There's no surprise "
    "here, given that some of these documents are long and convoluted on purpose (did you know that "
    "reading through all your privacy policies would take almost a quarter of a year?). Aside from "
    "inefficiency, workers may simply refrain from reading some documents (for example, Only 16% of "
    "Employees Read Their Employment Contracts Entirely Before Signing!).\nThis is where AI-driven summarization "
    "tools can be helpful: instead of reading entire documents, which is tedious and time-consuming, "
    "users can (ideally) quickly extract relevant information from a text. With large language models, "
    "the development of those tools is easier than ever, and you can offer your users a summary that is "
    "specifically tailored to their preferences.\nLarge language models naturally follow patterns in input "
    "(prompt), and provide coherent completion that follows the same patterns. For that, we want to feed "
    'them with several examples in the input ("few-shot prompt"), so they can follow through. '
    "The process of creating the correct prompt for your problem is called prompt engineering, "
    "and you can read more about it here."
)

semantic_text_splitter = AI21SemanticTextSplitter()
document = Document(page_content=TEXT, metadata={"hello": "goodbye"})
documents = semantic_text_splitter.split_documents([document])
print(f"The document list has been split into {len(documents)} Documents.")
for doc in documents:
    print(f"text: {doc.page_content}")
    print(f"metadata: {doc.metadata}")
    print("====")
```
