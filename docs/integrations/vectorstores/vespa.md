---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vespa.ipynb
---
# Vespa

>[Vespa](https://vespa.ai/) 是一个功能齐全的搜索引擎和向量数据库。它支持向量搜索（ANN）、词汇搜索和结构化数据搜索，所有这些都可以在同一个查询中进行。

本笔记本展示了如何将 `Vespa.ai` 用作 LangChain 向量存储。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

为了创建向量存储，我们使用
[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) 来创建一个
与 `Vespa` 服务的连接。


```python
%pip install --upgrade --quiet  pyvespa
```

使用 `pyvespa` 包，您可以连接到一个
[Vespa Cloud 实例](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
或一个本地的
[Docker 实例](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html)。
在这里，我们将创建一个新的 Vespa 应用程序并使用 Docker 部署它。

#### 创建一个 Vespa 应用程序

首先，我们需要创建一个应用程序包：


```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

这将设置一个具有每个文档模式的 Vespa 应用程序，其中包含
两个字段：`text` 用于保存文档文本，`embedding` 用于保存
嵌入向量。`text` 字段设置为使用 BM25 索引
高效的文本检索，我们将看到如何使用这个和混合搜索
稍后会详细介绍。

`embedding` 字段设置为长度为 384 的向量，以保存
文本的嵌入表示。请参见
[Vespa 的张量指南](https://docs.vespa.ai/en/tensor-user-guide.html)
了解更多关于 Vespa 中张量的信息。

最后，我们添加一个 [排名配置文件](https://docs.vespa.ai/en/ranking.html) 来
指示 Vespa 如何排序文档。在这里，我们设置了一个
[最近邻搜索](https://docs.vespa.ai/en/nearest-neighbor-search.html)。

现在我们可以在本地部署这个应用程序：


```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

这将部署并创建与 `Vespa` 服务的连接。如果您
已经有一个正在运行的 Vespa 应用程序，例如在云中，
请参考 PyVespa 应用程序以了解如何连接。

#### 创建一个 Vespa 向量存储

现在，让我们加载一些文档：


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Vespa"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Vespa"}, {"imported": "SentenceTransformerEmbeddings", "source": "langchain_community.embeddings.sentence_transformer", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.SentenceTransformerEmbeddings.html", "title": "Vespa"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

在这里，我们还设置了本地句子嵌入器，将文本转换为嵌入
向量。也可以使用 OpenAI 嵌入，但向量长度需要
更新为 `1536` 以反映该嵌入的更大尺寸。

为了将这些提供给 Vespa，我们需要配置向量存储如何映射到
Vespa 应用程序中的字段。然后我们直接从中创建向量存储
这组文档：


```python
<!--IMPORTS:[{"imported": "VespaStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vespa.VespaStore.html", "title": "Vespa"}]-->
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

这将创建一个Vespa向量存储，并将该组文档提供给Vespa。
向量存储负责为每个文档调用嵌入函数
并将它们插入数据库。

我们现在可以查询向量存储：


```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

这将使用上面给出的嵌入函数来创建一个表示
用于查询，并利用该表示搜索Vespa。请注意，这将使用
`default`排名函数，我们在应用程序包中设置了该函数
您可以使用`similarity_search`中的`ranking`参数来
指定要使用的排名函数。

请参考[pyvespa文档](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
以获取更多信息。

这涵盖了在LangChain中使用Vespa存储的基本用法。
现在您可以返回结果并继续在LangChain中使用这些结果。

#### 更新文档

作为调用`from_documents`的替代方案，您可以直接创建向量
存储并从中调用`add_texts`。这也可以用于更新
文档：


```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

然而，`pyvespa`库包含用于操作
Vespa上内容的方法，您可以直接使用。

#### 删除文档

您可以使用 `delete` 函数删除文档：


```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

同样，`pyvespa` 连接也包含删除文档的方法。

### 返回带分数的结果

`similarity_search` 方法仅按相关性返回文档。
要检索实际分数：


```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

这是使用 `
余弦距离函数（由应用函数中的 `angular` 参数给出）
的结果。

不同的嵌入函数需要不同的距离函数，而 Vespa
需要知道在排序文档时使用哪个距离函数。
请参考
[距离函数的文档](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric)
以获取更多信息。

### 作为检索器

要将此向量存储用作
[LangChain 检索器](/docs/how_to#retrievers)
只需调用 `as_retriever` 函数，这是一个标准的向量存储
方法：


```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

这允许从向量存储进行更一般的、非结构化的检索。

### 元数据

到目前为止，在这个例子中，我们只使用了文本和嵌入
文本。文档通常包含额外的信息，在LangChain中
被称为元数据。

Vespa可以通过将其添加到应用程序包中来包含许多不同类型的字段：
包：


```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```

我们可以在文档中添加一些元数据字段：


```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```

并让Vespa向量存储知道这些字段：


```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```

现在，当搜索这些文档时，这些字段将被返回。
此外，这些字段可以进行过滤：


```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```

### 自定义查询

如果相似性搜索的默认行为不符合您的
要求，您可以始终提供自己的查询。因此，您不需要
向向量存储提供所有配置，而是可以自己编写。
不如自己写这个。

首先，让我们为我们的应用程序添加一个BM25排名函数：


```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

然后，基于BM25执行常规文本搜索：


```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```

Vespa的所有强大搜索和查询功能都可以通过
使用自定义查询来实现。有关更多详细信息，请参阅Vespa文档中的
[查询API](https://docs.vespa.ai/en/query-api.html)。

### 混合搜索

混合搜索意味着同时使用经典的基于术语的搜索，例如
BM25 和向量搜索，并结合结果。我们需要为混合搜索创建
一个新的排名配置文件在 Vespa 上：


```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

在这里，我们将每个文档的得分作为其 BM25 得分和
距离得分的组合。我们可以使用自定义查询进行查询：


```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```

### Vespa 中的原生嵌入器

到目前为止，我们在 Python 中使用了嵌入函数来提供
文本的嵌入。Vespa 原生支持嵌入函数，因此
您可以将此计算推迟到 Vespa 中。一个好处是能够使用
如果您有大量文档集合，请在嵌入文档时使用GPU。

请参考 [Vespa embeddings](https://docs.vespa.ai/en/embedding.html)
以获取更多信息。

首先，我们需要修改我们的应用程序包：


```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

请参考嵌入文档以添加嵌入模型
和分词器到应用程序中。请注意，`hfembedding` 字段
包含使用 `hf-embedder` 进行嵌入的说明。

现在我们可以使用自定义查询进行查询：


```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```

请注意，这里的查询包含一个 `embed` 指令，以使用与文档相同的模型嵌入查询
。

### 近似最近邻

在上述所有示例中，我们使用了精确最近邻来
查找结果。然而，对于大量文档集合，这并不可行，因为必须扫描所有文档以找到
最佳匹配。为了避免这种情况，我们可以使用
[近似最近邻](https://docs.vespa.ai/en/approximate-nn-hnsw.html)。
[近似最近邻](https://docs.vespa.ai/en/approximate-nn-hnsw.html)。

首先，我们可以更改嵌入字段以创建HNSW索引：


```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```

这将在嵌入数据上创建HNSW索引，从而实现高效的
搜索。通过这个设置，我们可以通过将
`approximate`参数设置为`True`轻松使用ANN进行搜索：


```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```

这涵盖了LangChain中Vespa向量存储的大部分功能。




## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
