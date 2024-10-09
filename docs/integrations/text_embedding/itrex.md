---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/itrex.ipynb
---
# 英特尔® Transformers 扩展量化文本嵌入

加载由 [英特尔® Transformers 扩展](https://github.com/intel/intel-extension-for-transformers) (ITREX) 生成的量化 BGE 嵌入模型，并使用 ITREX [神经引擎](https://github.com/intel/intel-extension-for-transformers/blob/main/intel_extension_for_transformers/llm/runtime/deprecated/docs/Installation.md)，这是一个高性能的 NLP 后端，以加速模型推理而不影响准确性。

有关更多详细信息，请参阅我们的博客 [使用英特尔 Transformers 扩展的高效自然语言嵌入模型](https://medium.com/intel-analytics-software/efficient-natural-language-embedding-models-with-intel-extension-for-transformers-2b6fcd0f8f34) 和 [BGE 优化示例](https://github.com/intel/intel-extension-for-transformers/tree/main/examples/huggingface/pytorch/text-embedding/deployment/mteb/bge)。


```python
<!--IMPORTS:[{"imported": "QuantizedBgeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.itrex.QuantizedBgeEmbeddings.html", "title": "Intel\u00ae Extension for Transformers Quantized Text Embeddings"}]-->
from langchain_community.embeddings import QuantizedBgeEmbeddings

model_name = "Intel/bge-small-en-v1.5-sts-int8-static-inc"
encode_kwargs = {"normalize_embeddings": True}  # set True to compute cosine similarity

model = QuantizedBgeEmbeddings(
    model_name=model_name,
    encode_kwargs=encode_kwargs,
    query_instruction="Represent this sentence for searching relevant passages: ",
)
```
```output
/home/yuwenzho/.conda/envs/bge/lib/python3.9/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
2024-03-04 10:17:17 [INFO] Start to extarct onnx model ops...
2024-03-04 10:17:17 [INFO] Extract onnxruntime model done...
2024-03-04 10:17:17 [INFO] Start to implement Sub-Graph matching and replacing...
2024-03-04 10:17:18 [INFO] Sub-Graph match and replace done...
```
## 使用


```python
text = "This is a test document."
query_result = model.embed_query(text)
doc_result = model.embed_documents([text])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
