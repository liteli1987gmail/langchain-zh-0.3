---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/azure_ml.ipynb
---
# Azure ML

[Azure ML](https://azure.microsoft.com/en-us/products/machine-learning/) 是一个用于构建、训练和部署机器学习模型的平台。用户可以在模型目录中探索可部署的模型类型，该目录提供来自不同供应商的基础和通用模型。

本笔记本介绍如何使用托管在 `Azure ML 在线端点` 上的 LLM。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```


```python
<!--IMPORTS:[{"imported": "AzureMLOnlineEndpoint", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.AzureMLOnlineEndpoint.html", "title": "Azure ML"}]-->
from langchain_community.llms.azureml_endpoint import AzureMLOnlineEndpoint
```

## 设置

您必须 [在 Azure ML 上部署模型](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) 或 [在 Azure AI Studio 上](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) 并获取以下参数：

* `endpoint_url`: 由端点提供的 REST 端点 URL。
* `endpoint_api_type`: 在将模型部署到 **专用端点**（托管的基础设施）时使用 `endpoint_type='dedicated'`。在使用 **按需付费** 提供的模型作为服务时，使用 `endpoint_type='serverless'`。
* `endpoint_api_key`: 由端点提供的 API 密钥。
* `deployment_name`: （可选）使用端点的模型的部署名称。

## 内容格式化器

`content_formatter` 参数是一个处理类，用于将 AzureML 端点的请求和响应转换为所需的模式。由于模型目录中有各种各样的模型，每个模型可能以不同的方式处理数据，因此提供了一个 `ContentFormatterBase` 类，以允许用户根据自己的喜好转换数据。提供以下内容格式化器：

* `GPT2ContentFormatter`: 格式化 GPT2 的请求和响应数据
* `DollyContentFormatter`: 格式化 Dolly-v2 的请求和响应数据
* `HFContentFormatter`: 格式化文本生成 Hugging Face 模型的请求和响应数据
* `CustomOpenAIContentFormatter`: 格式化遵循 OpenAI API 兼容方案的模型（如 LLaMa2）的请求和响应数据。

*注意: `OSSContentFormatter` 正在被弃用，并被 `GPT2ContentFormatter` 替代。逻辑相同，但 `GPT2ContentFormatter` 是一个更合适的名称。您仍然可以继续使用 `OSSContentFormatter`，因为这些更改是向后兼容的。*

## 示例

### 示例: 使用实时端点的 LlaMa 2 完成


```python
<!--IMPORTS:[{"imported": "AzureMLEndpointApiType", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.AzureMLEndpointApiType.html", "title": "Azure ML"}, {"imported": "CustomOpenAIContentFormatter", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.CustomOpenAIContentFormatter.html", "title": "Azure ML"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Azure ML"}]-->
from langchain_community.llms.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIContentFormatter,
)
from langchain_core.messages import HumanMessage

llm = AzureMLOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIContentFormatter(),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
)
response = llm.invoke("Write me a song about sparkling water:")
response
```

模型参数也可以在调用时指明：


```python
response = llm.invoke("Write me a song about sparkling water:", temperature=0.5)
response
```

### 示例: 按需付费的聊天完成（模型即服务）


```python
<!--IMPORTS:[{"imported": "AzureMLEndpointApiType", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.AzureMLEndpointApiType.html", "title": "Azure ML"}, {"imported": "CustomOpenAIContentFormatter", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.CustomOpenAIContentFormatter.html", "title": "Azure ML"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Azure ML"}]-->
from langchain_community.llms.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIContentFormatter,
)
from langchain_core.messages import HumanMessage

llm = AzureMLOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIContentFormatter(),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
)
response = llm.invoke("Write me a song about sparkling water:")
response
```

### 示例: 自定义内容格式化器

以下是使用 Hugging Face 的摘要模型的示例。


```python
<!--IMPORTS:[{"imported": "AzureMLOnlineEndpoint", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.AzureMLOnlineEndpoint.html", "title": "Azure ML"}, {"imported": "ContentFormatterBase", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.ContentFormatterBase.html", "title": "Azure ML"}]-->
import json
import os
from typing import Dict

from langchain_community.llms.azureml_endpoint import (
    AzureMLOnlineEndpoint,
    ContentFormatterBase,
)


class CustomFormatter(ContentFormatterBase):
    content_type = "application/json"
    accepts = "application/json"

    def format_request_payload(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps(
            {
                "inputs": [prompt],
                "parameters": model_kwargs,
                "options": {"use_cache": False, "wait_for_model": True},
            }
        )
        return str.encode(input_str)

    def format_response_payload(self, output: bytes) -> str:
        response_json = json.loads(output)
        return response_json[0]["summary_text"]


content_formatter = CustomFormatter()

llm = AzureMLOnlineEndpoint(
    endpoint_api_type="dedicated",
    endpoint_api_key=os.getenv("BART_ENDPOINT_API_KEY"),
    endpoint_url=os.getenv("BART_ENDPOINT_URL"),
    model_kwargs={"temperature": 0.8, "max_new_tokens": 400},
    content_formatter=content_formatter,
)
large_text = """On January 7, 2020, Blockberry Creative announced that HaSeul would not participate in the promotion for Loona's 
next album because of mental health concerns. She was said to be diagnosed with "intermittent anxiety symptoms" and would be 
taking time to focus on her health.[39] On February 5, 2020, Loona released their second EP titled [#] (read as hash), along 
with the title track "So What".[40] Although HaSeul did not appear in the title track, her vocals are featured on three other 
songs on the album, including "365". Once peaked at number 1 on the daily Gaon Retail Album Chart,[41] the EP then debuted at 
number 2 on the weekly Gaon Album Chart. On March 12, 2020, Loona won their first music show trophy with "So What" on Mnet's 
M Countdown.[42]

On October 19, 2020, Loona released their third EP titled [12:00] (read as midnight),[43] accompanied by its first single 
"Why Not?". HaSeul was again not involved in the album, out of her own decision to focus on the recovery of her health.[44] 
The EP then became their first album to enter the Billboard 200, debuting at number 112.[45] On November 18, Loona released 
the music video for "Star", another song on [12:00].[46] Peaking at number 40, "Star" is Loona's first entry on the Billboard 
Mainstream Top 40, making them the second K-pop girl group to enter the chart.[47]

On June 1, 2021, Loona announced that they would be having a comeback on June 28, with their fourth EP, [&] (read as and).
[48] The following day, on June 2, a teaser was posted to Loona's official social media accounts showing twelve sets of eyes, 
confirming the return of member HaSeul who had been on hiatus since early 2020.[49] On June 12, group members YeoJin, Kim Lip, 
Choerry, and Go Won released the song "Yum-Yum" as a collaboration with Cocomong.[50] On September 8, they released another 
collaboration song named "Yummy-Yummy".[51] On June 27, 2021, Loona announced at the end of their special clip that they are 
making their Japanese debut on September 15 under Universal Music Japan sublabel EMI Records.[52] On August 27, it was announced 
that Loona will release the double A-side single, "Hula Hoop / Star Seed" on September 15, with a physical CD release on October 
20.[53] In December, Chuu filed an injunction to suspend her exclusive contract with Blockberry Creative.[54][55]
"""
summarized_text = llm.invoke(large_text)
print(summarized_text)
```

### 示例: 使用 LLMChain 的 Dolly


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Azure ML"}, {"imported": "DollyContentFormatter", "source": "langchain_community.llms.azureml_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.azureml_endpoint.DollyContentFormatter.html", "title": "Azure ML"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Azure ML"}]-->
from langchain.chains import LLMChain
from langchain_community.llms.azureml_endpoint import DollyContentFormatter
from langchain_core.prompts import PromptTemplate

formatter_template = "Write a {word_count} word essay about {topic}."

prompt = PromptTemplate(
    input_variables=["word_count", "topic"], template=formatter_template
)

content_formatter = DollyContentFormatter()

llm = AzureMLOnlineEndpoint(
    endpoint_api_key=os.getenv("DOLLY_ENDPOINT_API_KEY"),
    endpoint_url=os.getenv("DOLLY_ENDPOINT_URL"),
    model_kwargs={"temperature": 0.8, "max_tokens": 300},
    content_formatter=content_formatter,
)

chain = LLMChain(llm=llm, prompt=prompt)
print(chain.invoke({"word_count": 100, "topic": "how to make friends"}))
```

## 序列化大型语言模型
您还可以保存和加载大型语言模型配置


```python
<!--IMPORTS:[{"imported": "load_llm", "source": "langchain_community.llms.loading", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.loading.load_llm.html", "title": "Azure ML"}]-->
from langchain_community.llms.loading import load_llm

save_llm = AzureMLOnlineEndpoint(
    deployment_name="databricks-dolly-v2-12b-4",
    model_kwargs={
        "temperature": 0.2,
        "max_tokens": 150,
        "top_p": 0.8,
        "frequency_penalty": 0.32,
        "presence_penalty": 72e-3,
    },
)
save_llm.save("azureml.json")
loaded_llm = load_llm("azureml.json")

print(loaded_llm)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
