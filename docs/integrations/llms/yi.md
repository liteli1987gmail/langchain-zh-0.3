---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/yi.ipynb
---
# Yi
[01.AI](https://www.lingyiwanwu.com/en)，由李开复博士创立，是一家处于AI 2.0前沿的全球公司。他们提供尖端的大型语言模型，包括Yi系列，参数范围从60亿到数千亿。01.AI还提供多模态模型、开放API平台以及开源选项，如Yi-34B/9B/6B和Yi-VL。


```python
## Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```

## 前提条件
访问 Yi LLM API 需要一个 API 密钥。请访问 https://www.lingyiwanwu.com/ 获取您的 API 密钥。在申请 API 密钥时，您需要指定是用于国内（中国）还是国际使用。

## 使用 Yi LLM


```python
<!--IMPORTS:[{"imported": "YiLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.yi.YiLLM.html", "title": "Yi"}]-->
import os

os.environ["YI_API_KEY"] = "YOUR_API_KEY"

from langchain_community.llms import YiLLM

# Load the model
llm = YiLLM(model="yi-large")

# You can specify the region if needed (default is "auto")
# llm = YiLLM(model="yi-large", region="domestic")  # or "international"

# Basic usage
res = llm.invoke("What's your name?")
print(res)
```


```python
# Generate method
res = llm.generate(
    prompts=[
        "Explain the concept of large language models.",
        "What are the potential applications of AI in healthcare?",
    ]
)
print(res)
```


```python
# Streaming
for chunk in llm.stream("Describe the key features of the Yi language model series."):
    print(chunk, end="", flush=True)
```


```python
# Asynchronous streaming
import asyncio


async def run_aio_stream():
    async for chunk in llm.astream(
        "Write a brief on the future of AI according to Dr. Kai-Fu Lee's vision."
    ):
        print(chunk, end="", flush=True)


asyncio.run(run_aio_stream())
```


```python
# Adjusting parameters
llm_with_params = YiLLM(
    model="yi-large",
    temperature=0.7,
    top_p=0.9,
)

res = llm_with_params(
    "Propose an innovative AI application that could benefit society."
)
print(res)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
