---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/fireworks.ipynb
---
# 烟花

:::caution
您当前正在查看关于将烟花模型用作 [文本补全模型](/docs/concepts/#llms) 的文档。许多流行的烟花模型是 [聊天补全模型](/docs/concepts/#chat-models)。

您可能想查看 [此页面](/docs/integrations/chat/fireworks/)。
:::

>[烟花](https://app.fireworks.ai/) 通过创建一个创新的AI实验和生产平台，加速生成AI的产品开发。

本示例介绍如何使用 LangChain 与 `烟花` 模型进行交互。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS支持](https://js.langchain.com/v0.1/docs/integrations/llms/fireworks/) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [烟花](https://python.langchain.com/api_reference/fireworks/llms/langchain_fireworks.llms.Fireworks.html#langchain_fireworks.llms.Fireworks) | [langchain_fireworks](https://python.langchain.com/api_reference/fireworks/index.html) | ❌ | ❌ | ✅ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain_fireworks?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_fireworks?style=flat-square&label=%20) |

## 设置

### 凭证

登录 [Fireworks AI](http://fireworks.ai) 获取 API 密钥以访问我们的模型，并确保将其设置为 `FIREWORKS_API_KEY` 环境变量。
3. 使用模型 ID 设置您的模型。如果未设置模型，则默认模型为 fireworks-llama-v2-7b-chat。请查看 [fireworks.ai](https://fireworks.ai) 上最新的完整模型列表。


```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")
```

### 安装

您需要安装 `langchain_fireworks` Python 包，以便笔记本的其余部分正常工作。


```python
%pip install -qU langchain-fireworks
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 实例化


```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://python.langchain.com/api_reference/fireworks/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

# Initialize a Fireworks model
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    base_url="https://api.fireworks.ai/inference/v1/completions",
)
```

## 调用

您可以直接使用字符串提示调用模型以获取补全。


```python
output = llm.invoke("Who's the best quarterback in the NFL?")
print(output)
```
```output
 If Manningville Station, Lions rookie EJ Manuel's
```
### 使用多个提示进行调用


```python
# Calling multiple prompts
output = llm.generate(
    [
        "Who's the best cricket player in 2016?",
        "Who's the best basketball player in the league?",
    ]
)
print(output.generations)
```
```output
[[Generation(text=" We're not just asking, we've done some research. We'")], [Generation(text=' The conversation is dominated by Kobe Bryant, Dwyane Wade,')]]
```
### 使用附加参数进行调用


```python
# Setting additional parameters: temperature, max_tokens, top_p
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=0.7,
    max_tokens=15,
    top_p=1.0,
)
print(llm.invoke("What's the weather like in Kansas City in December?"))
```
```output

December is a cold month in Kansas City, with temperatures of
```
## 链接

您可以使用 LangChain 表达式 (LCEL) 创建一个简单的链，使用非聊天模型。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Fireworks"}, {"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://python.langchain.com/api_reference/fireworks/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_core.prompts import PromptTemplate
from langchain_fireworks import Fireworks

llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=0.7,
    max_tokens=15,
    top_p=1.0,
)
prompt = PromptTemplate.from_template("Tell me a joke about {topic}?")
chain = prompt | llm

print(chain.invoke({"topic": "bears"}))
```
```output
 What do you call a bear with no teeth? A gummy bear!
```
## 流式处理

如果需要，您可以流式输出。


```python
for token in chain.stream({"topic": "bears"}):
    print(token, end="", flush=True)
```
```output
 Why do bears hate shoes so much? They like to run around in their
```
## API参考

有关所有`Fireworks`大型语言模型功能和配置的详细文档，请访问API参考： https://python.langchain.com/api_reference/fireworks/llms/langchain_fireworks.llms.Fireworks.html#langchain_fireworks.llms.Fireworks


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
