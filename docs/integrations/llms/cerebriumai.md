---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/cerebriumai.ipynb
---
# CerebriumAI

`Cerebrium` 是 AWS Sagemaker 的替代品。它还提供对 [多个大型语言模型](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment) 的 API 访问。

本笔记本介绍了如何将 LangChain 与 [CerebriumAI](https://docs.cerebrium.ai/introduction) 一起使用。

## 安装 cerebrium
`cerebrium` 包是使用 `CerebriumAI` API 所必需的。使用 `pip3 install cerebrium` 安装 `cerebrium`。


```python
# Install the package
!pip3 install cerebrium
```

## 导入


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "CerebriumAI"}, {"imported": "CerebriumAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.cerebriumai.CerebriumAI.html", "title": "CerebriumAI"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "CerebriumAI"}]-->
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## 设置环境 API 密钥
确保从 CerebriumAI 获取您的 API 密钥。请参见 [这里](https://dashboard.cerebrium.ai/login)。您将获得 1 小时的无服务器 GPU 计算免费试用，以测试不同的模型。


```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## 创建 CerebriumAI 实例
您可以指定不同的参数，例如模型端点 URL、最大长度、温度等。您必须提供一个端点 URL。


```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
```

## 创建提示词模板
我们将为问答创建一个提示词模板。


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## 初始化 LLMChain


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## 运行 LLMChain
提供一个问题并运行 LLMChain。


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
