---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/pypdfloader.ipynb
---
# PyPDFLoader

本笔记本提供了一个快速概述，帮助您开始使用 `PyPDF` [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders)。有关所有 DocumentLoader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html)。


## 概述
### 集成细节


| 类 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [PyPDFLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持 |
| :---: | :---: | :---: |
| PyPDFLoader | ✅ | ❌ |

## 设置

### 凭证

使用 `PyPDFLoader` 不需要任何凭证。

### 安装

要使用 `PyPDFLoader`，您需要下载 `langchain-community` Python 包：


```python
%pip install -qU langchain_community pypdf
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：


```python
<!--IMPORTS:[{"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "PyPDFLoader"}]-->
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader(
    "./example_data/layout-parser-paper.pdf",
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'page': 0}, page_content='LayoutParser : A Uniﬁed Toolkit for Deep\nLearning Based Document Image Analysis\nZejiang Shen1( \x00), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain\nLee4, Jacob Carlson3, and Weining Li5\n1Allen Institute for AI\nshannons@allenai.org\n2Brown University\nruochen zhang@brown.edu\n3Harvard University\n{melissadell,jacob carlson }@fas.harvard.edu\n4University of Washington\nbcgl@cs.washington.edu\n5University of Waterloo\nw422li@uwaterloo.ca\nAbstract. Recent advances in document image analysis (DIA) have been\nprimarily driven by the application of neural networks. Ideally, research\noutcomes could be easily deployed in production and extended for further\ninvestigation. However, various factors like loosely organized codebases\nand sophisticated model conﬁgurations complicate the easy reuse of im-\nportant innovations by a wide audience. Though there have been on-going\neﬀorts to improve reusability and simplify deep learning (DL) model\ndevelopment in disciplines like natural language processing and computer\nvision, none of them are optimized for challenges in the domain of DIA.\nThis represents a major gap in the existing toolkit, as DIA is central to\nacademic research across a wide range of disciplines in the social sciences\nand humanities. This paper introduces LayoutParser , an open-source\nlibrary for streamlining the usage of DL in DIA research and applica-\ntions. The core LayoutParser library comes with a set of simple and\nintuitive interfaces for applying and customizing DL models for layout de-\ntection, character recognition, and many other document processing tasks.\nTo promote extensibility, LayoutParser also incorporates a community\nplatform for sharing both pre-trained models and full document digiti-\nzation pipelines. We demonstrate that LayoutParser is helpful for both\nlightweight and large-scale digitization pipelines in real-word use cases.\nThe library is publicly available at https://layout-parser.github.io .\nKeywords: Document Image Analysis ·Deep Learning ·Layout Analysis\n·Character Recognition ·Open Source library ·Toolkit.\n1 Introduction\nDeep Learning(DL)-based approaches are the state-of-the-art for a wide range of\ndocument image analysis (DIA) tasks including document image classiﬁcation [ 11,arXiv:2103.15348v2  [cs.CV]  21 Jun 2021')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/layout-parser-paper.pdf', 'page': 0}
```
## 延迟加载



```python
pages = []
for doc in loader.lazy_load():
    pages.append(doc)
    if len(pages) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        pages = []
len(pages)
```



```output
6
```



```python
print(pages[0].page_content[:100])
print(pages[0].metadata)
```
```output
LayoutParser : A Uniﬁed Toolkit for DL-Based DIA 11
focuses on precision, eﬃciency, and robustness. 
{'source': './example_data/layout-parser-paper.pdf', 'page': 10}
```
## API 参考

有关所有 `PyPDFLoader` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
