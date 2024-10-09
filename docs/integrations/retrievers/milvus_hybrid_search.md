---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/milvus_hybrid_search.ipynb
sidebar_label: Milvus Hybrid Search
---
# Milvus 混合搜索检索器

> [Milvus](https://milvus.io/docs) 是一个开源向量数据库，旨在支持嵌入相似性搜索和人工智能应用。Milvus 使非结构化数据搜索变得更加便捷，并提供一致的用户体验，无论部署环境如何。

这将帮助您开始使用 Milvus 混合搜索 [检索器](/docs/concepts/#retrievers)，它结合了稠密和稀疏向量搜索的优势。有关所有 `MilvusCollectionHybridSearchRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/milvus/retrievers/langchain_milvus.retrievers.milvus_hybrid_search.MilvusCollectionHybridSearchRetriever.html)。

另请参阅 Milvus 多向量搜索 [文档](https://milvus.io/docs/multi-vector-search.md)。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="document_retrievers" item="MilvusCollectionHybridSearchRetriever" />

## 设置

如果您希望从单个查询中获取自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

该检索器位于 `langchain-milvus` 包中。本指南需要以下依赖项：


```python
%pip install --upgrade --quiet pymilvus[model] langchain-milvus langchain-openai
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "MilvusCollectionHybridSearchRetriever", "source": "langchain_milvus.retrievers", "docs": "https://python.langchain.com/api_reference/milvus/retrievers/langchain_milvus.retrievers.milvus_hybrid_search.MilvusCollectionHybridSearchRetriever.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "BM25SparseEmbedding", "source": "langchain_milvus.utils.sparse", "docs": "https://python.langchain.com/api_reference/milvus/utils/langchain_milvus.utils.sparse.BM25SparseEmbedding.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Milvus Hybrid Search Retriever"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Milvus Hybrid Search Retriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_milvus.retrievers import MilvusCollectionHybridSearchRetriever
from langchain_milvus.utils.sparse import BM25SparseEmbedding
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pymilvus import (
    Collection,
    CollectionSchema,
    DataType,
    FieldSchema,
    WeightedRanker,
    connections,
)
```

### 启动 Milvus 服务

请参考 [Milvus 文档](https://milvus.io/docs/install_standalone-docker.md) 启动 Milvus 服务。

启动 Milvus 后，您需要指定您的 Milvus 连接 URI。


```python
CONNECTION_URI = "http://localhost:19530"
```

### 准备 OpenAI API 密钥

请参考 [OpenAI 文档](https://platform.openai.com/account/api-keys) 获取您的 OpenAI API 密钥，并将其设置为环境变量。

```shell
export OPENAI_API_KEY=<your_api_key>
```


### 准备稠密和稀疏嵌入函数

让我们虚构 10 个小说的假描述。在实际生产中，这可能是大量的文本数据。


```python
texts = [
    "In 'The Whispering Walls' by Ava Moreno, a young journalist named Sophia uncovers a decades-old conspiracy hidden within the crumbling walls of an ancient mansion, where the whispers of the past threaten to destroy her own sanity.",
    "In 'The Last Refuge' by Ethan Blackwood, a group of survivors must band together to escape a post-apocalyptic wasteland, where the last remnants of humanity cling to life in a desperate bid for survival.",
    "In 'The Memory Thief' by Lila Rose, a charismatic thief with the ability to steal and manipulate memories is hired by a mysterious client to pull off a daring heist, but soon finds themselves trapped in a web of deceit and betrayal.",
    "In 'The City of Echoes' by Julian Saint Clair, a brilliant detective must navigate a labyrinthine metropolis where time is currency, and the rich can live forever, but at a terrible cost to the poor.",
    "In 'The Starlight Serenade' by Ruby Flynn, a shy astronomer discovers a mysterious melody emanating from a distant star, which leads her on a journey to uncover the secrets of the universe and her own heart.",
    "In 'The Shadow Weaver' by Piper Redding, a young orphan discovers she has the ability to weave powerful illusions, but soon finds herself at the center of a deadly game of cat and mouse between rival factions vying for control of the mystical arts.",
    "In 'The Lost Expedition' by Caspian Grey, a team of explorers ventures into the heart of the Amazon rainforest in search of a lost city, but soon finds themselves hunted by a ruthless treasure hunter and the treacherous jungle itself.",
    "In 'The Clockwork Kingdom' by Augusta Wynter, a brilliant inventor discovers a hidden world of clockwork machines and ancient magic, where a rebellion is brewing against the tyrannical ruler of the land.",
    "In 'The Phantom Pilgrim' by Rowan Welles, a charismatic smuggler is hired by a mysterious organization to transport a valuable artifact across a war-torn continent, but soon finds themselves pursued by deadly assassins and rival factions.",
    "In 'The Dreamwalker's Journey' by Lyra Snow, a young dreamwalker discovers she has the ability to enter people's dreams, but soon finds herself trapped in a surreal world of nightmares and illusions, where the boundaries between reality and fantasy blur.",
]
```

我们将使用 [OpenAI 嵌入](https://platform.openai.com/docs/guides/embeddings) 生成稠密向量，并使用 [BM25 算法](https://en.wikipedia.org/wiki/Okapi_BM25) 生成稀疏向量。

初始化密集嵌入函数并获取维度


```python
dense_embedding_func = OpenAIEmbeddings()
dense_dim = len(dense_embedding_func.embed_query(texts[1]))
dense_dim
```



```output
1536
```


初始化稀疏嵌入函数。

注意，稀疏嵌入的输出是一组稀疏向量，表示输入文本的关键词的索引和权重。


```python
sparse_embedding_func = BM25SparseEmbedding(corpus=texts)
sparse_embedding_func.embed_query(texts[1])
```



```output
{0: 0.4270424944042204,
 21: 1.845826690498331,
 22: 1.845826690498331,
 23: 1.845826690498331,
 24: 1.845826690498331,
 25: 1.845826690498331,
 26: 1.845826690498331,
 27: 1.2237754316221157,
 28: 1.845826690498331,
 29: 1.845826690498331,
 30: 1.845826690498331,
 31: 1.845826690498331,
 32: 1.845826690498331,
 33: 1.845826690498331,
 34: 1.845826690498331,
 35: 1.845826690498331,
 36: 1.845826690498331,
 37: 1.845826690498331,
 38: 1.845826690498331,
 39: 1.845826690498331}
```


### 创建 Milvus 集合并加载数据

初始化连接 URI 并建立连接


```python
connections.connect(uri=CONNECTION_URI)
```

定义字段名称及其数据类型


```python
pk_field = "doc_id"
dense_field = "dense_vector"
sparse_field = "sparse_vector"
text_field = "text"
fields = [
    FieldSchema(
        name=pk_field,
        dtype=DataType.VARCHAR,
        is_primary=True,
        auto_id=True,
        max_length=100,
    ),
    FieldSchema(name=dense_field, dtype=DataType.FLOAT_VECTOR, dim=dense_dim),
    FieldSchema(name=sparse_field, dtype=DataType.SPARSE_FLOAT_VECTOR),
    FieldSchema(name=text_field, dtype=DataType.VARCHAR, max_length=65_535),
]
```

使用定义的模式创建集合


```python
schema = CollectionSchema(fields=fields, enable_dynamic_field=False)
collection = Collection(
    name="IntroductionToTheNovels", schema=schema, consistency_level="Strong"
)
```

为密集和稀疏向量定义索引


```python
dense_index = {"index_type": "FLAT", "metric_type": "IP"}
collection.create_index("dense_vector", dense_index)
sparse_index = {"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"}
collection.create_index("sparse_vector", sparse_index)
collection.flush()
```

将实体插入集合并加载集合


```python
entities = []
for text in texts:
    entity = {
        dense_field: dense_embedding_func.embed_documents([text])[0],
        sparse_field: sparse_embedding_func.embed_documents([text])[0],
        text_field: text,
    }
    entities.append(entity)
collection.insert(entities)
collection.load()
```

## 实例化

现在我们可以实例化我们的检索器，定义稀疏和密集字段的搜索参数：


```python
sparse_search_params = {"metric_type": "IP"}
dense_search_params = {"metric_type": "IP", "params": {}}
retriever = MilvusCollectionHybridSearchRetriever(
    collection=collection,
    rerank=WeightedRanker(0.5, 0.5),
    anns_fields=[dense_field, sparse_field],
    field_embeddings=[dense_embedding_func, sparse_embedding_func],
    field_search_params=[dense_search_params, sparse_search_params],
    top_k=3,
    text_field=text_field,
)
```

在这个检索器的输入参数中，我们使用密集嵌入和稀疏嵌入对这个集合的两个字段进行混合搜索，并使用加权排序器进行重新排序。最后，将返回3个前K文档。

## 用法


```python
retriever.invoke("What are the story about ventures?")
```



```output
[Document(page_content="In 'The Lost Expedition' by Caspian Grey, a team of explorers ventures into the heart of the Amazon rainforest in search of a lost city, but soon finds themselves hunted by a ruthless treasure hunter and the treacherous jungle itself.", metadata={'doc_id': '449281835035545843'}),
 Document(page_content="In 'The Phantom Pilgrim' by Rowan Welles, a charismatic smuggler is hired by a mysterious organization to transport a valuable artifact across a war-torn continent, but soon finds themselves pursued by deadly assassins and rival factions.", metadata={'doc_id': '449281835035545845'}),
 Document(page_content="In 'The Dreamwalker's Journey' by Lyra Snow, a young dreamwalker discovers she has the ability to enter people's dreams, but soon finds herself trapped in a surreal world of nightmares and illusions, where the boundaries between reality and fantasy blur.", metadata={'doc_id': '449281835035545846'})]
```


## 在链中使用

初始化ChatOpenAI并定义提示词模板


```python
llm = ChatOpenAI()

PROMPT_TEMPLATE = """
Human: You are an AI assistant, and provides answers to questions by using fact based and statistical information when possible.
Use the following pieces of information to provide a concise answer to the question enclosed in <question> tags.

<context>
{context}
</context>

<question>
{question}
</question>

Assistant:"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE, input_variables=["context", "question"]
)
```

定义一个格式化文档的函数


```python
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)
```

使用检索器和其他组件定义一个链


```python
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

使用定义的链执行查询


```python
rag_chain.invoke("What novels has Lila written and what are their contents?")
```



```output
"Lila Rose has written 'The Memory Thief,' which follows a charismatic thief with the ability to steal and manipulate memories as they navigate a daring heist and a web of deceit and betrayal."
```


删除集合


```python
collection.drop()
```

## API参考

有关所有 `MilvusCollectionHybridSearchRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/milvus/retrievers/langchain_milvus.retrievers.milvus_hybrid_search.MilvusCollectionHybridSearchRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
