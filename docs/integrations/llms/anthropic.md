---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/anthropic.ipynb
sidebar_label: Anthropic
sidebar_class_name: hidden
---
# AnthropicLLM

:::caution
您当前正在查看文档，介绍如何使用Anthropic遗留的Claude 2模型作为[文本补全模型](/docs/concepts/#llms)。最新和最受欢迎的Anthropic模型是[聊天补全模型](/docs/concepts/#chat-models)，而文本补全模型已被弃用。

您可能想查看[此页面](/docs/integrations/chat/anthropic/)。
:::

本示例介绍如何使用LangChain与`Anthropic`模型进行交互。

## 安装


```python
%pip install -qU langchain-anthropic
```

## 环境设置

我们需要获取一个 [Anthropic](https://console.anthropic.com/settings/keys) API 密钥并设置 `ANTHROPIC_API_KEY` 环境变量：


```python
import os
from getpass import getpass

if "ANTHROPIC_API_KEY" not in os.environ:
    os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## 使用方法


```python
<!--IMPORTS:[{"imported": "AnthropicLLM", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/llms/langchain_anthropic.llms.AnthropicLLM.html", "title": "AnthropicLLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "AnthropicLLM"}]-->
from langchain_anthropic import AnthropicLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

model = AnthropicLLM(model="claude-2.1")

chain = prompt | model

chain.invoke({"question": "What is LangChain?"})
```



```output
'\nLangChain is a decentralized blockchain network that leverages AI and machine learning to provide language translation services.'
```



## 相关内容

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
