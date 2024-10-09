---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/replicate.ipynb
---
# 复制

>[复制](https://replicate.com/blog/machine-learning-needs-better-tools) 在云中运行机器学习模型。我们有一个开源模型库，您可以用几行代码运行。如果您正在构建自己的机器学习模型，复制使其易于大规模部署。

本示例介绍如何使用 LangChain 与 `复制` [模型](https://replicate.com/explore) 进行交互

## 设置


```python
# magics to auto-reload external modules in case you are making changes to langchain while working on this notebook
%load_ext autoreload
%autoreload 2
```

要运行此笔记本，您需要创建一个 [replicate](https://replicate.com) 账户并安装 [replicate python 客户端](https://github.com/replicate/replicate-python)。


```python
!poetry run pip install replicate
```
```output
Collecting replicate
  Using cached replicate-0.25.1-py3-none-any.whl.metadata (24 kB)
Requirement already satisfied: httpx<1,>=0.21.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (0.24.1)
Requirement already satisfied: packaging in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (23.2)
Requirement already satisfied: pydantic>1.10.7 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (1.10.14)
Requirement already satisfied: typing-extensions>=4.5.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from replicate) (4.10.0)
Requirement already satisfied: certifi in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (2024.2.2)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (0.17.3)
Requirement already satisfied: idna in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (3.6)
Requirement already satisfied: sniffio in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpx<1,>=0.21.0->replicate) (1.3.1)
Requirement already satisfied: h11<0.15,>=0.13 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (3.7.1)
Requirement already satisfied: exceptiongroup in /Users/charlieholtz/miniconda3/envs/langchain/lib/python3.9/site-packages (from anyio<5.0,>=3.0->httpcore<0.18.0,>=0.15.0->httpx<1,>=0.21.0->replicate) (1.2.0)
Using cached replicate-0.25.1-py3-none-any.whl (39 kB)
Installing collected packages: replicate
Successfully installed replicate-0.25.1
```

```python
# get a token: https://replicate.com/account

from getpass import getpass

REPLICATE_API_TOKEN = getpass()
```


```python
import os

os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Replicate"}, {"imported": "Replicate", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.replicate.Replicate.html", "title": "Replicate"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Replicate"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import Replicate
from langchain_core.prompts import PromptTemplate
```

## 调用模型

在 [replicate 探索页面](https://replicate.com/explore) 找到一个模型，然后以这种格式粘贴模型名称和版本：model_name/version。

例如，这里是 [`Meta Llama 3`](https://replicate.com/meta/meta-llama-3-8b-instruct)。


```python
llm = Replicate(
    model="meta/meta-llama-3-8b-instruct",
    model_kwargs={"temperature": 0.75, "max_length": 500, "top_p": 1},
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
llm(prompt)
```



```output
"Let's break this down step by step:\n\n1. A dog is a living being, specifically a mammal.\n2. Dogs do not possess the cognitive abilities or physical characteristics necessary to operate a vehicle, such as a car.\n3. Operating a car requires complex mental and physical abilities, including:\n\t* Understanding of traffic laws and rules\n\t* Ability to read and comprehend road signs\n\t* Ability to make decisions quickly and accurately\n\t* Ability to physically manipulate the vehicle's controls (e.g., steering wheel, pedals)\n4. Dogs do not possess any of these abilities. They are unable to read or comprehend written language, let alone complex traffic laws.\n5. Dogs also lack the physical dexterity and coordination to operate a vehicle's controls. Their paws and claws are not adapted for grasping or manipulating small, precise objects like a steering wheel or pedals.\n6. Therefore, it is not possible for a dog to drive a car.\n\nAnswer: No."
```


作为另一个例子，对于这个 [dolly 模型](https://replicate.com/replicate/dolly-v2-12b)，点击 API 标签。模型名称/版本将是：`replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5`

只有 `model` 参数是必需的，但我们可以在初始化时添加其他模型参数。

例如，如果我们正在运行稳定扩散并想要更改图像尺寸：

```
Replicate(model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf", input={'image_dimensions': '512x512'})
```
                       
*请注意，只有模型的第一个输出将被返回。*


```python
llm = Replicate(
    model="replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5"
)
```


```python
prompt = """
Answer the following yes/no question by reasoning step by step.
Can a dog drive a car?
"""
llm(prompt)
```



```output
'No, dogs lack some of the brain functions required to operate a motor vehicle. They cannot focus and react in time to accelerate or brake correctly. Additionally, they do not have enough muscle control to properly operate a steering wheel.\n\n'
```


我们可以使用这种语法调用任何 replicate 模型。例如，我们可以调用稳定扩散。


```python
text2image = Replicate(
    model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    model_kwargs={"image_dimensions": "512x512"},
)
```


```python
image_output = text2image("A cat riding a motorcycle by Picasso")
image_output
```



```output
'https://pbxt.replicate.delivery/bqQq4KtzwrrYL9Bub9e7NvMTDeEMm5E9VZueTXkLE7kWumIjA/out-0.png'
```


模型输出一个 URL。让我们渲染它。


```python
!poetry run pip install Pillow
```
```output
Requirement already satisfied: Pillow in /Users/bagatur/langchain/.venv/lib/python3.9/site-packages (9.5.0)

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2[0m[39;49m -> [0m[32;49m23.2.1[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from io import BytesIO

import requests
from PIL import Image

response = requests.get(image_output)
img = Image.open(BytesIO(response.content))

img
```

## 流式响应
您可以选择在生成时流式传输响应，这有助于向用户展示交互性，特别是在耗时的生成过程中。有关更多信息，请参见[流式处理](/docs/how_to/streaming_llm)的详细文档。


```python
<!--IMPORTS:[{"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Replicate"}]-->
from langchain_core.callbacks import StreamingStdOutCallbackHandler

llm = Replicate(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
    model="a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
    model_kwargs={"temperature": 0.75, "max_length": 500, "top_p": 1},
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
_ = llm.invoke(prompt)
```
```output
1. Dogs do not have the physical ability to operate a vehicle.
```
# 停止序列
您还可以指定停止序列。如果您有一个明确的停止序列用于生成，并且您无论如何都会解析它，那么在达到一个或多个停止序列后取消生成会更好（更便宜且更快！），而不是让模型继续生成直到指定的`max_length`。停止序列在流式模式下或非流式模式下都有效，并且Replicate仅对生成到停止序列的部分收费。


```python
import time

llm = Replicate(
    model="a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
    model_kwargs={"temperature": 0.01, "max_length": 500, "top_p": 1},
)

prompt = """
User: What is the best way to learn python?
Assistant:
"""
start_time = time.perf_counter()
raw_output = llm.invoke(prompt)  # raw output, no stop
end_time = time.perf_counter()
print(f"Raw output:\n {raw_output}")
print(f"Raw output runtime: {end_time - start_time} seconds")

start_time = time.perf_counter()
stopped_output = llm.invoke(prompt, stop=["\n\n"])  # stop on double newlines
end_time = time.perf_counter()
print(f"Stopped output:\n {stopped_output}")
print(f"Stopped output runtime: {end_time - start_time} seconds")
```
```output
Raw output:
 There are several ways to learn Python, and the best method for you will depend on your learning style and goals. Here are a few suggestions:

1. Online tutorials and courses: Websites such as Codecademy, Coursera, and edX offer interactive coding lessons and courses that can help you get started with Python. These courses are often designed for beginners and cover the basics of Python programming.
2. Books: There are many books available that can teach you Python, ranging from introductory texts to more advanced manuals. Some popular options include "Python Crash Course" by Eric Matthes, "Automate the Boring Stuff with Python" by Al Sweigart, and "Python for Data Analysis" by Wes McKinney.
3. Videos: YouTube and other video platforms have a wealth of tutorials and lectures on Python programming. Many of these videos are created by experienced programmers and can provide detailed explanations and examples of Python concepts.
4. Practice: One of the best ways to learn Python is to practice writing code. Start with simple programs and gradually work your way up to more complex projects. As you gain experience, you'll become more comfortable with the language and develop a better understanding of its capabilities.
5. Join a community: There are many online communities and forums dedicated to Python programming, such as Reddit's r/learnpython community. These communities can provide support, resources, and feedback as you learn.
6. Take online courses: Many universities and organizations offer online courses on Python programming. These courses can provide a structured learning experience and often include exercises and assignments to help you practice your skills.
7. Use a Python IDE: An Integrated Development Environment (IDE) is a software application that provides an interface for writing, debugging, and testing code. Popular Python IDEs include PyCharm, Visual Studio Code, and Spyder. These tools can help you write more efficient code and provide features such as code completion, debugging, and project management.


Which of the above options do you think is the best way to learn Python?
Raw output runtime: 25.27470933299992 seconds
Stopped output:
 There are several ways to learn Python, and the best method for you will depend on your learning style and goals. Here are some suggestions:
Stopped output runtime: 25.77039254200008 seconds
```
## 链式调用
LangChain的整个目的就是... 链接！以下是如何做到这一点的示例。


```python
<!--IMPORTS:[{"imported": "SimpleSequentialChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.sequential.SimpleSequentialChain.html", "title": "Replicate"}]-->
from langchain.chains import SimpleSequentialChain
```

首先，让我们将此模型的LLM定义为flan-5，将text2image定义为稳定扩散模型。


```python
dolly_llm = Replicate(
    model="replicate/dolly-v2-12b:ef0e1aefc61f8e096ebe4db6b2bacc297daf2ef6899f0f7e001ec445893500e5"
)
text2image = Replicate(
    model="stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
)
```

链中的第一个提示


```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=dolly_llm, prompt=prompt)
```

第二个提示以获取公司描述的logo


```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}",
)
chain_two = LLMChain(llm=dolly_llm, prompt=second_prompt)
```

第三个提示，让我们根据提示2的描述输出创建图像


```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

现在让我们运行它！


```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
catchphrase = overall_chain.run("colorful socks")
print(catchphrase)
```
```output


[1m> Entering new SimpleSequentialChain chain...[0m
[36;1m[1;3mColorful socks could be named after a song by The Beatles or a color (yellow, blue, pink). A good combination of letters and digits would be 6399. Apple also owns the domain 6399.com so this could be reserved for the Company.

[0m
[33;1m[1;3mA colorful sock with the numbers 3, 9, and 99 screen printed in yellow, blue, and pink, respectively.

[0m
[38;5;200m[1;3mhttps://pbxt.replicate.delivery/P8Oy3pZ7DyaAC1nbJTxNw95D1A3gCPfi2arqlPGlfG9WYTkRA/out-0.png[0m

[1m> Finished chain.[0m
https://pbxt.replicate.delivery/P8Oy3pZ7DyaAC1nbJTxNw95D1A3gCPfi2arqlPGlfG9WYTkRA/out-0.png
```

```python
response = requests.get(
    "https://replicate.delivery/pbxt/682XgeUlFela7kmZgPOf39dDdGDDkwjsCIJ0aQ0AO5bTbbkiA/out-0.png"
)
img = Image.open(BytesIO(response.content))
img
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
