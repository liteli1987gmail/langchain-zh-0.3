---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/mosaicml.ipynb
---
# MosaicML

[MosaicML](https://docs.mosaicml.com/en/latest/inference.html) 提供了一个托管的推理服务。您可以使用各种开源模型，或部署您自己的模型。

本示例介绍了如何使用 LangChain 与 MosaicML 推理进行文本补全。


```python
# sign up for an account: https://forms.mosaicml.com/demo?utm_source=langchain

from getpass import getpass

MOSAICML_API_TOKEN = getpass()
```


```python
import os

os.environ["MOSAICML_API_TOKEN"] = MOSAICML_API_TOKEN
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "MosaicML"}, {"imported": "MosaicML", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.mosaicml.MosaicML.html", "title": "MosaicML"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "MosaicML"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import MosaicML
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}"""

prompt = PromptTemplate.from_template(template)
```


```python
llm = MosaicML(inject_instruction_format=True, model_kwargs={"max_new_tokens": 128})
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What is one good reason why you should train a large language model on domain specific data?"

llm_chain.run(question)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
