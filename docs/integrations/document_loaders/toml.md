---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/toml.ipynb
---
# TOML

>[TOML](https://en.wikipedia.org/wiki/TOML) 是一种配置文件的文件格式。它旨在易于阅读和编写，并设计为可以明确映射到字典。其规范是开源的。`TOML` 在许多编程语言中都有实现。`TOML` 的名称是“Tom 的明显、最小语言”的首字母缩写，指的是其创建者 Tom Preston-Werner。

如果您需要加载 `Toml` 文件，请使用 `TomlLoader`。


```python
<!--IMPORTS:[{"imported": "TomlLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.toml.TomlLoader.html", "title": "TOML"}]-->
from langchain_community.document_loaders import TomlLoader
```


```python
loader = TomlLoader("example_data/fake_rule.toml")
```


```python
rule = loader.load()
```


```python
rule
```



```output
[Document(page_content='{"internal": {"creation_date": "2023-05-01", "updated_date": "2022-05-01", "release": ["release_type"], "min_endpoint_version": "some_semantic_version", "os_list": ["operating_system_list"]}, "rule": {"uuid": "some_uuid", "name": "Fake Rule Name", "description": "Fake description of rule", "query": "process where process.name : \\"somequery\\"\\n", "threat": [{"framework": "MITRE ATT&CK", "tactic": {"name": "Execution", "id": "TA0002", "reference": "https://attack.mitre.org/tactics/TA0002/"}}]}}', metadata={'source': 'example_data/fake_rule.toml'})]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
