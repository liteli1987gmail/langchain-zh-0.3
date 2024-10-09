---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/cohere.ipynb
---
# Cohere

:::caution
您当前正在查看文档，介绍了将 Cohere 模型用作 [文本补全模型](/docs/concepts/#llms) 的方法。许多流行的 Cohere 模型是 [聊天补全模型](/docs/concepts/#chat-models)。

您可能想查看 [此页面](/docs/integrations/chat/cohere/)。
:::

>[Cohere](https://cohere.ai/about) 是一家加拿大初创公司，提供自然语言处理模型，帮助公司改善人机交互。

请前往 [API 参考](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.cohere.Cohere.html) 获取所有属性和方法的详细文档。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/llms/cohere/) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [Cohere](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.cohere.Cohere.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ❌ | beta | ✅ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain_community?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain_community?style=flat-square&label=%20) |


## 设置

集成位于 `LangChain 社区` 包中。我们还需要安装 `cohere` 包本身。我们可以通过以下方式安装这些：

### 凭证

我们需要获取一个 [Cohere API 密钥](https://cohere.com/) 并设置 `COHERE_API_KEY` 环境变量：


```python
import getpass
import os

if "COHERE_API_KEY" not in os.environ:
    os.environ["COHERE_API_KEY"] = getpass.getpass()
```

### 安装


```python
pip install -U langchain-community langchain-cohere
```

设置 [LangSmith](https://smith.langchain.com/) 以获得最佳的可观察性也是有帮助的（但不是必需的）


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 调用

Cohere 支持所有 [大型语言模型](/docs/how_to#llms) 功能：


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Cohere"}]-->
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```


```python
model = Cohere(max_tokens=256, temperature=0.75)
```


```python
message = "Knock knock"
model.invoke(message)
```



```output
" Who's there?"
```



```python
await model.ainvoke(message)
```



```output
" Who's there?"
```



```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```
```output
 Who's there?
```

```python
model.batch([message])
```



```output
[" Who's there?"]
```


## 链接

您还可以轻松地与提示词模板结合，以便于用户输入的结构化。我们可以使用 [LangChain表达式 (LCEL)](/docs/concepts#langchain-expression-language-lcel) 来实现这一点


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Cohere"}]-->
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```


```python
chain.invoke({"topic": "bears"})
```



```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```


## API 参考

有关所有 `Cohere` 大型语言模型功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/llms/langchain_community.llms.cohere.Cohere.html


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
