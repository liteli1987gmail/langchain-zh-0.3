---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/xinference.ipynb
---
# Xorbits 推理 (Xinference)

[Xinference](https://github.com/xorbitsai/inference) 是一个强大且多功能的库，旨在为大型语言模型（LLMs）、语音识别模型和多模态模型提供服务，甚至可以在您的笔记本电脑上使用。它支持多种与 GGML 兼容的模型，如 chatglm、baichuan、whisper、vicuna、orca 等等。此笔记本演示了如何将 Xinference 与 LangChain 一起使用。
## 安装

## 安装

通过 PyPI 安装 `Xinference`：


```python
%pip install --upgrade --quiet  "xinference[all]"
```

## 在本地或分布式集群中部署 Xinference。

要进行本地部署，请运行 `xinference`。

要在集群中部署 Xinference，首先使用 `xinference-supervisor` 启动一个 Xinference 监督进程。您还可以使用 -p 选项指定端口，使用 -H 选项指定主机。默认端口为 9997。

然后，在您希望运行的每个服务器上使用 `xinference-worker` 启动 Xinference 工作进程。

您可以查阅 [Xinference](https://github.com/xorbitsai/inference) 的 README 文件以获取更多信息。
## 包装器

要将 Xinference 与 LangChain 一起使用，您需要首先启动一个模型。您可以使用命令行界面 (CLI) 来做到这一点：


```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```
```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```
将返回一个模型 UID 供您使用。现在您可以将 Xinference 与 LangChain 一起使用：


```python
<!--IMPORTS:[{"imported": "Xinference", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.xinference.Xinference.html", "title": "Xorbits Inference (Xinference)"}]-->
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```



```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```


### 与 LLMChain 集成


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Xorbits Inference (Xinference)"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Xorbits Inference (Xinference)"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```
```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```
最后，当您不再需要使用模型时，请终止它：


```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
