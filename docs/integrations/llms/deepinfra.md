---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/deepinfra.ipynb
---
# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) 是一种无服务器推理服务，提供对[多种大型语言模型](https://deepinfra.com/models?utm_source=langchain)和[嵌入模型](https://deepinfra.com/models?type=embeddings&utm_source=langchain)的访问。此笔记本介绍了如何将LangChain与DeepInfra结合使用以进行语言模型。

## 设置环境API密钥
确保从DeepInfra获取您的API密钥。您需要[登录](https://deepinfra.com/login?from=%2Fdash)并获取一个新令牌。

您将获得1小时的无服务器GPU计算免费时间，以测试不同的模型。（见[这里](https://github.com/deepinfra/deepctl#deepctl)）
您可以使用 `deepctl auth token` 打印您的令牌


```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```
```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## 创建 DeepInfra 实例
您还可以使用我们的开源 [deepctl 工具](https://github.com/deepinfra/deepctl#deepctl) 来管理您的模型部署。您可以在 [这里](https://deepinfra.com/databricks/dolly-v2-12b#API) 查看可用参数的列表。


```python
<!--IMPORTS:[{"imported": "DeepInfra", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.deepinfra.DeepInfra.html", "title": "DeepInfra"}]-->
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```


```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```



```output
'This is a question that has puzzled many people'
```



```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```



```output
 Will
 Smith
.
```


## 创建提示词模板
我们将为问答创建一个提示词模板。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "DeepInfra"}]-->
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## 初始化 LLMChain


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "DeepInfra"}]-->
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## 运行 LLMChain
提供一个问题并运行 LLMChain。


```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```



```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
