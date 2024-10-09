---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/ibm_watsonx.ipynb
---
# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain) 是 IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) 基础模型的封装。

本示例展示了如何使用 `LangChain` 与 `watsonx.ai` 模型进行通信。

## 设置

安装包 `langchain-ibm`。


```python
!pip install -qU langchain-ibm
```

此单元定义了与watsonx基础模型推理相关的WML凭证。

**操作：** 提供IBM Cloud用户API密钥。有关详细信息，请参见
[文档](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)。


```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

此外，您可以将额外的密钥作为环境变量传递。


```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## 加载模型

您可能需要根据不同的模型或任务调整模型`参数`。有关详细信息，请参阅[文档](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames)。


```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "temperature": 0.5,
    "top_k": 50,
    "top_p": 1,
}
```

使用先前设置的参数初始化`WatsonxLLM`类。


**注意**：

- 为API调用提供上下文，您必须添加`project_id`或`space_id`。有关更多信息，请参见[文档](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)。
- 根据您所配置的服务实例的区域，使用[这里](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)描述的其中一个网址。

在这个示例中，我们将使用 `project_id` 和达拉斯网址。


您需要指定将用于推理的 `model_id`。所有可用模型可以在 [文档](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes) 中找到。


```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

或者，您可以使用 Cloud Pak for Data 凭据。有关详细信息，请参见 [文档](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)。


```python
watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

您还可以传递先前调优模型的 `deployment_id`，而不是 `model_id`。整个模型调优工作流程在 [这里](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html) 描述。


```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

对于某些要求，可以选择将 IBM 的 [`APIClient`](https://ibm.github.io/watsonx-ai-python-sdk/base.html#apiclient) 对象传递到 `WatsonxLLM` 类中。


```python
from ibm_watsonx_ai import APIClient

api_client = APIClient(...)

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    watsonx_client=api_client,
)
```

您还可以将 IBM 的 [`ModelInference`](https://ibm.github.io/watsonx-ai-python-sdk/fm_model_inference.html) 对象传递到 `WatsonxLLM` 类中。


```python
from ibm_watsonx_ai.foundation_models import ModelInference

model = ModelInference(...)

watsonx_llm = WatsonxLLM(watsonx_model=model)
```

## 创建链
创建 `PromptTemplate` 对象，负责生成随机问题。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "IBM watsonx.ai"}]-->
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "

prompt = PromptTemplate.from_template(template)
```

提供一个主题并运行链。


```python
llm_chain = prompt | watsonx_llm

topic = "dog"

llm_chain.invoke(topic)
```



```output
'What is the difference between a dog and a wolf?'
```


## 直接调用模型
要获取完成结果，您可以使用字符串提示直接调用模型。


```python
# Calling a single prompt

watsonx_llm.invoke("Who is man's best friend?")
```



```output
"Man's best friend is his dog. "
```



```python
# Calling multiple prompts

watsonx_llm.generate(
    [
        "The fastest dog in the world?",
        "Describe your chosen dog breed",
    ]
)
```



```output
LLMResult(generations=[[Generation(text='The fastest dog in the world is the greyhound, which can run up to 45 miles per hour. This is about the same speed as a human running down a track. Greyhounds are very fast because they have long legs, a streamlined body, and a strong tail. They can run this fast for short distances, but they can also run for long distances, like a marathon. ', generation_info={'finish_reason': 'eos_token'})], [Generation(text='The Beagle is a scent hound, meaning it is bred to hunt by following a trail of scents.', generation_info={'finish_reason': 'eos_token'})]], llm_output={'token_usage': {'generated_token_count': 106, 'input_token_count': 13}, 'model_id': 'ibm/granite-13b-instruct-v2', 'deployment_id': ''}, run=[RunInfo(run_id=UUID('52cb421d-b63f-4c5f-9b04-d4770c664725')), RunInfo(run_id=UUID('df2ea606-1622-4ed7-8d5d-8f6e068b71c4'))])
```


## 流式处理模型输出

您可以流式处理模型输出。


```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```
```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```

## 相关内容

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
