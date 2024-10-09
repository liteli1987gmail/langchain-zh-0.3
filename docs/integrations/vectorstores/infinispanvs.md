---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/infinispanvs.ipynb
---
# Infinispan

Infinispan 是一个开源的键值数据网格，它可以作为单节点运行，也可以作为分布式系统运行。

自 15.x 版本以来支持向量搜索
更多信息： [Infinispan 首页](https://infinispan.org)


```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# 设置

要运行此演示，我们需要一个没有身份验证的 Infinispan 实例和一个数据文件。
在接下来的三个单元中，我们将：
- 下载数据文件
- 创建配置
- 在 Docker 中运行 Infinispan


```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```


```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container: 
    name: default
    transport: 
      cluster: cluster 
      stack: tcp 
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0 
    socket-bindings:
      default-interface: public
      port-offset: 0        
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```


```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# 代码

## 选择一个嵌入模型

在这个演示中，我们使用
一个 HuggingFace 嵌入模型。


```python
<!--IMPORTS:[{"imported": "Embeddings", "source": "langchain_core.embeddings", "docs": "https://python.langchain.com/api_reference/core/embeddings/langchain_core.embeddings.embeddings.Embeddings.html", "title": "Infinispan"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Infinispan"}]-->
from langchain_core.embeddings import Embeddings
from langchain_huggingface import HuggingFaceEmbeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## 设置 Infinispan 缓存

Infinispan 是一个非常灵活的键值存储，它可以存储原始位以及复杂数据类型。
用户在数据网格配置中拥有完全的自由，但对于简单数据类型，一切都是自动配置的。
由 Python 层进行配置。我们利用这个特性，以便可以专注于我们的应用程序。

## 准备数据

在这个演示中，我们依赖于默认配置，因此文本、元数据和向量存储在同一个缓存中，但其他选项也是可能的：即内容可以存储在其他地方，向量存储可以仅包含对实际内容的引用。


```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# 填充向量存储


```python
<!--IMPORTS:[{"imported": "InfinispanVS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.infinispanvs.InfinispanVS.html", "title": "Infinispan"}]-->
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# 一个帮助函数，用于打印结果文档

默认情况下，InfinispanVS 在 `Document.page_content` 中返回 protobuf 的 `ŧext` 字段
以及所有剩余的 protobuf 字段（除了向量）在 `metadata` 中。这个行为是
在设置时通过lambda函数进行配置。


```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# 尝试一下！！！

以下是一些示例查询


```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```


```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```


```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```


```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```


```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```


```python
!docker rm --force infinispanvs-demo
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
