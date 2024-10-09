---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/microsoft_excel.ipynb
---
# Microsoft Excel

 `UnstructuredExcelLoader` 用于加载 `Microsoft Excel` 文件。该加载器支持 `.xlsx` 和 `.xls` 文件。页面内容将是 Excel 文件的原始文本。如果您在 "elements" 模式下使用加载器，Excel 文件的 HTML 表示将可在文档元数据中的 `text_as_html` 键下找到。

有关在本地设置 Unstructured 的更多说明，包括设置所需的系统依赖项，请参阅 [本指南](/docs/integrations/providers/unstructured/)。


```python
%pip install --upgrade --quiet langchain-community unstructured openpyxl
```


```python
<!--IMPORTS:[{"imported": "UnstructuredExcelLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.excel.UnstructuredExcelLoader.html", "title": "Microsoft Excel"}]-->
from langchain_community.document_loaders import UnstructuredExcelLoader

loader = UnstructuredExcelLoader("./example_data/stanley-cups.xlsx", mode="elements")
docs = loader.load()

print(len(docs))

docs
```
```output
4
```


```output
[Document(page_content='Stanley Cups', metadata={'source': './example_data/stanley-cups.xlsx', 'file_directory': './example_data', 'filename': 'stanley-cups.xlsx', 'last_modified': '2023-12-19T13:42:18', 'page_name': 'Stanley Cups', 'page_number': 1, 'languages': ['eng'], 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'category': 'Title'}),
 Document(page_content='\n\n\nTeam\nLocation\nStanley Cups\n\n\nBlues\nSTL\n1\n\n\nFlyers\nPHI\n2\n\n\nMaple Leafs\nTOR\n13\n\n\n', metadata={'source': './example_data/stanley-cups.xlsx', 'file_directory': './example_data', 'filename': 'stanley-cups.xlsx', 'last_modified': '2023-12-19T13:42:18', 'page_name': 'Stanley Cups', 'page_number': 1, 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>13</td>\n    </tr>\n  </tbody>\n</table>', 'languages': ['eng'], 'parent_id': '17e9a90f9616f2abed8cf32b5bd3810d', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'category': 'Table'}),
 Document(page_content='Stanley Cups Since 67', metadata={'source': './example_data/stanley-cups.xlsx', 'file_directory': './example_data', 'filename': 'stanley-cups.xlsx', 'last_modified': '2023-12-19T13:42:18', 'page_name': 'Stanley Cups Since 67', 'page_number': 2, 'languages': ['eng'], 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'category': 'Title'}),
 Document(page_content='\n\n\nTeam\nLocation\nStanley Cups\n\n\nBlues\nSTL\n1\n\n\nFlyers\nPHI\n2\n\n\nMaple Leafs\nTOR\n0\n\n\n', metadata={'source': './example_data/stanley-cups.xlsx', 'file_directory': './example_data', 'filename': 'stanley-cups.xlsx', 'last_modified': '2023-12-19T13:42:18', 'page_name': 'Stanley Cups Since 67', 'page_number': 2, 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>0</td>\n    </tr>\n  </tbody>\n</table>', 'languages': ['eng'], 'parent_id': 'ee34bd8c186b57e3530d5443ffa58122', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'category': 'Table'})]
```


## 使用 Azure AI 文档智能

>[Azure AI 文档智能](https://aka.ms/doc-intelligence)（前称 `Azure 表单识别`）是基于机器学习的
>服务，能够从数字或扫描的 PDF、图像、Office 和 HTML 文件中提取文本（包括手写）、表格、文档结构（例如标题、章节标题等）和键值对。
>
大于
>文档智能支持 `PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX` 和 `HTML`。

当前使用 `文档智能` 的加载器实现可以按页面整合内容并将其转换为 LangChain 文档。默认输出格式为 markdown，可以与 `MarkdownHeaderTextSplitter` 轻松链式处理以进行语义文档分块。您还可以使用 `mode="single"` 或 `mode="page"` 返回单页或按页分割的纯文本。


### 前提条件

在以下 3 个预览区域之一创建 Azure AI 文档智能资源：**东部美国**、**西部美国2**、**西欧** - 如果您没有，请按照 [此文档](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) 创建一个。您将把 `<endpoint>` 和 `<key>` 作为参数传递给加载器。


```python
%pip install --upgrade --quiet langchain langchain-community azure-ai-documentintelligence
```


```python
<!--IMPORTS:[{"imported": "AzureAIDocumentIntelligenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.doc_intelligence.AzureAIDocumentIntelligenceLoader.html", "title": "Microsoft Excel"}]-->
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
