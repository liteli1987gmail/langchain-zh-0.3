---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/alibabacloud_pai_eas_endpoint.ipynb
---
# 阿里云 PAI EAS

>[阿里云机器学习平台](https://www.alibabacloud.com/help/en/pai) 是一个面向企业和开发者的机器学习或深度学习工程平台。它提供易于使用、具有成本效益、高性能和易于扩展的插件，可应用于各种行业场景。凭借超过140种内置优化算法，`机器学习平台` 提供全流程的AI工程能力，包括数据标注（`PAI-iTAG`）、模型构建（`PAI-Designer` 和 `PAI-DSW`）、模型训练（`PAI-DLC`）、编译优化和推理部署（`PAI-EAS`）。`PAI-EAS` 支持不同类型的硬件资源，包括CPU和GPU，并具有高吞吐量和低延迟。它允许您通过几次点击部署大规模复杂模型，并实时执行弹性缩放和扩展。它还提供全面的运维和监控系统。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Alibaba Cloud PAI EAS"}, {"imported": "PaiEasEndpoint", "source": "langchain_community.llms.pai_eas_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.pai_eas_endpoint.PaiEasEndpoint.html", "title": "Alibaba Cloud PAI EAS"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Alibaba Cloud PAI EAS"}]-->
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

想要使用EAS大型语言模型的用户必须先设置EAS服务。当EAS服务启动后，可以获取`EAS_SERVICE_URL`和`EAS_SERVICE_TOKEN`。用户可以参考https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/获取更多信息。


```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```


```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```



```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
