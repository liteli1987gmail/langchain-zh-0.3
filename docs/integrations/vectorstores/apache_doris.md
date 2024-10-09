---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/apache_doris.ipynb
---
# Apache Doris

>[Apache Doris](https://doris.apache.org/) 是一个现代数据仓库，用于实时分析。
它提供了对实时数据的闪电般快速的分析，能够大规模处理。

>通常 `Apache Doris` 被归类为 OLAP，并且在 [ClickBench — 一个分析型数据库基准测试](https://benchmark.clickhouse.com/) 中表现出色。由于它具有超快的向量化执行引擎，它也可以用作快速的向量数据库。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

在这里，我们将展示如何使用 Apache Doris 向量存储。

## 设置


```python
%pip install --upgrade --quiet  pymysql
```

在开始时设置 `update_vectordb = False`。如果没有文档被更新，那么我们就不需要重建文档的嵌入。


```python
!pip install  sqlalchemy
!pip install langchain
```


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Apache Doris"}, {"imported": "DirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.directory.DirectoryLoader.html", "title": "Apache Doris"}, {"imported": "UnstructuredMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html", "title": "Apache Doris"}, {"imported": "ApacheDoris", "source": "langchain_community.vectorstores.apache_doris", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.apache_doris.ApacheDoris.html", "title": "Apache Doris"}, {"imported": "ApacheDorisSettings", "source": "langchain_community.vectorstores.apache_doris", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.apache_doris.ApacheDorisSettings.html", "title": "Apache Doris"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Apache Doris"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Apache Doris"}, {"imported": "TokenTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.TokenTextSplitter.html", "title": "Apache Doris"}]-->
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores.apache_doris import (
    ApacheDoris,
    ApacheDorisSettings,
)
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

## 加载文档并将其分割为标记

加载 `docs` 目录下的所有 markdown 文件

对于 Apache Doris 文档，您可以从 https://github.com/apache/doris 克隆仓库，里面有 `docs` 目录。


```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

将文档分割为标记，并设置 `update_vectordb = True`，因为有新的文档/标记。


```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))

## 创建 vectordb 实例

### 使用 Apache Doris 作为 vectordb


```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## 将标记转换为嵌入并放入 vectordb

在这里我们使用 Apache Doris 作为向量数据库，您可以通过 `ApacheDorisSettings` 配置 Apache Doris 实例。

配置 Apache Doris 实例与配置 MySQL 实例非常相似。您需要指定：
1. 主机/端口
2. 用户名（默认：'root'）
3. 密码（默认：''）
4. 数据库（默认：'default'）
5. 表（默认：'langchain'）


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```


```python
update_vectordb = True

embeddings = OpenAIEmbeddings()

# configure Apache Doris settings(host/port/user/pw/db)
settings = ApacheDorisSettings()
settings.port = 9030
settings.host = "172.30.34.130"
settings.username = "root"
settings.password = ""
settings.database = "langchain"
docsearch = gen_apache_doris(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

## 构建问答系统并向其提问


```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
