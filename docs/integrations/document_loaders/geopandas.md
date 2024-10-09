---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/geopandas.ipynb
---
# Geopandas

[Geopandas](https://geopandas.org/en/stable/index.html) 是一个开源项目，旨在简化在 Python 中处理地理空间数据的工作。

GeoPandas 扩展了 pandas 使用的数据类型，以允许对几何类型进行空间操作。

几何操作由 shapely 执行。Geopandas 进一步依赖 fiona 进行文件访问和 matplotlib 进行绘图。

利用地理空间数据的 LLM 应用（聊天、问答）是一个有趣的探索领域。


```python
%pip install --upgrade --quiet  sodapy
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  geopandas
```


```python
<!--IMPORTS:[{"imported": "OpenCityDataLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.open_city_data.OpenCityDataLoader.html", "title": "Geopandas"}]-->
import ast

import geopandas as gpd
import pandas as pd
from langchain_community.document_loaders import OpenCityDataLoader
```

从 [`开放城市数据`](/docs/integrations/document_loaders/open_city_data) 创建一个 GeoPandas 数据框作为示例输入。


```python
# Load Open City Data
dataset = "tmnf-yvry"  # San Francisco crime data
loader = OpenCityDataLoader(city_id="data.sfgov.org", dataset_id=dataset, limit=5000)
docs = loader.load()
```


```python
# Convert list of dictionaries to DataFrame
df = pd.DataFrame([ast.literal_eval(d.page_content) for d in docs])

# Extract latitude and longitude
df["Latitude"] = df["location"].apply(lambda loc: loc["coordinates"][1])
df["Longitude"] = df["location"].apply(lambda loc: loc["coordinates"][0])

# Create geopandas DF
gdf = gpd.GeoDataFrame(
    df, geometry=gpd.points_from_xy(df.Longitude, df.Latitude), crs="EPSG:4326"
)

# Only keep valid longitudes and latitudes for San Francisco
gdf = gdf[
    (gdf["Longitude"] >= -123.173825)
    & (gdf["Longitude"] <= -122.281780)
    & (gdf["Latitude"] >= 37.623983)
    & (gdf["Latitude"] <= 37.929824)
]
```

旧金山犯罪数据样本的可视化。


```python
import matplotlib.pyplot as plt

# Load San Francisco map data
sf = gpd.read_file("https://data.sfgov.org/resource/3psu-pn9h.geojson")

# Plot the San Francisco map and the points
fig, ax = plt.subplots(figsize=(10, 10))
sf.plot(ax=ax, color="white", edgecolor="black")
gdf.plot(ax=ax, color="red", markersize=5)
plt.show()
```

将 GeoPandas 数据框加载为 `文档` 以进行后续处理（嵌入、聊天等）。

`geometry` 将是默认的 `page_content` 列，所有其他列将放置在 `metadata` 中。

但是，我们可以指定 `page_content_column`。


```python
<!--IMPORTS:[{"imported": "GeoDataFrameLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.geodataframe.GeoDataFrameLoader.html", "title": "Geopandas"}]-->
from langchain_community.document_loaders import GeoDataFrameLoader

loader = GeoDataFrameLoader(data_frame=gdf, page_content_column="geometry")
docs = loader.load()
```


```python
docs[0]
```



```output
Document(page_content='POINT (-122.420084075249 37.7083109744362)', metadata={'pdid': '4133422003074', 'incidntnum': '041334220', 'incident_code': '03074', 'category': 'ROBBERY', 'descript': 'ROBBERY, BODILY FORCE', 'dayofweek': 'Monday', 'date': '2004-11-22T00:00:00.000', 'time': '17:50', 'pddistrict': 'INGLESIDE', 'resolution': 'NONE', 'address': 'GENEVA AV / SANTOS ST', 'x': '-122.420084075249', 'y': '37.7083109744362', 'location': {'type': 'Point', 'coordinates': [-122.420084075249, 37.7083109744362]}, ':@computed_region_26cr_cadq': '9', ':@computed_region_rxqg_mtj9': '8', ':@computed_region_bh8s_q3mv': '309', ':@computed_region_6qbp_sg9q': nan, ':@computed_region_qgnn_b9vv': nan, ':@computed_region_ajp5_b2md': nan, ':@computed_region_yftq_j783': nan, ':@computed_region_p5aj_wyqh': nan, ':@computed_region_fyvs_ahh9': nan, ':@computed_region_6pnf_4xz7': nan, ':@computed_region_jwn9_ihcz': nan, ':@computed_region_9dfj_4gjx': nan, ':@computed_region_4isq_27mq': nan, ':@computed_region_pigm_ib2e': nan, ':@computed_region_9jxd_iqea': nan, ':@computed_region_6ezc_tdp2': nan, ':@computed_region_h4ep_8xdi': nan, ':@computed_region_n4xg_c4py': nan, ':@computed_region_fcz8_est8': nan, ':@computed_region_nqbw_i6c3': nan, ':@computed_region_2dwj_jsy4': nan, 'Latitude': 37.7083109744362, 'Longitude': -122.420084075249})
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
