---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/fiddler.ipynb
---
# Fiddler

>[Fiddler](https://www.fiddler.ai/) 是企业生成和预测系统操作的先驱，提供一个统一的平台，使数据科学、MLOps、风险、合规、分析和其他业务部门能够在企业规模上监控、解释、分析和改进机器学习部署。

## 1. 安装和设置


```python
#!pip install langchain langchain-community langchain-openai fiddler-client
```

## 2. Fiddler 连接详情

*在您可以使用 Fiddler 添加有关您的模型的信息之前*

1. 您用于连接 Fiddler 的 URL
2. 您的组织 ID
3. 您的授权令牌

这些信息可以通过导航到您的 Fiddler 环境的 *设置* 页面找到。


```python
URL = ""  # Your Fiddler instance URL, Make sure to include the full URL (including https://). For example: https://demo.fiddler.ai
ORG_NAME = ""
AUTH_TOKEN = ""  # Your Fiddler instance auth token

# Fiddler project and model names, used for model registration
PROJECT_NAME = ""
MODEL_NAME = ""  # Model name in Fiddler
```

## 3. 创建一个 Fiddler 回调处理程序实例


```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler

fiddler_handler = FiddlerCallbackHandler(
    url=URL,
    org=ORG_NAME,
    project=PROJECT_NAME,
    model=MODEL_NAME,
    api_key=AUTH_TOKEN,
)
```

## 示例 1 : 基本链


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Fiddler"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Fiddler"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAI

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])
output_parser = StrOutputParser()

chain = llm | output_parser

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke("How far is moon from earth?")
```


```python
# Few more invocations
chain.invoke("What is the temperature on Mars?")
chain.invoke("How much is 2 + 200000?")
chain.invoke("Which movie won the oscars this year?")
chain.invoke("Can you write me a poem about insomnia?")
chain.invoke("How are you doing today?")
chain.invoke("What is the meaning of life?")
```

## 示例 2 : 带提示词模板的链


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Fiddler"}, {"imported": "FewShotChatMessagePromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html", "title": "Fiddler"}]-->
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])

chain = final_prompt | llm

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke({"input": "What's the square of a triangle?"})
```
