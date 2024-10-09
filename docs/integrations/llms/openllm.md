---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/openllm.ipynb
---
# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM) 是一个用于在生产环境中操作大型语言模型 (LLMs) 的开放平台。它使开发者能够轻松地使用任何开源 LLM 进行推理，部署到云端或本地，并构建强大的 AI 应用程序。

## 安装

通过 [PyPI](https://pypi.org/project/openllm/) 安装 `openllm`


```python
%pip install --upgrade --quiet  openllm
```

## 在本地启动 OpenLLM 服务器

要启动 LLM 服务器，请使用 `openllm start` 命令。例如，要启动 dolly-v2 服务器，请从终端运行以下命令：

```bash
openllm start dolly-v2
```


## 包装器


```python
<!--IMPORTS:[{"imported": "OpenLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.openllm.OpenLLM.html", "title": "OpenLLM"}]-->
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### 可选：本地 LLM 推理

您还可以选择从当前进程本地初始化由 OpenLLM 管理的 LLM。这对于开发目的非常有用，并允许开发人员快速尝试不同类型的 LLM。

在将 LLM 应用程序迁移到生产环境时，我们建议单独部署 OpenLLM 服务器，并通过上述演示的 `server_url` 选项进行访问。

要通过 LangChain 包装器在本地加载 LLM：


```python
<!--IMPORTS:[{"imported": "OpenLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.openllm.OpenLLM.html", "title": "OpenLLM"}]-->
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### 与 LLMChain 集成


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "OpenLLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OpenLLM"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```
```output
iLkb
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
