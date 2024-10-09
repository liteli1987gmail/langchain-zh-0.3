---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/bedrock.ipynb
---
# Bedrock

> [Amazon Bedrock](https://aws.amazon.com/bedrock/) 是一项完全托管的服务，提供来自
> 领先AI公司如 `AI21 Labs`、`Anthropic`、`Cohere` 的高性能基础模型 (FMs)，
> `Meta`、`Stability AI` 和 `Amazon`，通过单一API，以及您构建
> 具有安全性、隐私和负责任的AI所需的广泛功能的生成AI应用程序。使用 `Amazon Bedrock`，
> 您可以轻松地实验和评估适合您用例的顶级FMs，私下使用
> 您的数据通过微调和 `检索增强生成` (`RAG`) 等技术进行定制，并构建
> 执行任务的代理，使用您的企业系统和数据源。由于 `Amazon Bedrock` 是
> 无服务器的，您无需管理任何基础设施，您可以安全地集成和部署
> 生成AI功能到您已经熟悉的AWS服务中的应用程序。




```python
%pip install --upgrade --quiet  boto3
```


```python
<!--IMPORTS:[{"imported": "BedrockEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.bedrock.BedrockEmbeddings.html", "title": "Bedrock"}]-->
from langchain_community.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    credentials_profile_name="bedrock-admin", region_name="us-east-1"
)
```


```python
embeddings.embed_query("This is a content of the document")
```


```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```


```python
# async embed query
await embeddings.aembed_query("This is a content of the document")
```


```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
