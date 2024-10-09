---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/nucliadb.ipynb
---
# NucliaDB

您可以使用本地的 NucliaDB 实例或使用 [Nuclia Cloud](https://nuclia.cloud)。

使用本地实例时，您需要一个 Nuclia Understanding API 密钥，以便您的文本能够正确地向量化和索引。您可以通过在 [https://nuclia.cloud](https://nuclia.cloud) 创建一个免费账户来获取密钥，然后 [创建一个 NUA 密钥](https://docs.nuclia.dev/docs/docs/using/understanding/intro)。


```python
%pip install --upgrade --quiet  langchain langchain-community nuclia
```

## 在 nuclia.cloud 上的使用


```python
<!--IMPORTS:[{"imported": "NucliaDB", "source": "langchain_community.vectorstores.nucliadb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.nucliadb.NucliaDB.html", "title": "NucliaDB"}]-->
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## 在本地实例上的使用

注意：默认情况下 `backend` 设置为 `http://localhost:8080`。


```python
<!--IMPORTS:[{"imported": "NucliaDB", "source": "langchain_community.vectorstores.nucliadb", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.nucliadb.NucliaDB.html", "title": "NucliaDB"}]-->
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## 添加和删除知识库中的文本


```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```


```python
ndb.delete(ids=ids)
```

## 在知识库中搜索


```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
