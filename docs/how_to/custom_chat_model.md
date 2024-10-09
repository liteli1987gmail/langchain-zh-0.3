---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/custom_chat_model.ipynb
---
# 如何创建自定义聊天模型类

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)

:::

在本指南中，我们将学习如何使用LangChain抽象创建自定义聊天模型。

使用标准[`BaseChatModel`](https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.chat_models.BaseChatModel.html)接口包装您的大型语言模型（LLM），可以让您在现有的LangChain程序中以最小的代码修改使用您的LLM！

作为额外好处，您的LLM将自动成为LangChain `Runnable`，并将受益于一些开箱即用的优化（例如，通过线程池批处理）、异步支持、`astream_events` API等。

## 输入和输出

首先，我们需要谈谈**消息**，它们是聊天模型的输入和输出。

### 消息

聊天模型将消息作为输入，并返回一条消息作为输出。

LangChain 有一些 [内置消息类型](/docs/concepts/#message-types)：

| 消息类型              | 描述                                                                                         |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `SystemMessage`       | 用于引导 AI 行为，通常作为输入消息序列中的第一个传入。                                         |
| `HumanMessage`        | 表示与聊天模型交互的人的消息。                                                               |
| `AIMessage`           | 表示来自聊天模型的消息。这可以是文本或请求调用工具。                                         |
| `FunctionMessage` / `ToolMessage` | 用于将工具调用结果传回模型的消息。                                         |
| `AIMessageChunk` / `HumanMessageChunk` / ... | 每种消息类型的块变体。                       |


:::note
`ToolMessage` 和 `FunctionMessage` 紧密遵循 OpenAI 的 `function` 和 `tool` 角色。

这是一个快速发展的领域，随着更多模型添加函数调用能力，预计该模式将会有更多补充。
:::


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to create a custom chat model class"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to create a custom chat model class"}, {"imported": "FunctionMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.function.FunctionMessage.html", "title": "How to create a custom chat model class"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to create a custom chat model class"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to create a custom chat model class"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to create a custom chat model class"}]-->
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    FunctionMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
```

### 流式变体

所有聊天消息都有一个流式变体，其名称中包含 `Chunk`。


```python
<!--IMPORTS:[{"imported": "AIMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html", "title": "How to create a custom chat model class"}, {"imported": "FunctionMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.function.FunctionMessageChunk.html", "title": "How to create a custom chat model class"}, {"imported": "HumanMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessageChunk.html", "title": "How to create a custom chat model class"}, {"imported": "SystemMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessageChunk.html", "title": "How to create a custom chat model class"}, {"imported": "ToolMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessageChunk.html", "title": "How to create a custom chat model class"}]-->
from langchain_core.messages import (
    AIMessageChunk,
    FunctionMessageChunk,
    HumanMessageChunk,
    SystemMessageChunk,
    ToolMessageChunk,
)
```

这些块在从聊天模型流式输出时使用，它们都定义了一个附加属性！


```python
AIMessageChunk(content="Hello") + AIMessageChunk(content=" World!")
```



```output
AIMessageChunk(content='Hello World!')
```


## 基础聊天模型

让我们实现一个聊天模型，它回显提示中最后一条消息的前 `n` 个字符！

为此，我们将从 `BaseChatModel` 继承，并需要实现以下内容：

| 方法/属性                          | 描述                                                             | 必需/可选         |
|------------------------------------|-------------------------------------------------------------------|--------------------|
| `_generate`                        | 用于从提示生成聊天结果                                           | 必需               |
| `_llm_type` (属性)                | 用于唯一标识模型的类型。用于日志记录。                          | 必需               |
| `_identifying_params` (属性)   | 表示用于追踪目的的模型参数化。            | 可选           |
| `_stream`                          | 用于实现流式处理。                                       | 可选           |
| `_agenerate`                       | 用于实现原生异步方法。                           | 可选           |
| `_astream`                         | 用于实现 `_stream` 的异步版本。                      | 可选           |


:::tip
 `_astream` 的实现使用 `run_in_executor` 在单独的线程中启动同步的 `_stream`，如果 `_stream` 已实现，否则回退使用 `_agenerate`。

如果您想重用 `_stream` 的实现，可以使用这个技巧，但如果您能够实现原生异步的代码，那将是更好的解决方案，因为该代码的开销更小。
:::

### 实现


```python
<!--IMPORTS:[{"imported": "AsyncCallbackManagerForLLMRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.AsyncCallbackManagerForLLMRun.html", "title": "How to create a custom chat model class"}, {"imported": "CallbackManagerForLLMRun", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManagerForLLMRun.html", "title": "How to create a custom chat model class"}, {"imported": "BaseChatModel", "source": "langchain_core.language_models", "docs": "https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.chat_models.BaseChatModel.html", "title": "How to create a custom chat model class"}, {"imported": "SimpleChatModel", "source": "langchain_core.language_models", "docs": "https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.chat_models.SimpleChatModel.html", "title": "How to create a custom chat model class"}, {"imported": "AIMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html", "title": "How to create a custom chat model class"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to create a custom chat model class"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to create a custom chat model class"}, {"imported": "ChatGeneration", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.chat_generation.ChatGeneration.html", "title": "How to create a custom chat model class"}, {"imported": "ChatGenerationChunk", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.chat_generation.ChatGenerationChunk.html", "title": "How to create a custom chat model class"}, {"imported": "ChatResult", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.chat_result.ChatResult.html", "title": "How to create a custom chat model class"}, {"imported": "run_in_executor", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.run_in_executor.html", "title": "How to create a custom chat model class"}]-->
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional

from langchain_core.callbacks import (
    AsyncCallbackManagerForLLMRun,
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel, SimpleChatModel
from langchain_core.messages import AIMessageChunk, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from langchain_core.runnables import run_in_executor


class CustomChatModelAdvanced(BaseChatModel):
    """A custom chat model that echoes the first `n` characters of the input.

    When contributing an implementation to LangChain, carefully document
    the model including the initialization parameters, include
    an example of how to initialize the model and include any relevant
    links to the underlying models documentation or API.

    Example:

        .. code-block:: python

            model = CustomChatModel(n=2)
            result = model.invoke([HumanMessage(content="hello")])
            result = model.batch([[HumanMessage(content="hello")],
                                 [HumanMessage(content="world")]])
    """

    model_name: str
    """The name of the model"""
    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override the _generate method to implement the chat model logic.

        This can be a call to an API, a call to a local model, or any other
        implementation that generates a response to the input prompt.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        # Replace this with actual logic to generate a response from a list
        # of messages.
        last_message = messages[-1]
        tokens = last_message.content[: self.n]
        message = AIMessage(
            content=tokens,
            additional_kwargs={},  # Used to add additional payload (e.g., function calling request)
            response_metadata={  # Use for response metadata
                "time_in_seconds": 3,
            },
        )
        ##

        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """Stream the output of the model.

        This method should be implemented if the model can generate output
        in a streaming fashion. If the model does not support streaming,
        do not implement it. In that case streaming requests will be automatically
        handled by the _generate method.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        last_message = messages[-1]
        tokens = last_message.content[: self.n]

        for token in tokens:
            chunk = ChatGenerationChunk(message=AIMessageChunk(content=token))

            if run_manager:
                # This is optional in newer versions of LangChain
                # The on_llm_new_token will be called automatically
                run_manager.on_llm_new_token(token, chunk=chunk)

            yield chunk

        # Let's add some other information (e.g., response metadata)
        chunk = ChatGenerationChunk(
            message=AIMessageChunk(content="", response_metadata={"time_in_sec": 3})
        )
        if run_manager:
            # This is optional in newer versions of LangChain
            # The on_llm_new_token will be called automatically
            run_manager.on_llm_new_token(token, chunk=chunk)
        yield chunk

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "echoing-chat-model-advanced"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": self.model_name,
        }
```

### 让我们测试一下 🧪

聊天模型将实现 LangChain 的标准 `Runnable` 接口，许多 LangChain 抽象都支持该接口！


```python
model = CustomChatModelAdvanced(n=3, model_name="my_custom_model")

model.invoke(
    [
        HumanMessage(content="hello!"),
        AIMessage(content="Hi there human!"),
        HumanMessage(content="Meow!"),
    ]
)
```



```output
AIMessage(content='Meo', response_metadata={'time_in_seconds': 3}, id='run-ddb42bd6-4fdd-4bd2-8be5-e11b67d3ac29-0')
```



```python
model.invoke("hello")
```



```output
AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-4d3cc912-44aa-454b-977b-ca02be06c12e-0')
```



```python
model.batch(["hello", "goodbye"])
```



```output
[AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-9620e228-1912-4582-8aa1-176813afec49-0'),
 AIMessage(content='goo', response_metadata={'time_in_seconds': 3}, id='run-1ce8cdf8-6f75-448e-82f7-1bb4a121df93-0')]
```



```python
for chunk in model.stream("cat"):
    print(chunk.content, end="|")
```
```output
c|a|t||
```
请查看模型中 `_astream` 的实现！如果您不实现它，则不会有输出流！


```python
async for chunk in model.astream("cat"):
    print(chunk.content, end="|")
```
```output
c|a|t||
```
让我们尝试使用astream事件API，这也将帮助我们双重检查所有回调是否已实现！


```python
async for event in model.astream_events("cat", version="v1"):
    print(event)
```
```output
{'event': 'on_chat_model_start', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'name': 'CustomChatModelAdvanced', 'tags': [], 'metadata': {}, 'data': {'input': 'cat'}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='c', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='a', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='t', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_end', 'name': 'CustomChatModelAdvanced', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'data': {'output': AIMessageChunk(content='cat', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
``````output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```
## 贡献

我们感谢所有聊天模型集成的贡献。

以下是一个检查清单，以帮助确保您的贡献被添加到LangChain中：

文档：

* 该模型包含所有初始化参数的文档字符串，因为这些将在[API参考](https://python.langchain.com/api_reference/langchain/index.html)中显示。
* 如果模型由服务提供支持，则模型的类文档字符串包含指向模型API的链接。

测试：

* [ ] 为重写的方法添加单元或集成测试。如果您重写了相应的代码，请验证`invoke`、`ainvoke`、`batch`、`stream`是否正常工作。


流式处理（如果您正在实现它）：

* [ ] 实现_stream方法以使流式处理正常工作

停止令牌行为：

* [ ] 应尊重停止令牌
* [ ] 停止令牌应作为响应的一部分包含在内

秘密API密钥：

* [ ] 如果您的模型连接到API，它可能会在初始化时接受API密钥。使用Pydantic的`SecretStr`类型来处理秘密，以免在打印模型时意外打印出来。


识别参数：

* [ ] 在识别参数中包含`model_name`


优化：

考虑提供原生异步支持，以减少模型的开销！
 
* [ ] 提供了`_agenerate`的原生异步支持（由`ainvoke`使用）
* [ ] 提供了 `_astream` 的原生异步 (由 `astream` 使用)

## 下一步

您现在已经学习了如何创建自己的自定义聊天模型。

接下来，请查看本节中其他关于聊天模型的使用指南，例如 [如何让模型返回结构化输出](/docs/how_to/structured_output) 或 [如何跟踪聊天模型的令牌使用情况](/docs/how_to/chat_token_usage_tracking)。
