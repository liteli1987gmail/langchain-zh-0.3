---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chat_streaming.ipynb
sidebar_position: 1.5
---
# 如何流式传输聊天模型响应


所有 [聊天模型](https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.chat_models.BaseChatModel.html) 都实现了 [运行接口](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable)，该接口提供了标准可运行方法的 **默认** 实现（即 `ainvoke`、`batch`、`abatch`、`stream`、`astream`、`astream_events`）。

**默认** 流式实现提供了一个 `Iterator`（或用于异步流式处理的 `AsyncIterator`），它生成一个单一值：来自底层聊天大模型供应商的最终输出。

:::tip

**默认** 实现 **不** 支持逐个令牌的流式传输，但它确保模型可以替换为任何其他模型，因为它支持相同的标准接口。

:::

逐个令牌流式输出的能力取决于大模型供应商是否实现了适当的流式支持。

查看哪些 [集成支持逐个令牌流式传输](https://python.langchain.com/docs/integrations/chat/)。

## 同步流式处理

下面我们使用 `|` 来帮助可视化令牌之间的分隔符。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to stream chat model responses"}]-->
from langchain_anthropic.chat_models import ChatAnthropic

chat = ChatAnthropic(model="claude-3-haiku-20240307")
for chunk in chat.stream("Write me a 1 verse song about goldfish on the moon"):
    print(chunk.content, end="|", flush=True)
```
```output
Here| is| a| |1| |verse| song| about| gol|dfish| on| the| moon|:|

Floating| up| in| the| star|ry| night|,|
Fins| a|-|gl|im|mer| in| the| pale| moon|light|.|
Gol|dfish| swimming|,| peaceful| an|d free|,|
Se|ren|ely| |drif|ting| across| the| lunar| sea|.|
```
## 异步流式处理


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to stream chat model responses"}]-->
from langchain_anthropic.chat_models import ChatAnthropic

chat = ChatAnthropic(model="claude-3-haiku-20240307")
async for chunk in chat.astream("Write me a 1 verse song about goldfish on the moon"):
    print(chunk.content, end="|", flush=True)
```
```output
Here| is| a| |1| |verse| song| about| gol|dfish| on| the| moon|:|

Floating| up| above| the| Earth|,|
Gol|dfish| swim| in| alien| m|irth|.|
In| their| bowl| of| lunar| dust|,|
Gl|it|tering| scales| reflect| the| trust|
Of| swimming| free| in| this| new| worl|d,|
Where| their| aqu|atic| dream|'s| unf|ur|le|d.|
```
## Astream 事件

聊天模型也支持标准的 [astream 事件](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.astream_events) 方法。

如果您正在从包含多个步骤的大型语言模型应用程序中流式输出（例如，由提示、LLM 和解析器组成的 LLM 链），此方法非常有用。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to stream chat model responses"}]-->
from langchain_anthropic.chat_models import ChatAnthropic

chat = ChatAnthropic(model="claude-3-haiku-20240307")
idx = 0

async for event in chat.astream_events(
    "Write me a 1 verse song about goldfish on the moon", version="v1"
):
    idx += 1
    if idx >= 5:  # Truncate the output
        print("...Truncated")
        break
    print(event)
```
```output
{'event': 'on_chat_model_start', 'run_id': '08da631a-12a0-4f07-baee-fc9a175ad4ba', 'name': 'ChatAnthropic', 'tags': [], 'metadata': {}, 'data': {'input': 'Write me a 1 verse song about goldfish on the moon'}}
{'event': 'on_chat_model_stream', 'run_id': '08da631a-12a0-4f07-baee-fc9a175ad4ba', 'tags': [], 'metadata': {}, 'name': 'ChatAnthropic', 'data': {'chunk': AIMessageChunk(content='Here', id='run-08da631a-12a0-4f07-baee-fc9a175ad4ba')}}
{'event': 'on_chat_model_stream', 'run_id': '08da631a-12a0-4f07-baee-fc9a175ad4ba', 'tags': [], 'metadata': {}, 'name': 'ChatAnthropic', 'data': {'chunk': AIMessageChunk(content="'s", id='run-08da631a-12a0-4f07-baee-fc9a175ad4ba')}}
{'event': 'on_chat_model_stream', 'run_id': '08da631a-12a0-4f07-baee-fc9a175ad4ba', 'tags': [], 'metadata': {}, 'name': 'ChatAnthropic', 'data': {'chunk': AIMessageChunk(content=' a', id='run-08da631a-12a0-4f07-baee-fc9a175ad4ba')}}
...Truncated
```