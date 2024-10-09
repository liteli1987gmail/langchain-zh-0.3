---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/deepsparse.ipynb
---
# DeepSparse

本页面介绍如何在LangChain中使用[DeepSparse](https://github.com/neuralmagic/deepsparse)推理运行时。
内容分为两部分：安装和设置，以及DeepSparse使用示例。

## 安装和设置

- 使用`pip install deepsparse`安装Python包
- 选择一个[SparseZoo模型](https://sparsezoo.neuralmagic.com/?useCase=text_generation)或将支持的模型导出为ONNX格式[使用Optimum](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.ipynb)


存在一个DeepSparse LLM包装器，提供所有模型的统一接口：


```python
<!--IMPORTS:[{"imported": "DeepSparse", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.deepsparse.DeepSparse.html", "title": "DeepSparse"}]-->
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

可以使用 `config` 参数传递附加参数：


```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
