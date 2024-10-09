---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/metal.ipynb
---
# Metal

>[Metal](https://github.com/getmetal/metal-python) 是一个用于机器学习嵌入的托管服务。

本笔记本展示了如何使用 [Metal](https://docs.getmetal.io/introduction) 的检索器。

首先，您需要注册 Metal 并获取 API 密钥。您可以在 [这里](https://docs.getmetal.io/misc-create-app) 完成。


```python
%pip install --upgrade --quiet  metal_sdk
```


```python
from metal_sdk.metal import Metal

API_KEY = ""
CLIENT_ID = ""
INDEX_ID = ""

metal = Metal(API_KEY, CLIENT_ID, INDEX_ID)
```

## 导入文档

只有在您尚未设置索引的情况下，才需要执行此操作


```python
metal.index({"text": "foo1"})
metal.index({"text": "foo"})
```



```output
{'data': {'id': '642739aa7559b026b4430e42',
  'text': 'foo',
  'createdAt': '2023-03-31T19:51:06.748Z'}}
```


## 查询

现在我们的索引已设置好，我们可以设置检索器并开始查询。


```python
<!--IMPORTS:[{"imported": "MetalRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.metal.MetalRetriever.html", "title": "Metal"}]-->
from langchain_community.retrievers import MetalRetriever
```


```python
retriever = MetalRetriever(metal, params={"limit": 2})
```


```python
retriever.invoke("foo1")
```



```output
[Document(page_content='foo1', metadata={'dist': '1.19209289551e-07', 'id': '642739a17559b026b4430e40', 'createdAt': '2023-03-31T19:50:57.853Z'}),
 Document(page_content='foo1', metadata={'dist': '4.05311584473e-06', 'id': '642738f67559b026b4430e3c', 'createdAt': '2023-03-31T19:48:06.769Z'})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
