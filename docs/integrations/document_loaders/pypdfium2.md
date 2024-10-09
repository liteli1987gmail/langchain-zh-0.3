---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/pypdfium2.ipynb
---
# PyPDFium2加载器


本笔记本提供了一个快速概述，帮助您开始使用PyPDFium2 [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders)。有关所有__ModuleName__Loader功能和配置的详细文档，请访问[API参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFium2Loader.html)。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | JS支持|
| :--- | :--- | :---: | :---: |  :---: |
| [PyPDFium2加载器](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFium2Loader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器功能
| 源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| PyPDFium2Loader | ✅ | ❌ |

## 设置


要访问 PyPDFium2 文档加载器，您需要安装 `LangChain 社区` 集成包。

### 凭证

不需要凭证。

如果您想获得自动化的最佳模型调用追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community**。


```python
%pip install -qU langchain_community
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：


```python
<!--IMPORTS:[{"imported": "PyPDFium2Loader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFium2Loader.html", "title": "PyPDFium2Loader"}]-->
from langchain_community.document_loaders import PyPDFium2Loader

file_path = "./example_data/layout-parser-paper.pdf"
loader = PyPDFium2Loader(file_path)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'page': 0}, page_content='LayoutParser: A Unified Toolkit for Deep\r\nLearning Based Document Image Analysis\r\nZejiang Shen\r\n1\r\n(), Ruochen Zhang\r\n2\r\n, Melissa Dell\r\n3\r\n, Benjamin Charles Germain\r\nLee\r\n4\r\n, Jacob Carlson\r\n3\r\n, and Weining Li\r\n5\r\n1 Allen Institute for AI\r\nshannons@allenai.org 2 Brown University\r\nruochen zhang@brown.edu 3 Harvard University\r\n{melissadell,jacob carlson}@fas.harvard.edu\r\n4 University of Washington\r\nbcgl@cs.washington.edu 5 University of Waterloo\r\nw422li@uwaterloo.ca\r\nAbstract. Recent advances in document image analysis (DIA) have been\r\nprimarily driven by the application of neural networks. Ideally, research\r\noutcomes could be easily deployed in production and extended for further\r\ninvestigation. However, various factors like loosely organized codebases\r\nand sophisticated model configurations complicate the easy reuse of im\x02portant innovations by a wide audience. Though there have been on-going\r\nefforts to improve reusability and simplify deep learning (DL) model\r\ndevelopment in disciplines like natural language processing and computer\r\nvision, none of them are optimized for challenges in the domain of DIA.\r\nThis represents a major gap in the existing toolkit, as DIA is central to\r\nacademic research across a wide range of disciplines in the social sciences\r\nand humanities. This paper introduces LayoutParser, an open-source\r\nlibrary for streamlining the usage of DL in DIA research and applica\x02tions. The core LayoutParser library comes with a set of simple and\r\nintuitive interfaces for applying and customizing DL models for layout de\x02tection, character recognition, and many other document processing tasks.\r\nTo promote extensibility, LayoutParser also incorporates a community\r\nplatform for sharing both pre-trained models and full document digiti\x02zation pipelines. We demonstrate that LayoutParser is helpful for both\r\nlightweight and large-scale digitization pipelines in real-word use cases.\r\nThe library is publicly available at https://layout-parser.github.io.\r\nKeywords: Document Image Analysis· Deep Learning· Layout Analysis\r\n· Character Recognition· Open Source library· Toolkit.\r\n1 Introduction\r\nDeep Learning(DL)-based approaches are the state-of-the-art for a wide range of\r\ndocument image analysis (DIA) tasks including document image classification [11,\r\narXiv:2103.15348v2 [cs.CV] 21 Jun 2021\n')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/layout-parser-paper.pdf', 'page': 0}
```
## 延迟加载


```python
page = []
for doc in loader.lazy_load():
    page.append(doc)
    if len(page) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        page = []
```

## API 参考

有关所有 PyPDFium2Loader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFium2Loader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
