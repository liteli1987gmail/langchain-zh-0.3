---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/llmsherpa.ipynb
---
# LLM Sherpa

本笔记本介绍如何使用 `LLM Sherpa` 加载多种类型的文件。`LLM Sherpa` 支持多种文件格式，包括 DOCX、PPTX、HTML、TXT 和 XML。

`LLMSherpaFileLoader` 使用 LayoutPDFReader，这是 LLMSherpa 库的一部分。该工具旨在解析 PDF，同时保留其布局信息，而在使用大多数 PDF 转文本解析器时，这些信息通常会丢失。

以下是 LayoutPDFReader 的一些关键特性：

* 它可以识别并提取章节和子章节及其级别。
* 它可以将行合并成段落。
* 它可以识别章节和段落之间的链接。
* 它可以提取表格以及表格所在的章节。
* 它可以识别并提取列表和嵌套列表。
* 它可以连接跨页的内容。
* 它可以去除重复的页眉和页脚。
* 它可以去除水印。

查看 [llmsherpa](https://llmsherpa.readthedocs.io/en/latest/) 文档。

`信息：该库在某些 PDF 文件上可能会失败，因此请谨慎使用。`


```python
# Install package
# !pip install --upgrade --quiet llmsherpa
```

## LLMSherpa文件加载器

在底层，LLMSherpa文件加载器定义了一些策略来加载文件内容： ["sections", "chunks", "html", "text"]，设置[nlm-ingestor](https://github.com/nlmatics/nlm-ingestor)以获取`llmsherpa_api_url`或使用默认值。

### sections策略：将文件解析为多个部分


```python
<!--IMPORTS:[{"imported": "LLMSherpaFileLoader", "source": "langchain_community.document_loaders.llmsherpa", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.llmsherpa.LLMSherpaFileLoader.html", "title": "LLM Sherpa"}]-->
from langchain_community.document_loaders.llmsherpa import LLMSherpaFileLoader

loader = LLMSherpaFileLoader(
    file_path="https://arxiv.org/pdf/2402.14207.pdf",
    new_indent_parser=True,
    apply_ocr=True,
    strategy="sections",
    llmsherpa_api_url="http://localhost:5010/api/parseDocument?renderFormat=all",
)
docs = loader.load()
```


```python
docs[1]
```



```output
Document(page_content='Abstract\nWe study how to apply large language models to write grounded and organized long-form articles from scratch, with comparable breadth and depth to Wikipedia pages.\nThis underexplored problem poses new challenges at the pre-writing stage, including how to research the topic and prepare an outline prior to writing.\nWe propose STORM, a writing system for the Synthesis of Topic Outlines through\nReferences\nFull-length Article\nTopic\nOutline\n2022 Winter Olympics\nOpening Ceremony\nResearch via Question Asking\nRetrieval and Multi-perspective Question Asking.\nSTORM models the pre-writing stage by\nLLM\n(1) discovering diverse perspectives in researching the given topic, (2) simulating conversations where writers carrying different perspectives pose questions to a topic expert grounded on trusted Internet sources, (3) curating the collected information to create an outline.\nFor evaluation, we curate FreshWiki, a dataset of recent high-quality Wikipedia articles, and formulate outline assessments to evaluate the pre-writing stage.\nWe further gather feedback from experienced Wikipedia editors.\nCompared to articles generated by an outlinedriven retrieval-augmented baseline, more of STORM’s articles are deemed to be organized (by a 25% absolute increase) and broad in coverage (by 10%).\nThe expert feedback also helps identify new challenges for generating grounded long articles, such as source bias transfer and over-association of unrelated facts.\n1. Can you provide any information about the transportation arrangements for the opening ceremony?\nLLM\n2. Can you provide any information about the budget for the 2022 Winter Olympics opening ceremony?…\nLLM- Role1\nLLM- Role2\nLLM- Role1', metadata={'source': 'https://arxiv.org/pdf/2402.14207.pdf', 'section_number': 1, 'section_title': 'Abstract'})
```



```python
len(docs)
```



```output
79
```


### chunks策略：将文件解析为多个块


```python
<!--IMPORTS:[{"imported": "LLMSherpaFileLoader", "source": "langchain_community.document_loaders.llmsherpa", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.llmsherpa.LLMSherpaFileLoader.html", "title": "LLM Sherpa"}]-->
from langchain_community.document_loaders.llmsherpa import LLMSherpaFileLoader

loader = LLMSherpaFileLoader(
    file_path="https://arxiv.org/pdf/2402.14207.pdf",
    new_indent_parser=True,
    apply_ocr=True,
    strategy="chunks",
    llmsherpa_api_url="http://localhost:5010/api/parseDocument?renderFormat=all",
)
docs = loader.load()
```


```python
docs[1]
```



```output
Document(page_content='Assisting in Writing Wikipedia-like Articles From Scratch with Large Language Models\nStanford University {shaoyj, yuchengj, tkanell, peterxu, okhattab}@stanford.edu lam@cs.stanford.edu', metadata={'source': 'https://arxiv.org/pdf/2402.14207.pdf', 'chunk_number': 1, 'chunk_type': 'para'})
```



```python
len(docs)
```



```output
306
```


### html策略：将文件作为一个html文档返回


```python
<!--IMPORTS:[{"imported": "LLMSherpaFileLoader", "source": "langchain_community.document_loaders.llmsherpa", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.llmsherpa.LLMSherpaFileLoader.html", "title": "LLM Sherpa"}]-->
from langchain_community.document_loaders.llmsherpa import LLMSherpaFileLoader

loader = LLMSherpaFileLoader(
    file_path="https://arxiv.org/pdf/2402.14207.pdf",
    new_indent_parser=True,
    apply_ocr=True,
    strategy="html",
    llmsherpa_api_url="http://localhost:5010/api/parseDocument?renderFormat=all",
)
docs = loader.load()
```


```python
docs[0].page_content[:400]
```



```output
'<html><h1>Assisting in Writing Wikipedia-like Articles From Scratch with Large Language Models</h1><table><th><td colSpan=1>Yijia Shao</td><td colSpan=1>Yucheng Jiang</td><td colSpan=1>Theodore A. Kanell</td><td colSpan=1>Peter Xu</td></th><tr><td colSpan=1></td><td colSpan=1>Omar Khattab</td><td colSpan=1>Monica S. Lam</td><td colSpan=1></td></tr></table><p>Stanford University {shaoyj, yuchengj, '
```



```python
len(docs)
```



```output
1
```


### text策略：将文件作为一个文本文档返回


```python
<!--IMPORTS:[{"imported": "LLMSherpaFileLoader", "source": "langchain_community.document_loaders.llmsherpa", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.llmsherpa.LLMSherpaFileLoader.html", "title": "LLM Sherpa"}]-->
from langchain_community.document_loaders.llmsherpa import LLMSherpaFileLoader

loader = LLMSherpaFileLoader(
    file_path="https://arxiv.org/pdf/2402.14207.pdf",
    new_indent_parser=True,
    apply_ocr=True,
    strategy="text",
    llmsherpa_api_url="http://localhost:5010/api/parseDocument?renderFormat=all",
)
docs = loader.load()
```


```python
docs[0].page_content[:400]
```



```output
'Assisting in Writing Wikipedia-like Articles From Scratch with Large Language Models\n | Yijia Shao | Yucheng Jiang | Theodore A. Kanell | Peter Xu\n | --- | --- | --- | ---\n |  | Omar Khattab | Monica S. Lam | \n\nStanford University {shaoyj, yuchengj, tkanell, peterxu, okhattab}@stanford.edu lam@cs.stanford.edu\nAbstract\nWe study how to apply large language models to write grounded and organized long'
```



```python
len(docs)
```



```output
1
```



## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器[使用指南](/docs/how_to/#document-loaders)