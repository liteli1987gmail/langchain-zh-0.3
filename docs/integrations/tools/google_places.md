---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/google_places.ipynb
---
# 谷歌地点

本笔记本介绍如何使用谷歌地点API


```python
%pip install --upgrade --quiet  googlemaps langchain-community
```


```python
import os

os.environ["GPLACES_API_KEY"] = ""
```


```python
<!--IMPORTS:[{"imported": "GooglePlacesTool", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.google_places.tool.GooglePlacesTool.html", "title": "Google Places"}]-->
from langchain_community.tools import GooglePlacesTool
```


```python
places = GooglePlacesTool()
```


```python
places.run("al fornos")
```



```output
"1. Delfina Restaurant\nAddress: 3621 18th St, San Francisco, CA 94110, USA\nPhone: (415) 552-4055\nWebsite: https://www.delfinasf.com/\n\n\n2. Piccolo Forno\nAddress: 725 Columbus Ave, San Francisco, CA 94133, USA\nPhone: (415) 757-0087\nWebsite: https://piccolo-forno-sf.com/\n\n\n3. L'Osteria del Forno\nAddress: 519 Columbus Ave, San Francisco, CA 94133, USA\nPhone: (415) 982-1124\nWebsite: Unknown\n\n\n4. Il Fornaio\nAddress: 1265 Battery St, San Francisco, CA 94111, USA\nPhone: (415) 986-0100\nWebsite: https://www.ilfornaio.com/\n\n"
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
