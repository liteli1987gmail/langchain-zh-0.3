---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/titan_takeoff.ipynb
---
# Titan Takeoff

`TitanML` 帮助企业通过我们的训练、压缩和推理优化平台构建和部署更好、更小、更便宜和更快的 NLP 模型。

我们的推理服务器 [Titan Takeoff](https://docs.titanml.co/docs/intro) 使您能够通过单个命令在本地硬件上部署大型语言模型。大多数生成模型架构都受到支持，例如 Falcon、Llama 2、GPT2、T5 等。如果您在使用特定模型时遇到问题，请通过 hello@titanml.co 联系我们。

## 示例用法
以下是一些有用的示例，帮助您开始使用 Titan Takeoff 服务器。在运行这些命令之前，您需要确保 Takeoff 服务器已在后台启动。有关更多信息，请参见 [启动 Takeoff 的文档页面](https://docs.titanml.co/docs/Docs/launching/)。


```python
<!--IMPORTS:[{"imported": "TitanTakeoff", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.titan_takeoff.TitanTakeoff.html", "title": "Titan Takeoff"}, {"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "Titan Takeoff"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Titan Takeoff"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Titan Takeoff"}]-->
import time

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

### 示例 1

基本用法，假设 Takeoff 在您的机器上运行，使用默认端口（即 localhost:3000）。



```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### 示例 2

指定端口和其他生成参数


```python
llm = TitanTakeoff(port=3000)
# A comprehensive list of parameters can be found at https://docs.titanml.co/docs/next/apis/Takeoff%20inference_REST_API/generate#request
output = llm.invoke(
    "What is the largest rainforest in the world?",
    consumer_group="primary",
    min_new_tokens=128,
    max_new_tokens=512,
    no_repeat_ngram_size=2,
    sampling_topk=1,
    sampling_topp=1.0,
    sampling_temperature=1.0,
    repetition_penalty=1.0,
    regex_string="",
    json_schema=None,
)
print(output)
```

### 示例 3

使用 generate 处理多个输入


```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### 示例 4

流式输出


```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### 示例 5

使用 LCEL


```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### 示例 6

使用 TitanTakeoff Python Wrapper 启动读取器。如果您在首次启动 Takeoff 时尚未创建任何读取器，或者您想添加另一个，可以在初始化 TitanTakeoff 对象时进行。只需将您想要启动的模型配置列表作为 `models` 参数传递。


```python
# Model config for the llama model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
#   tensor_parallel (Optional[int]): The number of gpus you would like your model to be split across
#   max_seq_length (int): The maximum sequence length to use for inference, defaults to 512
#   max_batch_size (int_: The max batch size for continuous batching of requests
llama_model = {
    "model_name": "TheBloke/Llama-2-7b-Chat-AWQ",
    "device": "cuda",
    "consumer_group": "llama",
}
llm = TitanTakeoff(models=[llama_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
output = llm.invoke(prompt, consumer_group="llama")
print(output)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
