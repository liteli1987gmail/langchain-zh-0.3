---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/huggingface.ipynb
---
# ChatHuggingFace

这将帮助您开始使用 `langchain_huggingface` [聊天模型](/docs/concepts/#chat-models)。有关所有 `ChatHuggingFace` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html)。要查看 Hugging Face 支持的模型列表，请查看 [此页面](https://huggingface.co/models)。

## 概述
### 集成细节

### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatHuggingFace](https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html) | [langchain-huggingface](https://python.langchain.com/api_reference/huggingface/index.html) | ✅ | beta | ❌ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain_huggingface?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain_huggingface?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

## 设置

要访问 Hugging Face 模型，您需要创建一个 Hugging Face 账户，获取 API 密钥，并安装 `langchain-huggingface` 集成包。

### 凭证

生成一个 [Hugging Face 访问令牌](https://huggingface.co/docs/hub/security-tokens) 并将其存储为环境变量：`HUGGINGFACEHUB_API_TOKEN`。


```python
import getpass
import os

if not os.getenv("HUGGINGFACEHUB_API_TOKEN"):
    os.environ["HUGGINGFACEHUB_API_TOKEN"] = getpass.getpass("Enter your token: ")
```

### 安装

| 类别 | 包名 | 本地 | 可序列化 | JS支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatHuggingFace](https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html) | [langchain_huggingface](https://python.langchain.com/api_reference/huggingface/index.html) | ✅ | ❌ | ❌ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain_huggingface?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_huggingface?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 设置

要访问 `langchain_huggingface` 模型，您需要创建一个 `Hugging Face` 账户，获取 API 密钥，并安装 `langchain_huggingface` 集成包。

### 凭证

您需要将 [Hugging Face 访问令牌](https://huggingface.co/docs/hub/security-tokens) 保存为环境变量：`HUGGINGFACEHUB_API_TOKEN`。


```python
import getpass
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = getpass.getpass(
    "Enter your Hugging Face API key: "
)
```


```python
%pip install --upgrade --quiet  langchain-huggingface text-generation transformers google-search-results numexpr langchainhub sentencepiece jinja2 bitsandbytes accelerate
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m24.0[0m[39;49m -> [0m[32;49m24.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

您可以通过两种不同的方式实例化 `ChatHuggingFace` 模型，既可以从 `HuggingFaceEndpoint` 实例化，也可以从 `HuggingFacePipeline` 实例化。

### `HuggingFaceEndpoint`


```python
<!--IMPORTS:[{"imported": "ChatHuggingFace", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html", "title": "ChatHuggingFace"}, {"imported": "HuggingFaceEndpoint", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_endpoint.HuggingFaceEndpoint.html", "title": "ChatHuggingFace"}]-->
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    max_new_tokens=512,
    do_sample=False,
    repetition_penalty=1.03,
)

chat_model = ChatHuggingFace(llm=llm)
```
```output
The token has not been saved to the git credentials helper. Pass `add_to_git_credential=True` in this function directly or `--add-to-git-credential` if using via `huggingface-cli` if you want to set the git credential as well.
Token is valid (permission: fineGrained).
Your token has been saved to /Users/isaachershenson/.cache/huggingface/token
Login successful
```
### `HuggingFacePipeline`


```python
<!--IMPORTS:[{"imported": "ChatHuggingFace", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html", "title": "ChatHuggingFace"}, {"imported": "HuggingFacePipeline", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "ChatHuggingFace"}]-->
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline

llm = HuggingFacePipeline.from_model_id(
    model_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    pipeline_kwargs=dict(
        max_new_tokens=512,
        do_sample=False,
        repetition_penalty=1.03,
    ),
)

chat_model = ChatHuggingFace(llm=llm)
```

```output
config.json:   0%|          | 0.00/638 [00:00<?, ?B/s]
```

```output
model.safetensors.index.json:   0%|          | 0.00/23.9k [00:00<?, ?B/s]
```

```output
Downloading shards:   0%|          | 0/8 [00:00<?, ?it/s]
```

```output
model-00001-of-00008.safetensors:   0%|          | 0.00/1.89G [00:00<?, ?B/s]
```

```output
model-00002-of-00008.safetensors:   0%|          | 0.00/1.95G [00:00<?, ?B/s]
```

```output
model-00003-of-00008.safetensors:   0%|          | 0.00/1.98G [00:00<?, ?B/s]
```

```output
model-00004-of-00008.safetensors:   0%|          | 0.00/1.95G [00:00<?, ?B/s]
```

```output
model-00005-of-00008.safetensors:   0%|          | 0.00/1.98G [00:00<?, ?B/s]
```

```output
model-00006-of-00008.safetensors:   0%|          | 0.00/1.95G [00:00<?, ?B/s]
```

```output
model-00007-of-00008.safetensors:   0%|          | 0.00/1.98G [00:00<?, ?B/s]
```

```output
model-00008-of-00008.safetensors:   0%|          | 0.00/816M [00:00<?, ?B/s]
```

```output
Loading checkpoint shards:   0%|          | 0/8 [00:00<?, ?it/s]
```

```output
generation_config.json:   0%|          | 0.00/111 [00:00<?, ?B/s]
```

### 使用量化进行实例化

要运行模型的量化版本，您可以按如下方式指定 `bitsandbytes` 量化配置：


```python
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype="float16",
    bnb_4bit_use_double_quant=True,
)
```

并将其作为 `model_kwargs` 的一部分传递给 `HuggingFacePipeline`：


```python
llm = HuggingFacePipeline.from_model_id(
    model_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    pipeline_kwargs=dict(
        max_new_tokens=512,
        do_sample=False,
        repetition_penalty=1.03,
        return_full_text=False,
    ),
    model_kwargs={"quantization_config": quantization_config},
)

chat_model = ChatHuggingFace(llm=llm)
```

## 调用


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatHuggingFace"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatHuggingFace"}]-->
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
)

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

ai_msg = chat_model.invoke(messages)
```


```python
print(ai_msg.content)
```
```output
According to the popular phrase and hypothetical scenario, when an unstoppable force meets an immovable object, a paradoxical situation arises as both forces are seemingly contradictory. On one hand, an unstoppable force is an entity that cannot be stopped or prevented from moving forward, while on the other hand, an immovable object is something that cannot be moved or displaced from its position. 

In this scenario, it is un
```
## API 参考

有关所有 `ChatHuggingFace` 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html

## API 参考

有关所有 ChatHuggingFace 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/huggingface/chat_models/langchain_huggingface.chat_models.huggingface.ChatHuggingFace.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
