---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/solar.ipynb
---
# 太阳能

*此社区集成已被弃用。您应该使用 [`ChatUpstage`](../../chat/upstage) 来通过聊天模型连接器访问太阳能大型语言模型。*


```python
<!--IMPORTS:[{"imported": "Solar", "source": "langchain_community.llms.solar", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.solar.Solar.html", "title": "Solar"}]-->
import os

from langchain_community.llms.solar import Solar

os.environ["SOLAR_API_KEY"] = "SOLAR_API_KEY"
llm = Solar()
llm.invoke("tell me a story?")
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Solar"}, {"imported": "Solar", "source": "langchain_community.llms.solar", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.solar.Solar.html", "title": "Solar"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Solar"}]-->
from langchain.chains import LLMChain
from langchain_community.llms.solar import Solar
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm = Solar()
llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
