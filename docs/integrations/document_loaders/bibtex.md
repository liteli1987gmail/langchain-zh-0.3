---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/bibtex.ipynb
---
# BibTeX

>[BibTeX](https://www.ctan.org/pkg/bibtex) 是一种文件格式和参考管理系统，通常与 `LaTeX` 排版一起使用。它作为一种组织和存储学术和研究文档的书目资料的方法。

`BibTeX` 文件具有 `.bib` 扩展名，由表示对各种出版物（如书籍、文章、会议论文、学位论文等）的引用的纯文本条目组成。每个 `BibTeX` 条目遵循特定结构，并包含不同书目细节的字段，如作者姓名、出版标题、期刊或书名、出版年份、页码等。

BibTeX 文件还可以存储文档的路径，例如可以检索的 `.pdf` 文件。

## 安装
首先，您需要安装 `bibtexparser` 和 `PyMuPDF`。


```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## 示例

`BibtexLoader` 具有以下参数：
- `file_path`: `.bib` bibtex 文件的路径
- 可选 `max_docs`: 默认=None，即不限制。用于限制检索到的文档数量。
- 可选 `max_content_chars`: 默认=4000。用于限制单个文档中的字符数。
- 可选 `load_extra_meta`: 默认=False。默认情况下，仅从 bibtex 条目中加载最重要的字段：`Published`（出版年份）、`Title`、`Authors`、`Summary`、`Journal`、`Keywords` 和 `URL`。如果为 True，还会尝试加载 `entry_id`、`note`、`doi` 和 `links` 字段。
- 可选 `file_pattern`: 默认=`r'[^:]+\.pdf'`。用于在 `file` 条目中查找文件的正则表达式模式。默认模式支持 `Zotero` 风格的 bibtex 格式和裸文件路径。


```python
<!--IMPORTS:[{"imported": "BibtexLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.bibtex.BibtexLoader.html", "title": "BibTeX"}]-->
from langchain_community.document_loaders import BibtexLoader
```


```python
# Create a dummy bibtex file and download a pdf.
import urllib.request

urllib.request.urlretrieve(
    "https://www.fourmilab.ch/etexts/einstein/specrel/specrel.pdf", "einstein1905.pdf"
)

bibtex_text = """
    @article{einstein1915,
        title={Die Feldgleichungen der Gravitation},
        abstract={Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{\"a}tstheorie`` in den Sitzungsberichten der Preu{\ss}ischen Akademie der Wissenschaften 1915 ver{\"o}ffentlicht.},
        author={Einstein, Albert},
        journal={Sitzungsberichte der K{\"o}niglich Preu{\ss}ischen Akademie der Wissenschaften},
        volume={1915},
        number={1},
        pages={844--847},
        year={1915},
        doi={10.1002/andp.19163540702},
        link={https://onlinelibrary.wiley.com/doi/abs/10.1002/andp.19163540702},
        file={einstein1905.pdf}
    }
    """
# save bibtex_text to biblio.bib file
with open("./biblio.bib", "w") as file:
    file.write(bibtex_text)
```


```python
docs = BibtexLoader("./biblio.bib").load()
```


```python
docs[0].metadata
```



```output
{'id': 'einstein1915',
 'published_year': '1915',
 'title': 'Die Feldgleichungen der Gravitation',
 'publication': 'Sitzungsberichte der K{"o}niglich Preu{\\ss}ischen Akademie der Wissenschaften',
 'authors': 'Einstein, Albert',
 'abstract': 'Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{"a}tstheorie`` in den Sitzungsberichten der Preu{\\ss}ischen Akademie der Wissenschaften 1915 ver{"o}ffentlicht.',
 'url': 'https://doi.org/10.1002/andp.19163540702'}
```



```python
print(docs[0].page_content[:400])  # all pages of the pdf content
```
```output
ON THE ELECTRODYNAMICS OF MOVING
BODIES
By A. EINSTEIN
June 30, 1905
It is known that Maxwell’s electrodynamics—as usually understood at the
present time—when applied to moving bodies, leads to asymmetries which do
not appear to be inherent in the phenomena. Take, for example, the recipro-
cal electrodynamic action of a magnet and a conductor. The observable phe-
nomenon here depends only on the r
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
