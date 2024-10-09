---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/callbacks_async.ipynb
---
# 如何在异步环境中使用回调

:::info Prerequisites

本指南假设您熟悉以下概念：

- [回调](/docs/concepts/#callbacks)
- [自定义回调处理器](/docs/how_to/custom_callbacks)
:::

如果您计划使用异步 API，建议使用并扩展 [`AsyncCallbackHandler`](https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.AsyncCallbackHandler.html) 以避免阻塞事件。


:::warning
如果您在使用异步方法运行您的大型语言模型 / 链 / 工具 / 代理时使用同步 `CallbackHandler`，它仍然会工作。然而，在底层，它将通过 [`run_in_executor`](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 被调用，如果您的 `CallbackHandler` 不是线程安全的，可能会导致问题。
:::

:::danger

如果您使用的是 `python<=3.10`，您需要记住在从 `RunnableLambda`、`RunnableGenerator` 或 `@tool` 中调用其他 `runnable` 时传播 `config` 或 `callbacks`。如果您不这样做，
回调将不会传播到被调用的子可运行对象。
:::


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to use callbacks in async environments"}, {"imported": "AsyncCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.AsyncCallbackHandler.html", "title": "How to use callbacks in async environments"}, {"imported": "BaseCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html", "title": "How to use callbacks in async environments"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to use callbacks in async environments"}, {"imported": "LLMResult", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.llm_result.LLMResult.html", "title": "How to use callbacks in async environments"}]-->
import asyncio
from typing import Any, Dict, List

from langchain_anthropic import ChatAnthropic
from langchain_core.callbacks import AsyncCallbackHandler, BaseCallbackHandler
from langchain_core.messages import HumanMessage
from langchain_core.outputs import LLMResult


class MyCustomSyncHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"Sync handler being called in a `thread_pool_executor`: token: {token}")


class MyCustomAsyncHandler(AsyncCallbackHandler):
    """Async callback handler that can be used to handle callbacks from langchain."""

    async def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        """Run when chain starts running."""
        print("zzzz....")
        await asyncio.sleep(0.3)
        class_name = serialized["name"]
        print("Hi! I just woke up. Your llm is starting")

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Run when chain ends running."""
        print("zzzz....")
        await asyncio.sleep(0.3)
        print("Hi! I just woke up. Your llm is ending")


# To enable streaming, we pass in `streaming=True` to the ChatModel constructor
# Additionally, we pass in a list with our custom handler
chat = ChatAnthropic(
    model="claude-3-sonnet-20240229",
    max_tokens=25,
    streaming=True,
    callbacks=[MyCustomSyncHandler(), MyCustomAsyncHandler()],
)

await chat.agenerate([[HumanMessage(content="Tell me a joke")]])
```
```output
zzzz....
Hi! I just woke up. Your llm is starting
Sync handler being called in a `thread_pool_executor`: token: Here
Sync handler being called in a `thread_pool_executor`: token: 's
Sync handler being called in a `thread_pool_executor`: token:  a
Sync handler being called in a `thread_pool_executor`: token:  little
Sync handler being called in a `thread_pool_executor`: token:  joke
Sync handler being called in a `thread_pool_executor`: token:  for
Sync handler being called in a `thread_pool_executor`: token:  you
Sync handler being called in a `thread_pool_executor`: token: :
Sync handler being called in a `thread_pool_executor`: token: 

Why
Sync handler being called in a `thread_pool_executor`: token:  can
Sync handler being called in a `thread_pool_executor`: token: 't
Sync handler being called in a `thread_pool_executor`: token:  a
Sync handler being called in a `thread_pool_executor`: token:  bicycle
Sync handler being called in a `thread_pool_executor`: token:  stan
Sync handler being called in a `thread_pool_executor`: token: d up
Sync handler being called in a `thread_pool_executor`: token:  by
Sync handler being called in a `thread_pool_executor`: token:  itself
Sync handler being called in a `thread_pool_executor`: token: ?
Sync handler being called in a `thread_pool_executor`: token:  Because
Sync handler being called in a `thread_pool_executor`: token:  it
Sync handler being called in a `thread_pool_executor`: token: 's
Sync handler being called in a `thread_pool_executor`: token:  two
Sync handler being called in a `thread_pool_executor`: token: -
Sync handler being called in a `thread_pool_executor`: token: tire
zzzz....
Hi! I just woke up. Your llm is ending
```


```output
LLMResult(generations=[[ChatGeneration(text="Here's a little joke for you:\n\nWhy can't a bicycle stand up by itself? Because it's two-tire", message=AIMessage(content="Here's a little joke for you:\n\nWhy can't a bicycle stand up by itself? Because it's two-tire", id='run-8afc89e8-02c0-4522-8480-d96977240bd4-0'))]], llm_output={}, run=[RunInfo(run_id=UUID('8afc89e8-02c0-4522-8480-d96977240bd4'))])
```


## 下一步

您现在已经学习了如何创建自己的自定义回调处理程序。

接下来，请查看本节中的其他操作指南，例如 [如何将回调附加到可运行的](/docs/how_to/callbacks_attach)。
