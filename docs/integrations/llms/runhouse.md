---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/runhouse.ipynb
---
# Runhouse

[Runhouse](https://github.com/run-house/runhouse) 允许在不同环境和用户之间进行远程计算和数据处理。请参阅 [Runhouse 文档](https://www.run.house/docs)。

本示例介绍如何使用 LangChain 和 [Runhouse](https://github.com/run-house/runhouse) 与托管在您自己的 GPU 上或 AWS、GCP、AWS 或 Lambda 上的按需 GPU 进行交互。

**注意**：代码使用 `SelfHosted` 名称而不是 `Runhouse`。


```python
%pip install --upgrade --quiet  runhouse
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Runhouse"}, {"imported": "SelfHostedHuggingFaceLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.self_hosted_hugging_face.SelfHostedHuggingFaceLLM.html", "title": "Runhouse"}, {"imported": "SelfHostedPipeline", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.self_hosted.SelfHostedPipeline.html", "title": "Runhouse"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Runhouse"}]-->
import runhouse as rh
from langchain.chains import LLMChain
from langchain_community.llms import SelfHostedHuggingFaceLLM, SelfHostedPipeline
from langchain_core.prompts import PromptTemplate
```
```output
INFO | 2023-04-17 16:47:36,173 | No auth token provided, so not using RNS API to save and load configs
```

```python
# For an on-demand A100 with GCP, Azure, or Lambda
gpu = rh.cluster(name="rh-a10x", instance_type="A100:1", use_spot=False)

# For an on-demand A10G with AWS (no single A100s on AWS)
# gpu = rh.cluster(name='rh-a10x', instance_type='g5.2xlarge', provider='aws')

# For an existing cluster
# gpu = rh.cluster(ips=['<ip of the cluster>'],
#                  ssh_creds={'ssh_user': '...', 'ssh_private_key':'<path_to_key>'},
#                  name='rh-a10x')
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
llm = SelfHostedHuggingFaceLLM(
    model_id="gpt2", hardware=gpu, model_reqs=["pip:./", "transformers", "torch"]
)
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
```output
INFO | 2023-02-17 05:42:23,537 | Running _generate_text via gRPC
INFO | 2023-02-17 05:42:24,016 | Time to send message: 0.48 seconds
```


```output
"\n\nLet's say we're talking sports teams who won the Super Bowl in the year Justin Beiber"
```


您还可以通过SelfHostedHuggingFaceLLM接口加载更多自定义模型：


```python
llm = SelfHostedHuggingFaceLLM(
    model_id="google/flan-t5-small",
    task="text2text-generation",
    hardware=gpu,
)
```


```python
llm("What is the capital of Germany?")
```
```output
INFO | 2023-02-17 05:54:21,681 | Running _generate_text via gRPC
INFO | 2023-02-17 05:54:21,937 | Time to send message: 0.25 seconds
```


```output
'berlin'
```


使用自定义加载函数，我们可以直接在远程硬件上加载自定义管道：


```python
def load_pipeline():
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        pipeline,
    )

    model_id = "gpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(model_id)
    pipe = pipeline(
        "text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
    )
    return pipe


def inference_fn(pipeline, prompt, stop=None):
    return pipeline(prompt)[0]["generated_text"][len(prompt) :]
```


```python
llm = SelfHostedHuggingFaceLLM(
    model_load_fn=load_pipeline, hardware=gpu, inference_fn=inference_fn
)
```


```python
llm("Who is the current US president?")
```
```output
INFO | 2023-02-17 05:42:59,219 | Running _generate_text via gRPC
INFO | 2023-02-17 05:42:59,522 | Time to send message: 0.3 seconds
```


```output
'john w. bush'
```


您可以直接将管道发送到模型，但这仅适用于小型模型`（<2 Gb）`，并且速度会很慢：


```python
pipeline = load_pipeline()
llm = SelfHostedPipeline.from_pipeline(
    pipeline=pipeline, hardware=gpu, model_reqs=["pip:./", "transformers", "torch"]
)
```

相反，我们也可以将其发送到硬件的文件系统，这样会快得多。


```python
import pickle

rh.blob(pickle.dumps(pipeline), path="models/pipeline.pkl").save().to(
    gpu, path="models"
)

llm = SelfHostedPipeline.from_pipeline(pipeline="models/pipeline.pkl", hardware=gpu)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
