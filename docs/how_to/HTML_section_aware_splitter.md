---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/HTML_section_aware_splitter.ipynb
---
# 如何按HTML部分进行分割
## 描述和动机
与[HTMLHeaderTextSplitter](/docs/how_to/HTML_header_metadata_splitter)的概念类似，`HTMLSectionSplitter`是一个“结构感知”的分块器，它在元素级别分割文本，并为与任何给定块“相关”的每个标题添加元数据。

它可以逐个返回块，或将具有相同元数据的元素组合在一起，目的是(a)保持相关文本在语义上（或多或少）分组，以及(b)保留编码在文档结构中的丰富上下文信息。

使用`xslt_path`提供一个绝对路径来转换HTML，以便它可以根据提供的标签检测部分。默认情况下使用`data_connection/document_transformers`目录中的`converting_to_header.xslt`文件。这是为了将html转换为更容易检测部分的格式/布局。例如，基于字体大小的`span`可以转换为标题标签，以便被检测为一个部分。

## 使用示例
### 1) 如何分割HTML字符串：


```python
<!--IMPORTS:[{"imported": "HTMLSectionSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/html/langchain_text_splitters.html.HTMLSectionSplitter.html", "title": "How to split by HTML sections"}]-->
from langchain_text_splitters import HTMLSectionSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2")]

html_splitter = HTMLSectionSplitter(headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```



```output
[Document(page_content='Foo \n Some intro text about Foo.', metadata={'Header 1': 'Foo'}),
 Document(page_content='Bar main section \n Some intro text about Bar. \n Bar subsection 1 \n Some text about the first subtopic of Bar. \n Bar subsection 2 \n Some text about the second subtopic of Bar.', metadata={'Header 2': 'Bar main section'}),
 Document(page_content='Baz \n Some text about Baz \n \n \n Some concluding text about Foo', metadata={'Header 2': 'Baz'})]
```


### 2) 如何限制块大小：

`HTMLSectionSplitter` 可以与其他文本分割器一起使用，作为分块管道的一部分。内部，当节的大小大于块的大小时，它使用 `RecursiveCharacterTextSplitter`。它还考虑文本的字体大小，以根据确定的字体大小阈值来判断它是否为一个节。


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to split by HTML sections"}]-->
from langchain_text_splitters import RecursiveCharacterTextSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLSectionSplitter(headers_to_split_on)

html_header_splits = html_splitter.split_text(html_string)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits
```



```output
[Document(page_content='Foo \n Some intro text about Foo.', metadata={'Header 1': 'Foo'}),
 Document(page_content='Bar main section \n Some intro text about Bar.', metadata={'Header 2': 'Bar main section'}),
 Document(page_content='Bar subsection 1 \n Some text about the first subtopic of Bar.', metadata={'Header 3': 'Bar subsection 1'}),
 Document(page_content='Bar subsection 2 \n Some text about the second subtopic of Bar.', metadata={'Header 3': 'Bar subsection 2'}),
 Document(page_content='Baz \n Some text about Baz \n \n \n Some concluding text about Foo', metadata={'Header 2': 'Baz'})]
```

