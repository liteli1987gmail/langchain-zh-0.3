---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/callbacks_runtime.ipynb
---
# 如何在运行时传递回调

:::info Prerequisites

本指南假设您熟悉以下概念：

- [回调](/docs/concepts/#callbacks)
- [自定义回调处理器](/docs/how_to/custom_callbacks)

:::

在许多情况下，运行对象时传递处理器更为有利。当我们在执行运行时通过 `callbacks` 关键字参数传递 [`CallbackHandlers`](https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html#langchain-core-callbacks-base-basecallbackhandler)，这些回调将由所有参与执行的嵌套对象发出。例如，当一个处理器传递给代理时，它将用于与代理相关的所有回调以及参与代理执行的所有对象，在这种情况下，包括工具和大型语言模型。

这避免了我们必须手动将处理器附加到每个单独的嵌套对象。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to pass callbacks in at runtime"}, {"imported": "BaseCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html", "title": "How to pass callbacks in at runtime"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to pass callbacks in at runtime"}, {"imported": "LLMResult", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.llm_result.LLMResult.html", "title": "How to pass callbacks in at runtime"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to pass callbacks in at runtime"}]-->
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

chain.invoke({"number": "2"}, config={"callbacks": callbacks})
```
```output
Chain RunnableSequence started
Chain ChatPromptTemplate started
Chain ended, outputs: messages=[HumanMessage(content='What is 1 + 2?')]
Chat model started
Chat model ended, response: generations=[[ChatGeneration(text='1 + 2 = 3', message=AIMessage(content='1 + 2 = 3', response_metadata={'id': 'msg_01D8Tt5FdtBk5gLTfBPm2tac', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}}, id='run-bb0dddd8-85f3-4e6b-8553-eaa79f859ef8-0'))]] llm_output={'id': 'msg_01D8Tt5FdtBk5gLTfBPm2tac', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}} run=None
Chain ended, outputs: content='1 + 2 = 3' response_metadata={'id': 'msg_01D8Tt5FdtBk5gLTfBPm2tac', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}} id='run-bb0dddd8-85f3-4e6b-8553-eaa79f859ef8-0'
```


```output
AIMessage(content='1 + 2 = 3', response_metadata={'id': 'msg_01D8Tt5FdtBk5gLTfBPm2tac', 'model': 'claude-3-sonnet-20240229', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 16, 'output_tokens': 13}}, id='run-bb0dddd8-85f3-4e6b-8553-eaa79f859ef8-0')
```


如果模块已经存在回调，这些回调将在运行时传入的回调之外执行。

## 下一步

您现在已经学习了如何在运行时传递回调。

接下来，请查看本节中的其他使用指南，例如如何[将回调传递到模块构造函数中](/docs/how_to/custom_callbacks)。
