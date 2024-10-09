---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/whylabs_profiling.ipynb
---
# WhyLabs

>[WhyLabs](https://docs.whylabs.ai/docs/) 是一个可观察性平台，旨在监控数据管道和机器学习应用程序，以检测数据质量回归、数据漂移和模型性能下降。该平台建立在一个名为 `whylogs` 的开源软件包之上，使数据科学家和工程师能够：
>- 在几分钟内设置：使用 whylogs 这个轻量级开源库开始生成任何数据集的统计概况。
>- 将数据集概况上传到 WhyLabs 平台，以便集中和可定制地监控/警报数据集特征以及模型输入、输出和性能。
>- 无缝集成：与任何数据管道、机器学习基础设施或框架互操作。实时生成对您现有数据流的洞察。有关我们集成的更多信息，请点击这里。
>- 扩展到 TB 级：处理您的大规模数据，同时保持计算需求低。与批处理或流式数据管道集成。
>- 维护数据隐私：WhyLabs 依赖于通过 whylogs 创建的统计概况，因此您的实际数据永远不会离开您的环境！
启用可观察性，以更快地检测输入和大型语言模型问题，提供持续改进，并避免高昂的事故。

## 安装和设置


```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

确保设置发送遥测到 WhyLabs 所需的 API 密钥和配置：

* WhyLabs API 密钥： https://whylabs.ai/whylabs-free-sign-up
* 组织和数据集 [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI： https://platform.openai.com/account/api-keys

然后你可以像这样设置它们：

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```
> *注意*：回调支持直接将这些变量传递给回调，当没有直接传递身份验证时，它将默认为环境。直接传递身份验证允许将配置文件写入多个项目或组织中的 WhyLabs。


## 回调

这是与 OpenAI 的单一 LLM 集成，它将记录各种开箱即用的指标并将遥测发送到 WhyLabs 进行监控。


```python
<!--IMPORTS:[{"imported": "WhyLabsCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.whylabs_callback.WhyLabsCallbackHandler.html", "title": "WhyLabs"}]-->
from langchain_community.callbacks import WhyLabsCallbackHandler
```


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "WhyLabs"}]-->
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```
```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```
```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```