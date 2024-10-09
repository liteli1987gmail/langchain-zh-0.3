---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/tensorflowhub.ipynb
---
# TensorFlow Hub

>[TensorFlow Hub](https://www.tensorflow.org/hub) 是一个经过训练的机器学习模型的仓库，准备好进行微调并可在任何地方部署。只需几行代码即可重用训练好的模型，如 `BERT` 和 `Faster R-CNN`。
>
>
让我们加载 TensorflowHub 嵌入类。


```python
<!--IMPORTS:[{"imported": "TensorflowHubEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.tensorflow_hub.TensorflowHubEmbeddings.html", "title": "TensorFlow Hub"}]-->
from langchain_community.embeddings import TensorflowHubEmbeddings
```


```python
embeddings = TensorflowHubEmbeddings()
```
```output
2023-01-30 23:53:01.652176: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
2023-01-30 23:53:34.362802: I tensorflow/core/platform/cpu_feature_guard.cc:193] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX2 FMA
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
```

```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


```python
doc_results = embeddings.embed_documents(["foo"])
```


```python
doc_results
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
