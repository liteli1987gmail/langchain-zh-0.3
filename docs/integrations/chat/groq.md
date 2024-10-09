---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/groq.ipynb
sidebar_label: Groq
---
# ChatGroq

这将帮助您开始使用 Groq [聊天模型](../../concepts.mdx#chat-models)。有关所有 ChatGroq 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/groq/chat_models/langchain_groq.chat_models.ChatGroq.html)。有关所有 Groq 模型的列表，请访问此 [链接](https://console.groq.com/docs/models)。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/groq) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatGroq](https://python.langchain.com/api_reference/groq/chat_models/langchain_groq.chat_models.ChatGroq.html) | [langchain-groq](https://python.langchain.com/api_reference/groq/index.html) | ❌ | beta | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain-groq?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-groq?style=flat-square&label=%20) |

### 模型特性
| [工具调用](../../how_to/tool_calling.md) | [结构化输出](../../how_to/structured_output.md) | JSON 模式 | [图像输入](../../how_to/multimodal_inputs.md) | 音频输入 | 视频输入 | [令牌级流式处理](../../how_to/chat_streaming.md) | 原生异步 | [令牌使用](../../how_to/chat_token_usage_tracking.md) | [Logprobs](../../how_to/logprobs.md) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

## 设置

要访问 Groq 模型，您需要创建一个 Groq 账户，获取 API 密钥，并安装 `langchain-groq` 集成包。

### 凭证

前往 [Groq 控制台](https://console.groq.com/keys) 注册 Groq 并生成 API 密钥。完成后设置 GROQ_API_KEY 环境变量：


```python
import getpass
import os

if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter your Groq API key: ")
```

如果您想要自动跟踪模型调用，可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Groq 集成位于 `langchain-groq` 包中：


```python
%pip install -qU langchain-groq
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m24.0[0m[39;49m -> [0m[32;49m24.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "ChatGroq", "source": "langchain_groq", "docs": "https://python.langchain.com/api_reference/groq/chat_models/langchain_groq.chat_models.ChatGroq.html", "title": "ChatGroq"}]-->
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="mixtral-8x7b-32768",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # other params...
)
```

## 调用


```python
messages = [
    (
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ),
    ("human", "I love programming."),
]
ai_msg = llm.invoke(messages)
ai_msg
```



```output
AIMessage(content='I enjoy programming. (The French translation is: "J\'aime programmer.")\n\nNote: I chose to translate "I love programming" as "J\'aime programmer" instead of "Je suis amoureux de programmer" because the latter has a romantic connotation that is not present in the original English sentence.', response_metadata={'token_usage': {'completion_tokens': 73, 'prompt_tokens': 31, 'total_tokens': 104, 'completion_time': 0.1140625, 'prompt_time': 0.003352463, 'queue_time': None, 'total_time': 0.117414963}, 'model_name': 'mixtral-8x7b-32768', 'system_fingerprint': 'fp_c5f20b5bb1', 'finish_reason': 'stop', 'logprobs': None}, id='run-64433c19-eadf-42fc-801e-3071e3c40160-0', usage_metadata={'input_tokens': 31, 'output_tokens': 73, 'total_tokens': 104})
```



```python
print(ai_msg.content)
```
```output
I enjoy programming. (The French translation is: "J'aime programmer.")

Note: I chose to translate "I love programming" as "J'aime programmer" instead of "Je suis amoureux de programmer" because the latter has a romantic connotation that is not present in the original English sentence.
```
## 链接

我们可以像这样使用提示词模板 [链](../../how_to/sequence.md) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatGroq"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```



```output
AIMessage(content='That\'s great! I can help you translate English phrases related to programming into German.\n\n"I love programming" can be translated as "Ich liebe Programmieren" in German.\n\nHere are some more programming-related phrases translated into German:\n\n* "Programming language" = "Programmiersprache"\n* "Code" = "Code"\n* "Variable" = "Variable"\n* "Function" = "Funktion"\n* "Array" = "Array"\n* "Object-oriented programming" = "Objektorientierte Programmierung"\n* "Algorithm" = "Algorithmus"\n* "Data structure" = "Datenstruktur"\n* "Debugging" = "Fehlersuche"\n* "Compile" = "Kompilieren"\n* "Link" = "Verknüpfen"\n* "Run" = "Ausführen"\n* "Test" = "Testen"\n* "Deploy" = "Bereitstellen"\n* "Version control" = "Versionskontrolle"\n* "Open source" = "Open Source"\n* "Software development" = "Softwareentwicklung"\n* "Agile methodology" = "Agile Methodik"\n* "DevOps" = "DevOps"\n* "Cloud computing" = "Cloud Computing"\n\nI hope this helps! Let me know if you have any other questions or if you need further translations.', response_metadata={'token_usage': {'completion_tokens': 331, 'prompt_tokens': 25, 'total_tokens': 356, 'completion_time': 0.520006542, 'prompt_time': 0.00250165, 'queue_time': None, 'total_time': 0.522508192}, 'model_name': 'mixtral-8x7b-32768', 'system_fingerprint': 'fp_c5f20b5bb1', 'finish_reason': 'stop', 'logprobs': None}, id='run-74207fb7-85d3-417d-b2b9-621116b75d41-0', usage_metadata={'input_tokens': 25, 'output_tokens': 331, 'total_tokens': 356})
```


## API 参考

有关所有 ChatGroq 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/groq/chat_models/langchain_groq.chat_models.ChatGroq.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
