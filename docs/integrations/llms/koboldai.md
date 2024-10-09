---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/koboldai.ipynb
---
# KoboldAI API

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) 是一个“基于浏览器的前端，用于与多个本地和远程AI模型进行AI辅助写作...”。它具有一个公共和本地API，可以在LangChain中使用。

本示例介绍了如何使用LangChain与该API。

文档可以在浏览器中找到，只需在您的端点末尾添加/api（即 http://127.0.0.1/:5000/api）。



```python
<!--IMPORTS:[{"imported": "KoboldApiLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.koboldai.KoboldApiLLM.html", "title": "KoboldAI API"}]-->
from langchain_community.llms import KoboldApiLLM
```

用下面看到的端点替换为在使用 --api 或 --public-api 启动 webui 后显示的端点

可选地，您可以传入参数，如温度或最大长度


```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```


```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
