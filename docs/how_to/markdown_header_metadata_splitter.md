---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/markdown_header_metadata_splitter.ipynb
---
# 如何按标题分割Markdown

### 动机

许多聊天或问答应用在嵌入和向量存储之前涉及对输入文档进行分块。

[这些笔记](https://www.pinecone.io/learn/chunking-strategies/)来自Pinecone，提供了一些有用的提示：

```
When a full paragraph or document is embedded, the embedding process considers both the overall context and the relationships between the sentences and phrases within the text. This can result in a more comprehensive vector representation that captures the broader meaning and themes of the text.
```
 
如前所述，分块通常旨在将具有共同上下文的文本保持在一起。考虑到这一点，我们可能希望特别尊重文档本身的结构。例如，markdown 文件是通过标题组织的。在特定标题组内创建块是一个直观的想法。为了解决这个挑战，我们可以使用 [MarkdownHeaderTextSplitter](https://python.langchain.com/api_reference/text_splitters/markdown/langchain_text_splitters.markdown.MarkdownHeaderTextSplitter.html)。这将根据指定的标题集拆分 markdown 文件。

例如，如果我们想要拆分这个 markdown：
```
md = '# Foo\n\n ## Bar\n\nHi this is Jim  \nHi this is Joe\n\n ## Baz\n\n Hi this is Molly' 
```
 
我们可以指定要拆分的标题：
```
[("#", "Header 1"),("##", "Header 2")]
```

内容按共同标题分组或拆分：
```
{'content': 'Hi this is Jim  \nHi this is Joe', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Bar'}}
{'content': 'Hi this is Molly', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Baz'}}
```

让我们看看下面的一些示例。

### 基本用法：


```python
%pip install -qU langchain-text-splitters
```


```python
<!--IMPORTS:[{"imported": "MarkdownHeaderTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/markdown/langchain_text_splitters.markdown.MarkdownHeaderTextSplitter.html", "title": "How to split Markdown by Headers"}]-->
from langchain_text_splitters import MarkdownHeaderTextSplitter
```


```python
markdown_document = "# Foo\n\n    ## Bar\n\nHi this is Jim\n\nHi this is Joe\n\n ### Boo \n\n Hi this is Lance \n\n ## Baz\n\n Hi this is Molly"

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```



```output
[Document(page_content='Hi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='Hi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='Hi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```



```python
type(md_header_splits[0])
```



```output
langchain_core.documents.base.Document
```


默认情况下，`MarkdownHeaderTextSplitter` 会从输出块的内容中剥离正在拆分的标题。通过设置 `strip_headers = False` 可以禁用此功能。


```python
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on, strip_headers=False)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```



```output
[Document(page_content='# Foo  \n## Bar  \nHi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='### Boo  \nHi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='## Baz  \nHi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```


### 如何将 Markdown 行作为单独的文档返回

默认情况下，`MarkdownHeaderTextSplitter` 根据 `headers_to_split_on` 中指定的标题聚合行。我们可以通过指定 `return_each_line` 来禁用此功能：


```python
markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on,
    return_each_line=True,
)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```



```output
[Document(page_content='Hi this is Jim', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='Hi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='Hi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='Hi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```


请注意，这里每个文档的 `metadata` 中保留了标题信息。

### 如何限制块大小：

在每个markdown组内，我们可以应用任何我们想要的文本分割器，例如`RecursiveCharacterTextSplitter`，它允许进一步控制块大小。


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to split Markdown by Headers"}]-->
markdown_document = "# Intro \n\n    ## History \n\n Markdown[9] is a lightweight markup language for creating formatted text using a plain-text editor. John Gruber created Markdown in 2004 as a markup language that is appealing to human readers in its source code form.[9] \n\n Markdown is widely used in blogging, instant messaging, online forums, collaborative software, documentation pages, and readme files. \n\n ## Rise and divergence \n\n As Markdown popularity grew rapidly, many Markdown implementations appeared, driven mostly by the need for \n\n additional features such as tables, footnotes, definition lists,[note 1] and Markdown inside HTML blocks. \n\n #### Standardization \n\n From 2012, a group of people, including Jeff Atwood and John MacFarlane, launched what Atwood characterised as a standardisation effort. \n\n ## Implementations \n\n Implementations of Markdown are available for over a dozen programming languages."

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
]

# MD splits
markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on, strip_headers=False
)
md_header_splits = markdown_splitter.split_text(markdown_document)

# Char-level splits
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 250
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(md_header_splits)
splits
```



```output
[Document(page_content='# Intro  \n## History  \nMarkdown[9] is a lightweight markup language for creating formatted text using a plain-text editor. John Gruber created Markdown in 2004 as a markup language that is appealing to human readers in its source code form.[9]', metadata={'Header 1': 'Intro', 'Header 2': 'History'}),
 Document(page_content='Markdown is widely used in blogging, instant messaging, online forums, collaborative software, documentation pages, and readme files.', metadata={'Header 1': 'Intro', 'Header 2': 'History'}),
 Document(page_content='## Rise and divergence  \nAs Markdown popularity grew rapidly, many Markdown implementations appeared, driven mostly by the need for  \nadditional features such as tables, footnotes, definition lists,[note 1] and Markdown inside HTML blocks.', metadata={'Header 1': 'Intro', 'Header 2': 'Rise and divergence'}),
 Document(page_content='#### Standardization  \nFrom 2012, a group of people, including Jeff Atwood and John MacFarlane, launched what Atwood characterised as a standardisation effort.', metadata={'Header 1': 'Intro', 'Header 2': 'Rise and divergence'}),
 Document(page_content='## Implementations  \nImplementations of Markdown are available for over a dozen programming languages.', metadata={'Header 1': 'Intro', 'Header 2': 'Implementations'})]
```

