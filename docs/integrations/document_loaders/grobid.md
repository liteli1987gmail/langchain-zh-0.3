---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/grobid.ipynb
---
# Grobid

GROBID 是一个用于提取、解析和重构原始文档的机器学习库。

它旨在并预计用于解析学术论文，在这方面表现尤为出色。注意：如果提供给 Grobid 的文章是超过一定元素数量的大型文档（例如，论文），可能无法处理。

该加载器使用 Grobid 将 PDF 解析为保留与文本部分相关的元数据的 `Documents`。

---
The best approach is to install Grobid via docker, see https://grobid.readthedocs.io/en/latest/Grobid-docker/. 

(Note: additional instructions can be found [here](/docs/integrations/providers/grobid).)

Once grobid is up-and-running you can interact as described below. 


Now, we can use the data loader.


```python
<!--IMPORTS:[{"imported": "GenericLoader", "source": "langchain_community.document_loaders.generic", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.generic.GenericLoader.html", "title": "Grobid"}, {"imported": "GrobidParser", "source": "langchain_community.document_loaders.parsers", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.parsers.grobid.GrobidParser.html", "title": "Grobid"}]-->
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import GrobidParser
```


```python
loader = GenericLoader.from_filesystem(
    "../Papers/",
    glob="*",
    suffixes=[".pdf"],
    parser=GrobidParser(segment_sentences=False),
)
docs = loader.load()
```


```python
docs[3].page_content
```



```output
'Unlike Chinchilla, PaLM, or GPT-3, we only use publicly available data, making our work compatible with open-sourcing, while most existing models rely on data which is either not publicly available or undocumented (e.g."Books -2TB" or "Social media conversations").There exist some exceptions, notably OPT (Zhang et al., 2022), GPT-NeoX (Black et al., 2022), BLOOM (Scao et al., 2022) and GLM (Zeng et al., 2022), but none that are competitive with PaLM-62B or Chinchilla.'
```



```python
docs[3].metadata
```



```output
{'text': 'Unlike Chinchilla, PaLM, or GPT-3, we only use publicly available data, making our work compatible with open-sourcing, while most existing models rely on data which is either not publicly available or undocumented (e.g."Books -2TB" or "Social media conversations").There exist some exceptions, notably OPT (Zhang et al., 2022), GPT-NeoX (Black et al., 2022), BLOOM (Scao et al., 2022) and GLM (Zeng et al., 2022), but none that are competitive with PaLM-62B or Chinchilla.',
 'para': '2',
 'bboxes': "[[{'page': '1', 'x': '317.05', 'y': '509.17', 'h': '207.73', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '522.72', 'h': '220.08', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '536.27', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '549.82', 'h': '218.65', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '563.37', 'h': '136.98', 'w': '9.46'}], [{'page': '1', 'x': '446.49', 'y': '563.37', 'h': '78.11', 'w': '9.46'}, {'page': '1', 'x': '304.69', 'y': '576.92', 'h': '138.32', 'w': '9.46'}], [{'page': '1', 'x': '447.75', 'y': '576.92', 'h': '76.66', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '590.47', 'h': '219.63', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '604.02', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '617.56', 'h': '218.27', 'w': '9.46'}, {'page': '1', 'x': '306.14', 'y': '631.11', 'h': '220.18', 'w': '9.46'}]]",
 'pages': "('1', '1')",
 'section_title': 'Introduction',
 'section_number': '1',
 'paper_title': 'LLaMA: Open and Efficient Foundation Language Models',
 'file_path': '/Users/31treehaus/Desktop/Papers/2302.13971.pdf'}
```



## Related

- Document loader [conceptual guide](/docs/concepts/#document-loaders)
- Document loader [how-to guides](/docs/how_to/#document-loaders)
