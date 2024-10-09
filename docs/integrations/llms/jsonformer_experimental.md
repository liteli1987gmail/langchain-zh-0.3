---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/jsonformer_experimental.ipynb
---
# JSONFormer

[JSONFormer](https://github.com/1rgs/jsonformer) 是一个库，它封装了本地 Hugging Face 管道模型，用于对 JSON Schema 的子集进行结构化解码。

它通过填充结构标记，然后从模型中采样内容标记来工作。

**警告 - 此模块仍处于实验阶段**


```python
%pip install --upgrade --quiet  jsonformer > /dev/null
```

### Hugging Face 基线

首先，让我们通过检查模型在没有结构化解码的情况下的输出，来建立一个定性基线。


```python
import logging

logging.basicConfig(level=logging.ERROR)
```


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "JSONFormer"}]-->
import json
import os

import requests
from langchain_core.tools import tool

HF_TOKEN = os.environ.get("HUGGINGFACE_API_KEY")


@tool
def ask_star_coder(query: str, temperature: float = 1.0, max_new_tokens: float = 250):
    """Query the BigCode StarCoder model about coding questions."""
    url = "https://api-inference.huggingface.co/models/bigcode/starcoder"
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "content-type": "application/json",
    }
    payload = {
        "inputs": f"{query}\n\nAnswer:",
        "temperature": temperature,
        "max_new_tokens": int(max_new_tokens),
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    response.raise_for_status()
    return json.loads(response.content.decode("utf-8"))
```


```python
prompt = """You must respond using JSON format, with a single action and single action input.
You may 'ask_star_coder' for help on coding problems.

{arg_schema}

EXAMPLES
----
Human: "So what's all this about a GIL?"
AI Assistant:{{
  "action": "ask_star_coder",
  "action_input": {{"query": "What is a GIL?", "temperature": 0.0, "max_new_tokens": 100}}"
}}
Observation: "The GIL is python's Global Interpreter Lock"
Human: "Could you please write a calculator program in LISP?"
AI Assistant:{{
  "action": "ask_star_coder",
  "action_input": {{"query": "Write a calculator program in LISP", "temperature": 0.0, "max_new_tokens": 250}}
}}
Observation: "(defun add (x y) (+ x y))\n(defun sub (x y) (- x y ))"
Human: "What's the difference between an SVM and an LLM?"
AI Assistant:{{
  "action": "ask_star_coder",
  "action_input": {{"query": "What's the difference between SGD and an SVM?", "temperature": 1.0, "max_new_tokens": 250}}
}}
Observation: "SGD stands for stochastic gradient descent, while an SVM is a Support Vector Machine."

BEGIN! Answer the Human's question as best as you are able.
------
Human: 'What's the difference between an iterator and an iterable?'
AI Assistant:""".format(arg_schema=ask_star_coder.args)
```


```python
<!--IMPORTS:[{"imported": "HuggingFacePipeline", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "JSONFormer"}]-->
from langchain_huggingface import HuggingFacePipeline
from transformers import pipeline

hf_model = pipeline(
    "text-generation", model="cerebras/Cerebras-GPT-590M", max_new_tokens=200
)

original_model = HuggingFacePipeline(pipeline=hf_model)

generated = original_model.predict(prompt, stop=["Observation:", "Human:"])
print(generated)
```
```output
Setting `pad_token_id` to `eos_token_id`:50256 for open-end generation.
``````output
 'What's the difference between an iterator and an iterable?'
```
***这并不那么令人印象深刻，是吗？它根本没有遵循JSON格式！让我们尝试使用结构化解码器。***

## JSONFormer LLM包装器

让我们再试一次，这次向模型提供Action输入的JSON Schema。


```python
decoder_schema = {
    "title": "Decoding Schema",
    "type": "object",
    "properties": {
        "action": {"type": "string", "default": ask_star_coder.name},
        "action_input": {
            "type": "object",
            "properties": ask_star_coder.args,
        },
    },
}
```


```python
<!--IMPORTS:[{"imported": "JsonFormer", "source": "langchain_experimental.llms", "docs": "https://python.langchain.com/api_reference/experimental/llms/langchain_experimental.llms.jsonformer_decoder.JsonFormer.html", "title": "JSONFormer"}]-->
from langchain_experimental.llms import JsonFormer

json_former = JsonFormer(json_schema=decoder_schema, pipeline=hf_model)
```


```python
results = json_former.predict(prompt, stop=["Observation:", "Human:"])
print(results)
```
```output
{"action": "ask_star_coder", "action_input": {"query": "What's the difference between an iterator and an iter", "temperature": 0.0, "max_new_tokens": 50.0}}
```
**瞧！没有解析错误。**


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
