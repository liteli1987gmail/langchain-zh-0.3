---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/recursive_json_splitter.ipynb
---
# 如何分割 JSON 数据

这个 JSON 分割器在允许控制块大小的同时分割 JSON 数据。它深度优先遍历 JSON 数据并构建较小的 JSON 块。它尝试保持嵌套的 JSON 对象完整，但如果需要，会将其分割，以保持块在 min_chunk_size 和 max_chunk_size 之间。

如果值不是嵌套的 JSON，而是一个非常大的字符串，则该字符串不会被分割。如果您需要对块大小进行严格限制，可以考虑将其与递归文本分割器组合使用。还有一个可选的预处理步骤，可以通过先将列表转换为 JSON（字典）然后再进行分割来分割列表。

1. 文本如何分割：JSON 值。
2. 块大小如何测量：按字符数。


```python
%pip install -qU langchain-text-splitters
```

首先我们加载一些json数据：


```python
import json

import requests

# This is a large nested json object and will be loaded as a python dict
json_data = requests.get("https://api.smith.langchain.com/openapi.json").json()
```

## 基本用法

指定 `max_chunk_size` 来限制块大小：


```python
<!--IMPORTS:[{"imported": "RecursiveJsonSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/json/langchain_text_splitters.json.RecursiveJsonSplitter.html", "title": "How to split JSON data"}]-->
from langchain_text_splitters import RecursiveJsonSplitter

splitter = RecursiveJsonSplitter(max_chunk_size=300)
```

要获取json块，请使用 `.split_json` 方法：


```python
# Recursively split json data - If you need to access/manipulate the smaller json chunks
json_chunks = splitter.split_json(json_data=json_data)

for chunk in json_chunks[:3]:
    print(chunk)
```
```output
{'openapi': '3.1.0', 'info': {'title': 'LangSmith', 'version': '0.1.0'}, 'servers': [{'url': 'https://api.smith.langchain.com', 'description': 'LangSmith API endpoint.'}]}
{'paths': {'/api/v1/sessions/{session_id}': {'get': {'tags': ['tracer-sessions'], 'summary': 'Read Tracer Session', 'description': 'Get a specific session.', 'operationId': 'read_tracer_session_api_v1_sessions__session_id__get'}}}}
{'paths': {'/api/v1/sessions/{session_id}': {'get': {'security': [{'API Key': []}, {'Tenant ID': []}, {'Bearer Auth': []}]}}}}
```
要获取 LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 对象，请使用 `.create_documents` 方法：


```python
# The splitter can also output documents
docs = splitter.create_documents(texts=[json_data])

for doc in docs[:3]:
    print(doc)
```
```output
page_content='{"openapi": "3.1.0", "info": {"title": "LangSmith", "version": "0.1.0"}, "servers": [{"url": "https://api.smith.langchain.com", "description": "LangSmith API endpoint."}]}'
page_content='{"paths": {"/api/v1/sessions/{session_id}": {"get": {"tags": ["tracer-sessions"], "summary": "Read Tracer Session", "description": "Get a specific session.", "operationId": "read_tracer_session_api_v1_sessions__session_id__get"}}}}'
page_content='{"paths": {"/api/v1/sessions/{session_id}": {"get": {"security": [{"API Key": []}, {"Tenant ID": []}, {"Bearer Auth": []}]}}}}'
```
或者使用 `.split_text` 直接获取字符串内容：


```python
texts = splitter.split_text(json_data=json_data)

print(texts[0])
print(texts[1])
```
```output
{"openapi": "3.1.0", "info": {"title": "LangSmith", "version": "0.1.0"}, "servers": [{"url": "https://api.smith.langchain.com", "description": "LangSmith API endpoint."}]}
{"paths": {"/api/v1/sessions/{session_id}": {"get": {"tags": ["tracer-sessions"], "summary": "Read Tracer Session", "description": "Get a specific session.", "operationId": "read_tracer_session_api_v1_sessions__session_id__get"}}}}
```
## 如何管理列表内容的块大小

请注意，这个示例中的一个块大于指定的 `max_chunk_size` 300。查看这个较大的块，我们看到里面有一个列表对象：


```python
print([len(text) for text in texts][:10])
print()
print(texts[3])
```
```output
[171, 231, 126, 469, 210, 213, 237, 271, 191, 232]

{"paths": {"/api/v1/sessions/{session_id}": {"get": {"parameters": [{"name": "session_id", "in": "path", "required": true, "schema": {"type": "string", "format": "uuid", "title": "Session Id"}}, {"name": "include_stats", "in": "query", "required": false, "schema": {"type": "boolean", "default": false, "title": "Include Stats"}}, {"name": "accept", "in": "header", "required": false, "schema": {"anyOf": [{"type": "string"}, {"type": "null"}], "title": "Accept"}}]}}}}
```
默认情况下，json分割器不会分割列表。

指定 `convert_lists=True` 来预处理json，将列表内容转换为 `index:item` 形式的字典，作为 `key:val` 对：


```python
texts = splitter.split_text(json_data=json_data, convert_lists=True)
```

让我们看看块的大小。现在它们都在最大值之下


```python
print([len(text) for text in texts][:10])
```
```output
[176, 236, 141, 203, 212, 221, 210, 213, 242, 291]
```
列表已被转换为字典，但即使分成多个块，仍保留所有所需的上下文信息：


```python
print(texts[1])
```
```output
{"paths": {"/api/v1/sessions/{session_id}": {"get": {"tags": {"0": "tracer-sessions"}, "summary": "Read Tracer Session", "description": "Get a specific session.", "operationId": "read_tracer_session_api_v1_sessions__session_id__get"}}}}
```

```python
# We can also look at the documents
docs[1]
```



```output
Document(page_content='{"paths": {"/api/v1/sessions/{session_id}": {"get": {"tags": ["tracer-sessions"], "summary": "Read Tracer Session", "description": "Get a specific session.", "operationId": "read_tracer_session_api_v1_sessions__session_id__get"}}}}')
```

