---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/openvino.ipynb
---
# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) 是一个开源工具包，用于优化和部署 AI 推理。OpenVINO™ Runtime 可以支持在各种硬件 [设备](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) 上运行相同的优化模型。加速您在语言 + 大型语言模型、计算机视觉、自动语音识别等用例中的深度学习性能。

OpenVINO 模型可以通过 `HuggingFacePipeline` [类](https://python.langchain.com/docs/integrations/llms/huggingface_pipeline) 在本地运行。要使用 OpenVINO 部署模型，您可以指定 `backend="openvino"` 参数以触发 OpenVINO 作为后端推理框架。

要使用，您应该安装带有 OpenVINO 加速器的 ``optimum-intel`` python [包](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#installation)。


```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" langchain-huggingface --quiet
```

### 模型加载

可以通过使用 `from_model_id` 方法指定模型参数来加载模型。

如果您有 Intel GPU，可以指定 `model_kwargs`


```python
<!--IMPORTS:[{"imported": "HuggingFacePipeline", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "OpenVINO"}]-->
from langchain_huggingface import HuggingFacePipeline

ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10}
)
```

它们也可以通过直接传入现有的 [`optimum-intel`](https://huggingface.co/docs/optimum/main/en/intel/inference) 管道来加载。


```python
from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "gpt2"
device = "CPU"
tokenizer = AutoTokenizer.from_pretrained(model_id)
ov_model = OVModelForCausalLM.from_pretrained(
    model_id, export=True, device=device, ov_config=ov_config
)
ov_pipe = pipeline(
    "text-generation", model=ov_model, tokenizer=tokenizer, max_new_tokens=10
)
ov_llm = HuggingFacePipeline(pipeline=ov_pipe)
```

### 创建链

将模型加载到内存后，您可以与提示组合以
形成一个链。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OpenVINO"}]-->
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

要在没有提示的情况下获取响应，您可以将 `skip_prompt=True` 绑定到 LLM。


```python
chain = prompt | ov_llm.bind(skip_prompt=True)

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
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

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

通过对激活和KV缓存进行动态量化，您可以获得额外的推理速度提升。这些选项可以通过`ov_config`如下启用：


```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

### 流式处理

您可以使用`stream`方法获取LLM输出的流式数据，


```python
generation_config = {"skip_prompt": True, "pipeline_kwargs": {"max_new_tokens": 100}}
chain = prompt | ov_llm.bind(**generation_config)

for chunk in chain.stream(question):
    print(chunk, end="", flush=True)
```

有关更多信息，请参阅：

* [OpenVINO LLM指南](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)。

* [OpenVINO文档](https://docs.openvino.ai/2024/home.html)。

* [OpenVINO入门指南](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)。
  
* [与LangChain的RAG笔记本](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)。


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
