---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/weight_only_quantization.ipynb
---
# 英特尔权重量化
## 使用英特尔扩展的变换器管道进行Huggingface模型的权重量化

Hugging Face模型可以通过`WeightOnlyQuantPipeline`类在本地运行权重量化。

[Hugging Face模型库](https://huggingface.co/models)托管超过12万个模型、2万个数据集和5万个演示应用（Spaces），所有内容均为开源和公开可用，提供一个在线平台，方便人们协作并共同构建机器学习。

这些可以通过这个本地管道包装类从LangChain调用。

要使用，您需要安装``transformers`` python [包](https://pypi.org/project/transformers/)，以及[pytorch](https://pytorch.org/get-started/locally/)和[intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers)。


```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### 模型加载

可以通过使用 `from_model_id` 方法指定模型参数来加载模型。模型参数包括 intel_extension_for_transformers 中的 `WeightOnlyQuantConfig` 类。


```python
<!--IMPORTS:[{"imported": "WeightOnlyQuantPipeline", "source": "langchain_community.llms.weight_only_quantization", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.weight_only_quantization.WeightOnlyQuantPipeline.html", "title": "Intel Weight-Only Quantization"}]-->
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

也可以通过直接传入现有的 `transformers` 管道来加载。


```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
```

### 创建链

将模型加载到内存后，您可以与提示词组合以
形成一个链。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Intel Weight-Only Quantization"}]-->
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### CPU 推理

现在 intel-extension-for-transformers 仅支持 CPU 设备推理。将很快支持 intel GPU。在 CPU 机器上运行时，您可以指定 `device="cpu"` 或 `device=-1` 参数将模型放在 CPU 设备上。
默认值为 `-1` 用于 CPU 推理。


```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### 批量 CPU 推理

您还可以在CPU上以批处理模式运行推理。


```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### Intel扩展用于变换器支持的数据类型

我们支持将权重量化为以下数据类型以进行存储（WeightOnlyQuantConfig中的weight_dtype）：

* **int8**: 使用8位数据类型。
* **int4_fullrange**: 使用int4范围的-8值，与正常的int4范围[-7,7]相比。
* **int4_clip**: 剪切并保留int4范围内的值，将其他值设置为零。
* **nf4**: 使用归一化的4位浮点数据类型。
* **fp4_e2m1**: 使用常规的4位浮点数据类型。“e2”表示使用2位作为指数，“m1”表示使用1位作为尾数。

虽然这些技术以4或8位存储权重，但计算仍然在float32、bfloat16或int8中进行（WeightOnlyQuantConfig中的compute_dtype）：
* **fp32**: 使用float32数据类型进行计算。
* **bf16**: 使用 bfloat16 数据类型进行计算。
* **int8**: 使用 8 位数据类型进行计算。

### 支持的算法矩阵

在 intel-extension-for-transformers 中支持的量化算法（WeightOnlyQuantConfig 中的算法）：

| 算法 |   PyTorch  |    LLM 运行时    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | 敬请期待 |
|      TEQ      | &#10004; | 敬请期待 |
> **RTN:** 一种我们可以非常直观理解的量化方法。它不需要额外的数据集，是一种非常快速的量化方法。一般来说，RTN 会将权重转换为均匀分布的整数数据类型，但一些算法，如 Qlora，提出了一种非均匀的 NF4 数据类型，并证明了其理论最优性。

> **AWQ:** 证明仅保护1%的显著权重可以大大减少量化误差。显著权重通道是通过观察每个通道的激活和权重分布来选择的。显著权重在量化前还会乘以一个大比例因子进行量化，以便于保留。

> **TEQ:** 一种可训练的等效变换，能够在仅权重量化中保留FP32精度。它受到AWQ的启发，同时提供了一种新的解决方案，以搜索激活和权重之间的最佳每通道缩放因子。



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
