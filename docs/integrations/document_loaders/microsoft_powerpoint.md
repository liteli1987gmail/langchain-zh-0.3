---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/microsoft_powerpoint.ipynb
---
# Microsoft PowerPoint

>[Microsoft PowerPoint](https://en.wikipedia.org/wiki/Microsoft_PowerPoint) 是微软的一款演示程序。

这涵盖了如何将 `Microsoft PowerPoint` 文档加载为我们可以在后续使用的文档格式。

有关在本地设置 Unstructured 的更多说明，包括设置所需的系统依赖项，请参见 [本指南](/docs/integrations/providers/unstructured/)。


```python
# Install packages
%pip install unstructured
%pip install python-magic
%pip install python-pptx
```


```python
<!--IMPORTS:[{"imported": "UnstructuredPowerPointLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.powerpoint.UnstructuredPowerPointLoader.html", "title": "Microsoft PowerPoint"}]-->
from langchain_community.document_loaders import UnstructuredPowerPointLoader

loader = UnstructuredPowerPointLoader("./example_data/fake-power-point.pptx")

data = loader.load()

data
```



```output
[Document(page_content='Adding a Bullet Slide\n\nFind the bullet slide layout\n\nUse _TextFrame.text for first bullet\n\nUse _TextFrame.add_paragraph() for subsequent bullets\n\nHere is a lot of text!\n\nHere is some text in a text box!', metadata={'source': './example_data/fake-power-point.pptx'})]
```


### 保留元素

在底层，`Unstructured` 为不同的文本块创建不同的“元素”。默认情况下，我们将这些元素组合在一起，但您可以通过指定 `mode="elements"` 来轻松保持这种分离。


```python
loader = UnstructuredPowerPointLoader(
    "./example_data/fake-power-point.pptx", mode="elements"
)

data = loader.load()

data[0]
```



```output
Document(page_content='Adding a Bullet Slide', metadata={'source': './example_data/fake-power-point.pptx', 'category_depth': 0, 'file_directory': './example_data', 'filename': 'fake-power-point.pptx', 'last_modified': '2023-12-19T13:42:18', 'page_number': 1, 'languages': ['eng'], 'filetype': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'category': 'Title'})
```


## 使用 Azure AI 文档智能

>[Azure AI 文档智能](https://aka.ms/doc-intelligence)（前称 `Azure Form Recognizer`）是基于机器学习的
>服务，提取文本（包括手写）、表格、文档结构（例如标题、章节标题等）和键值对
>从数字或扫描的 PDF、图像、Office 和 HTML 文件中。
>
>文档智能支持 `PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX` 和 `HTML`。

当前使用 `Document Intelligence` 的加载器实现可以按页面整合内容并将其转换为 LangChain 文档。默认输出格式为 markdown，可以轻松与 `MarkdownHeaderTextSplitter` 链接以进行语义文档分块。您还可以使用 `mode="single"` 或 `mode="page"` 返回单页或按页分割的纯文本。


## 先决条件

在以下三个预览区域之一创建 Azure AI 文档智能资源：**东部美国**、**西部美国2**、**西欧** - 如果您还没有，请按照[此文档](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)创建一个。您将把 `<endpoint>` 和 `<key>` 作为参数传递给加载器。


```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```


```python
<!--IMPORTS:[{"imported": "AzureAIDocumentIntelligenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.doc_intelligence.AzureAIDocumentIntelligenceLoader.html", "title": "Microsoft PowerPoint"}]-->
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
