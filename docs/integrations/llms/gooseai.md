---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/gooseai.ipynb
---
# GooseAI

`GooseAI` 是一个完全托管的自然语言处理即服务，通过API提供。GooseAI提供对[这些模型](https://goose.ai/docs/models)的访问。

本笔记本介绍了如何使用Langchain与[GooseAI](https://goose.ai/)。


## 安装openai
使用GooseAI API需要`openai`包。使用`pip install openai`安装`openai`。


```python
%pip install --upgrade --quiet  langchain-openai
```

## 导入


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "GooseAI"}, {"imported": "GooseAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gooseai.GooseAI.html", "title": "GooseAI"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "GooseAI"}]-->
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## 设置环境 API 密钥
确保从 GooseAI 获取您的 API 密钥。您将获得 $10 的免费积分以测试不同的模型。


```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```


```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## 创建 GooseAI 实例
您可以指定不同的参数，例如模型名称、生成的最大令牌、温度等。


```python
llm = GooseAI()
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
