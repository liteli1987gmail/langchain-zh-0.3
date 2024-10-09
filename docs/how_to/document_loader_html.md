---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/document_loader_html.ipynb
---
# 如何加载HTML

超文本标记语言或[HTML](https://en.wikipedia.org/wiki/HTML)是为在网页浏览器中显示的文档设计的标准标记语言。

这部分介绍如何将`HTML`文档加载到LangChain [Document](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document)对象中，以便我们在后续使用。

解析HTML文件通常需要专门的工具。在这里，我们演示了通过[Unstructured](https://unstructured-io.github.io/unstructured/)和[BeautifulSoup4](https://beautiful-soup-4.readthedocs.io/en/latest/)进行解析，这些工具可以通过pip安装。请访问集成页面以查找与其他服务的集成，例如[Azure AI Document Intelligence](/docs/integrations/document_loaders/azure_document_intelligence)或[FireCrawl](/docs/integrations/document_loaders/firecrawl)。

## 使用Unstructured加载HTML


```python
%pip install unstructured
```


```python
<!--IMPORTS:[{"imported": "UnstructuredHTMLLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html.UnstructuredHTMLLoader.html", "title": "How to load HTML"}]-->
from langchain_community.document_loaders import UnstructuredHTMLLoader

file_path = "../../docs/integrations/document_loaders/example_data/fake-content.html"

loader = UnstructuredHTMLLoader(file_path)
data = loader.load()

print(data)
```
```output
[Document(page_content='My First Heading\n\nMy first paragraph.', metadata={'source': '../../docs/integrations/document_loaders/example_data/fake-content.html'})]
```
## 使用 BeautifulSoup4 加载 HTML

我们还可以使用 `BeautifulSoup4` 通过 `BSHTMLLoader` 加载 HTML 文档。这将从 HTML 中提取文本到 `page_content`，并将页面标题作为 `title` 提取到 `metadata`。


```python
%pip install bs4
```


```python
<!--IMPORTS:[{"imported": "BSHTMLLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html", "title": "How to load HTML"}]-->
from langchain_community.document_loaders import BSHTMLLoader

loader = BSHTMLLoader(file_path)
data = loader.load()

print(data)
```
```output
[Document(page_content='\nTest Title\n\n\nMy First Heading\nMy first paragraph.\n\n\n', metadata={'source': '../../docs/integrations/document_loaders/example_data/fake-content.html', 'title': 'Test Title'})]
```