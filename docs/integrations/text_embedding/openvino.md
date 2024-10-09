---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/openvino.ipynb
---
# OpenVINO
[OpenVINO™](https://github.com/openvinotoolkit/openvino) 是一个开源工具包，用于优化和部署 AI 推理。OpenVINO™ Runtime 支持各种硬件 [设备](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix)，包括 x86 和 ARM CPU 以及 Intel GPU。它可以帮助提升计算机视觉、自动语音识别、自然语言处理和其他常见任务中的深度学习性能。

Hugging Face 嵌入模型可以通过 ``OpenVINOEmbeddings`` 类在 OpenVINO 中得到支持。如果您有 Intel GPU，可以指定 `model_kwargs=` 来在其上运行推理。


```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```
```output
Note: you may need to restart the kernel to use updated packages.
```

```python
<!--IMPORTS:[{"imported": "OpenVINOEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.openvino.OpenVINOEmbeddings.html", "title": "OpenVINO"}]-->
from langchain_community.embeddings import OpenVINOEmbeddings
```


```python
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"mean_pooling": True, "normalize_embeddings": True}

ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```


```python
text = "This is a test document."
```


```python
query_result = ov_embeddings.embed_query(text)
```


```python
query_result[:3]
```



```output
[-0.048951778560876846, -0.03986183926463127, -0.02156277745962143]
```



```python
doc_result = ov_embeddings.embed_documents([text])
```

## 导出 IR 模型
可以使用 ``OVModelForFeatureExtraction`` 将您的嵌入模型导出为 OpenVINO IR 格式，并从本地文件夹加载模型。


```python
from pathlib import Path

ov_model_dir = "all-mpnet-base-v2-ov"
if not Path(ov_model_dir).exists():
    ov_embeddings.save_model(ov_model_dir)
```


```python
ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=ov_model_dir,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```
```output
Compiling the model to CPU ...
```
## 使用 OpenVINO 的 BGE
我们还可以通过 ``OpenVINOBgeEmbeddings`` 类访问 BGE 嵌入模型，使用 OpenVINO。


```python
<!--IMPORTS:[{"imported": "OpenVINOBgeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.openvino.OpenVINOBgeEmbeddings.html", "title": "OpenVINO"}]-->
from langchain_community.embeddings import OpenVINOBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"normalize_embeddings": True}
ov_embeddings = OpenVINOBgeEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```


```python
embedding = ov_embeddings.embed_query("hi this is harrison")
len(embedding)
```



```output
384
```


有关更多信息，请参阅：

* [OpenVINO LLM 指南](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)。

* [OpenVINO 文档](https://docs.openvino.ai/2024/home.html)。

* [OpenVINO 入门指南](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)。

* [与 LangChain 的 RAG 笔记本](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)。


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
