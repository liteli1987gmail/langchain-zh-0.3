---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/document_loader_markdown.ipynb
---
# 如何加载Markdown

[Markdown](https://en.wikipedia.org/wiki/Markdown) 是一种轻量级标记语言，用于使用纯文本编辑器创建格式化文本。

在这里，我们介绍如何将 `Markdown` 文档加载到 LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象中，以便我们可以在后续使用。

我们将涵盖：

- 基本用法；
- 将Markdown解析为标题、列表项和文本等元素。

LangChain 实现了一个 [UnstructuredMarkdownLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html) 对象，该对象需要 [Unstructured](https://unstructured-io.github.io/unstructured/) 包。首先，我们安装它：


```python
%pip install "unstructured[md]" nltk
```

基本用法将会把一个Markdown文件导入为一个单一文档。这里我们展示LangChain的自述文件：


```python
<!--IMPORTS:[{"imported": "UnstructuredMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html", "title": "How to load Markdown"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "How to load Markdown"}]-->
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_core.documents import Document

markdown_path = "../../../README.md"
loader = UnstructuredMarkdownLoader(markdown_path)

data = loader.load()
assert len(data) == 1
assert isinstance(data[0], Document)
readme_content = data[0].page_content
print(readme_content[:250])
```
```output
🦜️🔗 LangChain

⚡ Build context-aware reasoning applications ⚡

Looking for the JS/TS library? Check out LangChain.js.

To help you ship LangChain apps to production faster, check out LangSmith. 
LangSmith is a unified developer platform for building,
```
## 保留元素

在底层，Unstructured为不同的文本块创建不同的“元素”。默认情况下，我们将这些元素组合在一起，但您可以通过指定`mode="elements"`轻松保持这种分离。


```python
loader = UnstructuredMarkdownLoader(markdown_path, mode="elements")

data = loader.load()
print(f"Number of documents: {len(data)}\n")

for document in data[:2]:
    print(f"{document}\n")
```
```output
Number of documents: 66

page_content='🦜️🔗 LangChain' metadata={'source': '../../../README.md', 'category_depth': 0, 'last_modified': '2024-06-28T15:20:01', 'languages': ['eng'], 'filetype': 'text/markdown', 'file_directory': '../../..', 'filename': 'README.md', 'category': 'Title'}

page_content='⚡ Build context-aware reasoning applications ⚡' metadata={'source': '../../../README.md', 'last_modified': '2024-06-28T15:20:01', 'languages': ['eng'], 'parent_id': '200b8a7d0dd03f66e4f13456566d2b3a', 'filetype': 'text/markdown', 'file_directory': '../../..', 'filename': 'README.md', 'category': 'NarrativeText'}
```
请注意，在这种情况下，我们恢复了三种不同的元素类型：


```python
print(set(document.metadata["category"] for document in data))
```
```output
{'ListItem', 'NarrativeText', 'Title'}
```