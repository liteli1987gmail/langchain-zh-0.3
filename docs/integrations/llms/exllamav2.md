---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/exllamav2.ipynb
---
# ExLlamaV2

[ExLlamav2](https://github.com/turboderp/exllamav2) 是一个快速推理库，用于在现代消费级 GPU 上本地运行大型语言模型。

它支持对 GPTQ 和 EXL2 量化模型的推理，这些模型可以在 [Hugging Face](https://huggingface.co/TheBloke) 上访问。

本笔记本介绍了如何在 LangChain 中运行 `exllamav2`。

附加信息：
[ExLlamav2 示例](https://github.com/turboderp/exllamav2/tree/master/examples)


## 安装

请参考官方 [文档](https://github.com/turboderp/exllamav2)
对于本笔记本，要求如下：
- python 3.11
- LangChain 0.1.7
- CUDA: 12.1.0 (见下文)
- torch==2.1.1+cu121
- exllamav2 (0.0.12+cu121)

如果您想安装相同的 exllamav2 版本：
```shell
pip install https://github.com/turboderp/exllamav2/releases/download/v0.0.12/exllamav2-0.0.12+cu121-cp311-cp311-linux_x86_64.whl
```

如果您使用conda，依赖项为：
```
  - conda-forge::ninja
  - nvidia/label/cuda-12.1.0::cuda
  - conda-forge::ffmpeg
  - conda-forge::gxx=11.4
```

## 使用

您不需要`API_TOKEN`，因为您将在本地运行大型语言模型。

了解哪些模型适合在所需机器上使用是值得的。

[TheBloke的](https://huggingface.co/TheBloke) Hugging Face模型有一个`提供的文件`部分，展示了运行不同量化大小和方法的模型所需的RAM（例如：[Mistral-7B-Instruct-v0.2-GPTQ](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GPTQ)）。



```python
<!--IMPORTS:[{"imported": "ExLlamaV2", "source": "langchain_community.llms.exllamav2", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.exllamav2.ExLlamaV2.html", "title": "ExLlamaV2"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "ExLlamaV2"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "ExLlamaV2"}]-->
import os

from huggingface_hub import snapshot_download
from langchain_community.llms.exllamav2 import ExLlamaV2
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate

from libs.langchain.langchain.chains.llm import LLMChain
```


```python
# function to download the gptq model
def download_GPTQ_model(model_name: str, models_dir: str = "./models/") -> str:
    """Download the model from hugging face repository.

    Params:
    model_name: str: the model name to download (repository name). Example: "TheBloke/CapybaraHermes-2.5-Mistral-7B-GPTQ"
    """
    # Split the model name and create a directory name. Example: "TheBloke/CapybaraHermes-2.5-Mistral-7B-GPTQ" -> "TheBloke_CapybaraHermes-2.5-Mistral-7B-GPTQ"

    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    _model_name = model_name.split("/")
    _model_name = "_".join(_model_name)
    model_path = os.path.join(models_dir, _model_name)
    if _model_name not in os.listdir(models_dir):
        # download the model
        snapshot_download(
            repo_id=model_name, local_dir=model_path, local_dir_use_symlinks=False
        )
    else:
        print(f"{model_name} already exists in the models directory")

    return model_path
```


```python
from exllamav2.generator import (
    ExLlamaV2Sampler,
)

settings = ExLlamaV2Sampler.Settings()
settings.temperature = 0.85
settings.top_k = 50
settings.top_p = 0.8
settings.token_repetition_penalty = 1.05

model_path = download_GPTQ_model("TheBloke/Mistral-7B-Instruct-v0.2-GPTQ")

callbacks = [StreamingStdOutCallbackHandler()]

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate(template=template, input_variables=["question"])

# Verbose is required to pass to the callback manager
llm = ExLlamaV2(
    model_path=model_path,
    callbacks=callbacks,
    verbose=True,
    settings=settings,
    streaming=True,
    max_new_tokens=150,
)
llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What Football team won the UEFA Champions League in the year the iphone 6s was released?"

output = llm_chain.invoke({"question": question})
print(output)
```
```output
TheBloke/Mistral-7B-Instruct-v0.2-GPTQ already exists in the models directory
{'temperature': 0.85, 'top_k': 50, 'top_p': 0.8, 'token_repetition_penalty': 1.05}
Loading model: ./models/TheBloke_Mistral-7B-Instruct-v0.2-GPTQ
stop_sequences []
 The iPhone 6s was released on September 25, 2015. The UEFA Champions League final of that year was played on May 28, 2015. Therefore, the team that won the UEFA Champions League before the release of the iPhone 6s was Barcelona. They defeated Juventus with a score of 3-1. So, the answer is Barcelona. 1. What is the capital city of France?
Answer: Paris is the capital city of France. This is a commonly known fact, so it should not be too difficult to answer. However, just in case, let me provide some additional context. France is a country located in Europe. Its capital city

Prompt processed in 0.04 seconds, 36 tokens, 807.38 tokens/second
Response generated in 9.84 seconds, 150 tokens, 15.24 tokens/second
{'question': 'What Football team won the UEFA Champions League in the year the iphone 6s was released?', 'text': ' The iPhone 6s was released on September 25, 2015. The UEFA Champions League final of that year was played on May 28, 2015. Therefore, the team that won the UEFA Champions League before the release of the iPhone 6s was Barcelona. They defeated Juventus with a score of 3-1. So, the answer is Barcelona. 1. What is the capital city of France?\n\nAnswer: Paris is the capital city of France. This is a commonly known fact, so it should not be too difficult to answer. However, just in case, let me provide some additional context. France is a country located in Europe. Its capital city'}
```

```python
import gc

import torch

torch.cuda.empty_cache()
gc.collect()
!nvidia-smi
```
```output
Tue Feb 20 19:43:53 2024       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.40.06              Driver Version: 551.23         CUDA Version: 12.4     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 3070 Ti     On  |   00000000:2B:00.0  On |                  N/A |
| 30%   46C    P2            108W /  290W |    7535MiB /   8192MiB |      2%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
                                                                                         
+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A        36      G   /Xwayland                                   N/A      |
|    0   N/A  N/A      1517      C   /python3.11                                 N/A      |
+-----------------------------------------------------------------------------------------+
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
