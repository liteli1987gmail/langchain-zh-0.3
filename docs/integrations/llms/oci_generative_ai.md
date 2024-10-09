---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/oci_generative_ai.ipynb
---
## Oracle Cloud Infrastructure 生成式人工智能

Oracle Cloud Infrastructure (OCI) 生成式人工智能是一个完全托管的服务，提供一套最先进的、可定制的大型语言模型 (LLMs)，涵盖广泛的使用案例，并通过单一 API 提供。
使用 OCI 生成式人工智能服务，您可以访问现成的预训练模型，或根据自己的数据在专用 AI 集群上创建和托管自己的微调自定义模型。服务和 API 的详细文档可在 __[这里](https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm)__ 和 __[这里](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/)__ 获取。

本笔记本解释了如何使用 OCI 的生成式人工智能完整模型与 LangChain。

## 设置
确保已安装 oci sdk 和 langchain-community 包


```python
!pip install -U oci langchain-community
```

## 使用


```python
<!--IMPORTS:[{"imported": "OCIGenAI", "source": "langchain_community.llms.oci_generative_ai", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.oci_generative_ai.OCIGenAI.html", "title": "# Oracle Cloud Infrastructure Generative AI"}]-->
from langchain_community.llms.oci_generative_ai import OCIGenAI

llm = OCIGenAI(
    model_id="cohere.command",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    model_kwargs={"temperature": 0, "max_tokens": 500},
)

response = llm.invoke("Tell me one fact about earth", temperature=0.7)
print(response)
```

#### 使用提示词模板进行链式调用


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "# Oracle Cloud Infrastructure Generative AI"}]-->
from langchain_core.prompts import PromptTemplate

llm = OCIGenAI(
    model_id="cohere.command",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    model_kwargs={"temperature": 0, "max_tokens": 500},
)

prompt = PromptTemplate(input_variables=["query"], template="{query}")
llm_chain = prompt | llm

response = llm_chain.invoke("what is the capital of france?")
print(response)
```

#### 流式处理


```python
llm = OCIGenAI(
    model_id="cohere.command",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    model_kwargs={"temperature": 0, "max_tokens": 500},
)

for chunk in llm.stream("Write me a song about sparkling water."):
    print(chunk, end="", flush=True)
```

## 认证
LlamaIndex 支持的认证方法与其他 OCI 服务使用的认证方法相同，并遵循 __[标准 SDK 认证](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdk_authentication_methods.htm)__ 方法，具体包括 API 密钥、会话令牌、实例主体和资源主体。

API 密钥是上述示例中使用的默认认证方法。以下示例演示如何使用不同的认证方法（会话令牌）


```python
llm = OCIGenAI(
    model_id="cohere.command",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="MY_OCID",
    auth_type="SECURITY_TOKEN",
    auth_profile="MY_PROFILE",  # replace with your profile name
)
```

## 专用 AI 集群
要访问托管在专用 AI 集群中的模型 __[创建一个端点](https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai-inference/20231130/)__，其分配的 OCID（当前以 ‘ocid1.generativeaiendpoint.oc1.us-chicago-1’ 为前缀）将用作您的模型 ID。

访问托管在专用 AI 集群中的模型时，您需要使用两个额外的必需参数（“provider”和“context_size”）初始化 OCIGenAI 接口。


```python
llm = OCIGenAI(
    model_id="ocid1.generativeaiendpoint.oc1.us-chicago-1....",
    service_endpoint="https://inference.generativeai.us-chicago-1.oci.oraclecloud.com",
    compartment_id="DEDICATED_COMPARTMENT_OCID",
    auth_profile="MY_PROFILE",  # replace with your profile name,
    provider="MODEL_PROVIDER",  # e.g., "cohere" or "meta"
    context_size="MODEL_CONTEXT_SIZE",  # e.g., 128000
)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
