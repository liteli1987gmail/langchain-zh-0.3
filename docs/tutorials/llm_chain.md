---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/llm_chain.ipynb
sidebar_position: 0
---
# 使用 LCEL 构建一个简单的 LLM 应用

在这个快速入门中，我们将向您展示如何使用 LangChain 构建一个简单的 LLM 应用。这个应用将把文本从英语翻译成另一种语言。这是一个相对简单的 LLM 应用 - 只需一次 LLM 调用加上一些提示。尽管如此，这是一个很好的开始使用 LangChain 的方式 - 许多功能只需一些提示和一次 LLM 调用就可以构建！

阅读完本教程后，您将对以下内容有一个高层次的概述：

- 使用 [聊天模型](/docs/concepts/#chat-models)

- 使用 [提示词模板](/docs/concepts/#prompt-templates) 和 [输出解析器](/docs/concepts/#output-parsers)

- 使用 [LangChain 表达式 (LCEL)](/docs/concepts/#langchain-expression-language-lcel) 将组件串联在一起

- 使用 [LangSmith](/docs/concepts/#langsmith) 调试和追踪您的应用

- 使用 [LangServe](/docs/concepts/#langserve) 部署您的应用

让我们开始吧！

## 设置

### Jupyter Notebook

本指南（以及文档中的大多数其他指南）使用 [Jupyter notebooks](https://jupyter.org/) 并假设读者也是如此。Jupyter notebooks 非常适合学习如何使用大型语言模型系统，因为事情有时会出错（意外输出、API故障等），在交互环境中逐步阅读指南是更好理解它们的好方法。

这个和其他教程最方便的运行方式是使用 Jupyter notebook。有关如何安装的说明，请参见 [这里](https://jupyter.org/install)。

### 安装

要安装 LangChain，请运行：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from "@theme/CodeBlock";

<Tabs>
  <TabItem value="pip" label="Pip" default>
    <CodeBlock language="bash">pip install langchain</CodeBlock>
  </TabItem>
  <TabItem value="conda" label="Conda">
    <CodeBlock language="bash">conda install langchain -c conda-forge</CodeBlock>
  </TabItem>
</Tabs>



有关更多详细信息，请参见我们的 [安装指南](/docs/how_to/installation)。

### LangSmith

使用 LangChain 构建的许多应用程序将包含多个步骤和多次调用大型语言模型。
随着这些应用变得越来越复杂，能够检查您的链或代理内部究竟发生了什么变得至关重要。
做到这一点的最佳方法是使用 [LangSmith](https://smith.langchain.com)。

在您注册上述链接后，请确保设置您的环境变量以开始记录跟踪：

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="..."
```

或者，如果在笔记本中，您可以使用以下方式设置：

```python
import getpass
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用语言模型

首先，让我们学习如何单独使用语言模型。LangChain支持许多不同的语言模型，您可以互换使用 - 请选择您想要使用的模型！

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs openaiParams={`model="gpt-4"`} />


让我们首先直接使用模型。`ChatModel`是LangChain“运行接口”的实例，这意味着它们提供了一个标准接口供我们与之交互。要简单地调用模型，我们可以将消息列表传递给`.invoke`方法。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Build a Simple LLM Application with LCEL"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Build a Simple LLM Application with LCEL"}]-->
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="Translate the following from English into Italian"),
    HumanMessage(content="hi!"),
]

model.invoke(messages)
```



```output
AIMessage(content='ciao!', response_metadata={'token_usage': {'completion_tokens': 3, 'prompt_tokens': 20, 'total_tokens': 23}, 'model_name': 'gpt-4', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-fc5d7c88-9615-48ab-a3c7-425232b562c5-0')
```


如果我们启用了LangSmith，我们可以看到此运行已记录到LangSmith，并可以查看[LangSmith跟踪](https://smith.langchain.com/public/88baa0b2-7c1a-4d09-ba30-a47985dde2ea/r)

## 输出解析器

请注意，模型的响应是一个`AIMessage`。这包含一个字符串响应以及关于响应的其他元数据。我们通常可能只想处理字符串响应。我们可以通过使用简单的输出解析器来解析出这个响应。

我们首先导入简单的输出解析器。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Build a Simple LLM Application with LCEL"}]-->
from langchain_core.output_parsers import StrOutputParser

parser = StrOutputParser()
```

使用它的一种方法是单独使用它。例如，我们可以保存语言模型调用的结果，然后将其传递给解析器。


```python
result = model.invoke(messages)
```


```python
parser.invoke(result)
```



```output
'Ciao!'
```


更常见的是，我们可以将模型与此输出解析器“链式”连接。这意味着在此链中，每次都会调用此输出解析器。此链采用语言模型的输入类型（字符串或消息列表）并返回输出解析器的输出类型（字符串）。

我们可以使用 `|` 运算符轻松创建链。`|` 运算符在 LangChain 中用于将两个元素组合在一起。


```python
chain = model | parser
```


```python
chain.invoke(messages)
```



```output
'Ciao!'
```


如果我们现在查看 LangSmith，我们可以看到链有两个步骤：首先调用语言模型，然后将结果传递给输出解析器。我们可以看到 [LangSmith 跟踪]( https://smith.langchain.com/public/f1bdf656-2739-42f7-ac7f-0f1dd712322f/r)

## 提示词模板

现在我们直接将消息列表传递给语言模型。这些消息列表来自哪里？通常，它是由用户输入和应用逻辑的组合构建而成的。这个应用逻辑通常会将原始用户输入转换为准备传递给语言模型的消息列表。常见的转换包括添加系统消息或使用用户输入格式化模板。

PromptTemplates 是 LangChain 中的一个概念，旨在帮助进行这种转换。它们接收原始用户输入并返回准备传递给语言模型的数据（提示）。

让我们在这里创建一个 PromptTemplate。它将接收两个用户变量：

- `language`: 要翻译成的语言
- `text`: 要翻译的文本


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a Simple LLM Application with LCEL"}]-->
from langchain_core.prompts import ChatPromptTemplate
```

首先，让我们创建一个字符串，我们将格式化为系统消息：


```python
system_template = "Translate the following into {language}:"
```

接下来，我们可以创建 PromptTemplate。这将是 `system_template` 和一个更简单的模板的组合，用于放置要翻译的文本


```python
prompt_template = ChatPromptTemplate.from_messages(
    [("system", system_template), ("user", "{text}")]
)
```

此提示词模板的输入是一个字典。我们可以单独玩弄这个提示词模板，以查看它的功能。


```python
result = prompt_template.invoke({"language": "italian", "text": "hi"})

result
```



```output
ChatPromptValue(messages=[SystemMessage(content='Translate the following into italian:'), HumanMessage(content='hi')])
```


我们可以看到它返回一个 `ChatPromptValue`，由两个消息组成。如果我们想直接访问这些消息，可以这样做：


```python
result.to_messages()
```



```output
[SystemMessage(content='Translate the following into italian:'),
 HumanMessage(content='hi')]
```


## 使用 LCEL 连接组件

我们现在可以使用管道 (`|`) 操作符将其与上面的模型和输出解析器结合起来：


```python
chain = prompt_template | model | parser
```


```python
chain.invoke({"language": "italian", "text": "hi"})
```



```output
'ciao'
```


这是一个使用 [LangChain 表达式 (LCEL)](/docs/concepts/#langchain-expression-language-lcel) 连接 LangChain 模块的简单示例。这种方法有几个好处，包括优化的流式处理和追踪支持。

如果我们查看 LangSmith 追踪，我们可以看到所有三个组件出现在 [LangSmith 追踪](https://smith.langchain.com/public/bc49bec0-6b13-4726-967f-dbd3448b786d/r) 中。

## 使用 LangServe 提供服务

现在我们已经构建了一个应用程序，我们需要提供服务。这就是 LangServe 的用武之地。
LangServe 帮助开发者将 LangChain 链部署为 REST API。您不需要使用 LangServe 来使用 LangChain，但在本指南中，我们将展示如何使用 LangServe 部署您的应用。

虽然本指南的第一部分旨在在 Jupyter Notebook 或脚本中运行，但我们现在将脱离这一点。我们将创建一个 Python 文件，然后从命令行与之交互。

安装方式：
```bash
pip install "langserve[all]"
```

### 服务器

为了为我们的应用创建一个服务器，我们将制作一个 `serve.py` 文件。这个文件将包含我们服务应用的逻辑。它由三部分组成：
1. 我们刚刚构建的链的定义
2. 我们的 FastAPI 应用
3. 一个定义用于服务链的路由，这通过 `langserve.add_routes` 完成


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Build a Simple LLM Application with LCEL"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Build a Simple LLM Application with LCEL"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Build a Simple LLM Application with LCEL"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langserve import add_routes

# 1. Create prompt template
system_template = "Translate the following into {language}:"
prompt_template = ChatPromptTemplate.from_messages([
    ('system', system_template),
    ('user', '{text}')
])

# 2. Create model
model = ChatOpenAI()

# 3. Create parser
parser = StrOutputParser()

# 4. Create chain
chain = prompt_template | model | parser


# 4. App definition
app = FastAPI(
  title="LangChain Server",
  version="1.0",
  description="A simple API server using LangChain's Runnable interfaces",
)

# 5. Adding chain route
add_routes(
    app,
    chain,
    path="/chain",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

就这样！如果我们执行这个文件：
```bash
python serve.py
```
我们应该能在 [http://localhost:8000](http://localhost:8000) 看到我们的链被服务。

### 游乐场

每个 LangServe 服务都配有一个简单的 [内置用户界面](https://github.com/langchain-ai/langserve/blob/main/README.md#playground)，用于配置和调用应用，支持流式输出并可查看中间步骤。
前往 [http://localhost:8000/chain/playground/](http://localhost:8000/chain/playground/) 试用一下！输入与之前相同的内容 - `{"language": "italian", "text": "hi"}` - 它应该会像之前一样响应。

### 客户端

现在让我们设置一个客户端，以便以编程方式与我们的服务进行交互。我们可以使用 [langserve.RemoteRunnable](/docs/langserve/#client) 轻松做到这一点。
使用这个，我们可以像在客户端运行一样与服务的链进行交互。


```python
from langserve import RemoteRunnable

remote_chain = RemoteRunnable("http://localhost:8000/chain/")
remote_chain.invoke({"language": "italian", "text": "hi"})
```



```output
'Ciao'
```


要了解更多关于 LangServe 的其他功能，请 [点击这里](/docs/langserve)。

## 结论

就是这样！在本教程中，您学习了如何创建第一个简单的 LLM 应用程序。您学习了如何使用语言模型，如何解析它们的输出，如何创建提示词模板，如何使用 LCEL 将它们链接在一起，如何使用 LangSmith 获取您创建的链的良好可观察性，以及如何使用 LangServe 部署它们。

这只是您想要学习以成为熟练的 AI 工程师的表面。幸运的是，我们还有很多其他资源！

有关 LangChain 核心概念的进一步阅读，我们提供了详细的 [概念指南](/docs/concepts)。

如果您对这些概念有更具体的问题，请查看以下使用手册的相关部分：

- [LangChain表达式 (LCEL)](/docs/how_to/#langchain-expression-language-lcel)
- [提示词模板](/docs/how_to/#prompt-templates)
- [聊天模型](/docs/how_to/#chat-models)
- [输出解析器](/docs/how_to/#output-parsers)
- [LangServe](/docs/langserve/)

以及 LangSmith 文档：

- [LangSmith](https://docs.smith.langchain.com)
