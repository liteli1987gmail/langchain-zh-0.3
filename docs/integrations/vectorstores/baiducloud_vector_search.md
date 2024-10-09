---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/baiducloud_vector_search.ipynb
---
# 百度云 ElasticSearch 向量搜索

>[百度云向量搜索](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc) 是一个完全托管的企业级分布式搜索和分析服务，100% 兼容开源。百度云向量搜索为结构化/非结构化数据提供低成本、高性能和可靠的检索与分析平台级产品服务。作为一个向量数据库，它支持多种索引类型和相似度距离方法。

>`百度云 ElasticSearch` 提供了一个权限管理机制，允许您自由配置集群权限，以进一步确保数据安全。

本笔记本展示了如何使用与 `百度云 ElasticSearch 向量存储` 相关的功能。
要运行，您应该有一个正在运行的 [百度云 ElasticSearch](https://cloud.baidu.com/product/bes.html) 实例：

阅读 [帮助文档](https://cloud.baidu.com/doc/BES/s/8llyn0hh4) 以快速熟悉和配置百度云 ElasticSearch 实例。

实例启动并运行后，按照以下步骤拆分文档、获取嵌入、连接到百度云 ElasticSearch 实例、索引文档并执行向量检索。

我们需要先安装以下 Python 包。


```python
%pip install --upgrade --quiet langchain-community elasticsearch == 7.11.0
```

首先，我们想使用 `QianfanEmbeddings`，所以我们需要获取 Qianfan 的 AK 和 SK。有关 QianFan 的详细信息，请参见 [百度千帆工作坊](https://cloud.baidu.com/product/wenxinworkshop)


```python
import getpass
import os

if "QIANFAN_AK" not in os.environ:
    os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
if "QIANFAN_SK" not in os.environ:
    os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

其次，分割文档并获取嵌入。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Baidu Cloud ElasticSearch VectorSearch"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Baidu Cloud ElasticSearch VectorSearch"}, {"imported": "QianfanEmbeddingsEndpoint", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.baidu_qianfan_endpoint.QianfanEmbeddingsEndpoint.html", "title": "Baidu Cloud ElasticSearch VectorSearch"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

然后，创建一个可访问的百度 Elasticsearch 实例。


```python
<!--IMPORTS:[{"imported": "BESVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.baiducloud_vector_search.BESVectorStore.html", "title": "Baidu Cloud ElasticSearch VectorSearch"}]-->
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

最后，查询并检索数据。


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

如果在使用过程中遇到任何问题，请随时联系 liuboyao@baidu.com 或 chenweixu01@baidu.com，我们将竭诚为您提供支持。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
