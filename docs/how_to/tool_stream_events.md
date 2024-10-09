---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_stream_events.ipynb
---
# 如何从工具中流式传输事件

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain 工具](/docs/concepts/#tools)
- [自定义工具](/docs/how_to/custom_tools)
- [使用流事件](/docs/how_to/streaming/#using-stream-events)
- [在自定义工具中访问 RunnableConfig](/docs/how_to/tool_configure/)

:::

如果您有调用聊天模型、检索器或其他可运行对象的工具，您可能希望访问这些可运行对象的内部事件或使用附加属性对其进行配置。本指南将向您展示如何正确手动传递参数，以便您可以使用 `astream_events()` 方法来实现这一点。

:::caution Compatibility

如果您在 `python&lt;=3.10` 中运行 `async` 代码，LangChain 无法自动传播配置，包括 `astream_events()` 所需的回调到子可运行对象。这是您可能无法看到自定义可运行对象或工具发出事件的常见原因。

如果您在 `python&lt;=3.10` 中运行，您需要手动将 `RunnableConfig` 对象传播到异步环境中的子可运行对象。有关如何手动传播配置的示例，请参见下面的 `bar` RunnableLambda 的实现。

如果您在 `python>=3.11` 中运行，`RunnableConfig` 将自动传播到异步环境中的子可运行对象。然而，如果您的代码可能在较旧的 Python 版本中运行，手动传播 `RunnableConfig` 仍然是个好主意。

本指南还要求 `langchain-core>=0.2.16`。
:::

假设你有一个自定义工具，它调用一个链，通过提示聊天模型仅返回10个单词来压缩其输入，然后反转输出。首先，以一种简单的方式定义它：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="model" />



```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to stream events from a tool"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to stream events from a tool"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to stream events from a tool"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool


@tool
async def special_summarization_tool(long_text: str) -> str:
    """A tool that summarizes input text using advanced techniques."""
    prompt = ChatPromptTemplate.from_template(
        "You are an expert writer. Summarize the following text in 10 words or less:\n\n{long_text}"
    )

    def reverse(x: str):
        return x[::-1]

    chain = prompt | model | StrOutputParser() | reverse
    summary = await chain.ainvoke({"long_text": long_text})
    return summary
```

直接调用工具工作得很好：


```python
LONG_TEXT = """
NARRATOR:
(Black screen with text; The sound of buzzing bees can be heard)
According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.
BARRY BENSON:
(Barry is picking out a shirt)
Yellow, black. Yellow, black. Yellow, black. Yellow, black. Ooh, black and yellow! Let's shake it up a little.
JANET BENSON:
Barry! Breakfast is ready!
BARRY:
Coming! Hang on a second.
"""

await special_summarization_tool.ainvoke({"long_text": LONG_TEXT})
```



```output
'.yad noitaudarg rof tiftuo sesoohc yrraB ;scisyhp seifed eeB'
```


但是如果你想访问聊天模型的原始输出而不是完整的工具，你可以尝试使用 [`astream_events()`](/docs/how_to/streaming/#using-stream-events) 方法并寻找 `on_chat_model_end` 事件。发生了以下情况：


```python
stream = special_summarization_tool.astream_events(
    {"long_text": LONG_TEXT}, version="v2"
)

async for event in stream:
    if event["event"] == "on_chat_model_end":
        # Never triggers in python<=3.10!
        print(event)
```

你会注意到（除非你在 `python>=3.11` 中运行此指南），子运行没有发出聊天模型事件！

这是因为上面的示例没有将工具的配置对象传递到内部链中。要解决此问题，请重新定义你的工具，使其接受一个特殊参数，类型为 `RunnableConfig`（有关更多详细信息，请参见 [此指南](/docs/how_to/tool_configure)）。在执行内部链时，你还需要将该参数传递进去：


```python
<!--IMPORTS:[{"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to stream events from a tool"}]-->
from langchain_core.runnables import RunnableConfig


@tool
async def special_summarization_tool_with_config(
    long_text: str, config: RunnableConfig
) -> str:
    """A tool that summarizes input text using advanced techniques."""
    prompt = ChatPromptTemplate.from_template(
        "You are an expert writer. Summarize the following text in 10 words or less:\n\n{long_text}"
    )

    def reverse(x: str):
        return x[::-1]

    chain = prompt | model | StrOutputParser() | reverse
    # Pass the "config" object as an argument to any executed runnables
    summary = await chain.ainvoke({"long_text": long_text}, config=config)
    return summary
```

现在尝试使用你的新工具进行相同的 `astream_events()` 调用：


```python
stream = special_summarization_tool_with_config.astream_events(
    {"long_text": LONG_TEXT}, version="v2"
)

async for event in stream:
    if event["event"] == "on_chat_model_end":
        print(event)
```
```output
{'event': 'on_chat_model_end', 'data': {'output': AIMessage(content='Bee defies physics; Barry chooses outfit for graduation day.', response_metadata={'stop_reason': 'end_turn', 'stop_sequence': None}, id='run-d23abc80-0dce-4f74-9d7b-fb98ca4f2a9e', usage_metadata={'input_tokens': 182, 'output_tokens': 16, 'total_tokens': 198}), 'input': {'messages': [[HumanMessage(content="You are an expert writer. Summarize the following text in 10 words or less:\n\n\nNARRATOR:\n(Black screen with text; The sound of buzzing bees can be heard)\nAccording to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible.\nBARRY BENSON:\n(Barry is picking out a shirt)\nYellow, black. Yellow, black. Yellow, black. Yellow, black. Ooh, black and yellow! Let's shake it up a little.\nJANET BENSON:\nBarry! Breakfast is ready!\nBARRY:\nComing! Hang on a second.\n")]]}}, 'run_id': 'd23abc80-0dce-4f74-9d7b-fb98ca4f2a9e', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['f25c41fe-8972-4893-bc40-cecf3922c1fa']}
```
太棒了！这次发出了一个事件。

对于流式处理，`astream_events()` 会自动在启用流式处理的情况下调用链中的内部可运行对象，因此如果你想在聊天模型生成时流式传输令牌，你可以简单地过滤以查找 `on_chat_model_stream` 事件，而无需其他更改：


```python
stream = special_summarization_tool_with_config.astream_events(
    {"long_text": LONG_TEXT}, version="v2"
)

async for event in stream:
    if event["event"] == "on_chat_model_stream":
        print(event)
```
```output
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42', usage_metadata={'input_tokens': 182, 'output_tokens': 0, 'total_tokens': 182})}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='Bee', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' def', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='ies physics', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=';', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' Barry', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' cho', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='oses outfit', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' for', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' graduation', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' day', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='.', id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42')}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'stop_reason': 'end_turn', 'stop_sequence': None}, id='run-f24ab147-0b82-4e63-810a-b12bd8d1fb42', usage_metadata={'input_tokens': 0, 'output_tokens': 16, 'total_tokens': 16})}, 'run_id': 'f24ab147-0b82-4e63-810a-b12bd8d1fb42', 'name': 'ChatAnthropic', 'tags': ['seq:step:2'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-5-sonnet-20240620', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['385f3612-417c-4a70-aae0-cce3a5ba6fb6']}
```
## 下一步

你现在已经看到如何从工具内部流式传输事件。接下来，查看以下指南以获取更多关于使用工具的信息：

- 将 [运行时值传递给工具](/docs/how_to/tool_runtime)
- 将 [工具结果传递给模型](/docs/how_to/tool_results_pass_to_model)
- [调度自定义回调事件](/docs/how_to/callbacks_custom_events)

您还可以查看一些工具调用的更具体用法：

- 构建 [使用工具的链和代理](/docs/how_to#tools)
- 从模型获取 [结构化输出](/docs/how_to/structured_output/)
