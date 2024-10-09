---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/azureml_chat_endpoint.ipynb
sidebar_label: Azure ML Endpoint
---
# AzureML聊天在线端点

>[Azure 机器学习](https://azure.microsoft.com/en-us/products/machine-learning/) 是一个用于构建、训练和部署机器学习模型的平台。用户可以在模型目录中探索可部署的模型类型，该目录提供来自不同供应商的基础和通用模型。
>
>一般来说，您需要部署模型以便使用其预测（推理）。在 `Azure 机器学习` 中，[在线端点](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints) 用于以实时服务的方式部署这些模型。它们基于 `端点` 和 `部署` 的理念，允许您将生产工作负载的接口与提供该服务的实现解耦。

本笔记本介绍如何使用托管在 `Azure 机器学习端点` 上的聊天模型。


```python
<!--IMPORTS:[{"imported": "AzureMLChatOnlineEndpoint", "source": "langchain_community.chat_models.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.azureml_endpoint.AzureMLChatOnlineEndpoint.html", "title": "AzureMLChatOnlineEndpoint"}]-->
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## 设置

您必须[在 Azure ML 上部署模型](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing)或[在 Azure AI Studio 上部署](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open)并获取以下参数：

* `endpoint_url`: 由端点提供的 REST 端点 URL。
* `endpoint_api_type`: 在将模型部署到 **专用端点**（托管的管理基础设施）时使用 `endpoint_type='dedicated'`。在使用 **按需付费** 提供的模型（即服务）时使用 `endpoint_type='serverless'`。
* `endpoint_api_key`: 由端点提供的 API 密钥

## 内容格式化器

`content_formatter` 参数是一个处理类，用于将 AzureML 端点的请求和响应转换为所需的模式。由于模型目录中有各种各样的模型，每个模型可能以不同的方式处理数据，因此提供了一个 `ContentFormatterBase` 类，以允许用户根据自己的喜好转换数据。提供以下内容格式化器：

* `CustomOpenAIChatContentFormatter`: 为像 LLaMa2-chat 这样的模型格式化请求和响应数据，这些模型遵循 OpenAI API 规范。

*注意：`langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter` 正在被弃用，并被 `langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter` 替代。*

您可以实现特定于您的模型的自定义内容格式化器，派生自类 `langchain_community.llms.azureml_endpoint.ContentFormatterBase`。

## 示例

以下部分包含有关如何使用此类的示例：

### 示例：使用实时端点的聊天完成


```python
<!--IMPORTS:[{"imported": "AzureMLEndpointApiType", "source": "langchain_community.chat_models.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.AzureMLEndpointApiType.html", "title": "AzureMLChatOnlineEndpoint"}, {"imported": "CustomOpenAIChatContentFormatter", "source": "langchain_community.chat_models.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter.html", "title": "AzureMLChatOnlineEndpoint"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "AzureMLChatOnlineEndpoint"}]-->
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```



```output
AIMessage(content='  The Collatz Conjecture is one of the most famous unsolved problems in mathematics, and it has been the subject of much study and research for many years. While it is impossible to predict with certainty whether the conjecture will ever be solved, there are several reasons why it is considered a challenging and important problem:\n\n1. Simple yet elusive: The Collatz Conjecture is a deceptively simple statement that has proven to be extraordinarily difficult to prove or disprove. Despite its simplicity, the conjecture has eluded some of the brightest minds in mathematics, and it remains one of the most famous open problems in the field.\n2. Wide-ranging implications: The Collatz Conjecture has far-reaching implications for many areas of mathematics, including number theory, algebra, and analysis. A solution to the conjecture could have significant impacts on these fields and potentially lead to new insights and discoveries.\n3. Computational evidence: While the conjecture remains unproven, extensive computational evidence supports its validity. In fact, no counterexample to the conjecture has been found for any starting value up to 2^64 (a number', additional_kwargs={}, example=False)
```


### 示例：按需部署的聊天完成（模型即服务）


```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

如果您需要向模型传递其他参数，请使用 `model_kwargs` 参数：


```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

参数也可以在调用时传递：


```python
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")],
    max_tokens=512,
)
response
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
