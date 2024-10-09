---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/volcengine_maas.ipynb
---
# Volc Engine MaaS

本笔记本为您提供了关于如何开始使用Volc Engine的MaaS大型语言模型的指南。


```python
# Install the package
%pip install --upgrade --quiet  volcengine
```


```python
<!--IMPORTS:[{"imported": "VolcEngineMaasLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.volcengine_maas.VolcEngineMaasLLM.html", "title": "Volc Engine Maas"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Volc Engine Maas"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Volc Engine Maas"}]-->
from langchain_community.llms import VolcEngineMaasLLM
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
```


```python
llm = VolcEngineMaasLLM(volc_engine_maas_ak="your ak", volc_engine_maas_sk="your sk")
```

或者您可以在环境变量中设置 access_key 和 secret_key
```bash
export VOLC_ACCESSKEY=YOUR_AK
export VOLC_SECRETKEY=YOUR_SK
```


```python
chain = PromptTemplate.from_template("给我讲个笑话") | llm | StrOutputParser()
chain.invoke({})
```



```output
'好的，下面是一个笑话：\n\n大学暑假我配了隐形眼镜，回家给爷爷说，我现在配了隐形眼镜。\n爷爷让我给他看看，于是，我用小镊子夹了一片给爷爷看。\n爷爷看完便准备出门，边走还边说：“真高级啊，还真是隐形眼镜！”\n等爷爷出去后我才发现，我刚没夹起来！'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
