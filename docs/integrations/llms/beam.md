---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/beam.ipynb
---
# Beam

调用 Beam API 包装器以在云部署中部署并对 gpt2 LLM 实例进行后续调用。需要安装 Beam 库并注册 Beam 客户端 ID 和客户端密钥。通过调用包装器创建并运行模型的实例，返回的文本与提示相关。然后可以通过直接调用 Beam API 进行额外的调用。

[创建一个账户](https://www.beam.cloud/)，如果你还没有的话。从 [仪表板](https://www.beam.cloud/dashboard/settings/api-keys) 获取你的 API 密钥。

安装 Beam CLI


```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

注册API密钥并设置您的Beam客户端ID和秘密环境变量：


```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

安装Beam SDK：


```python
%pip install --upgrade --quiet  beam-sdk
```

**直接从LangChain部署并调用Beam！**

请注意，冷启动可能需要几分钟才能返回响应，但后续调用会更快！


```python
<!--IMPORTS:[{"imported": "Beam", "source": "langchain_community.llms.beam", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.beam.Beam.html", "title": "Beam"}]-->
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
