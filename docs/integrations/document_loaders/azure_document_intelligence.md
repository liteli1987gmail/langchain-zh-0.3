---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/azure_document_intelligence.ipynb
---
# Azure AI 文档智能

>[Azure AI 文档智能](https://aka.ms/doc-intelligence)（前称 `Azure 表单识别器`）是基于机器学习的
>服务，能够从数字或扫描的PDF、图像、Office和HTML文件中提取文本（包括手写）、表格、文档结构（例如标题、章节标题等）和键值对。
>
>文档智能支持 `PDF`、`JPEG/JPG`、`PNG`、`BMP`、`TIFF`、`HEIF`、`DOCX`、`XLSX`、`PPTX` 和 `HTML`。
当前使用 `文档智能` 的加载器实现可以按页面整合内容并将其转换为 LangChain 文档。默认输出格式为 markdown，可以与 `MarkdownHeaderTextSplitter` 轻松链式处理以进行语义文档分块。您还可以使用 `mode="single"` 或 `mode="page"` 返回单页或按页分割的纯文本。

## 前提条件


在以下三个预览区域之一拥有 Azure AI 文档智能资源：**东美国**、**西美国2**、**西欧洲** - 如果您没有，请按照[此文档](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)创建一个。您将把 `` 和 `` 作为参数传递给加载器。

在三个预览区域之一的 Azure AI 文档智能资源：**东部美国**、**西部美国2**、**西欧** - 如果您没有，请按照[此文档](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0)创建一个。您将把 `<endpoint>` 和 `<key>` 作为参数传递给加载器。


```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## 示例 1

第一个示例使用一个本地文件，该文件将被发送到 Azure AI 文档智能。

使用初始化的文档分析客户端，我们可以继续创建 DocumentIntelligenceLoader 的实例：


```python
<!--IMPORTS:[{"imported": "AzureAIDocumentIntelligenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.doc_intelligence.AzureAIDocumentIntelligenceLoader.html", "title": "Azure AI Document Intelligence"}]-->
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

默认输出包含一个带有 markdown 格式内容的 LangChain 文档：


```python
documents
```

## 示例 2
输入文件也可以是一个公共 URL 路径。例如，https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png。


```python
url_path = "<url>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, url_path=url_path, api_model="prebuilt-layout"
)

documents = loader.load()
```


```python
documents
```

## 示例 3
您还可以指定 `mode="page"` 以按页面加载文档。


```python
<!--IMPORTS:[{"imported": "AzureAIDocumentIntelligenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.doc_intelligence.AzureAIDocumentIntelligenceLoader.html", "title": "Azure AI Document Intelligence"}]-->
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    mode="page",
)

documents = loader.load()
```

输出将是每一页作为列表中的单独文档存储：


```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## 示例 4
您还可以指定 `analysis_feature=["ocrHighResolution"]` 以启用附加功能。有关更多信息，请参见：https://aka.ms/azsdk/python/documentintelligence/analysisfeature。


```python
<!--IMPORTS:[{"imported": "AzureAIDocumentIntelligenceLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.doc_intelligence.AzureAIDocumentIntelligenceLoader.html", "title": "Azure AI Document Intelligence"}]-->
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
analysis_features = ["ocrHighResolution"]
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    analysis_features=analysis_features,
)

documents = loader.load()
```

输出包含具有高分辨率附加功能的 LangChain 文档：


```python
documents
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
