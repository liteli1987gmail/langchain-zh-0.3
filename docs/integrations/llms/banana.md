---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/banana.ipynb
---
# Banana


[Banana](https://www.banana.dev/about-us) 专注于构建机器学习基础设施。

本示例介绍了如何使用 LangChain 与Banana模型进行交互。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU  langchain-community
```


```python
# Install the package  https://docs.banana.dev/banana-docs/core-concepts/sdks/python
%pip install --upgrade --quiet  banana-dev
```


```python
# get new tokens: https://app.banana.dev/
# We need three parameters to make a Banana.dev API call:
# * a team api key
# * the model's unique key
# * the model's url slug

import os

# You can get this from the main dashboard
# at https://app.banana.dev
os.environ["BANANA_API_KEY"] = "YOUR_API_KEY"
# OR
# BANANA_API_KEY = getpass()
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Banana"}, {"imported": "Banana", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.bananadev.Banana.html", "title": "Banana"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Banana"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import Banana
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
# Both of these are found in your model's
# detail page in https://app.banana.dev
llm = Banana(model_key="YOUR_MODEL_KEY", model_url_slug="YOUR_MODEL_URL_SLUG")
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
