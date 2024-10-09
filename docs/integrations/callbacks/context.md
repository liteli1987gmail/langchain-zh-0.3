---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/context.ipynb
---
# 上下文

>[上下文](https://context.ai/) 为大型语言模型驱动的产品和功能提供用户分析。

使用 `上下文`，您可以在不到 30 分钟的时间内开始了解您的用户并改善他们的体验。


在本指南中，我们将向您展示如何与上下文集成。

## 安装和设置


```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-community context-python
```

### 获取API凭证

要获取您的Context API令牌：

1. 前往您的Context账户中的设置页面 (https://with.context.ai/settings)。
2. 生成一个新的API令牌。
3. 将此令牌存储在安全的地方。

### 设置Context

要使用`ContextCallbackHandler`，请从LangChain导入处理程序，并使用您的Context API令牌实例化它。

确保在使用处理程序之前已安装`context-python`包。


```python
<!--IMPORTS:[{"imported": "ContextCallbackHandler", "source": "langchain_community.callbacks.context_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.context_callback.ContextCallbackHandler.html", "title": "Context"}]-->
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```


```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## 使用
### 在聊天模型中的Context回调

上下文回调处理器可用于直接记录用户与AI助手之间的对话记录。


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Context"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Context"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Context"}]-->
import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### 链中的上下文回调

上下文回调处理器也可用于记录链的输入和输出。请注意，链的中间步骤不会被记录 - 仅记录起始输入和最终输出。

__注意：__ 确保将相同的上下文对象传递给聊天模型和链。

错误：
> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

正确：
>```python
>handler = ContextCallbackHandler(token)
>chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
>chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
>```



```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Context"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Context"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Context"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "Context"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Context"}]-->
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```
