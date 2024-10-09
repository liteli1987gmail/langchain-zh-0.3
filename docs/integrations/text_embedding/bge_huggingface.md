---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/bge_huggingface.ipynb
---
# BGE 在 Hugging Face 上

>[HuggingFace 上的 BGE 模型](https://huggingface.co/BAAI/bge-large-en-v1.5) 是 [最佳开源嵌入模型之一](https://huggingface.co/spaces/mteb/leaderboard)。
>BGE 模型由 [北京人工智能研究院 (BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence) 创建。`BAAI` 是一个从事人工智能研究和开发的私营非营利组织。

本笔记本展示了如何通过 `Hugging Face` 使用 `BGE 嵌入`


```python
%pip install --upgrade --quiet  sentence_transformers
```


```python
<!--IMPORTS:[{"imported": "HuggingFaceBgeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.HuggingFaceBgeEmbeddings.html", "title": "BGE on Hugging Face"}]-->
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "cpu"}
encode_kwargs = {"normalize_embeddings": True}
hf = HuggingFaceBgeEmbeddings(
    model_name=model_name, model_kwargs=model_kwargs, encode_kwargs=encode_kwargs
)
```

请注意，对于 `model_name="BAAI/bge-m3"` 需要传递 `query_instruction=""`，请参见 [FAQ BGE M3](https://huggingface.co/BAAI/bge-m3#faq)。


```python
embedding = hf.embed_query("hi this is harrison")
len(embedding)
```



```output
384
```



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
