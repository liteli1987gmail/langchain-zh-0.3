---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/golden_query.ipynb
---
# 黄金查询

>[Golden](https://golden.com) 提供了一套自然语言API，用于通过Golden知识图谱进行查询和丰富，例如：`来自OpenAI的产品`、`获得A轮融资的生成式AI公司`和`投资的说唱歌手`等查询可以用来检索相关实体的结构化数据。
>
>`golden-query` LangChain工具是一个封装在[Golden查询API](https://docs.golden.com/reference/query-api)之上的工具，允许以编程方式访问这些结果。
>有关更多信息，请参见[Golden查询API文档](https://docs.golden.com/reference/query-api)。


本笔记本介绍了如何使用`golden-query`工具。

- 前往[Golden API文档](https://docs.golden.com/)以获取Golden API的概述。
- 从[Golden API设置](https://golden.com/settings/api)页面获取您的API密钥。
- 将您的API密钥保存到GOLDEN_API_KEY环境变量中


```python
%pip install -qU langchain-community
```


```python
import os

os.environ["GOLDEN_API_KEY"] = ""
```


```python
<!--IMPORTS:[{"imported": "GoldenQueryAPIWrapper", "source": "langchain_community.utilities.golden_query", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.golden_query.GoldenQueryAPIWrapper.html", "title": "Golden Query"}]-->
from langchain_community.utilities.golden_query import GoldenQueryAPIWrapper
```


```python
golden_query = GoldenQueryAPIWrapper()
```


```python
import json

json.loads(golden_query.run("companies in nanotech"))
```



```output
{'results': [{'id': 4673886,
   'latestVersionId': 60276991,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Samsung', 'citations': []}]}]},
  {'id': 7008,
   'latestVersionId': 61087416,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Intel', 'citations': []}]}]},
  {'id': 24193,
   'latestVersionId': 60274482,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Texas Instruments', 'citations': []}]}]},
  {'id': 1142,
   'latestVersionId': 61406205,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Advanced Micro Devices', 'citations': []}]}]},
  {'id': 193948,
   'latestVersionId': 58326582,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Freescale Semiconductor', 'citations': []}]}]},
  {'id': 91316,
   'latestVersionId': 60387380,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Agilent Technologies', 'citations': []}]}]},
  {'id': 90014,
   'latestVersionId': 60388078,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Novartis', 'citations': []}]}]},
  {'id': 237458,
   'latestVersionId': 61406160,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Analog Devices', 'citations': []}]}]},
  {'id': 3941943,
   'latestVersionId': 60382250,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'AbbVie Inc.', 'citations': []}]}]},
  {'id': 4178762,
   'latestVersionId': 60542667,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'IBM', 'citations': []}]}]}],
 'next': 'https://golden.com/api/v2/public/queries/59044/results/?cursor=eyJwb3NpdGlvbiI6IFsxNzYxNiwgIklCTS04M1lQM1oiXX0%3D&pageSize=10',
 'previous': None}
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
