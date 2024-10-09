# Predibase

了解如何在Predibase上使用LangChain与模型。

## 设置
- 创建一个[Predibase](https://predibase.com/)账户和[API密钥](https://docs.predibase.com/sdk-guide/intro)。
- 使用`pip install predibase`安装Predibase Python客户端
- 使用您的API密钥进行身份验证

### 大型语言模型

Predibase通过实现LLM模块与LangChain集成。您可以在下面看到一个简短的示例，或在LLM > 集成 > Predibase下查看完整的笔记本。

```python
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    """
    Optionally use `model_kwargs` to set new default "generate()" settings.  For example:
    {
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    }
    """
    **model_kwargs,
)

"""
Optionally use `kwargs` to dynamically overwrite "generate()" settings.  For example:
{
    "temperature": 0.5,  # default is the value in model_kwargs or 0.1 (initialization default)
    "max_new_tokens": 1024,  # default is the value in model_kwargs or 256 (initialization default)
}
"""
response = model.invoke("Can you recommend me a nice dry wine?", **kwargs)
print(response)
```

Predibase 还支持在 `model` 参数给定的基础模型上进行微调的 Predibase 托管和 HuggingFace 托管适配器：

```python
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
    """
    Optionally use `model_kwargs` to set new default "generate()" settings.  For example:
    {
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    }
    """
    **model_kwargs,
)

"""
Optionally use `kwargs` to dynamically overwrite "generate()" settings.  For example:
{
    "temperature": 0.5,  # default is the value in model_kwargs or 0.1 (initialization default)
    "max_new_tokens": 1024,  # default is the value in model_kwargs or 256 (initialization default)
}
"""
response = model.invoke("Can you recommend me a nice dry wine?", **kwargs)
print(response)
```

Predibase 还支持在 `model` 参数给定的基础模型上进行微调的适配器：

```python
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
    """
    Optionally use `model_kwargs` to set new default "generate()" settings.  For example:
    {
        "api_token": os.environ.get("HUGGING_FACE_HUB_TOKEN"),
        "max_new_tokens": 5,  # default is 256
    }
    """
    **model_kwargs,
)

"""
Optionally use `kwargs` to dynamically overwrite "generate()" settings.  For example:
{
    "temperature": 0.5,  # default is the value in model_kwargs or 0.1 (initialization default)
    "max_new_tokens": 1024,  # default is the value in model_kwargs or 256 (initialization default)
}
"""
response = model.invoke("Can you recommend me a nice dry wine?", **kwargs)
print(response)
```
