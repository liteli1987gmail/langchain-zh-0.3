---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/text_embeddings_inference.ipynb
---
# 文本嵌入推理

> [Hugging Face 文本嵌入推理 (TEI)](https://huggingface.co/docs/text-embeddings-inference/index) 是一个用于部署和服务开源
> 文本嵌入和序列分类模型的工具包。`TEI` 使得最流行模型的高性能提取成为可能，
> 包括 `FlagEmbedding`、`Ember`、`GTE` 和 `E5`。

要在 LangChain 中使用它，首先安装 `huggingface-hub`。


```python
%pip install --upgrade huggingface-hub
```

然后使用TEI暴露一个嵌入模型。例如，使用Docker，您可以如下提供`BAAI/bge-large-en-v1.5`：

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

Docker的具体使用可能会因底层硬件而异。例如，要在Intel Gaudi/Gaudi2硬件上提供模型，请参考[tei-gaudi仓库](https://github.com/huggingface/tei-gaudi)以获取相关的docker运行命令。

最后，实例化客户端并嵌入您的文本。


```python
<!--IMPORTS:[{"imported": "HuggingFaceEndpointEmbeddings", "source": "langchain_huggingface.embeddings", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface_endpoint.HuggingFaceEndpointEmbeddings.html", "title": "Text Embeddings Inference"}]-->
from langchain_huggingface.embeddings import HuggingFaceEndpointEmbeddings
```


```python
embeddings = HuggingFaceEndpointEmbeddings(model="http://localhost:8080")
```


```python
text = "What is deep learning?"
```


```python
query_result = embeddings.embed_query(text)
query_result[:3]
```



```output
[0.018113142, 0.00302585, -0.049911194]
```



```python
doc_result = embeddings.embed_documents([text])
```


```python
doc_result[0][:3]
```



```output
[0.018113142, 0.00302585, -0.049911194]
```



## 相关

- 嵌入模型[概念指南](/docs/concepts/#embedding-models)
- 嵌入模型[操作指南](/docs/how_to/#embedding-models)
