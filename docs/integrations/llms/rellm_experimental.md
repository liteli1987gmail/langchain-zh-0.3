---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/rellm_experimental.ipynb
---
# RELLM

[RELLM](https://github.com/r2d4/rellm) 是一个库，用于包装本地 Hugging Face 管道模型以进行结构化解码。

它通过一次生成一个令牌来工作。在每一步，它会屏蔽不符合提供的部分正则表达式的令牌。


**警告 - 此模块仍处于实验阶段**


```python
%pip install --upgrade --quiet  rellm langchain-huggingface > /dev/null
```

### Hugging Face 基线

首先，让我们通过检查模型在没有结构化解码的情况下的输出，建立一个定性基线。


```python
import logging

logging.basicConfig(level=logging.ERROR)
prompt = """Human: "What's the capital of the United States?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of the United States is Washington D.C."
}
Human: "What's the capital of Pennsylvania?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of Pennsylvania is Harrisburg."
}
Human: "What 2 + 5?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "2 + 5 = 7."
}
Human: 'What's the capital of Maryland?'
AI Assistant:"""
```


```python
<!--IMPORTS:[{"imported": "HuggingFacePipeline", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/llms/langchain_huggingface.llms.huggingface_pipeline.HuggingFacePipeline.html", "title": "RELLM"}]-->
from langchain_huggingface import HuggingFacePipeline
from transformers import pipeline

hf_model = pipeline(
    "text-generation", model="cerebras/Cerebras-GPT-590M", max_new_tokens=200
)

original_model = HuggingFacePipeline(pipeline=hf_model)

generated = original_model.generate([prompt], stop=["Human:"])
print(generated)
```
```output
Setting `pad_token_id` to `eos_token_id`:50256 for open-end generation.
``````output
generations=[[Generation(text=' "What\'s the capital of Maryland?"\n', generation_info=None)]] llm_output=None
```
***这并不那么令人印象深刻，是吗？它没有回答问题，而且根本没有遵循JSON格式！让我们尝试使用结构化解码器。***

## RELLM LLM包装器

让我们再试一次，这次提供一个正则表达式来匹配JSON结构格式。


```python
import regex  # Note this is the regex library NOT python's re stdlib module

# We'll choose a regex that matches to a structured json string that looks like:
# {
#  "action": "Final Answer",
# "action_input": string or dict
# }
pattern = regex.compile(
    r'\{\s*"action":\s*"Final Answer",\s*"action_input":\s*(\{.*\}|"[^"]*")\s*\}\nHuman:'
)
```


```python
<!--IMPORTS:[{"imported": "RELLM", "source": "langchain_experimental.llms", "docs": "https://python.langchain.com/api_reference/experimental/llms/langchain_experimental.llms.rellm_decoder.RELLM.html", "title": "RELLM"}]-->
from langchain_experimental.llms import RELLM

model = RELLM(pipeline=hf_model, regex=pattern, max_new_tokens=200)

generated = model.predict(prompt, stop=["Human:"])
print(generated)
```
```output
{"action": "Final Answer",
  "action_input": "The capital of Maryland is Baltimore."
}
```
**瞧！没有解析错误。**


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
