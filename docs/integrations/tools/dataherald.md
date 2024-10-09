---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/dataherald.ipynb
---
# Dataherald

本笔记本介绍如何使用Dataherald组件。

首先，您需要设置您的Dataherald账户并获取您的API密钥：

1. 前往dataherald并在[这里](https://www.dataherald.com/)注册
2. 登录您的管理控制台后，创建一个API密钥
3. pip install dataherald

然后我们需要设置一些环境变量：
1. 将您的API密钥保存到DATAHERALD_API_KEY环境变量中


```python
pip install dataherald
%pip install --upgrade --quiet langchain-community
```


```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```


```python
<!--IMPORTS:[{"imported": "DataheraldAPIWrapper", "source": "langchain_community.utilities.dataherald", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.dataherald.DataheraldAPIWrapper.html", "title": "Dataherald"}]-->
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```


```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```


```python
dataherald.run("How many employees are in the company?")
```



```output
'select COUNT(*) from employees'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
