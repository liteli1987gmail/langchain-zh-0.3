---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/streaming_llm.ipynb
---
# 如何从大型语言模型流式传输响应

所有 `LLM` 都实现了 [运行接口](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable)，该接口提供了标准可运行方法的 **默认** 实现（即 `ainvoke`、`batch`、`abatch`、`stream`、`astream`、`astream_events`）。

**默认** 流式实现提供了一个 `Iterator`（或用于异步流式传输的 `AsyncIterator`），它生成一个单一值：来自底层聊天大模型供应商的最终输出。

逐个令牌流式传输输出的能力取决于大模型供应商是否实现了适当的流式支持。

查看哪些 [集成支持逐个令牌流式传输](/docs/integrations/llms/)。



:::note

**默认** 实现 **不** 提供逐个令牌流式传输的支持，但它确保模型可以替换为任何其他模型，因为它支持相同的标准接口。

:::

## 同步流

下面我们使用 `|` 来帮助可视化令牌之间的分隔符。


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to stream responses from an LLM"}]-->
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)
for chunk in llm.stream("Write me a 1 verse song about sparkling water."):
    print(chunk, end="|", flush=True)
```
```output


|Spark|ling| water|,| oh| so clear|
|Bubbles dancing|,| without| fear|
|Refreshing| taste|,| a| pure| delight|
|Spark|ling| water|,| my| thirst|'s| delight||
```
## 异步流式处理

让我们看看如何在异步环境中使用 `astream` 进行流式处理。


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to stream responses from an LLM"}]-->
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)
async for chunk in llm.astream("Write me a 1 verse song about sparkling water."):
    print(chunk, end="|", flush=True)
```
```output


|Spark|ling| water|,| oh| so clear|
|Bubbles dancing|,| without| fear|
|Refreshing| taste|,| a| pure| delight|
|Spark|ling| water|,| my| thirst|'s| delight||
```
## 异步事件流式处理


大型语言模型还支持标准的 [astream 事件](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.astream_events) 方法。

:::tip

`astream_events` 在实现包含多个步骤的更大 LLM 应用程序（例如，涉及 `agent` 的应用程序）时最为有用。
:::


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to stream responses from an LLM"}]-->
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)

idx = 0

async for event in llm.astream_events(
    "Write me a 1 verse song about goldfish on the moon", version="v1"
):
    idx += 1
    if idx >= 5:  # Truncate the output
        print("...Truncated")
        break
    print(event)
```
