---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/jupyter_notebook.ipynb
---
# Jupyter Notebook

>[Jupyter Notebook](https://en.wikipedia.org/wiki/Project_Jupyter#Applications)（前称 `IPython Notebook`）是一个基于网页的交互式计算环境，用于创建笔记本文档。

本笔记本介绍如何将数据从 `Jupyter notebook (.ipynb)` 加载到适合 LangChain 的格式中。


```python
<!--IMPORTS:[{"imported": "NotebookLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.notebook.NotebookLoader.html", "title": "Jupyter Notebook"}]-->
from langchain_community.document_loaders import NotebookLoader
```


```python
loader = NotebookLoader(
    "example_data/notebook.ipynb",
    include_outputs=True,
    max_output_length=20,
    remove_newline=True,
)
```

`NotebookLoader.load()` 将 `.ipynb` 笔记本文件加载到 `Document` 对象中。

**参数**:

* `include_outputs` (bool): 是否在生成的文档中包含单元输出（默认值为 False）。
* `max_output_length` (int): 从每个单元输出中包含的最大字符数（默认值为 10）。
* `remove_newline` (bool): 是否从单元源和输出中删除换行符（默认值为 False）。
* `traceback` (bool): 是否包含完整的回溯（默认值为 False）。


```python
loader.load()
```



```output
[Document(page_content='\'markdown\' cell: \'[\'# Notebook\', \'\', \'This notebook covers how to load data from an .html notebook into a format suitable by LangChain.\']\'\n\n \'code\' cell: \'[\'from langchain_community.document_loaders import NotebookLoader\']\'\n\n \'code\' cell: \'[\'loader = NotebookLoader("example_data/notebook.html")\']\'\n\n \'markdown\' cell: \'[\'`NotebookLoader.load()` loads the `.html` notebook file into a `Document` object.\', \'\', \'**Parameters**:\', \'\', \'* `include_outputs` (bool): whether to include cell outputs in the resulting document (default is False).\', \'* `max_output_length` (int): the maximum number of characters to include from each cell output (default is 10).\', \'* `remove_newline` (bool): whether to remove newline characters from the cell sources and outputs (default is False).\', \'* `traceback` (bool): whether to include full traceback (default is False).\']\'\n\n \'code\' cell: \'[\'loader.load(include_outputs=True, max_output_length=20, remove_newline=True)\']\'\n\n', metadata={'source': 'example_data/notebook.html'})]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
