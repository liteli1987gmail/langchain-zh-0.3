---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/oci_generative_ai.ipynb
---
# Oracle Cloud Infrastructure 生成式人工智能

Oracle Cloud Infrastructure (OCI) 生成式人工智能是一个完全托管的服务，提供一套最先进的、可定制的大型语言模型 (LLMs)，涵盖广泛的用例，并通过单一 API 提供。
使用 OCI 生成式人工智能服务，您可以访问现成的预训练模型，或根据自己的数据在专用 AI 集群上创建和托管自己的微调自定义模型。服务和 API 的详细文档可在 __[这里](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ 和 __[这里](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ 获取。

本笔记本解释了如何使用 OCI 的生成式人工智能模型与 LangChain。

### 先决条件
我们需要安装 oci sdk


```python
!pip install -U oci
```

### OCI 生成式 AI API 端点
https://inference.generativeai.us-chicago-1.oci.oraclecloud.com

## 认证
此 LangChain 集成支持的认证方法有：

1. API 密钥
2. 会话令牌
3. 实例主体
4. 资源主体

这些遵循标准的 SDK 认证方法，详细信息请见 __[这里](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__。
 

## 使用


```python
<!--IMPORTS:[{"imported": "OCIGenAIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.oci_generative_ai.OCIGenAIEmbeddings.html", "title": "Oracle Cloud Infrastructure Generative AI"}]-->
from langchain_community.embeddings import OCIGenAIEmbeddings

# use default authN method API-key
embeddings = OCIGenAIEmbeddings(
    model_id="MY_EMBEDDING_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
)


query = "This is a query in English."
response = embeddings.embed_query(query)
print(response)

documents = ["This is a sample document", "and here is another one"]
response = embeddings.embed_documents(documents)
print(response)
```


```python
# Use Session Token to authN
embeddings = OCIGenAIEmbeddings(
    model_id="MY_EMBEDDING_MODEL",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    auth_type="SECURITY_TOKEN",
    auth_profile="MY_PROFILE",  # replace with your profile name
)


query = "This is a sample query"
response = embeddings.embed_query(query)
print(response)

documents = ["This is a sample document", "and here is another one"]
response = embeddings.embed_documents(documents)
print(response)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
