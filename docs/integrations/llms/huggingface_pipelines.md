---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/huggingface_pipelines.ipynb
---
# Hugging Face 本地管道

Hugging Face 模型可以通过 `HuggingFacePipeline` 类在本地运行。

 [Hugging Face 模型库](https://huggingface.co/models) 托管超过 12 万个模型、2 万个数据集和 5 万个演示应用（Spaces），所有内容均为开源和公开可用，提供一个在线平台，方便人们协作并共同构建机器学习。

这些可以通过 LangChain 通过这个本地管道包装器调用，或者通过 HuggingFaceHub 类调用其托管的推理端点。

要使用，您需要安装 ``transformers`` python [包](https://pypi.org/project/transformers/)，以及 [pytorch](https://pytorch.org/get-started/locally/)。您还可以安装 `xformer` 以获得更高效的内存注意力实现。


```python
%pip install --upgrade --quiet transformers
```

### 模型加载

可以通过使用 `from_model_id` 方法指定模型参数来加载模型。


```python
<!--IMPORTS:[{"imported": "HuggingFacePipeline", "source": "langchain_huggingface.llms", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "Hugging Face Local Pipelines"}]-->
from langchain_huggingface.llms import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

也可以通过直接传入现有的 `transformers` 管道来加载。


```python
<!--IMPORTS:[{"imported": "HuggingFacePipeline", "source": "langchain_huggingface.llms", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "Hugging Face Local Pipelines"}]-->
from langchain_huggingface.llms import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
```

### 创建链

将模型加载到内存后，可以与提示词组合以
形成一个链。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Hugging Face Local Pipelines"}]-->
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

要在没有提示词的情况下获取响应，可以将 `skip_prompt=True` 绑定到 LLM。


```python
chain = prompt | hf.bind(skip_prompt=True)

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

流式响应。


```python
for chunk in chain.stream(question):
    print(chunk, end="", flush=True)
```

### GPU 推理

在具有 GPU 的机器上运行时，可以指定 `device=n` 参数将模型放置在指定设备上。
默认值为 `-1`，用于 CPU 推理。

如果您有多个 GPU 和/或模型对于单个 GPU 来说太大，您可以指定 `device_map="auto"`，这需要并使用 [Accelerate](https://huggingface.co/docs/accelerate/index) 库来自动确定如何加载模型权重。

*注意*: `device` 和 `device_map` 不应同时指定，这可能导致意外行为。


```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### 批量 GPU 推理

如果在具有 GPU 的设备上运行，您还可以以批量模式在 GPU 上运行推理。


```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### 使用 OpenVINO 后端进行推理

要使用 OpenVINO 部署模型，您可以指定 `backend="openvino"` 参数以触发 OpenVINO 作为后端推理框架。

如果您有 Intel GPU，您可以指定 `model_kwargs={"device": "GPU"}` 在其上运行推理。


```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```


```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### 使用本地 OpenVINO 模型进行推理

可以使用 CLI [导出您的模型](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) 为 OpenVINO IR 格式，并从本地文件夹加载模型。



```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

建议应用8位或4位权重量化，以使用`--weight-format`减少推理延迟和模型占用空间：


```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```


```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

通过激活和KV缓存量化的动态量化，您可以获得额外的推理速度提升。这些选项可以通过`ov_config`如下启用：


```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

有关更多信息，请参阅[OpenVINO LLM指南](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)和[OpenVINO本地管道笔记本](/docs/integrations/llms/openvino/)。


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
