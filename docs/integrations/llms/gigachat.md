---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/gigachat.ipynb
---
# GigaChat
本笔记本展示了如何将LangChain与[GigaChat](https://developers.sber.ru/portal/products/gigachat)结合使用。
要使用它，您需要安装```gigachat``` Python包。


```python
%pip install --upgrade --quiet  gigachat
```

要获取GigaChat凭证，您需要[创建账户](https://developers.sber.ru/studio/login)并[获取API访问权限](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## 示例


```python
import os
from getpass import getpass

if "GIGACHAT_CREDENTIALS" not in os.environ:
    os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```


```python
<!--IMPORTS:[{"imported": "GigaChat", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gigachat.GigaChat.html", "title": "GigaChat"}]-->
from langchain_community.llms import GigaChat

llm = GigaChat(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "GigaChat"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "GigaChat"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.invoke(input={"country": "Russia"})
print(generated["text"])
```
```output
The capital of Russia is Moscow.
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
