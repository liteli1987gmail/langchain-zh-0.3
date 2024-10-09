---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/pdfplumber.ipynb
---
# PDFPlumber

与 PyMuPDF 类似，输出的文档包含关于 PDF 及其页面的详细元数据，并且每页返回一个文档。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [PDFPlumberLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PDFPlumberLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持 |
| :---: | :---: | :---: |
| PDFPlumberLoader | ✅ | ❌ |

## 设置

### 凭证

使用此加载器不需要凭证。

如果您想要自动获取模型调用的最佳追踪，可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


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
<!--IMPORTS:[{"imported": "PDFPlumberLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PDFPlumberLoader.html", "title": "PDFPlumber"}]-->
from langchain_community.document_loaders import PDFPlumberLoader

loader = PDFPlumberLoader("./example_data/layout-parser-paper.pdf")
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/layout-parser-paper.pdf', 'file_path': './example_data/layout-parser-paper.pdf', 'page': 0, 'total_pages': 16, 'Author': '', 'CreationDate': 'D:20210622012710Z', 'Creator': 'LaTeX with hyperref', 'Keywords': '', 'ModDate': 'D:20210622012710Z', 'PTEX.Fullbanner': 'This is pdfTeX, Version 3.14159265-2.6-1.40.21 (TeX Live 2020) kpathsea version 6.3.2', 'Producer': 'pdfTeX-1.40.21', 'Subject': '', 'Title': '', 'Trapped': 'False'}, page_content='LayoutParser: A Unified Toolkit for Deep\nLearning Based Document Image Analysis\nZejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain\nLee4, Jacob Carlson3, and Weining Li5\n1 Allen Institute for AI\nshannons@allenai.org\n2 Brown University\nruochen zhang@brown.edu\n3 Harvard University\n{melissadell,jacob carlson}@fas.harvard.edu\n4 University of Washington\nbcgl@cs.washington.edu\n5 University of Waterloo\nw422li@uwaterloo.ca\nAbstract. Recentadvancesindocumentimageanalysis(DIA)havebeen\nprimarily driven by the application of neural networks. Ideally, research\noutcomescouldbeeasilydeployedinproductionandextendedforfurther\ninvestigation. However, various factors like loosely organized codebases\nand sophisticated model configurations complicate the easy reuse of im-\nportantinnovationsbyawideaudience.Thoughtherehavebeenon-going\nefforts to improve reusability and simplify deep learning (DL) model\ndevelopmentindisciplineslikenaturallanguageprocessingandcomputer\nvision, none of them are optimized for challenges in the domain of DIA.\nThis represents a major gap in the existing toolkit, as DIA is central to\nacademicresearchacross awiderangeof disciplinesinthesocialsciences\nand humanities. This paper introduces LayoutParser, an open-source\nlibrary for streamlining the usage of DL in DIA research and applica-\ntions. The core LayoutParser library comes with a set of simple and\nintuitiveinterfacesforapplyingandcustomizingDLmodelsforlayoutde-\ntection,characterrecognition,andmanyotherdocumentprocessingtasks.\nTo promote extensibility, LayoutParser also incorporates a community\nplatform for sharing both pre-trained models and full document digiti-\nzation pipelines. We demonstrate that LayoutParser is helpful for both\nlightweight and large-scale digitization pipelines in real-word use cases.\nThe library is publicly available at https://layout-parser.github.io.\nKeywords: DocumentImageAnalysis·DeepLearning·LayoutAnalysis\n· Character Recognition · Open Source library · Toolkit.\n1 Introduction\nDeep Learning(DL)-based approaches are the state-of-the-art for a wide range of\ndocumentimageanalysis(DIA)tasksincludingdocumentimageclassification[11,\n1202\nnuJ\n12\n]VC.sc[\n2v84351.3012:viXra\n')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/layout-parser-paper.pdf', 'file_path': './example_data/layout-parser-paper.pdf', 'page': 0, 'total_pages': 16, 'Author': '', 'CreationDate': 'D:20210622012710Z', 'Creator': 'LaTeX with hyperref', 'Keywords': '', 'ModDate': 'D:20210622012710Z', 'PTEX.Fullbanner': 'This is pdfTeX, Version 3.14159265-2.6-1.40.21 (TeX Live 2020) kpathsea version 6.3.2', 'Producer': 'pdfTeX-1.40.21', 'Subject': '', 'Title': '', 'Trapped': 'False'}
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

有关所有 PDFPlumberLoader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PDFPlumberLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
