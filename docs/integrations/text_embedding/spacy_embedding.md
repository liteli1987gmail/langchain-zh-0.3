---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/spacy_embedding.ipynb
---
# SpaCy

>[spaCy](https://spacy.io/) 是一个用于高级自然语言处理的开源软件库，使用编程语言 Python 和 Cython 编写。
 

## 安装和设置


```python
%pip install --upgrade --quiet  spacy
```

导入必要的类


```python
<!--IMPORTS:[{"imported": "SpacyEmbeddings", "source": "langchain_community.embeddings.spacy_embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.spacy_embeddings.SpacyEmbeddings.html", "title": "SpaCy"}]-->
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## 示例

初始化 SpacyEmbeddings。这将把 Spacy 模型加载到内存中。


```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

定义一些示例文本。这些可以是您想要分析的任何文档，例如新闻文章、社交媒体帖子或产品评论。


```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

为文本生成并打印嵌入。SpacyEmbeddings 类为每个文档生成一个嵌入，这是文档内容的数值表示。这些嵌入可以用于各种自然语言处理任务，例如文档相似性比较或文本分类。


```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

为单个文本生成并打印嵌入。您还可以为单个文本生成嵌入，例如搜索查询。这对于信息检索等任务非常有用，您希望找到与给定查询相似的文档。


```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
