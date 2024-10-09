---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/starrocks.ipynb
---
# StarRocks

>[StarRocks](https://www.starrocks.io/) 是一个高性能分析数据库。
`StarRocks` 是一个下一代亚秒级 MPP 数据库，适用于全分析场景，包括多维分析、实时分析和临时查询。

>通常 `StarRocks` 被归类为 OLAP，并且在 [ClickBench — 一个分析型数据库管理系统基准测试](https://benchmark.clickhouse.com/) 中表现出色。由于它具有超快的向量化执行引擎，它也可以用作快速向量数据库。

在这里我们将展示如何使用 StarRocks 向量存储。

## 设置


```python
%pip install --upgrade --quiet  pymysql langchain-community
```

在开始时设置 `update_vectordb = False`。如果没有文档被更新，那么我们就不需要重建文档的嵌入。


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "StarRocks"}, {"imported": "DirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.directory.DirectoryLoader.html", "title": "StarRocks"}, {"imported": "UnstructuredMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html", "title": "StarRocks"}, {"imported": "StarRocks", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.starrocks.StarRocks.html", "title": "StarRocks"}, {"imported": "StarRocksSettings", "source": "langchain_community.vectorstores.starrocks", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.starrocks.StarRocksSettings.html", "title": "StarRocks"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "StarRocks"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "StarRocks"}, {"imported": "TokenTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.TokenTextSplitter.html", "title": "StarRocks"}]-->
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores import StarRocks
from langchain_community.vectorstores.starrocks import StarRocksSettings
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```
```output
/Users/dirlt/utils/py3env/lib/python3.9/site-packages/requests/__init__.py:102: RequestsDependencyWarning: urllib3 (1.26.7) or chardet (5.1.0)/charset_normalizer (2.0.9) doesn't match a supported version!
  warnings.warn("urllib3 ({}) or chardet ({})/charset_normalizer ({}) doesn't match a supported "
```
## 加载文档并将其分割为标记

加载 `docs` 目录下的所有 markdown 文件

对于 StarRocks 文档，您可以从 https://github.com/StarRocks/starrocks 克隆仓库，里面有 `docs` 目录。


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


```python
split_docs[-20]
```



```output
Document(page_content='Compile StarRocks with Docker\n\nThis topic describes how to compile StarRocks using Docker.\n\nOverview\n\nStarRocks provides development environment images for both Ubuntu 22.04 and CentOS 7.9. With the image, you can launch a Docker container and compile StarRocks in the container.\n\nStarRocks version and DEV ENV image\n\nDifferent branches of StarRocks correspond to different development environment images provided on StarRocks Docker Hub.\n\nFor Ubuntu 22.04:\n\n| Branch name | Image name              |\n  | --------------- | ----------------------------------- |\n  | main            | starrocks/dev-env-ubuntu:latest     |\n  | branch-3.0      | starrocks/dev-env-ubuntu:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-ubuntu:2.5-latest |\n\nFor CentOS 7.9:\n\n| Branch name | Image name                       |\n  | --------------- | ------------------------------------ |\n  | main            | starrocks/dev-env-centos7:latest     |\n  | branch-3.0      | starrocks/dev-env-centos7:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-centos7:2.5-latest |\n\nPrerequisites\n\nBefore compiling StarRocks, make sure the following requirements are satisfied:\n\nHardware\n\n', metadata={'source': 'docs/developers/build-starrocks/Build_in_docker.md'})
```



```python
print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))
```
```output
# docs  = 657, # splits = 2802
```
## 创建 vectordb 实例

### 使用 StarRocks 作为 vectordb


```python
def gen_starrocks(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = StarRocks.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = StarRocks(embeddings, settings)
    return docsearch
```

## 将标记转换为嵌入并放入 vectordb

在这里我们使用 StarRocks 作为 vectordb，您可以通过 `StarRocksSettings` 配置 StarRocks 实例。

配置 StarRocks 实例与配置 mysql 实例非常相似。您需要指定：
1. 主机/端口
2. 用户名（默认：'root'）
3. 密码（默认：''）
4. 数据库（默认：'default'）
5. 表（默认：'langchain'）


```python
embeddings = OpenAIEmbeddings()

# configure starrocks settings(host/port/user/pw/db)
settings = StarRocksSettings()
settings.port = 41003
settings.host = "127.0.0.1"
settings.username = "root"
settings.password = ""
settings.database = "zya"
docsearch = gen_starrocks(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```
```output
Inserting data...: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 2802/2802 [02:26<00:00, 19.11it/s]
``````output
[92m[1mzya.langchain @ 127.0.0.1:41003[0m

[1musername: root[0m

Table Schema:
----------------------------------------------------------------------------
|[94mname                    [0m|[96mtype                    [0m|[96mkey                     [0m|
----------------------------------------------------------------------------
|[94mid                      [0m|[96mvarchar(65533)          [0m|[96mtrue                    [0m|
|[94mdocument                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
|[94membedding               [0m|[96marray<float>            [0m|[96mfalse                   [0m|
|[94mmetadata                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
----------------------------------------------------------------------------
```
## 构建问答并向其提问


```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "is profile enabled by default? if not, how to enable profile?"
resp = qa.run(query)
print(resp)
```
```output
 No, profile is not enabled by default. To enable profile, set the variable `enable_profile` to `true` using the command `set enable_profile = true;`
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
