---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/unstructured_file.ipynb
---
# 非结构化

本笔记本介绍如何使用 `Unstructured` [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders) 加载多种类型的文件。`Unstructured` 目前支持加载文本文件、幻灯片、html、pdf、图像等。

有关在本地设置 Unstructured 的更多说明，包括设置所需的系统依赖项，请参见 [本指南](../../integrations/providers/unstructured.mdx)。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/document_loaders/file_loaders/unstructured/)|
| :--- | :--- | :---: | :---: |  :---: |
| [UnstructuredLoader](https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html) | [langchain_unstructured](https://python.langchain.com/api_reference/unstructured/index.html) | ✅ | ❌ | ✅ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| 非结构化加载器 | ✅ | ❌ |

## 设置

### 凭证

默认情况下，`langchain-unstructured` 安装了一个较小的占用空间，需要将分区逻辑卸载到非结构化 API，这需要一个 API 密钥。如果您使用本地安装，则不需要 API 密钥。要获取您的 API 密钥，请访问 [此网站](https://unstructured.io) 并获取一个 API 密钥，然后在下面的单元格中设置：


```python
import getpass
import os

if "UNSTRUCTURED_API_KEY" not in os.environ:
    os.environ["UNSTRUCTURED_API_KEY"] = getpass.getpass(
        "Enter your Unstructured API key: "
    )
```

### 安装

#### 正常安装

运行本笔记本其余部分所需的以下软件包。


```python
# Install package, compatible with API partitioning
%pip install --upgrade --quiet langchain-unstructured unstructured-client unstructured "unstructured[pdf]" python-magic
```

#### 本地安装

如果您希望在本地运行分区逻辑，则需要安装一组合适的系统依赖项，具体说明请参见[Unstructured文档](https://docs.unstructured.io/open-source/installation/full-installation)。

例如，在Mac上，您可以使用以下命令安装所需的依赖项：

```bash
# base dependencies
brew install libmagic poppler tesseract

# If parsing xml / html documents:
brew install libxml2 libxslt
```

您可以使用以下命令安装本地所需的`pip`依赖项：

```bash
pip install "langchain-unstructured[local]"
```

## 初始化

`UnstructuredLoader`允许从多种不同的文件类型加载。要了解有关`unstructured`包的所有信息，请参阅他们的[文档](https://docs.unstructured.io/open-source/introduction/overview)/。在此示例中，我们展示了如何从文本文件和PDF文件加载。


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
from langchain_unstructured import UnstructuredLoader

file_paths = [
    "./example_data/layout-parser-paper.pdf",
    "./example_data/state_of_the_union.txt",
]


loader = UnstructuredLoader(file_paths)
```

## 加载


```python
docs = loader.load()

docs[0]
```
```output
INFO: pikepdf C++ to Python logger bridge initialized
```


```output
Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': 'd3ce55f220dfb75891b4394a18bcb973'}, page_content='1 2 0 2')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': 'd3ce55f220dfb75891b4394a18bcb973'}
```
## 懒加载


```python
pages = []
for doc in loader.lazy_load():
    pages.append(doc)

pages[0]
```



```output
Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': 'd3ce55f220dfb75891b4394a18bcb973'}, page_content='1 2 0 2')
```


## 后处理

如果您需要在提取后对 `unstructured` 元素进行后处理，可以在实例化 `UnstructuredLoader` 时将一组 `str` -> `str` 函数传递给 `post_processors` 关键字参数。这同样适用于其他 Unstructured 加载器。以下是一个示例。
`str` -> `str` 函数传递给 `UnstructuredLoader` 实例化时的 `post_processors` 关键字参数。这同样适用于其他非结构化加载器。以下是一个示例。


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
from langchain_unstructured import UnstructuredLoader
from unstructured.cleaners.core import clean_extra_whitespace

loader = UnstructuredLoader(
    "./example_data/layout-parser-paper.pdf",
    post_processors=[clean_extra_whitespace],
)

docs = loader.load()

docs[5:10]
```



```output
[Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 393.9), (16.34, 560.0), (36.34, 560.0), (36.34, 393.9)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'parent_id': '89565df026a24279aaea20dc08cedbec', 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': 'e9fa370aef7ee5c05744eb7bb7d9981b'}, page_content='2 v 8 4 3 5 1 . 3 0 1 2 : v i X r a'),
 Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((157.62199999999999, 114.23496279999995), (157.62199999999999, 146.5141628), (457.7358962799999, 146.5141628), (457.7358962799999, 114.23496279999995)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'filetype': 'application/pdf', 'category': 'Title', 'element_id': 'bde0b230a1aa488e3ce837d33015181b'}, page_content='LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis'),
 Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((134.809, 168.64029940800003), (134.809, 192.2517444), (480.5464199080001, 192.2517444), (480.5464199080001, 168.64029940800003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'parent_id': 'bde0b230a1aa488e3ce837d33015181b', 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': '54700f902899f0c8c90488fa8d825bce'}, page_content='Zejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain Lee4, Jacob Carlson3, and Weining Li5'),
 Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((207.23000000000002, 202.57205439999996), (207.23000000000002, 311.8195408), (408.12676, 311.8195408), (408.12676, 202.57205439999996)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'page_number': 1, 'parent_id': 'bde0b230a1aa488e3ce837d33015181b', 'filetype': 'application/pdf', 'category': 'UncategorizedText', 'element_id': 'b650f5867bad9bb4e30384282c79bcfe'}, page_content='1 Allen Institute for AI shannons@allenai.org 2 Brown University ruochen zhang@brown.edu 3 Harvard University {melissadell,jacob carlson}@fas.harvard.edu 4 University of Washington bcgl@cs.washington.edu 5 University of Waterloo w422li@uwaterloo.ca'),
 Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((162.779, 338.45008160000003), (162.779, 566.8455408), (454.0372021523199, 566.8455408), (454.0372021523199, 338.45008160000003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'file_directory': './example_data', 'filename': 'layout-parser-paper.pdf', 'languages': ['eng'], 'last_modified': '2024-02-27T15:49:27', 'links': [{'text': ':// layout - parser . github . io', 'url': 'https://layout-parser.github.io', 'start_index': 1477}], 'page_number': 1, 'parent_id': 'bde0b230a1aa488e3ce837d33015181b', 'filetype': 'application/pdf', 'category': 'NarrativeText', 'element_id': 'cfc957c94fe63c8fd7c7f4bcb56e75a7'}, page_content='Abstract. Recent advances in document image analysis (DIA) have been primarily driven by the application of neural networks. Ideally, research outcomes could be easily deployed in production and extended for further investigation. However, various factors like loosely organized codebases and sophisticated model conﬁgurations complicate the easy reuse of im- portant innovations by a wide audience. Though there have been on-going eﬀorts to improve reusability and simplify deep learning (DL) model development in disciplines like natural language processing and computer vision, none of them are optimized for challenges in the domain of DIA. This represents a major gap in the existing toolkit, as DIA is central to academic research across a wide range of disciplines in the social sciences and humanities. This paper introduces LayoutParser, an open-source library for streamlining the usage of DL in DIA research and applica- tions. The core LayoutParser library comes with a set of simple and intuitive interfaces for applying and customizing DL models for layout de- tection, character recognition, and many other document processing tasks. To promote extensibility, LayoutParser also incorporates a community platform for sharing both pre-trained models and full document digiti- zation pipelines. We demonstrate that LayoutParser is helpful for both lightweight and large-scale digitization pipelines in real-word use cases. The library is publicly available at https://layout-parser.github.io.')]
```


## 非结构化 API

如果您想快速启动并运行较小的包，并获取最新的分区信息，可以使用 `pip install
unstructured-client` 和 `pip install langchain-unstructured`。有关
 `UnstructuredLoader` 的更多信息，请参考
[非结构化大模型供应商页面](https://python.langchain.com/v0.1/docs/integrations/document_loaders/unstructured_file/)。

当您传入时，加载器将使用托管的非结构化无服务器 API 处理您的文档
您的 `api_key` 并设置 `partition_via_api=True`。您可以免费生成一个
非结构化 API 密钥 [在这里](https://unstructured.io/api-key/)。

查看说明 [在这里](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image)
如果您想自托管非结构化 API 或在本地运行它。


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
from langchain_unstructured import UnstructuredLoader

loader = UnstructuredLoader(
    file_path="example_data/fake.docx",
    api_key=os.getenv("UNSTRUCTURED_API_KEY"),
    partition_via_api=True,
)

docs = loader.load()
docs[0]
```
```output
INFO: Preparing to split document for partition.
INFO: Given file doesn't have '.pdf' extension, so splitting is not enabled.
INFO: Partitioning without split.
INFO: Successfully partitioned the document.
```


```output
Document(metadata={'source': 'example_data/fake.docx', 'category_depth': 0, 'filename': 'fake.docx', 'languages': ['por', 'cat'], 'filetype': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'category': 'Title', 'element_id': '56d531394823d81787d77a04462ed096'}, page_content='Lorem ipsum dolor sit amet.')
```


您还可以通过非结构化 API 在单个 API 中批量处理多个文件，使用 `UnstructuredLoader`。


```python
loader = UnstructuredLoader(
    file_path=["example_data/fake.docx", "example_data/fake-email.eml"],
    api_key=os.getenv("UNSTRUCTURED_API_KEY"),
    partition_via_api=True,
)

docs = loader.load()

print(docs[0].metadata["filename"], ": ", docs[0].page_content[:100])
print(docs[-1].metadata["filename"], ": ", docs[-1].page_content[:100])
```
```output
INFO: Preparing to split document for partition.
INFO: Given file doesn't have '.pdf' extension, so splitting is not enabled.
INFO: Partitioning without split.
INFO: Successfully partitioned the document.
INFO: Preparing to split document for partition.
INFO: Given file doesn't have '.pdf' extension, so splitting is not enabled.
INFO: Partitioning without split.
INFO: Successfully partitioned the document.
``````output
fake.docx :  Lorem ipsum dolor sit amet.
fake-email.eml :  Violets are blue
```
### 非结构化 SDK 客户端

使用非结构化 API 进行分区依赖于 [非结构化 SDK
客户端](https://docs.unstructured.io/api-reference/api-services/accessing-unstructured-api)。

如果您想自定义客户端，您需要将 `UnstructuredClient` 实例传递给 `UnstructuredLoader`。以下是一个示例，展示了如何自定义客户端的功能，例如使用您自己的 `requests.Session()`、传递替代的 `server_url`，以及自定义 `RetryConfig` 对象。有关自定义客户端或 SDK 客户端接受的其他参数的更多信息，请参阅 [非结构化 Python SDK](https://docs.unstructured.io/api-reference/api-services/sdk-python) 文档和 [API 参数](https://docs.unstructured.io/api-reference/api-services/api-parameters) 文档的客户端部分。请注意，所有 API 参数都应传递给 `UnstructuredLoader`。

<div class="alert alert-block alert-warning"><b>Warning:</b> The example below may not use the latest version of the UnstructuredClient and there could be breaking changes in future releases. For the latest examples, refer to the <a href="https://docs.unstructured.io/api-reference/api-services/sdk-python">Unstructured Python SDK</a> docs.</div>


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
import requests
from langchain_unstructured import UnstructuredLoader
from unstructured_client import UnstructuredClient
from unstructured_client.utils import BackoffStrategy, RetryConfig

client = UnstructuredClient(
    api_key_auth=os.getenv(
        "UNSTRUCTURED_API_KEY"
    ),  # Note: the client API param is "api_key_auth" instead of "api_key"
    client=requests.Session(),  # Define your own requests session
    server_url="https://api.unstructuredapp.io/general/v0/general",  # Define your own api url
    retry_config=RetryConfig(
        strategy="backoff",
        retry_connection_errors=True,
        backoff=BackoffStrategy(
            initial_interval=500,
            max_interval=60000,
            exponent=1.5,
            max_elapsed_time=900000,
        ),
    ),  # Define your own retry config
)

loader = UnstructuredLoader(
    "./example_data/layout-parser-paper.pdf",
    partition_via_api=True,
    client=client,
    split_pdf_page=True,
    split_pdf_page_range=[1, 10],
)

docs = loader.load()

print(docs[0].metadata["filename"], ": ", docs[0].page_content[:100])
```
```output
INFO: Preparing to split document for partition.
INFO: Concurrency level set to 5
INFO: Splitting pages 1 to 10 (10 total)
INFO: Determined optimal split size of 2 pages.
INFO: Partitioning 5 files with 2 page(s) each.
INFO: Partitioning set #1 (pages 1-2).
INFO: Partitioning set #2 (pages 3-4).
INFO: Partitioning set #3 (pages 5-6).
INFO: Partitioning set #4 (pages 7-8).
INFO: Partitioning set #5 (pages 9-10).
INFO: HTTP Request: POST https://api.unstructuredapp.io/general/v0/general "HTTP/1.1 200 OK"
INFO: HTTP Request: POST https://api.unstructuredapp.io/general/v0/general "HTTP/1.1 200 OK"
INFO: HTTP Request: POST https://api.unstructuredapp.io/general/v0/general "HTTP/1.1 200 OK"
INFO: HTTP Request: POST https://api.unstructuredapp.io/general/v0/general "HTTP/1.1 200 OK"
INFO: Successfully partitioned set #1, elements added to the final result.
INFO: Successfully partitioned set #2, elements added to the final result.
INFO: Successfully partitioned set #3, elements added to the final result.
INFO: Successfully partitioned set #4, elements added to the final result.
INFO: Successfully partitioned set #5, elements added to the final result.
INFO: Successfully partitioned the document.
``````output
layout-parser-paper.pdf :  LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis
```
## 分块

`UnstructuredLoader` 不支持 `mode` 作为参数来像旧版的 `UnstructuredFileLoader` 和其他加载器那样对文本进行分组。
它支持“分块”。在非结构化数据中，分块与您可能熟悉的其他分块机制有所不同，这些机制形成的块基于
的内容。
在纯文本特征上--像"\n\n"或"\n"这样的字符序列可能表示一个段落
边界或列表项边界。相反，所有文档都是使用关于每个文档格式的特定知识进行拆分的
以将文档划分为语义单元（文档元素），我们只需要
在单个元素超过所需的最大块大小时才 resort to text-splitting。一般来说，
分块将连续元素组合成尽可能大的块，而不超过
最大块大小。分块生成一系列CompositeElement、Table或TableChunk元素。
每个“块”是这三种类型之一的实例。

有关分块选项的更多详细信息，请参见此[页面](https://docs.unstructured.io/open-source/core-functionality/chunking)，但要重现与`mode="single"`相同的行为，您可以设置
`chunking_strategy="basic"`、`max_characters=<some-really-big-number>`和`include_orig_elements=False`。
`chunking_strategy="basic"`、`max_characters=<some-really-big-number>` 和 `include_orig_elements=False`。


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
from langchain_unstructured import UnstructuredLoader

loader = UnstructuredLoader(
    "./example_data/layout-parser-paper.pdf",
    chunking_strategy="basic",
    max_characters=1000000,
    include_orig_elements=False,
)

docs = loader.load()

print("Number of LangChain documents:", len(docs))
print("Length of text in the document:", len(docs[0].page_content))
```
```output
Number of LangChain documents: 1
Length of text in the document: 42772
```
## 加载网页

`UnstructuredLoader` 在本地运行时接受一个 `web_url` 关键字参数，该参数填充底层 Unstructured [分区](https://docs.unstructured.io/open-source/core-functionality/partitioning) 的 `url` 参数。这允许解析远程托管的文档，例如 HTML 网页。

示例用法：


```python
<!--IMPORTS:[{"imported": "UnstructuredLoader", "source": "langchain_unstructured", "docs": "https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html", "title": "Unstructured"}]-->
from langchain_unstructured import UnstructuredLoader

loader = UnstructuredLoader(web_url="https://www.example.com")
docs = loader.load()

for doc in docs:
    print(f"{doc}\n")
```
```output
page_content='Example Domain' metadata={'category_depth': 0, 'languages': ['eng'], 'filetype': 'text/html', 'url': 'https://www.example.com', 'category': 'Title', 'element_id': 'fdaa78d856f9d143aeeed85bf23f58f8'}

page_content='This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.' metadata={'languages': ['eng'], 'parent_id': 'fdaa78d856f9d143aeeed85bf23f58f8', 'filetype': 'text/html', 'url': 'https://www.example.com', 'category': 'NarrativeText', 'element_id': '3652b8458b0688639f973fe36253c992'}

page_content='More information...' metadata={'category_depth': 0, 'link_texts': ['More information...'], 'link_urls': ['https://www.iana.org/domains/example'], 'languages': ['eng'], 'filetype': 'text/html', 'url': 'https://www.example.com', 'category': 'Title', 'element_id': '793ab98565d6f6d6f3a6d614e3ace2a9'}
```
## API 参考

有关所有 `UnstructuredLoader` 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/unstructured/document_loaders/langchain_unstructured.document_loaders.UnstructuredLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
