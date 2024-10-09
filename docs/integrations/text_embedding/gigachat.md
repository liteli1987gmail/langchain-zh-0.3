---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/gigachat.ipynb
---
# GigaChat
本笔记展示了如何使用LangChain与[GigaChat嵌入](https://developers.sber.ru/portal/products/gigachat)。
要使用它，您需要安装```gigachat``` Python包。


```python
%pip install --upgrade --quiet  gigachat
```

要获取GigaChat凭证，您需要[创建账户](https://developers.sber.ru/studio/login)并[获取API访问权限](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## 示例


```python
import os
from getpass import getpass

if "GIGACHAT_CREDENTIALS" not in os.environ:
    os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "GigaChatEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.gigachat.GigaChatEmbeddings.html", "title": "GigaChat"}]-->
from langchain_community.embeddings import GigaChatEmbeddings

embeddings = GigaChatEmbeddings(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```


```python
query_result = embeddings.embed_query("The quick brown fox jumps over the lazy dog")
```


```python
query_result[:5]
```



```output
[0.8398333191871643,
 -0.14180311560630798,
 -0.6161925792694092,
 -0.17103666067123413,
 1.2884578704833984]
```



## 相关

- 嵌入模型[概念指南](/docs/concepts/#embedding-models)
- 嵌入模型[操作指南](/docs/how_to/#embedding-models)
