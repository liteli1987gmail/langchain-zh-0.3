---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/thirdai_neuraldb.ipynb
---
# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/) 是由 [ThirdAI](https://www.thirdai.com/) 开发的一个对CPU友好且可微调的向量存储。

## 初始化

有两种初始化方法：
- 从头开始：基本模型
- 从检查点：加载之前保存的模型

对于所有以下初始化方法，如果设置了 `THIRDAI_KEY` 环境变量，则可以省略 `thirdai_key` 参数。

可以在 https://www.thirdai.com/try-bolt/ 获取 ThirdAI API 密钥。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。


```python
<!--IMPORTS:[{"imported": "NeuralDBVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.thirdai_neuraldb.NeuralDBVectorStore.html", "title": "ThirdAI NeuralDB"}]-->
from langchain_community.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## 插入文档源


```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

## 相似性搜索

要查询向量存储，您可以使用标准的 LangChain 向量存储方法 `similarity_search`，该方法返回一个 LangChain 文档对象的列表。每个文档对象代表来自索引文件的一段文本。例如，它可能包含来自某个索引 PDF 文件的段落。除了文本之外，文档的元数据字段还包含信息，例如文档的 ID、该文档的来源（来自哪个文件）以及文档的得分。


```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## 微调

NeuralDBVectorStore 可以根据用户行为和特定领域知识进行微调。可以通过两种方式进行微调：
1. 关联：向量存储将源短语与目标短语关联。当向量存储看到源短语时，它还会考虑与目标短语相关的结果。
2. 赞成：向量存储会提高特定查询的文档得分。这在您想要根据用户行为微调向量存储时非常有用。例如，如果用户搜索“汽车是如何制造的”并喜欢返回的 ID 为 52 的文档，那么我们可以为查询“汽车是如何制造的”对 ID 为 52 的文档进行赞成。


```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
