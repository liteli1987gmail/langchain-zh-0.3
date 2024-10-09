---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/tongyi.ipynb
---
# 通义千问
通义千问是由阿里巴巴达摩院开发的大型语言模型。它能够通过自然语言理解和语义分析理解用户意图，基于用户的自然语言输入。它为用户在不同领域和任务中提供服务和帮助。通过提供清晰详细的指示，您可以获得更符合您期望的结果。

## 设置


```python
# Install the package
%pip install --upgrade --quiet  langchain-community dashscope
```


```python
# Get a new token: https://help.aliyun.com/document_detail/611472.html?spm=a2c4g.2399481.0.0
from getpass import getpass

DASHSCOPE_API_KEY = getpass()
```
```output
 ········
```

```python
import os

os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
```


```python
<!--IMPORTS:[{"imported": "Tongyi", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.tongyi.Tongyi.html", "title": "Tongyi Qwen"}]-->
from langchain_community.llms import Tongyi
```


```python
Tongyi().invoke("What NFL team won the Super Bowl in the year Justin Bieber was born?")
```



```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of that Super Bowl was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```


## 在链中使用


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Tongyi Qwen"}]-->
from langchain_core.prompts import PromptTemplate
```


```python
llm = Tongyi()
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
chain = prompt | llm
```


```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

chain.invoke({"question": question})
```



```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same calendar year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of Super Bowl XXVIII was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
