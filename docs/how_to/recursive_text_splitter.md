---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/recursive_text_splitter.ipynb
keywords: [recursivecharactertextsplitter]
---
# 如何按字符递归分割文本

这个文本分割器是推荐用于通用文本的。它通过字符列表进行参数化。它尝试按顺序在这些字符上进行分割，直到块的大小足够小。默认列表是 `['\n\n', '\n', ' ', '']`。这会尽量保持所有段落（然后是句子，再然后是单词）在一起，因为这些通常被认为是语义上最相关的文本片段。

1. 文本是如何分割的：按字符列表。
2. 块大小是如何测量的：按字符数。

下面我们展示示例用法。

要直接获取字符串内容，请使用 `.split_text`。

要创建 LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 对象（例如，用于下游任务），请使用 `.create_documents`。


```python
%pip install -qU langchain-text-splitters
```


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to recursively split text by characters"}]-->
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load example document
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()

text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
print(texts[1])
```
```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and'
page_content='of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.'
```

```python
text_splitter.split_text(state_of_the_union)[:2]
```



```output
['Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and',
 'of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.']
```


让我们来看看上面为 `RecursiveCharacterTextSplitter` 设置的参数：
- `chunk_size`: 每个块的最大大小，大小由 `length_function` 决定。
- `chunk_overlap`: 块之间的目标重叠。重叠的块有助于减轻在块之间划分上下文时信息的丢失。
- `length_function`: 确定块大小的函数。
- `is_separator_regex`: 分隔符列表（默认为 `['\n\n', '\n', ' ', '']`）是否应被解释为正则表达式。

## 从没有词边界的语言中分割文本

某些书写系统没有 [词边界](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries)，例如中文、日文和泰文。使用默认的分隔符列表 `['\n\n', '\n', ' ', '']` 分割文本可能会导致单词在块之间被拆分。为了保持单词在一起，您可以覆盖分隔符列表以包含额外的标点符号：

* 添加 ASCII 句号 "`.`"、[Unicode 全角](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) 句号 "`．`"（用于中文文本）和 [表意全角句号](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`"（用于日文和中文）
* 添加在泰文、缅甸文、柬文和日文中使用的 [零宽空格](https://en.wikipedia.org/wiki/Zero-width_space)。
* 添加 ASCII 逗号 "`,`"、Unicode 全角逗号 "`，`" 和 Unicode 表意逗号 "`、`"


```python
text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # Zero-width space
        "\uff0c",  # Fullwidth comma
        "\u3001",  # Ideographic comma
        "\uff0e",  # Fullwidth full stop
        "\u3002",  # Ideographic full stop
        "",
    ],
    # Existing args
)
```
