---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/epsilla.ipynb
---
# Epsilla

>[Epsilla](https://www.epsilla.com) 是一个开源向量数据库，利用先进的并行图遍历技术进行向量索引。Epsilla 采用 GPL-3.0 许可证。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

本笔记本展示了如何使用与 `Epsilla` 向量数据库相关的功能。

作为先决条件，您需要运行 Epsilla 向量数据库（例如，通过我们的 docker 镜像），并安装 ``pyepsilla`` 包。查看完整文档请访问 [docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start)。


```python
!pip/pip3 install pyepsilla
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

OpenAI API 密钥：········


```python
<!--IMPORTS:[{"imported": "Epsilla", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.epsilla.Epsilla.html", "title": "Epsilla"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Epsilla"}]-->
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Epsilla"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Epsilla"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

Epsilla vectordb 正在默认主机 "localhost" 和端口 "8888" 上运行。我们有一个自定义的数据库路径、数据库名称和集合名称，而不是默认的。


```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

在一个又一个州，新法律相继通过，不仅压制投票，还颠覆整个选举。

我们不能让这种事情发生。

今晚。我呼吁参议院：通过《投票自由法案》。通过《约翰·刘易斯投票权法案》。同时，通过《披露法案》，让美国人知道谁在资助我们的选举。

今晚，我想表彰一位为这个国家奉献一生的人：大法官斯蒂芬·布雷耶——一位退伍军人、宪法学者，以及即将退休的美国最高法院大法官。布雷耶大法官，感谢您的服务。

总统最重要的宪法责任之一是提名某人担任美国最高法院法官。

我在四天前做到了这一点，当时我提名了巡回上诉法院法官凯坦吉·布朗·杰克逊。她是我们国家顶尖的法律人才之一，将继续布雷耶大法官卓越的遗产。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
