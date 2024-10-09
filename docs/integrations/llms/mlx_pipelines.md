---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/mlx_pipelines.ipynb
---
# MLX 本地管道

MLX 模型可以通过 `MLXPipeline` 类在本地运行。

 [MLX 社区](https://huggingface.co/mlx-community) 拥有超过 150 个模型，全部开源并在 Hugging Face 模型库上公开可用，这是一个人们可以轻松合作并共同构建 ML 的在线平台。

这些模型可以通过 LangChain 通过这个本地管道包装器调用，或者通过 MlXPipeline 类调用它们的托管推理端点。有关 mlx 的更多信息，请参见 [示例库](https://github.com/ml-explore/mlx-examples/tree/main/llms) 笔记本。

要使用，您应该安装 ``mlx-lm`` python [包](https://pypi.org/project/mlx-lm/)，以及 [transformers](https://pypi.org/project/transformers/)。您还可以安装 `huggingface_hub`。


```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### 模型加载

可以通过使用 `from_model_id` 方法指定模型参数来加载模型。


```python
<!--IMPORTS:[{"imported": "MLXPipeline", "source": "langchain_community.llms.mlx_pipeline", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.mlx_pipeline.MLXPipeline.html", "title": "MLX Local Pipelines"}]-->
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

也可以通过直接传入现有的 `transformers` 管道来加载。


```python
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### 创建链

将模型加载到内存后，您可以与提示词组合以
形成一个链。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "MLX Local Pipelines"}]-->
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
