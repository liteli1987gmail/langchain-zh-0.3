---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/stochasticai.ipynb
---
# 随机人工智能

>[随机加速平台](https://docs.stochastic.ai/docs/introduction/) 旨在简化深度学习模型的生命周期。从上传和版本控制模型，到训练、压缩和加速，再到投入生产。

本示例介绍如何使用 LangChain 与 `StochasticAI` 模型进行交互。

您需要在[这里](https://app.stochastic.ai/workspace/profile/settings?tab=profile)获取 API_KEY 和 API_URL。


```python
from getpass import getpass

STOCHASTICAI_API_KEY = getpass()
```
```output
 ········
```

```python
import os

os.environ["STOCHASTICAI_API_KEY"] = STOCHASTICAI_API_KEY
```


```python
YOUR_API_URL = getpass()
```
```output
 ········
```

```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "StochasticAI"}, {"imported": "StochasticAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.stochasticai.StochasticAI.html", "title": "StochasticAI"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "StochasticAI"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import StochasticAI
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
llm = StochasticAI(api_url=YOUR_API_URL)
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```



```output
"\n\nStep 1: In 1999, the St. Louis Rams won the Super Bowl.\n\nStep 2: In 1999, Beiber was born.\n\nStep 3: The Rams were in Los Angeles at the time.\n\nStep 4: So they didn't play in the Super Bowl that year.\n"
```



## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
