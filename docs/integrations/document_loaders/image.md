---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/image.ipynb
---
# 图片

这部分介绍了如何将图像加载到我们可以在其他LangChain模块中使用的文档格式中。

它使用[Unstructured](https://unstructured.io/)来处理多种图像格式，例如`.jpg`和`.png`。有关在本地设置Unstructured的更多说明，包括设置所需的系统依赖项，请参见[本指南](/docs/integrations/providers/unstructured/)。

## 使用Unstructured


```python
%pip install --upgrade --quiet "unstructured[all-docs]"
```


```python
<!--IMPORTS:[{"imported": "UnstructuredImageLoader", "source": "langchain_community.document_loaders.image", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.image.UnstructuredImageLoader.html", "title": "Images"}]-->
from langchain_community.document_loaders.image import UnstructuredImageLoader

loader = UnstructuredImageLoader("./example_data/layout-parser-paper-screenshot.png")

data = loader.load()

data[0]
```



```output
Document(page_content='2021\n\n2103.15348v2 [cs.CV] 21 Jun\n\narXiv\n\nLayoutParser: A Unified Toolkit for Deep Learning Based Document Image Analysis\n\nZejiang Shen! (&4), Ruochen Zhang?, Melissa Dell?, Benjamin Charles Germain Lee*, Jacob Carlson?, and Weining Li?\n\n1\n\nAllen Institute for AI shannons@allenai.org ? Brown University ruochen_zhang@brown. edu 3 Harvard University {melissadell, jacob_carlson}@fas.harvard.edu 4 University of Washington begl@cs.washington.edu 5 University of Waterloo w4221i@uwaterloo.ca\n\nAbstract. Recent advances in document image analysis (DIA) have been primarily driven by the application of neural networks. Ideally, research outcomes could be easily deployed in production and extended for further investigation. However, various factors like loosely organized codebases and sophisticated model configurations complicate the easy reuse of im- portant innovations by a wide audience. Though there have been on-going efforts to improve reusability and simplify deep learning (DL) model development in disciplines like natural language processing and computer vision, none of them are optimized for challenges in the domain of DIA. This represents a major gap in the existing toolkit, as DIA is central to academic research across a wide range of disciplines in the social sciences and humanities. This paper introduces LayoutParser, an open-source library for streamlining the usage of DL in DIA research and applica- tions. The core LayoutParser library comes with a set of simple and intuitive interfaces for applying and customizing DL models for layout de- tection, character recognition, and many other document processing tasks. To promote extensibility, LayoutParser also incorporates a community platform for sharing both pre-trained models and full document digiti- zation pipelines. We demonstrate that LayoutParser is helpful for both lightweight and large-scale digitization pipelines in real-word use cases. The library is publicly available at https: //layout-parser.github. io.\n\nKeywords: Document Image Analysis - Deep Learning - Layout Analysis - Character Recognition - Open Source library - Toolkit.\n\n1 Introduction\n\nDeep Learning(DL)-based approaches are the state-of-the-art for a wide range of document image analysis (DIA) tasks including document image classification [11,', metadata={'source': './example_data/layout-parser-paper-screenshot.png'})
```


### 保留元素

在底层，Unstructured 为不同的文本块创建不同的“元素”。默认情况下，我们将这些元素组合在一起，但您可以通过指定 `mode="elements"` 来保持这种分离。


```python
loader = UnstructuredImageLoader(
    "./example_data/layout-parser-paper-screenshot.png", mode="elements"
)

data = loader.load()

data[0]
```



```output
Document(page_content='2021', metadata={'source': './example_data/layout-parser-paper-screenshot.png', 'coordinates': {'points': ((47.0, 492.0), (47.0, 591.0), (83.0, 591.0), (83.0, 492.0)), 'system': 'PixelSpace', 'layout_width': 1624, 'layout_height': 1920}, 'last_modified': '2024-07-01T10:38:29', 'filetype': 'PNG', 'languages': ['eng'], 'page_number': 1, 'file_directory': './example_data', 'filename': 'layout-parser-paper-screenshot.png', 'category': 'UncategorizedText'})
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
