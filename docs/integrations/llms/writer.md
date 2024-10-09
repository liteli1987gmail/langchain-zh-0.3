---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/writer.ipynb
---
# Writer

[Writer](https://writer.com/) 是一个生成不同语言内容的平台。

这个示例介绍了如何使用 LangChain 与 `Writer` [模型](https://dev.writer.com/docs/models) 进行交互。

您可以在 [这里](https://dev.writer.com/docs) 获取 WRITER_API_KEY。


```python
from getpass import getpass

WRITER_API_KEY = getpass()
```
```output
 ········
```

```python
import os

os.environ["WRITER_API_KEY"] = WRITER_API_KEY
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Writer"}, {"imported": "Writer", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.writer.Writer.html", "title": "Writer"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Writer"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import Writer
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
# If you get an error, probably, you need to set up the "base_url" parameter that can be taken from the error log.

llm = Writer()
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
