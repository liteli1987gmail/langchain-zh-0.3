---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/octoai.ipynb
---
# OctoAI

[OctoAI](https://docs.octoai.cloud/docs) 提供便捷的高效计算访问，并使用户能够将其选择的 AI 模型集成到应用程序中。`OctoAI` 计算服务帮助您轻松运行、调整和扩展 AI 应用程序。

本示例介绍如何使用 LangChain 与 `OctoAI` [LLM 端点](https://octoai.cloud/templates) 进行交互。

## 设置

要运行我们的示例应用程序，需要执行两个简单步骤：

1. 从 [您的 OctoAI 账户页面](https://octoai.cloud/settings) 获取 API 令牌。
   
2. 将您的 API 密钥粘贴到下面的代码单元中。

注意：如果您想使用不同的 LLM 模型，可以将模型容器化，并通过遵循 [从 Python 构建容器](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) 和 [从容器创建自定义端点](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container) 自行创建自定义 OctoAI 端点，然后更新您的 `OCTOAI_API_BASE` 环境变量。



```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "OctoAI"}, {"imported": "OctoAIEndpoint", "source": "langchain_community.llms.octoai_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.octoai_endpoint.OctoAIEndpoint.html", "title": "OctoAI"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OctoAI"}]-->
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## 示例


```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```


```python
llm = OctoAIEndpoint(
    model_name="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```


```python
question = "Who was Leonardo da Vinci?"

chain = prompt | llm

print(chain.invoke(question))
```

莱昂纳多·达·芬奇是一位真正的文艺复兴人物。他于1452年出生在意大利的文奇，以在艺术、科学、工程和数学等多个领域的成就而闻名。他被认为是有史以来最伟大的画家之一，他最著名的作品包括《蒙娜丽莎》和《最后的晚餐》。除了艺术，达·芬奇在工程和解剖学方面也做出了重要贡献，他的机器和发明设计在当时超前了几个世纪。他还以其广泛的日记和绘图而闻名，这些作品为我们提供了对他思想和创意的宝贵见解。达·芬奇的遗产至今仍激励和影响着世界各地的艺术家、科学家和思想家。


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
