---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/instruct_embeddings.ipynb
---
# 在 Hugging Face 上的指令嵌入

> [Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) 是一个用于最先进的句子、文本和图像嵌入的 Python 框架。
> 指令嵌入模型之一在 `HuggingFaceInstructEmbeddings` 类中使用。



```python
<!--IMPORTS:[{"imported": "HuggingFaceInstructEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.HuggingFaceInstructEmbeddings.html", "title": "Instruct Embeddings on Hugging Face"}]-->
from langchain_community.embeddings import HuggingFaceInstructEmbeddings
```


```python
embeddings = HuggingFaceInstructEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```
```output
load INSTRUCTOR_Transformer
max_seq_length  512
```

```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
