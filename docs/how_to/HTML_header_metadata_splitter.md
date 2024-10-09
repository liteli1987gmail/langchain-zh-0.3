---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/HTML_header_metadata_splitter.ipynb
---
# 如何按 HTML 头部进行分割
## 描述和动机

[HTMLHeaderTextSplitter](https://python.langchain.com/api_reference/text_splitters/html/langchain_text_splitters.html.HTMLHeaderTextSplitter.html) 是一个“结构感知”的分块器，它在 HTML 元素级别分割文本，并为每个与给定块“相关”的头部添加元数据。它可以逐个元素返回块，或将具有相同元数据的元素组合在一起，目的是 (a) 保持相关文本在语义上（或多或少）分组，以及 (b) 保留文档结构中编码的丰富上下文信息。它可以与其他文本分割器一起使用，作为分块管道的一部分。

它类似于用于 markdown 文件的 [MarkdownHeaderTextSplitter](/docs/how_to/markdown_header_metadata_splitter)。

要指定要分割的头部，请在实例化 `HTMLHeaderTextSplitter` 时指定 `headers_to_split_on`，如下所示。

## 使用示例
### 1) 如何分割 HTML 字符串：


```python
%pip install -qU langchain-text-splitters
```


```python
<!--IMPORTS:[{"imported": "HTMLHeaderTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/html/langchain_text_splitters.html.HTMLHeaderTextSplitter.html", "title": "How to split by HTML header "}]-->
from langchain_text_splitters import HTMLHeaderTextSplitter

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
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```



```output
[Document(page_content='Foo'),
 Document(page_content='Some intro text about Foo.  \nBar main section Bar subsection 1 Bar subsection 2', metadata={'Header 1': 'Foo'}),
 Document(page_content='Some intro text about Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section'}),
 Document(page_content='Some text about the first subtopic of Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section', 'Header 3': 'Bar subsection 1'}),
 Document(page_content='Some text about the second subtopic of Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section', 'Header 3': 'Bar subsection 2'}),
 Document(page_content='Baz', metadata={'Header 1': 'Foo'}),
 Document(page_content='Some text about Baz', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'}),
 Document(page_content='Some concluding text about Foo', metadata={'Header 1': 'Foo'})]
```


要将每个元素与其相关的标题一起返回，请在实例化 `HTMLHeaderTextSplitter` 时指定 `return_each_element=True`：


```python
html_splitter = HTMLHeaderTextSplitter(
    headers_to_split_on,
    return_each_element=True,
)
html_header_splits_elements = html_splitter.split_text(html_string)
```

与上述内容相比，元素按其标题聚合：


```python
for element in html_header_splits[:2]:
    print(element)
```
```output
page_content='Foo'
page_content='Some intro text about Foo.  \nBar main section Bar subsection 1 Bar subsection 2' metadata={'Header 1': 'Foo'}
```
现在每个元素作为一个独立的 `Document` 返回：


```python
for element in html_header_splits_elements[:3]:
    print(element)
```
```output
page_content='Foo'
page_content='Some intro text about Foo.' metadata={'Header 1': 'Foo'}
page_content='Bar main section Bar subsection 1 Bar subsection 2' metadata={'Header 1': 'Foo'}
```
#### 2) 如何从 URL 或 HTML 文件中拆分：

要直接从 URL 读取，请将 URL 字符串传递给 `split_text_from_url` 方法。

同样，可以将本地 HTML 文件传递给 `split_text_from_file` 方法。


```python
url = "https://plato.stanford.edu/entries/goedel/"

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on)

# for local file use html_splitter.split_text_from_file(<path_to_file>)
html_header_splits = html_splitter.split_text_from_url(url)
```

### 2) 如何限制块大小：

`HTMLHeaderTextSplitter` 根据 HTML 标题进行拆分，可以与另一个根据字符长度限制拆分的拆分器组合，例如 `RecursiveCharacterTextSplitter`。

这可以通过第二个拆分器的 `.split_documents` 方法完成：


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to split by HTML header "}]-->
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits[80:85]
```



```output
[Document(page_content='We see that Gödel first tried to reduce the consistency problem for analysis to that of arithmetic. This seemed to require a truth definition for arithmetic, which in turn led to paradoxes, such as the Liar paradox (“This sentence is false”) and Berry’s paradox (“The least number not defined by an expression consisting of just fourteen English words”). Gödel then noticed that such paradoxes would not necessarily arise if truth were replaced by provability. But this means that arithmetic truth', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='means that arithmetic truth and arithmetic provability are not co-extensive — whence the First Incompleteness Theorem.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='This account of Gödel’s discovery was told to Hao Wang very much after the fact; but in Gödel’s contemporary correspondence with Bernays and Zermelo, essentially the same description of his path to the theorems is given. (See Gödel 2003a and Gödel 2003b respectively.) From those accounts we see that the undefinability of truth in arithmetic, a result credited to Tarski, was likely obtained in some form by Gödel by 1931. But he neither publicized nor published the result; the biases logicians', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='result; the biases logicians had expressed at the time concerning the notion of truth, biases which came vehemently to the fore when Tarski announced his results on the undefinability of truth in formal systems 1935, may have served as a deterrent to Gödel’s publication of that theorem.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='We now describe the proof of the two theorems, formulating Gödel’s results in Peano arithmetic. Gödel himself used a system related to that defined in Principia Mathematica, but containing Peano arithmetic. In our presentation of the First and Second Incompleteness Theorems we refer to Peano arithmetic as P, following Gödel’s notation.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.2 The proof of the First Incompleteness Theorem'})]
```


## 限制

不同的HTML文档之间可能存在相当大的结构变化，虽然`HTMLHeaderTextSplitter`会尝试将所有“相关”的标题附加到任何给定的块上，但有时它可能会遗漏某些标题。例如，该算法假设存在一个信息层次结构，其中标题总是在与其相关文本“上方”的节点上，即前兄弟、祖先及其组合。在以下新闻文章中（截至本文撰写时），文档的结构使得顶级标题的文本虽然标记为“h1”，但与我们期望它“上方”的文本元素处于*不同*的子树中——因此我们可以观察到“h1”元素及其相关文本未出现在块元数据中（但在适用的情况下，我们确实看到了“h2”及其相关文本）：



```python
url = "https://www.cnn.com/2023/09/25/weather/el-nino-winter-us-climate/index.html"

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on)
html_header_splits = html_splitter.split_text_from_url(url)
print(html_header_splits[1].page_content[:500])
```
```output
No two El Niño winters are the same, but many have temperature and precipitation trends in common.  
Average conditions during an El Niño winter across the continental US.  
One of the major reasons is the position of the jet stream, which often shifts south during an El Niño winter. This shift typically brings wetter and cooler weather to the South while the North becomes drier and warmer, according to NOAA.  
Because the jet stream is essentially a river of air that storms flow through, they c
```