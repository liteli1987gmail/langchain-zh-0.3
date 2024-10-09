---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/yandex.ipynb
---
# YandexGPT

本笔记介绍如何使用LangChain与[YandexGPT](https://cloud.yandex.com/en/services/yandexgpt)。

要使用，您应该安装`yandexcloud` Python包。


```python
%pip install --upgrade --quiet  yandexcloud
```

首先，您应该[创建服务账户](https://cloud.yandex.com/en/docs/iam/operations/sa/create)，并赋予`ai.languageModels.user`角色。

接下来，您有两个身份验证选项：
- [IAM令牌](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)。
您可以在构造函数参数`iam_token`中指定令牌，或在环境变量`YC_IAM_TOKEN`中指定。

- [API密钥](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
您可以在构造函数参数`api_key`中指定密钥，或在环境变量`YC_API_KEY`中指定。

要指定模型，您可以使用`model_uri`参数，更多详细信息请参见[文档](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation)。

默认情况下，将使用从参数`folder_id`或环境变量`YC_FOLDER_ID`指定的文件夹中的最新版本`yandexgpt-lite`。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "YandexGPT"}, {"imported": "YandexGPT", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.yandex.YandexGPT.html", "title": "YandexGPT"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "YandexGPT"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import YandexGPT
from langchain_core.prompts import PromptTemplate
```


```python
template = "What is the capital of {country}?"
prompt = PromptTemplate.from_template(template)
```


```python
llm = YandexGPT()
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
country = "Russia"

llm_chain.invoke(country)
```



```output
'The capital of Russia is Moscow.'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
