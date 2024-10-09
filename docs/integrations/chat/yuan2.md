---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/yuan2.ipynb
sidebar_label: Yuan2.0
---
# Yuan2.0

本笔记展示了如何在LangChain中使用[YUAN2 API](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md)与langchain.chat_models.ChatYuan2。

[*Yuan2.0*](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md)是由IEIT系统开发的新一代基础大型语言模型。我们发布了三种模型，Yuan 2.0-102B、Yuan 2.0-51B和Yuan 2.0-2B。我们为其他开发者提供了相关的预训练、微调和推理服务脚本。Yuan2.0基于Yuan1.0，利用更广泛的高质量预训练数据和指令微调数据集来增强模型对语义、数学、推理、代码、知识等方面的理解。

## 开始使用
### 安装
首先，Yuan2.0提供了一个与OpenAI兼容的API，我们通过使用OpenAI客户端将ChatYuan2集成到langchain聊天模型中。
因此，请确保在您的Python环境中安装了openai包。运行以下命令：


```python
%pip install --upgrade --quiet openai
```

### 导入所需模块
安装后，将必要的模块导入到您的Python脚本中：


```python
<!--IMPORTS:[{"imported": "ChatYuan2", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.yuan2.ChatYuan2.html", "title": "Yuan2.0"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Yuan2.0"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Yuan2.0"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Yuan2.0"}]-->
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### 设置您的API服务器
按照[yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md)设置您的OpenAI兼容API服务器。
如果您在本地部署了API服务器，可以简单地将`yuan2_api_key="EMPTY"`或您想要的任何值设置为。
只需确保`yuan2_api_base`设置正确。


```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### 初始化ChatYuan2模型
以下是如何初始化聊天模型：


```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### 基本用法
像这样使用系统和人类消息调用模型：


```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```


```python
print(chat.invoke(messages))
```

### 使用流式处理的基本用法
要进行持续交互，请使用流式处理功能：


```python
<!--IMPORTS:[{"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Yuan2.0"}]-->
from langchain_core.callbacks import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```


```python
chat.invoke(messages)
```

## 高级功能
### 使用异步调用

以非阻塞调用的方式调用模型，如下所示：


```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```


```python
import asyncio

asyncio.run(basic_agenerate())
```

### 使用提示词模板

以非阻塞调用的方式调用模型，并使用聊天模板，如下所示：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Yuan2.0"}]-->
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```


```python
asyncio.run(ainvoke_with_prompt_template())
```

### 在流式处理中的异步调用用法
对于流式输出的非阻塞调用，请使用 astream 方法：


```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```


```python
import asyncio

asyncio.run(basic_astream())
```


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
