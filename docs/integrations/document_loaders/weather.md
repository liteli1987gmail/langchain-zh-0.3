---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/weather.ipynb
---
# 天气

>[OpenWeatherMap](https://openweathermap.org/) 是一个开源天气服务提供商

该加载器使用 pyowm Python 包从 OpenWeatherMap 的 OneCall API 获取天气数据。您必须使用您的 OpenWeatherMap API 令牌和您想要获取天气数据的城市名称来初始化加载器。


```python
<!--IMPORTS:[{"imported": "WeatherDataLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.weather.WeatherDataLoader.html", "title": "Weather"}]-->
from langchain_community.document_loaders import WeatherDataLoader
```


```python
%pip install --upgrade --quiet  pyowm
```


```python
# Set API key either by passing it in to constructor directly
# or by setting the environment variable "OPENWEATHERMAP_API_KEY".

from getpass import getpass

OPENWEATHERMAP_API_KEY = getpass()
```


```python
loader = WeatherDataLoader.from_params(
    ["chennai", "vellore"], openweathermap_api_key=OPENWEATHERMAP_API_KEY
)
```


```python
documents = loader.load()
documents
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
