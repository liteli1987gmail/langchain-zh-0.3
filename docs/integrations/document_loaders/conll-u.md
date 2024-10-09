---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/conll-u.ipynb
---
# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html) 是 CoNLL-X 格式的修订版。注释以纯文本文件（UTF-8，标准化为 NFC，仅使用 LF 字符作为换行符，文件末尾包含一个 LF 字符）编码，包含三种类型的行：
>- 单词行包含一个单词/标记的注释，分为 10 个字段，用单个制表符分隔；见下文。
>- 空行标记句子边界。
>- 以井号 (#) 开头的注释行。

这是如何加载 [CoNLL-U](https://universaldependencies.org/format.html) 格式文件的示例。整个文件被视为一个文档。示例数据 (`conllu.conllu`) 基于标准 UD/CoNLL-U 示例之一。


```python
<!--IMPORTS:[{"imported": "CoNLLULoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.conllu.CoNLLULoader.html", "title": "CoNLL-U"}]-->
from langchain_community.document_loaders import CoNLLULoader
```


```python
loader = CoNLLULoader("example_data/conllu.conllu")
```


```python
document = loader.load()
```


```python
document
```



```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
