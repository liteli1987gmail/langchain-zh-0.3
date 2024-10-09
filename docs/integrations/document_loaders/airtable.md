---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/airtable.ipynb
---
# Airtable


```python
%pip install --upgrade --quiet  pyairtable
```


```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

* 在[这里](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)获取您的API密钥。
* 在[这里](https://airtable.com/developers/web/api/introduction)获取您的基础ID。
* 从表格网址获取您的表格ID，如[这里](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)所示。


```python
api_key = "xxx"
base_id = "xxx"
table_id = "xxx"
view = "xxx"  # optional
```


```python
loader = AirtableLoader(api_key, table_id, base_id, view=view)
docs = loader.load()
```

将每个表格行返回为`dict`。


```python
len(docs)
```



```output
3
```



```python
eval(docs[0].page_content)
```



```output
{'id': 'recF3GbGZCuh9sXIQ',
 'createdTime': '2023-06-09T04:47:21.000Z',
 'fields': {'Priority': 'High',
  'Status': 'In progress',
  'Name': 'Document Splitters'}}
```



## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器[使用指南](/docs/how_to/#document-loaders)
