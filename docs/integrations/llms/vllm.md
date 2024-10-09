---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/vllm.ipynb
---
# vLLM

[vLLM](https://vllm.readthedocs.io/en/latest/index.html) 是一个快速且易于使用的 LLM 推理和服务库，提供：

* 最先进的服务吞吐量
* 使用 PagedAttention 高效管理注意力键和值内存
* 持续批处理传入请求
* 优化的 CUDA 内核

本笔记本介绍了如何使用 LangChain 和 vLLM 进行 LLM。

要使用，您需要安装 `vllm` Python 包。


```python
%pip install --upgrade --quiet  vllm -q
```


```python
<!--IMPORTS:[{"imported": "VLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.vllm.VLLM.html", "title": "vLLM"}]-->
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_new_tokens=128,
    top_k=10,
    top_p=0.95,
    temperature=0.8,
)

print(llm.invoke("What is the capital of France ?"))
```
```output
INFO 08-06 11:37:33 llm_engine.py:70] Initializing an LLM engine with config: model='mosaicml/mpt-7b', tokenizer='mosaicml/mpt-7b', tokenizer_mode=auto, trust_remote_code=True, dtype=torch.bfloat16, use_dummy_weights=False, download_dir=None, use_np_weights=False, tensor_parallel_size=1, seed=0)
INFO 08-06 11:37:41 llm_engine.py:196] # GPU blocks: 861, # CPU blocks: 512
``````output
Processed prompts: 100%|██████████| 1/1 [00:00<00:00,  2.00it/s]
``````output

What is the capital of France ? The capital of France is Paris.
```
## 在LLMChain中集成模型


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "vLLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "vLLM"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.invoke(question))
```
```output
Processed prompts: 100%|██████████| 1/1 [00:01<00:00,  1.34s/it]
``````output


1. The first Pokemon game was released in 1996.
2. The president was Bill Clinton.
3. Clinton was president from 1993 to 2001.
4. The answer is Clinton.
```
## 分布式推理

vLLM支持分布式张量并行推理和服务。

要使用LLM类运行多GPU推理，请将`tensor_parallel_size`参数设置为您想要使用的GPU数量。例如，要在4个GPU上运行推理


```python
<!--IMPORTS:[{"imported": "VLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.vllm.VLLM.html", "title": "vLLM"}]-->
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-30b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm.invoke("What is the future of AI?")
```

## 量化

vLLM支持`awq`量化。要启用它，请将`quantization`传递给`vllm_kwargs`。


```python
llm_q = VLLM(
    model="TheBloke/Llama-2-7b-Chat-AWQ",
    trust_remote_code=True,
    max_new_tokens=512,
    vllm_kwargs={"quantization": "awq"},
)
```

## OpenAI兼容服务器

vLLM可以作为一个模仿OpenAI API协议的服务器进行部署。这使得vLLM可以作为使用OpenAI API的应用程序的替代品。

该服务器可以以与OpenAI API相同的格式进行查询。

### OpenAI兼容的完成


```python
<!--IMPORTS:[{"imported": "VLLMOpenAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.vllm.VLLMOpenAI.html", "title": "vLLM"}]-->
from langchain_community.llms import VLLMOpenAI

llm = VLLMOpenAI(
    openai_api_key="EMPTY",
    openai_api_base="http://localhost:8000/v1",
    model_name="tiiuae/falcon-7b",
    model_kwargs={"stop": ["."]},
)
print(llm.invoke("Rome is"))
```
```output
 a city that is filled with history, ancient buildings, and art around every corner
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
