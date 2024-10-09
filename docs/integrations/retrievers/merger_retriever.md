---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/merger_retriever.ipynb
---
# LOTR (合并检索器)

>`检索者之主 (LOTR)`，也称为`合并检索器`，接受一个检索器列表作为输入，并将它们的 get_relevant_documents() 方法的结果合并为一个单一列表。合并后的结果将是与查询相关的文档列表，并且这些文档已由不同的检索器进行排名。

`合并检索器` 类可以通过多种方式提高文档检索的准确性。首先，它可以结合多个检索器的结果，这有助于减少结果中的偏差风险。其次，它可以对不同检索器的结果进行排名，这有助于确保最相关的文档优先返回。


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "LOTR (Merger Retriever)"}, {"imported": "MergerRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.merger_retriever.MergerRetriever.html", "title": "LOTR (Merger Retriever)"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "LOTR (Merger Retriever)"}, {"imported": "EmbeddingsClusteringFilter", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.embeddings_redundant_filter.EmbeddingsClusteringFilter.html", "title": "LOTR (Merger Retriever)"}, {"imported": "EmbeddingsRedundantFilter", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.embeddings_redundant_filter.EmbeddingsRedundantFilter.html", "title": "LOTR (Merger Retriever)"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "LOTR (Merger Retriever)"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "LOTR (Merger Retriever)"}]-->
import os

import chromadb
from langchain.retrievers import (
    ContextualCompressionRetriever,
    DocumentCompressorPipeline,
    MergerRetriever,
)
from langchain_chroma import Chroma
from langchain_community.document_transformers import (
    EmbeddingsClusteringFilter,
    EmbeddingsRedundantFilter,
)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings

# Get 3 diff embeddings.
all_mini = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
multi_qa_mini = HuggingFaceEmbeddings(model_name="multi-qa-MiniLM-L6-dot-v1")
filter_embeddings = OpenAIEmbeddings()

ABS_PATH = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(ABS_PATH, "db")

# Instantiate 2 diff chromadb indexes, each one with a diff embedding.
client_settings = chromadb.config.Settings(
    is_persistent=True,
    persist_directory=DB_DIR,
    anonymized_telemetry=False,
)
db_all = Chroma(
    collection_name="project_store_all",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=all_mini,
)
db_multi_qa = Chroma(
    collection_name="project_store_multi",
    persist_directory=DB_DIR,
    client_settings=client_settings,
    embedding_function=multi_qa_mini,
)

# Define 2 diff retrievers with 2 diff embeddings and diff search type.
retriever_all = db_all.as_retriever(
    search_type="similarity", search_kwargs={"k": 5, "include_metadata": True}
)
retriever_multi_qa = db_multi_qa.as_retriever(
    search_type="mmr", search_kwargs={"k": 5, "include_metadata": True}
)

# The Lord of the Retrievers will hold the output of both retrievers and can be used as any other
# retriever on different types of chains.
lotr = MergerRetriever(retrievers=[retriever_all, retriever_multi_qa])
```

## 从合并的检索器中移除冗余结果。


```python
# We can remove redundant results from both retrievers using yet another embedding.
# Using multiples embeddings in diff steps could help reduce biases.
filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
pipeline = DocumentCompressorPipeline(transformers=[filter])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## 从合并的检索器中选择一组代表性的文档。


```python
# This filter will divide the documents vectors into clusters or "centers" of meaning.
# Then it will pick the closest document to that center for the final results.
# By default the result document will be ordered/grouped by clusters.
filter_ordered_cluster = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
)

# If you want the final document to be ordered by the original retriever scores
# you need to add the "sorted" parameter.
filter_ordered_by_retriever = EmbeddingsClusteringFilter(
    embeddings=filter_embeddings,
    num_clusters=10,
    num_closest=1,
    sorted=True,
)

pipeline = DocumentCompressorPipeline(transformers=[filter_ordered_by_retriever])
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```

## 重新排序结果以避免性能下降。
无论模型的架构如何，当你包含10个以上的检索文档时，性能都会显著下降。
简而言之：当模型必须在长上下文中访问相关信息时，往往会忽略提供的文档。
见：https://arxiv.org/abs//2307.03172


```python
<!--IMPORTS:[{"imported": "LongContextReorder", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.long_context_reorder.LongContextReorder.html", "title": "LOTR (Merger Retriever)"}]-->
# You can use an additional document transformer to reorder documents after removing redundancy.
from langchain_community.document_transformers import LongContextReorder

filter = EmbeddingsRedundantFilter(embeddings=filter_embeddings)
reordering = LongContextReorder()
pipeline = DocumentCompressorPipeline(transformers=[filter, reordering])
compression_retriever_reordered = ContextualCompressionRetriever(
    base_compressor=pipeline, base_retriever=lotr
)
```


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
