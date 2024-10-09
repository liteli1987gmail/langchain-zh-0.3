---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/baichuan.ipynb
---
# 百川大型语言模型
百川公司（https://www.baichuan-ai.com/）是一家处于AGI时代的中国初创企业，致力于满足人类的基本需求：效率、健康和幸福。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```

## 前提条件
访问 Baichuan LLM API 需要一个 API 密钥。请访问 https://platform.baichuan-ai.com/ 获取您的 API 密钥。

## 使用 Baichuan LLM


```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```


```python
<!--IMPORTS:[{"imported": "BaichuanLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.baichuan.BaichuanLLM.html", "title": "Baichuan LLM"}]-->
from langchain_community.llms import BaichuanLLM

# Load the model
llm = BaichuanLLM()

res = llm.invoke("What's your name?")
print(res)
```


```python
res = llm.generate(prompts=["你好！"])
res
```


```python
for res in llm.stream("Who won the second world war?"):
    print(res)
```


```python
import asyncio


async def run_aio_stream():
    async for res in llm.astream("Write a poem about the sun."):
        print(res)


asyncio.run(run_aio_stream())
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
