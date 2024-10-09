---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/rockset.ipynb
---
# Rockset

>[Rockset](https://rockset.com/) 是一个为云构建的实时搜索和分析数据库。Rockset 使用 [Converged Index™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/) 和高效的向量嵌入存储来支持低延迟、高并发的搜索查询。Rockset 完全支持元数据过滤，并处理实时摄取不断更新的流数据。

本笔记本演示了如何在 LangChain 中使用 `Rockset` 作为向量存储。在开始之前，请确保您拥有 `Rockset` 账户和可用的 API 密钥。[今天开始您的免费试用。](https://rockset.com/create/)

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 设置您的环境

1. 利用 `Rockset` 控制台创建一个 [集合](https://rockset.com/docs/collections/) ，将写入 API 作为您的数据源。在本教程中，我们创建一个名为 `langchain_demo` 的集合。
    
配置以下 [摄取转换](https://rockset.com/docs/ingest-transformation/) 以标记您的嵌入字段，并利用性能和存储优化：


(我们在这个示例中使用了 OpenAI `text-embedding-ada-002`，其中 #length_of_vector_embedding = 1536)

```
SELECT _input.* EXCEPT(_meta), 
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding 
FROM _input
```

2. 创建集合后，使用控制台检索 [API 密钥](https://rockset.com/docs/iam/#users-api-keys-and-roles)。在本笔记本中，我们假设您使用的是 `Oregon(us-west-2)` 区域。

3. 安装 [rockset-python-client](https://github.com/rockset/rockset-python-client)，以使 LangChain 能够直接与 `Rockset` 进行通信。


```python
%pip install --upgrade --quiet  rockset
```

## LangChain 教程

在您自己的 Python 笔记本中跟随操作，以生成并存储 Rockset 中的向量嵌入。
开始使用 Rockset 搜索与您的搜索查询相似的文档。

### 1. 定义关键变量


```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. 准备文档


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Rockset"}, {"imported": "Rockset", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.rocksetdb.Rockset.html", "title": "Rockset"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Rockset"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Rockset"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. 插入文档


```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. 搜索相似文档


```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. 使用过滤搜索相似文档


```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [可选] 删除插入的文档

您必须拥有与每个文档关联的唯一ID，以便从您的集合中删除它们。
在使用 `Rockset.add_texts()` 插入文档时定义ID。否则，Rockset将为每个文档生成一个唯一ID。无论如何，`Rockset.add_texts()` 返回插入文档的ID。

要删除这些文档，只需使用 `Rockset.delete_texts()` 函数。


```python
docsearch.delete_texts(ids)
```

## 摘要

在本教程中，我们成功创建了一个 `Rockset` 集合，使用 OpenAI 嵌入插入了文档，并搜索了带有和不带有元数据过滤的相似文档。

请关注 https://rockset.com/ 以获取该领域的未来更新。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
