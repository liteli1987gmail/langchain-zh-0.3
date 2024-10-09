---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/xinference.ipynb
---
# Xorbits 推理 (Xinference)

本笔记本介绍如何在 LangChain 中使用 Xinference 嵌入

## 安装

通过 PyPI 安装 `Xinference`:


```python
%pip install --upgrade --quiet  "xinference[all]"
```

## 在本地或分布式集群中部署 Xinference。

要进行本地部署，请运行 `xinference`。

要在集群中部署 Xinference，首先使用 `xinference-supervisor` 启动一个 Xinference 监督进程。您还可以使用 -p 选项指定端口，使用 -H 指定主机。默认端口为 9997。

然后，在您希望运行它们的每个服务器上使用 `xinference-worker` 启动 Xinference 工作进程。

您可以查阅 [Xinference](https://github.com/xorbitsai/inference) 的 README 文件以获取更多信息。

## 包装器

要将 Xinference 与 LangChain 一起使用，您需要首先启动一个模型。您可以使用命令行界面 (CLI) 来做到这一点：


```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```
```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```
将返回一个模型 UID 供您使用。现在您可以将 Xinference 嵌入与 LangChain 一起使用：


```python
<!--IMPORTS:[{"imported": "XinferenceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.xinference.XinferenceEmbeddings.html", "title": "Xorbits inference (Xinference)"}]-->
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```


```python
query_result = xinference.embed_query("This is a test query")
```


```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

最后，当您不再需要使用模型时，请终止该模型：


```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
