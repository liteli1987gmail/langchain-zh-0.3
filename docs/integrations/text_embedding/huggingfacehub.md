---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/huggingfacehub.ipynb
---
# Hugging Face
让我们加载 Hugging Face 嵌入类。


```python
%pip install --upgrade --quiet  langchain sentence_transformers
```


```python
<!--IMPORTS:[{"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface.embeddings", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Hugging Face"}]-->
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
```


```python
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
```


```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


```python
query_result[:3]
```



```output
[-0.04895168915390968, -0.03986193612217903, -0.021562768146395683]
```



```python
doc_result = embeddings.embed_documents([text])
```

## Hugging Face 推理 API
我们还可以通过 Hugging Face 推理 API 访问嵌入模型，这不需要我们安装 ``sentence_transformers`` 并在本地下载模型。


```python
import getpass

inference_api_key = getpass.getpass("Enter your HF Inference API Key:\n\n")
```
```output
Enter your HF Inference API Key:

 ········
```

```python
<!--IMPORTS:[{"imported": "HuggingFaceInferenceAPIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.HuggingFaceInferenceAPIEmbeddings.html", "title": "Hugging Face"}]-->
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings

embeddings = HuggingFaceInferenceAPIEmbeddings(
    api_key=inference_api_key, model_name="sentence-transformers/all-MiniLM-l6-v2"
)

query_result = embeddings.embed_query(text)
query_result[:3]
```



```output
[-0.038338541984558105, 0.1234646737575531, -0.028642963618040085]
```


## Hugging Face Hub
我们还可以通过 Hugging Face Hub 包在本地生成嵌入，这需要我们安装 ``huggingface_hub``。


```python
!pip install huggingface_hub
```


```python
<!--IMPORTS:[{"imported": "HuggingFaceEndpointEmbeddings", "source": "langchain_huggingface.embeddings", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface_endpoint.HuggingFaceEndpointEmbeddings.html", "title": "Hugging Face"}]-->
from langchain_huggingface.embeddings import HuggingFaceEndpointEmbeddings
```


```python
embeddings = HuggingFaceEndpointEmbeddings()
```


```python
text = "This is a test document."
```


```python
query_result = embeddings.embed_query(text)
```


```python
query_result[:3]
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
