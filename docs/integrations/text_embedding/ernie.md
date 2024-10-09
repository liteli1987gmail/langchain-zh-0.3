---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/ernie.ipynb
---
# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu) 是基于 `百度文心` 大规模模型技术的文本表示模型，
它将文本转换为由数值表示的向量形式，广泛应用于文本检索、信息推荐、知识挖掘等场景。

**弃用警告**

我们建议用户使用 `langchain_community.embeddings.ErnieEmbeddings`
改用 `langchain_community.embeddings.QianfanEmbeddingsEndpoint`。

`QianfanEmbeddingsEndpoint` 的文档在 [这里](/docs/integrations/text_embedding/baidu_qianfan_endpoint/)。

我们推荐用户使用 `QianfanEmbeddingsEndpoint` 的原因有两个：

1. `QianfanEmbeddingsEndpoint` 支持更多的嵌入模型在 Qianfan 平台上。
2. `ErnieEmbeddings` 缺乏维护并已被弃用。

迁移的一些提示：


```python
<!--IMPORTS:[{"imported": "QianfanEmbeddingsEndpoint", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.baidu_qianfan_endpoint.QianfanEmbeddingsEndpoint.html", "title": "ERNIE"}]-->
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## 使用


```python
<!--IMPORTS:[{"imported": "ErnieEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.ernie.ErnieEmbeddings.html", "title": "ERNIE"}]-->
from langchain_community.embeddings import ErnieEmbeddings
```


```python
embeddings = ErnieEmbeddings()
```


```python
query_result = embeddings.embed_query("foo")
```


```python
doc_results = embeddings.embed_documents(["foo"])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
