---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/moonshot.ipynb
---
# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) 是一家为企业和个人提供大型语言模型服务的中国初创公司。

本示例介绍了如何使用 LangChain 与 Moonshot 进行交互。


```python
<!--IMPORTS:[{"imported": "Moonshot", "source": "langchain_community.llms.moonshot", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.moonshot.Moonshot.html", "title": "MoonshotChat"}]-->
from langchain_community.llms.moonshot import Moonshot
```


```python
import os

# Generate your api key from: https://platform.moonshot.cn/console/api-keys
os.environ["MOONSHOT_API_KEY"] = "MOONSHOT_API_KEY"
```


```python
llm = Moonshot()
# or use a specific model
# Available models: https://platform.moonshot.cn/docs
# llm = Moonshot(model="moonshot-v1-128k")
```


```python
# Prompt the model
llm.invoke("What is the difference between panda and bear?")
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
