---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/pinecone_hybrid_search.ipynb
---
# Pinecone 混合搜索

>[Pinecone](https://docs.pinecone.io/docs/overview) 是一个功能广泛的向量数据库。

本笔记本介绍了如何使用一个底层使用 Pinecone 和混合搜索的检索器。

该检索器的逻辑来自于 [这份文档](https://docs.pinecone.io/docs/hybrid-search)

要使用 Pinecone，您必须拥有一个 API 密钥和一个环境。
以下是 [安装说明](https://docs.pinecone.io/docs/quickstart)。


```python
%pip install --upgrade --quiet  pinecone-client pinecone-text pinecone-notebooks
```


```python
# Connect to Pinecone and get an API key.
from pinecone_notebooks.colab import Authenticate

Authenticate()

import os

api_key = os.environ["PINECONE_API_KEY"]
```


```python
<!--IMPORTS:[{"imported": "PineconeHybridSearchRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.pinecone_hybrid_search.PineconeHybridSearchRetriever.html", "title": "Pinecone Hybrid Search"}]-->
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 设置 Pinecone

您只需执行此部分一次。


```python
import os

from pinecone import Pinecone, ServerlessSpec

index_name = "langchain-pinecone-hybrid-search"

# initialize Pinecone client
pc = Pinecone(api_key=api_key)

# create the index
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # dimensionality of dense model
        metric="dotproduct",  # sparse values supported only for dotproduct
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
```



```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```


现在索引已创建，我们可以使用它。


```python
index = pc.Index(index_name)
```

## 获取嵌入和稀疏编码器

嵌入用于密集向量，分词器用于稀疏向量。


```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Pinecone Hybrid Search"}]-->
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

要将文本编码为稀疏值，您可以选择 SPLADE 或 BM25。对于领域外任务，我们建议使用 BM25。

有关稀疏编码器的更多信息，您可以查看 pinecone-text 库的 [文档](https://pinecone-io.github.io/pinecone-text/pinecone_text.html)。


```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

上述代码使用默认的 tf-idf 值。强烈建议将 tf-idf 值调整为您自己的语料库。您可以按如下方式进行：

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## 加载检索器

我们现在可以构建检索器！


```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## 添加文本（如果需要）

我们可以选择性地向检索器添加文本（如果它们尚未在其中）


```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```
```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```
## 使用检索器

我们现在可以使用检索器！


```python
result = retriever.invoke("foo")
```


```python
result[0]
```



```output
Document(page_content='foo', metadata={})
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
