---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/jina.ipynb
---
# Jina

安装要求


```python
pip install -U langchain-community
```

导入库


```python
<!--IMPORTS:[{"imported": "JinaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.jina.JinaEmbeddings.html", "title": "Jina"}]-->
import requests
from langchain_community.embeddings import JinaEmbeddings
from numpy import dot
from numpy.linalg import norm
from PIL import Image
```

## 通过 JinaAI API 使用 Jina 嵌入模型嵌入文本和查询


```python
text_embeddings = JinaEmbeddings(
    jina_api_key="jina_*", model_name="jina-embeddings-v2-base-en"
)
```


```python
text = "This is a test document."
```


```python
query_result = text_embeddings.embed_query(text)
```


```python
print(query_result)
```


```python
doc_result = text_embeddings.embed_documents([text])
```


```python
print(doc_result)
```

## 通过 JinaAI API 使用 Jina CLIP 嵌入图像和查询


```python
multimodal_embeddings = JinaEmbeddings(jina_api_key="jina_*", model_name="jina-clip-v1")
```


```python
image = "https://avatars.githubusercontent.com/u/126733545?v=4"

description = "Logo of a parrot and a chain on green background"

im = Image.open(requests.get(image, stream=True).raw)
print("Image:")
display(im)
```


```python
image_result = multimodal_embeddings.embed_images([image])
```


```python
print(image_result)
```


```python
description_result = multimodal_embeddings.embed_documents([description])
```


```python
print(description_result)
```


```python
cosine_similarity = dot(image_result[0], description_result[0]) / (
    norm(image_result[0]) * norm(description_result[0])
)
```


```python
print(cosine_similarity)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
