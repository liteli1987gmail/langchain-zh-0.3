---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/together.ipynb
---
# Together AI

[Together AI](https://www.together.ai/) 提供一个API，可以用几行代码查询 [50+ 个领先的开源模型](https://docs.together.ai/docs/inference-models)。

本示例介绍如何使用 LangChain 与 Together AI 模型进行交互。

## 安装


```python
%pip install --upgrade langchain-together
```

## 环境

要使用 Together AI，您需要一个 API 密钥，您可以在这里找到：
https://api.together.ai/settings/api-keys。可以作为初始化参数传递
``together_api_key`` 或设置为环境变量 ``TOGETHER_API_KEY``。


## 示例


```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```


```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
