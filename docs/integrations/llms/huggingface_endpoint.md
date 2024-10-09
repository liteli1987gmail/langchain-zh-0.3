---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/huggingface_endpoint.ipynb
---
# Huggingface 端点

> [Hugging Face Hub](https://huggingface.co/docs/hub/index) 是一个拥有超过 12 万个模型、2 万个数据集和 5 万个演示应用（Spaces）的平台，所有资源均为开源和公开可用，提供一个在线平台，方便人们协作并共同构建机器学习。

`Hugging Face Hub` 还提供各种端点以构建机器学习应用。
本示例展示了如何连接到不同的端点类型。

特别是，文本生成推理由 [文本生成推理](https://github.com/huggingface/text-generation-inference) 提供支持：一个定制构建的 Rust、Python 和 gRPC 服务器，用于快速的文本生成推理。


```python
<!--IMPORTS:[{"imported": "HuggingFaceEndpoint", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_endpoint.HuggingFaceEndpoint.html", "title": "Huggingface Endpoints"}]-->
from langchain_huggingface import HuggingFaceEndpoint
```

## 安装与设置

要使用此功能，您应该安装 ``huggingface_hub`` python [包](https://huggingface.co/docs/huggingface_hub/installation)。


```python
%pip install --upgrade --quiet huggingface_hub
```


```python
# get a token: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token

from getpass import getpass

HUGGINGFACEHUB_API_TOKEN = getpass()
```


```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
```

## 准备示例


```python
<!--IMPORTS:[{"imported": "HuggingFaceEndpoint", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_endpoint.HuggingFaceEndpoint.html", "title": "Huggingface Endpoints"}]-->
from langchain_huggingface import HuggingFaceEndpoint
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Huggingface Endpoints"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Huggingface Endpoints"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```


```python
question = "Who won the FIFA World Cup in the year 1994? "

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## 示例

这是一个示例，展示如何访问免费的 [无服务器端点](https://huggingface.co/inference-endpoints/serverless) API 的 `HuggingFaceEndpoint` 集成。


```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id,
    max_length=128,
    temperature=0.5,
    huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN,
)
llm_chain = prompt | llm
print(llm_chain.invoke({"question": question}))
```

## 专用端点


免费的无服务器 API 让您能够快速实现解决方案并进行迭代，但对于重负载使用情况可能会有限制，因为负载与其他请求共享。

对于企业工作负载，最佳选择是使用 [推理端点 - 专用](https://huggingface.co/inference-endpoints/dedicated)。
这提供了对完全托管基础设施的访问，提供更多的灵活性和速度。这些资源提供持续的支持和正常运行时间保证，以及自动扩展等选项。




```python
# Set the url to your Inference Endpoint below
your_endpoint_url = "https://fayjubiy2xqn36z0.us-east-1.aws.endpoints.huggingface.cloud"
```


```python
llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
)
llm("What did foo say about bar?")
```

### 流式处理


```python
<!--IMPORTS:[{"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Huggingface Endpoints"}, {"imported": "HuggingFaceEndpoint", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_endpoint.HuggingFaceEndpoint.html", "title": "Huggingface Endpoints"}]-->
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_huggingface import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
    streaming=True,
)
llm("What did foo say about bar?", callbacks=[StreamingStdOutCallbackHandler()])
```

同样的 `HuggingFaceEndpoint` 类可以与本地 [HuggingFace TGI 实例](https://github.com/huggingface/text-generation-inference/blob/main/docs/source/index.md) 一起使用，以提供大型语言模型。有关各种硬件（GPU、TPU、Gaudi...）支持的详细信息，请查看 TGI [仓库](https://github.com/huggingface/text-generation-inference/tree/main)。


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
