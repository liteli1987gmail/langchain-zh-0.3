---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/open_city_data.ipynb
---
# 开放城市数据

[Socrata](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6) 提供城市开放数据的API。

对于像 [SF 犯罪](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry) 这样的数据集，请点击右上角的 `API` 标签。

这将为您提供 `数据集标识符`。

使用数据集标识符来获取特定城市ID（`data.sfgov.org`）的表格 -

例如，`vw6y-z8j6` 对应于 [SF 311 数据](https://dev.socrata.com/foundry/data.sfgov.org/vw6y-z8j6)。

例如，`tmnf-yvry` 对应于 [SF 警察数据](https://dev.socrata.com/foundry/data.sfgov.org/tmnf-yvry)。


```python
%pip install --upgrade --quiet  sodapy
```


```python
<!--IMPORTS:[{"imported": "OpenCityDataLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.open_city_data.OpenCityDataLoader.html", "title": "Open City Data"}]-->
from langchain_community.document_loaders import OpenCityDataLoader
```


```python
dataset = "vw6y-z8j6"  # 311 data
dataset = "tmnf-yvry"  # crime data
loader = OpenCityDataLoader(city_id="data.sfgov.org", dataset_id=dataset, limit=2000)
```


```python
docs = loader.load()
```
```output
WARNING:root:Requests made without an app_token will be subject to strict throttling limits.
```

```python
eval(docs[0].page_content)
```



```output
{'pdid': '4133422003074',
 'incidntnum': '041334220',
 'incident_code': '03074',
 'category': 'ROBBERY',
 'descript': 'ROBBERY, BODILY FORCE',
 'dayofweek': 'Monday',
 'date': '2004-11-22T00:00:00.000',
 'time': '17:50',
 'pddistrict': 'INGLESIDE',
 'resolution': 'NONE',
 'address': 'GENEVA AV / SANTOS ST',
 'x': '-122.420084075249',
 'y': '37.7083109744362',
 'location': {'type': 'Point',
  'coordinates': [-122.420084075249, 37.7083109744362]},
 ':@computed_region_26cr_cadq': '9',
 ':@computed_region_rxqg_mtj9': '8',
 ':@computed_region_bh8s_q3mv': '309'}
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
