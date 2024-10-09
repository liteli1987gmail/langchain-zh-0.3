---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/friendli.ipynb
sidebar_label: Friendli
---
# Friendli

> [Friendli](https://friendli.ai/) 提升AI应用性能，并通过可扩展、高效的部署选项优化成本节约，专为高需求的AI工作负载量身定制。

本教程将指导您如何将 `Friendli` 与 LangChain 集成。

## 设置

确保安装了 `langchain_community` 和 `friendli-client`。

```sh
pip install -U langchain-comminity friendli-client.
```

登录到 [Friendli Suite](https://suite.friendli.ai/) 创建个人访问令牌，并将其设置为 `FRIENDLI_TOKEN` 环境变量。


```python
import getpass
import os

if "FRIENDLI_TOKEN" not in os.environ:
    os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

您可以通过选择要使用的模型来初始化 Friendli 聊天模型。默认模型是 `mixtral-8x7b-instruct-v0-1`。您可以在 [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models) 查看可用模型。


```python
<!--IMPORTS:[{"imported": "Friendli", "source": "langchain_community.llms.friendli", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.friendli.Friendli.html", "title": "Friendli"}]-->
from langchain_community.llms.friendli import Friendli

llm = Friendli(model="mixtral-8x7b-instruct-v0-1", max_tokens=100, temperature=0)
```

## 用法

`Frienli` 支持所有 [`LLM`](/docs/how_to#llms) 方法，包括异步 API。

您可以使用 `invoke`、`batch`、`generate` 和 `stream` 的功能。


```python
llm.invoke("Tell me a joke.")
```



```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```



```python
llm.batch(["Tell me a joke.", "Tell me a joke."])
```



```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```



```python
llm.generate(["Tell me a joke.", "Tell me a joke."])
```



```output
LLMResult(generations=[[Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')], [Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('a2009600-baae-4f5a-9f69-23b2bc916e4c')), RunInfo(run_id=UUID('acaf0838-242c-4255-85aa-8a62b675d046'))])
```



```python
for chunk in llm.stream("Tell me a joke."):
    print(chunk, end="", flush=True)
```
```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```
您还可以使用异步 API 的所有功能：`ainvoke`、`abatch`、`agenerate` 和 `astream`。


```python
await llm.ainvoke("Tell me a joke.")
```



```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```



```python
await llm.abatch(["Tell me a joke.", "Tell me a joke."])
```



```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```



```python
await llm.agenerate(["Tell me a joke.", "Tell me a joke."])
```



```output
LLMResult(generations=[[Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")], [Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('46144905-7350-4531-a4db-22e6a827c6e3')), RunInfo(run_id=UUID('e2b06c30-ffff-48cf-b792-be91f2144aa6'))])
```



```python
async for chunk in llm.astream("Tell me a joke."):
    print(chunk, end="", flush=True)
```
```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
