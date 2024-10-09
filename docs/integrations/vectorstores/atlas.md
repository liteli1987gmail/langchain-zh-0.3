---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/atlas.ipynb
---
# Atlas


>[Atlas](https://docs.nomic.ai/index.html) 是 Nomic 提供的一个平台，用于与小型和互联网规模的非结构化数据集进行交互。它使任何人都能够在浏览器中可视化、搜索和共享大量数据集。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本向您展示如何使用与 `AtlasDB` 向量存储相关的功能。


```python
%pip install --upgrade --quiet  spacy
```


```python
!python3 -m spacy download en_core_web_sm
```


```python
%pip install --upgrade --quiet  nomic
```

### 加载包


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Atlas"}, {"imported": "AtlasDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.atlas.AtlasDB.html", "title": "Atlas"}, {"imported": "SpacyTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/spacy/langchain_text_splitters.spacy.SpacyTextSplitter.html", "title": "Atlas"}]-->
import time

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AtlasDB
from langchain_text_splitters import SpacyTextSplitter
```


```python
ATLAS_TEST_API_KEY = "7xDPkYXSYDc1_ErdTPIcoAR9RNd8YDlkS3nVNXcVoIMZ6"
```

### 准备数据


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = SpacyTextSplitter(separator="|")
texts = []
for doc in text_splitter.split_documents(documents):
    texts.extend(doc.page_content.split("|"))

texts = [e.strip() for e in texts]
```

### 使用 Nomic 的 Atlas 映射数据


```python
db = AtlasDB.from_texts(
    texts=texts,
    name="test_index_" + str(time.time()),  # unique name for your vector store
    description="test_index",  # a description for your vector store
    api_key=ATLAS_TEST_API_KEY,
    index_kwargs={"build_topic_model": True},
)
```


```python
db.project.wait_for_project_lock()
```


```python
db.project
```

这是一个包含此代码结果的地图。该地图显示了国情咨文的文本。
https://atlas.nomic.ai/map/3e4de075-89ff-486a-845c-36c23f30bb67/d8ce2284-8edb-4050-8b9b-9bb543d7f647


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
