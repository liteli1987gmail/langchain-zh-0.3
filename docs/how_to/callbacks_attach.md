---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/callbacks_attach.ipynb
---
# 如何将回调附加到可运行对象

:::info Prerequisites

本指南假设您熟悉以下概念：

- [回调](/docs/concepts/#callbacks)
- [自定义回调处理程序](/docs/how_to/custom_callbacks)
- [链接可运行对象](/docs/how_to/sequence)
- [将运行时参数附加到可运行对象](/docs/how_to/binding)

:::

如果您正在组合一系列可运行对象并希望在多次执行中重用回调，可以使用 [`.with_config()`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_config) 方法附加回调。这可以节省您每次调用链时传递回调的需要。

:::important

`with_config()` 绑定一个配置，该配置将被解释为 **运行时** 配置。因此，这些回调将传播到所有子组件。
:::

这是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to attach callbacks to a runnable"}, {"imported": "BaseCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html", "title": "How to attach callbacks to a runnable"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to attach callbacks to a runnable"}, {"imported": "LLMResult", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.llm_result.LLMResult.html", "title": "How to attach callbacks to a runnable"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to attach callbacks to a runnable"}]-->
from typing import Any, Dict, List

from langchain_anthropic import ChatAnthropic
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import BaseMessage
from langchain_core.outputs import LLMResult
from langchain_core.prompts import ChatPromptTemplate


class LoggingHandler(BaseCallbackHandler):
    def on_chat_model_start(
        self, serialized: Dict[str, Any], messages: List[List[BaseMessage]], **kwargs
    ) -> None:
        print("Chat model started")

    def on_llm_end(self, response: LLMResult, **kwargs) -> None:
        print(f"Chat model ended, response: {response}")

    def on_chain_start(
        self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs
    ) -> None:
        print(f"Chain {serialized.get('name')} started")

    def on_chain_end(self, outputs: Dict[str, Any], **kwargs) -> None:
        print(f"Chain ended, outputs: {outputs}")


callbacks = [LoggingHandler()]
llm = ChatAnthropic(model="claude-3-sonnet-20240229")
prompt = ChatPromptTemplate.from_template("What is 1 + {number}?")

chain = prompt | llm

chain_with_callbacks = chain.with_config(callbacks=callbacks)

chain_with_callbacks.invoke({"number": "2"})
```
```output
Chain RunnableSequence started
Chain ChatPromptTemplate started
Chain ended, outputs: messages=[HumanMessage(content='What is 1 + 2?')]
Chat model started
Chat model ended, response: generations=[[ChatGeneration(text='1 + 2 = 3', message=AIMessage(content='1 + 2 = 3', response_metadata={'id': 'msg_01NTYMsH9YxkoWsiPYs4Lemn', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}}, id='run-d6bcfd72-9c94-466d-bac0-f39e456ad6e3-0'))]] llm_output={'id': 'msg_01NTYMsH9YxkoWsiPYs4Lemn', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}} run=None
Chain ended, outputs: content='1 + 2 = 3' response_metadata={'id': 'msg_01NTYMsH9YxkoWsiPYs4Lemn', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}} id='run-d6bcfd72-9c94-466d-bac0-f39e456ad6e3-0'
```


```output
AIMessage(content='1 + 2 = 3', response_metadata={'id': 'msg_01NTYMsH9YxkoWsiPYs4Lemn', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}}, id='run-d6bcfd72-9c94-466d-bac0-f39e456ad6e3-0')
```


绑定的回调将在所有嵌套模块运行时执行。

## 下一步

您现在已经学习了如何将回调附加到链上。

接下来，请查看本节中的其他使用指南，例如如何在运行时[传递回调](/docs/how_to/callbacks_runtime)。
