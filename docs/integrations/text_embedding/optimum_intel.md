---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/optimum_intel.ipynb
---
# 使用优化和量化嵌入器嵌入文档

使用量化嵌入器嵌入所有文档。

这些嵌入器基于优化模型，使用 [optimum-intel](https://github.com/huggingface/optimum-intel.git) 和 [IPEX](https://github.com/intel/intel-extension-for-pytorch) 创建。

示例文本基于 [SBERT](https://www.sbert.net/docs/pretrained_cross-encoders.html)。


```python
<!--IMPORTS:[{"imported": "QuantizedBiEncoderEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.optimum_intel.QuantizedBiEncoderEmbeddings.html", "title": "Embedding Documents using Optimized and Quantized Embedders"}]-->
from langchain_community.embeddings import QuantizedBiEncoderEmbeddings

model_name = "Intel/bge-small-en-v1.5-rag-int8-static"
encode_kwargs = {"normalize_embeddings": True}  # set True to compute cosine similarity

model = QuantizedBiEncoderEmbeddings(
    model_name=model_name,
    encode_kwargs=encode_kwargs,
    query_instruction="Represent this sentence for searching relevant passages: ",
)
```
```output
loading configuration file inc_config.json from cache at 
INCConfig {
  "distillation": {},
  "neural_compressor_version": "2.4.1",
  "optimum_version": "1.16.2",
  "pruning": {},
  "quantization": {
    "dataset_num_samples": 50,
    "is_static": true
  },
  "save_onnx_model": false,
  "torch_version": "2.2.0",
  "transformers_version": "4.37.2"
}

Using `INCModel` to load a TorchScript model will be deprecated in v1.15.0, to load your model please use `IPEXModel` instead.
```
让我们提出一个问题，并与两个文档进行比较。第一个文档包含问题的答案，而第二个文档则不包含。

我们可以检查哪个更适合我们的查询。


```python
question = "How many people live in Berlin?"
```


```python
documents = [
    "Berlin had a population of 3,520,031 registered inhabitants in an area of 891.82 square kilometers.",
    "Berlin is well known for its museums.",
]
```


```python
doc_vecs = model.embed_documents(documents)
```
```output
Batches: 100%|██████████| 1/1 [00:00<00:00,  4.18it/s]
```

```python
query_vec = model.embed_query(question)
```


```python
import torch
```


```python
doc_vecs_torch = torch.tensor(doc_vecs)
```


```python
query_vec_torch = torch.tensor(query_vec)
```


```python
query_vec_torch @ doc_vecs_torch.T
```



```output
tensor([0.7980, 0.6529])
```


我们可以看到，确实第一个的排名更高。


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
