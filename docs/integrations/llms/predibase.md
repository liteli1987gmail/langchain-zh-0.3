---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/predibase.ipynb
---
# Predibase

[Predibase](https://predibase.com/) 允许您训练、微调和部署任何机器学习模型——从线性回归到大型语言模型。

此示例演示了如何使用 LangChain 与部署在 Predibase 上的模型。

# 设置

要运行此笔记本，您需要一个 [Predibase 账户](https://predibase.com/free-trial/?utm_source=langchain) 和一个 [API 密钥](https://docs.predibase.com/sdk-guide/intro)。

您还需要安装 Predibase Python 包：


```python
%pip install --upgrade --quiet  predibase
import os

os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"
```

## 初始调用


```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
)
```


```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
from langchain_community.llms import Predibase

# With a fine-tuned adapter hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
```


```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
from langchain_community.llms import Predibase

# With a fine-tuned adapter hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
```


```python
# Optionally use `kwargs` to dynamically overwrite "generate()" settings.
response = model.invoke(
    "Can you recommend me a nice dry wine?",
    **{"temperature": 0.5, "max_new_tokens": 1024},
)
print(response)
```

## 链调用设置


```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
```


```python
# With a fine-tuned adapter hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
```


```python
# With a fine-tuned adapter hosted at HuggingFace (adapter_version does not apply and will be ignored).
llm = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
```

## 顺序链


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Predibase"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Predibase"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```


```python
# This is an LLMChain to write a synopsis given a title of a play.
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.

Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template)
```


```python
# This is an LLMChain to write a review of a play given a synopsis.
template = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.

Play Synopsis:
{synopsis}
Review from a New York Times play critic of the above play:"""
prompt_template = PromptTemplate(input_variables=["synopsis"], template=template)
review_chain = LLMChain(llm=llm, prompt=prompt_template)
```


```python
<!--IMPORTS:[{"imported": "SimpleSequentialChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sequential.SimpleSequentialChain.html", "title": "Predibase"}]-->
# This is the overall chain where we run these two chains in sequence.
from langchain.chains import SimpleSequentialChain

overall_chain = SimpleSequentialChain(
    chains=[synopsis_chain, review_chain], verbose=True
)
```


```python
review = overall_chain.run("Tragedy at sunset on the beach")
```

## 微调的LLM（使用您自己的微调LLM来自Predibase）


```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
from langchain_community.llms import Predibase

model = Predibase(
    model="my-base-LLM",
    predibase_api_key=os.environ.get(
        "PREDIBASE_API_TOKEN"
    ),  # Adapter argument is optional.
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="my-finetuned-adapter-id",  # Supports both, Predibase-hosted and HuggingFace-hosted adapter repositories.
    adapter_version=1,  # required for Predibase-hosted adapters (ignored for HuggingFace-hosted adapters)
    **{
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    },
)
# replace my-base-LLM with the name of your choice of a serverless base model in Predibase
```


```python
# Optionally use `kwargs` to dynamically overwrite "generate()" settings.
# response = model.invoke("Can you help categorize the following emails into positive, negative, and neutral?", **{"temperature": 0.5, "max_new_tokens": 1024})
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
