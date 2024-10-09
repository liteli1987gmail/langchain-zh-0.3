---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/callbacks_custom_events.ipynb
---
# 如何调度自定义回调事件

:::info Prerequisites

本指南假设您熟悉以下概念：

- [回调](/docs/concepts/#callbacks)
- [自定义回调处理程序](/docs/how_to/custom_callbacks)
- [Astream 事件 API](/docs/concepts/#astream_events) `astream_events` 方法将显示自定义回调事件。

:::

在某些情况下，您可能希望从 [运行接口](/docs/concepts/#runnable-interface) 内部调度自定义回调事件，以便它可以被显示
在自定义回调处理程序中或通过 [Astream 事件 API](/docs/concepts/#astream_events)。

例如，如果您有一个长时间运行的工具，包含多个步骤，您可以在步骤之间调度自定义事件，并使用这些自定义事件来监控进度。
您还可以将这些自定义事件展示给应用程序的最终用户，以向他们展示当前任务的进展情况。

要调度自定义事件，您需要为事件决定两个属性：`name` 和 `data`。

| 属性      | 类型  | 描述                                                                                                   |
|-----------|------|----------------------------------------------------------------------------------------------------------|
| 名称      | str  | 用户定义的事件名称。                                                                                     |
| 数据      | Any  | 与事件相关的数据。这可以是任何内容，但我们建议使其可序列化为JSON。                                      |


:::important
* 派发自定义回调事件需要 `langchain-core>=0.2.15`。
* 自定义回调事件只能从现有的 `Runnable` 内部派发。
* 如果使用 `astream_events`，您必须使用 `version='v2'` 才能查看自定义事件。
* 在LangSmith中发送或渲染自定义回调事件尚不支持。
:::


:::caution COMPATIBILITY
如果您在python&lt;=3.10中运行，LangChain无法自动传播配置，包括对astream_events()所需的回调，给子可运行对象。这是您可能无法看到自定义可运行对象或工具发出事件的常见原因。

如果您在python&lt;=3.10中运行，您需要手动将 `RunnableConfig` 对象传播到异步环境中的子可运行对象。有关如何手动传播配置的示例，请参见下面的 `bar` RunnableLambda 的实现。

如果您正在运行 python>=3.11，`RunnableConfig` 将自动传播到异步环境中的子可运行对象。然而，如果您的代码可能在其他 Python 版本中运行，手动传播 `RunnableConfig` 仍然是个好主意。
:::

## Astream 事件 API

消费自定义事件最有用的方法是通过 [Astream 事件 API](/docs/concepts/#astream_events)。

我们可以使用 `async` `adispatch_custom_event` API 在异步环境中发出自定义事件。


:::important

要通过 astream 事件 API 查看自定义事件，您需要使用更新的 `v2` API 的 `astream_events`。
:::


```python
<!--IMPORTS:[{"imported": "adispatch_custom_event", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.adispatch_custom_event.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables.config", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to dispatch custom callback events"}]-->
from langchain_core.callbacks.manager import (
    adispatch_custom_event,
)
from langchain_core.runnables import RunnableLambda
from langchain_core.runnables.config import RunnableConfig


@RunnableLambda
async def foo(x: str) -> str:
    await adispatch_custom_event("event1", {"x": x})
    await adispatch_custom_event("event2", 5)
    return x


async for event in foo.astream_events("hello world", version="v2"):
    print(event)
```
```output
{'event': 'on_chain_start', 'data': {'input': 'hello world'}, 'name': 'foo', 'tags': [], 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'metadata': {}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'event1', 'tags': [], 'metadata': {}, 'data': {'x': 'hello world'}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'event2', 'tags': [], 'metadata': {}, 'data': 5, 'parent_ids': []}
{'event': 'on_chain_stream', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'foo', 'tags': [], 'metadata': {}, 'data': {'chunk': 'hello world'}, 'parent_ids': []}
{'event': 'on_chain_end', 'data': {'output': 'hello world'}, 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'foo', 'tags': [], 'metadata': {}, 'parent_ids': []}
```
在 `Python <= 3.10` 中，您必须手动传播配置！


```python
<!--IMPORTS:[{"imported": "adispatch_custom_event", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.adispatch_custom_event.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables.config", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to dispatch custom callback events"}]-->
from langchain_core.callbacks.manager import (
    adispatch_custom_event,
)
from langchain_core.runnables import RunnableLambda
from langchain_core.runnables.config import RunnableConfig


@RunnableLambda
async def bar(x: str, config: RunnableConfig) -> str:
    """An example that shows how to manually propagate config.

    You must do this if you're running python<=3.10.
    """
    await adispatch_custom_event("event1", {"x": x}, config=config)
    await adispatch_custom_event("event2", 5, config=config)
    return x


async for event in bar.astream_events("hello world", version="v2"):
    print(event)
```
```output
{'event': 'on_chain_start', 'data': {'input': 'hello world'}, 'name': 'bar', 'tags': [], 'run_id': 'c787b09d-698a-41b9-8290-92aaa656f3e7', 'metadata': {}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'c787b09d-698a-41b9-8290-92aaa656f3e7', 'name': 'event1', 'tags': [], 'metadata': {}, 'data': {'x': 'hello world'}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'c787b09d-698a-41b9-8290-92aaa656f3e7', 'name': 'event2', 'tags': [], 'metadata': {}, 'data': 5, 'parent_ids': []}
{'event': 'on_chain_stream', 'run_id': 'c787b09d-698a-41b9-8290-92aaa656f3e7', 'name': 'bar', 'tags': [], 'metadata': {}, 'data': {'chunk': 'hello world'}, 'parent_ids': []}
{'event': 'on_chain_end', 'data': {'output': 'hello world'}, 'run_id': 'c787b09d-698a-41b9-8290-92aaa656f3e7', 'name': 'bar', 'tags': [], 'metadata': {}, 'parent_ids': []}
```
## 异步回调处理器

您还可以通过异步回调处理器消费调度的事件。


```python
<!--IMPORTS:[{"imported": "AsyncCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.AsyncCallbackHandler.html", "title": "How to dispatch custom callback events"}, {"imported": "adispatch_custom_event", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.adispatch_custom_event.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables.config", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to dispatch custom callback events"}]-->
from typing import Any, Dict, List, Optional
from uuid import UUID

from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.callbacks.manager import (
    adispatch_custom_event,
)
from langchain_core.runnables import RunnableLambda
from langchain_core.runnables.config import RunnableConfig


class AsyncCustomCallbackHandler(AsyncCallbackHandler):
    async def on_custom_event(
        self,
        name: str,
        data: Any,
        *,
        run_id: UUID,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        print(
            f"Received event {name} with data: {data}, with tags: {tags}, with metadata: {metadata} and run_id: {run_id}"
        )


@RunnableLambda
async def bar(x: str, config: RunnableConfig) -> str:
    """An example that shows how to manually propagate config.

    You must do this if you're running python<=3.10.
    """
    await adispatch_custom_event("event1", {"x": x}, config=config)
    await adispatch_custom_event("event2", 5, config=config)
    return x


async_handler = AsyncCustomCallbackHandler()
await foo.ainvoke(1, {"callbacks": [async_handler], "tags": ["foo", "bar"]})
```
```output
Received event event1 with data: {'x': 1}, with tags: ['foo', 'bar'], with metadata: {} and run_id: a62b84be-7afd-4829-9947-7165df1f37d9
Received event event2 with data: 5, with tags: ['foo', 'bar'], with metadata: {} and run_id: a62b84be-7afd-4829-9947-7165df1f37d9
```


```output
1
```


## 同步回调处理器

让我们看看如何在同步环境中使用 `dispatch_custom_event` 触发自定义事件。

您 **必须** 在现有的 `Runnable` 内部调用 `dispatch_custom_event`。


```python
<!--IMPORTS:[{"imported": "BaseCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html", "title": "How to dispatch custom callback events"}, {"imported": "dispatch_custom_event", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.dispatch_custom_event.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to dispatch custom callback events"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables.config", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to dispatch custom callback events"}]-->
from typing import Any, Dict, List, Optional
from uuid import UUID

from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.callbacks.manager import (
    dispatch_custom_event,
)
from langchain_core.runnables import RunnableLambda
from langchain_core.runnables.config import RunnableConfig


class CustomHandler(BaseCallbackHandler):
    def on_custom_event(
        self,
        name: str,
        data: Any,
        *,
        run_id: UUID,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        print(
            f"Received event {name} with data: {data}, with tags: {tags}, with metadata: {metadata} and run_id: {run_id}"
        )


@RunnableLambda
def foo(x: int, config: RunnableConfig) -> int:
    dispatch_custom_event("event1", {"x": x})
    dispatch_custom_event("event2", {"x": x})
    return x


handler = CustomHandler()
foo.invoke(1, {"callbacks": [handler], "tags": ["foo", "bar"]})
```
```output
Received event event1 with data: {'x': 1}, with tags: ['foo', 'bar'], with metadata: {} and run_id: 27b5ce33-dc26-4b34-92dd-08a89cb22268
Received event event2 with data: {'x': 1}, with tags: ['foo', 'bar'], with metadata: {} and run_id: 27b5ce33-dc26-4b34-92dd-08a89cb22268
```


```output
1
```


## 下一步

您已经了解了如何触发自定义事件，您可以查看更深入的指南 [astream events](/docs/how_to/streaming/#using-stream-events)，这是利用自定义事件的最简单方法。
