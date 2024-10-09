---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/duckdb.ipynb
---
# DuckDB

>[DuckDB](https://duckdb.org/) 是一个内嵌式 SQL OLAP 数据库管理系统。

加载一个每行一个文档的 `DuckDB` 查询。


```python
%pip install --upgrade --quiet  duckdb
```


```python
<!--IMPORTS:[{"imported": "DuckDBLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.duckdb_loader.DuckDBLoader.html", "title": "DuckDB"}]-->
from langchain_community.document_loaders import DuckDBLoader
```


```python
%%file example.csv
Team,Payroll
Nationals,81.34
Reds,82.20
```
```output
Writing example.csv
```

```python
loader = DuckDBLoader("SELECT * FROM read_csv_auto('example.csv')")

data = loader.load()
```


```python
print(data)
```
```output
[Document(page_content='Team: Nationals\nPayroll: 81.34', metadata={}), Document(page_content='Team: Reds\nPayroll: 82.2', metadata={})]
```
## 指定哪些列是内容与元数据


```python
loader = DuckDBLoader(
    "SELECT * FROM read_csv_auto('example.csv')",
    page_content_columns=["Team"],
    metadata_columns=["Payroll"],
)

data = loader.load()
```


```python
print(data)
```
```output
[Document(page_content='Team: Nationals', metadata={'Payroll': 81.34}), Document(page_content='Team: Reds', metadata={'Payroll': 82.2})]
```
## 向元数据添加来源


```python
loader = DuckDBLoader(
    "SELECT Team, Payroll, Team As source FROM read_csv_auto('example.csv')",
    metadata_columns=["source"],
)

data = loader.load()
```


```python
print(data)
```
```output
[Document(page_content='Team: Nationals\nPayroll: 81.34\nsource: Nationals', metadata={'source': 'Nationals'}), Document(page_content='Team: Reds\nPayroll: 82.2\nsource: Reds', metadata={'source': 'Reds'})]
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
