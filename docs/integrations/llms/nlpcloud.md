---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/nlpcloud.ipynb
---
# NLP Cloud

[NLP Cloud](https://nlpcloud.io) 提供高性能的预训练或自定义模型，用于命名实体识别、情感分析、分类、摘要、改写、语法和拼写纠正、关键词和短语提取、聊天机器人、产品描述和广告生成、意图分类、文本生成、图像生成、博客文章生成、代码生成、问答、自动语音识别、机器翻译、语言检测、语义搜索、语义相似性、分词、词性标注、嵌入和依赖解析。它已准备好投入生产，通过 REST API 提供服务。


本示例介绍了如何使用 LangChain 与 `NLP Cloud` [模型](https://docs.nlpcloud.com/#models) 进行交互。


```python
%pip install --upgrade --quiet  nlpcloud
```


```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```
```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "NLP Cloud"}, {"imported": "NLPCloud", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.nlpcloud.NLPCloud.html", "title": "NLP Cloud"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "NLP Cloud"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
llm = NLPCloud()
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```



```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
