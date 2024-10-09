---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/sambanova.ipynb
---
# SambaNova

**[SambaNova](https://sambanova.ai/)** 的 [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) 是一个运行您自己的开源模型的平台

本示例介绍如何使用 LangChain 与 SambaNova 模型进行交互

## SambaStudio

**SambaStudio** 允许您训练、运行批量推理任务，并部署在线推理端点，以运行您自己微调的开源模型。

部署模型需要一个 SambaStudio 环境。获取更多信息请访问 [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

运行流式预测需要 [sseclient-py](https://pypi.org/project/sseclient-py/) 包


```python
%pip install --quiet sseclient-py==1.8.0
```

注册您的环境变量：


```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_base_uri = "<Your SambaStudio endpoint base URI>"  # optional, "api/predict/generic" set as default
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_BASE_URI"] = sambastudio_base_uri
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

直接从LangChain调用SambaStudio模型！


```python
<!--IMPORTS:[{"imported": "SambaStudio", "source": "langchain_community.llms.sambanova", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sambanova.SambaStudio.html", "title": "SambaNova"}]-->
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty":  1.0,
        # "top_k": 50,
        # "top_logprobs": 0,
        # "top_p": 1.0
    },
)

print(llm.invoke("Why should I use open source models?"))
```


```python
<!--IMPORTS:[{"imported": "SambaStudio", "source": "langchain_community.llms.sambanova", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sambanova.SambaStudio.html", "title": "SambaNova"}]-->
# Streaming response

from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=True,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty":  1.0,
        # "top_k": 50,
        # "top_logprobs": 0,
        # "top_p": 1.0
    },
)

for chunk in llm.stream("Why should I use open source models?"):
    print(chunk, end="", flush=True)
```

您还可以调用CoE端点专家模型


```python
<!--IMPORTS:[{"imported": "SambaStudio", "source": "langchain_community.llms.sambanova", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sambanova.SambaStudio.html", "title": "SambaNova"}]-->
# Using a CoE endpoint

from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": False,
        "select_expert": "Meta-Llama-3-8B-Instruct",
        # "repetition_penalty":  1.0,
        # "top_k": 50,
        # "top_logprobs": 0,
        # "top_p": 1.0
    },
)

print(llm.invoke("Why should I use open source models?"))
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
