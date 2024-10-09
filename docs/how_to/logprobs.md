---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/logprobs.ipynb
---
# 如何获取日志概率

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)

:::

某些聊天模型可以配置为返回表示给定令牌可能性的令牌级日志概率。本指南将介绍如何在LangChain中获取此信息。

## OpenAI

安装LangChain x OpenAI包并设置您的API密钥


```python
%pip install -qU langchain-openai
```


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

为了让OpenAI API返回日志概率，我们需要配置`logprobs=True`参数。然后，日志概率将作为`response_metadata`的一部分包含在每个输出的[`AIMessage`](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html)中：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to get log probabilities"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini").bind(logprobs=True)

msg = llm.invoke(("human", "how are you today"))

msg.response_metadata["logprobs"]["content"][:5]
```



```output
[{'token': 'I', 'bytes': [73], 'logprob': -0.26341408, 'top_logprobs': []},
 {'token': "'m",
  'bytes': [39, 109],
  'logprob': -0.48584133,
  'top_logprobs': []},
 {'token': ' just',
  'bytes': [32, 106, 117, 115, 116],
  'logprob': -0.23484154,
  'top_logprobs': []},
 {'token': ' a',
  'bytes': [32, 97],
  'logprob': -0.0018291725,
  'top_logprobs': []},
 {'token': ' computer',
  'bytes': [32, 99, 111, 109, 112, 117, 116, 101, 114],
  'logprob': -0.052299336,
  'top_logprobs': []}]
```


并且也作为流式消息块的一部分：


```python
ct = 0
full = None
for chunk in llm.stream(("human", "how are you today")):
    if ct < 5:
        full = chunk if full is None else full + chunk
        if "logprobs" in full.response_metadata:
            print(full.response_metadata["logprobs"]["content"])
    else:
        break
    ct += 1
```
```output
[]
[{'token': 'I', 'bytes': [73], 'logprob': -0.26593843, 'top_logprobs': []}]
[{'token': 'I', 'bytes': [73], 'logprob': -0.26593843, 'top_logprobs': []}, {'token': "'m", 'bytes': [39, 109], 'logprob': -0.3238896, 'top_logprobs': []}]
[{'token': 'I', 'bytes': [73], 'logprob': -0.26593843, 'top_logprobs': []}, {'token': "'m", 'bytes': [39, 109], 'logprob': -0.3238896, 'top_logprobs': []}, {'token': ' just', 'bytes': [32, 106, 117, 115, 116], 'logprob': -0.23778509, 'top_logprobs': []}]
[{'token': 'I', 'bytes': [73], 'logprob': -0.26593843, 'top_logprobs': []}, {'token': "'m", 'bytes': [39, 109], 'logprob': -0.3238896, 'top_logprobs': []}, {'token': ' just', 'bytes': [32, 106, 117, 115, 116], 'logprob': -0.23778509, 'top_logprobs': []}, {'token': ' a', 'bytes': [32, 97], 'logprob': -0.0022134194, 'top_logprobs': []}]
```
## 下一步

您现在已经学习了如何在LangChain中从OpenAI模型获取日志概率。

接下来，查看本节中其他如何使用聊天模型的指南，例如[如何让模型返回结构化输出](/docs/how_to/structured_output)或[如何跟踪令牌使用情况](/docs/how_to/chat_token_usage_tracking)。
