---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/llm_chain.ipynb
---
# 从LLMChain迁移

[`LLMChain`](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html) 将提示词模板、大型语言模型和输出解析器组合成一个类。

切换到LCEL实现的一些优势包括：

- 内容和参数的清晰性。遗留的`LLMChain`包含一个默认的输出解析器和其他选项。
- 更容易的流式处理。`LLMChain`仅通过回调支持流式处理。
- 如果需要，更容易访问原始消息输出。`LLMChain`仅通过参数或回调暴露这些。


```python
%pip install --upgrade --quiet langchain-openai
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 传统

<details open>


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating from LLMChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from LLMChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMChain"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [("user", "Tell me a {adjective} joke")],
)

legacy_chain = LLMChain(llm=ChatOpenAI(), prompt=prompt)

legacy_result = legacy_chain({"adjective": "funny"})
legacy_result
```



```output
{'adjective': 'funny',
 'text': "Why couldn't the bicycle stand up by itself?\n\nBecause it was two tired!"}
```


请注意，`LLMChain` 默认返回一个 `dict`，其中包含来自 `StrOutputParser` 的输入和输出，因此要提取输出，您需要访问 `"text"` 键。


```python
legacy_result["text"]
```



```output
"Why couldn't the bicycle stand up by itself?\n\nBecause it was two tired!"
```


</details>

## LCEL

<details open>


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from LLMChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from LLMChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from LLMChain"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [("user", "Tell me a {adjective} joke")],
)

chain = prompt | ChatOpenAI() | StrOutputParser()

chain.invoke({"adjective": "funny"})
```



```output
'Why was the math book sad?\n\nBecause it had too many problems.'
```


如果您想模仿 `LLMChain` 中输入和输出的 `dict` 打包，可以使用 [`RunnablePassthrough.assign`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html) ，例如：


```python
<!--IMPORTS:[{"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Migrating from LLMChain"}]-->
from langchain_core.runnables import RunnablePassthrough

outer_chain = RunnablePassthrough().assign(text=chain)

outer_chain.invoke({"adjective": "funny"})
```



```output
{'adjective': 'funny',
 'text': 'Why did the scarecrow win an award? Because he was outstanding in his field!'}
```


</details>

## 下一步

请参阅 [本教程](/docs/tutorials/llm_chain) 以获取有关使用提示词模板、大型语言模型和输出解析器的更多详细信息。

查看 [LCEL 概念文档](/docs/concepts/#langchain-expression-language-lcel) 以获取更多背景信息。
