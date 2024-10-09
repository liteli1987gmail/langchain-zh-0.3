---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_error.ipynb
---
# 如何处理工具错误

:::info Prerequisites

本指南假设您熟悉以下概念：
- [聊天模型](/docs/concepts/#chat-models)
- [LangChain 工具](/docs/concepts/#tools)
- [如何使用模型调用工具](/docs/how_to/tool_calling)

:::

使用大型语言模型调用工具通常比纯提示更可靠，但并不完美。模型可能会尝试调用不存在的工具，或者未能返回与请求的模式匹配的参数。保持模式简单、减少一次传递的工具数量，以及使用良好的名称和描述等策略可以帮助降低这种风险，但并非万无一失。

本指南涵盖了一些将错误处理构建到您的链中的方法，以减轻这些失败模式。

## 设置

我们需要安装以下软件包：


```python
%pip install --upgrade --quiet langchain-core langchain-openai
```

如果您想在 [LangSmith](https://docs.smith.langchain.com/) 中跟踪您的运行，请取消注释并设置以下环境变量：


```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 链

假设我们有以下（虚拟）工具和工具调用链。我们将故意使我们的工具复杂，以试图让模型出错。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>



```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to handle tool errors"}]-->
# Define tool
from langchain_core.tools import tool


@tool
def complex_tool(int_arg: int, float_arg: float, dict_arg: dict) -> int:
    """Do something complex with a complex tool."""
    return int_arg * float_arg


llm_with_tools = llm.bind_tools(
    [complex_tool],
)

# Define chain
chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool
```

我们可以看到，当我们尝试用即使是相当明确的输入来调用这个链时，模型未能正确调用工具（它忘记了 `dict_arg` 参数）。


```python
chain.invoke(
    "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
)
```

```output
---------------------------------------------------------------------------
``````output
ValidationError                           Traceback (most recent call last)
``````output
Cell In[5], line 1
----> 1 chain.invoke(
      2     "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
      3 )
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/runnables/base.py:2998, in RunnableSequence.invoke(self, input, config, **kwargs)
   2996             input = context.run(step.invoke, input, config, **kwargs)
   2997         else:
-> 2998             input = context.run(step.invoke, input, config)
   2999 # finish the root run
   3000 except BaseException as e:
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:456, in BaseTool.invoke(self, input, config, **kwargs)
    449 def invoke(
    450     self,
    451     input: Union[str, Dict, ToolCall],
    452     config: Optional[RunnableConfig] = None,
    453     **kwargs: Any,
    454 ) -> Any:
    455     tool_input, kwargs = _prep_run_args(input, config, **kwargs)
--> 456     return self.run(tool_input, **kwargs)
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:659, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, config, tool_call_id, **kwargs)
    657 if error_to_raise:
    658     run_manager.on_tool_error(error_to_raise)
--> 659     raise error_to_raise
    660 output = _format_output(content, artifact, tool_call_id, self.name, status)
    661 run_manager.on_tool_end(output, color=color, name=self.name, **kwargs)
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:622, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, config, tool_call_id, **kwargs)
    620 context = copy_context()
    621 context.run(_set_config_context, child_config)
--> 622 tool_args, tool_kwargs = self._to_args_and_kwargs(tool_input)
    623 if signature(self._run).parameters.get("run_manager"):
    624     tool_kwargs["run_manager"] = run_manager
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:545, in BaseTool._to_args_and_kwargs(self, tool_input)
    544 def _to_args_and_kwargs(self, tool_input: Union[str, Dict]) -> Tuple[Tuple, Dict]:
--> 545     tool_input = self._parse_input(tool_input)
    546     # For backwards compatibility, if run_input is a string,
    547     # pass as a positional argument.
    548     if isinstance(tool_input, str):
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:487, in BaseTool._parse_input(self, tool_input)
    485 if input_args is not None:
    486     if issubclass(input_args, BaseModel):
--> 487         result = input_args.model_validate(tool_input)
    488         result_dict = result.model_dump()
    489     elif issubclass(input_args, BaseModelV1):
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/pydantic/main.py:568, in BaseModel.model_validate(cls, obj, strict, from_attributes, context)
    566 # `__tracebackhide__` tells pytest and some other tools to omit this function from tracebacks
    567 __tracebackhide__ = True
--> 568 return cls.__pydantic_validator__.validate_python(
    569     obj, strict=strict, from_attributes=from_attributes, context=context
    570 )
``````output
ValidationError: 1 validation error for complex_toolSchema
dict_arg
  Field required [type=missing, input_value={'int_arg': 5, 'float_arg': 2.1}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.8/v/missing
```

## 尝试/异常工具调用

处理错误的最简单方法是对工具调用步骤进行try/except，并在出现错误时返回有帮助的消息：


```python
<!--IMPORTS:[{"imported": "Runnable", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html", "title": "How to handle tool errors"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to handle tool errors"}]-->
from typing import Any

from langchain_core.runnables import Runnable, RunnableConfig


def try_except_tool(tool_args: dict, config: RunnableConfig) -> Runnable:
    try:
        complex_tool.invoke(tool_args, config=config)
    except Exception as e:
        return f"Calling tool with arguments:\n\n{tool_args}\n\nraised the following error:\n\n{type(e)}: {e}"


chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | try_except_tool

print(
    chain.invoke(
        "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
    )
)
```
```output
Calling tool with arguments:

{'int_arg': 5, 'float_arg': 2.1}

raised the following error:

<class 'pydantic_core._pydantic_core.ValidationError'>: 1 validation error for complex_toolSchema
dict_arg
  Field required [type=missing, input_value={'int_arg': 5, 'float_arg': 2.1}, input_type=dict]
    For further information visit https://errors.pydantic.dev/2.8/v/missing
```
## 回退

在工具调用错误的情况下，我们也可以尝试回退到更好的模型。在这种情况下，我们将回退到一个使用 `gpt-4-1106-preview` 的相同链，而不是 `gpt-3.5-turbo`。


```python
chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool

better_model = ChatOpenAI(model="gpt-4-1106-preview", temperature=0).bind_tools(
    [complex_tool], tool_choice="complex_tool"
)

better_chain = better_model | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool

chain_with_fallback = chain.with_fallbacks([better_chain])

chain_with_fallback.invoke(
    "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
)
```



```output
10.5
```


查看这个链运行的 [LangSmith 跟踪](https://smith.langchain.com/public/00e91fc2-e1a4-4b0f-a82e-e6b3119d196c/r)，我们可以看到第一个链调用如预期失败，而回退成功。

## 带异常重试

进一步说，我们可以尝试自动重新运行链，并传入异常，以便模型能够纠正其行为：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to handle tool errors"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to handle tool errors"}, {"imported": "ToolCall", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolCall.html", "title": "How to handle tool errors"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to handle tool errors"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to handle tool errors"}]-->
from langchain_core.messages import AIMessage, HumanMessage, ToolCall, ToolMessage
from langchain_core.prompts import ChatPromptTemplate


class CustomToolException(Exception):
    """Custom LangChain tool exception."""

    def __init__(self, tool_call: ToolCall, exception: Exception) -> None:
        super().__init__()
        self.tool_call = tool_call
        self.exception = exception


def tool_custom_exception(msg: AIMessage, config: RunnableConfig) -> Runnable:
    try:
        return complex_tool.invoke(msg.tool_calls[0]["args"], config=config)
    except Exception as e:
        raise CustomToolException(msg.tool_calls[0], e)


def exception_to_messages(inputs: dict) -> dict:
    exception = inputs.pop("exception")

    # Add historical messages to the original input, so the model knows that it made a mistake with the last tool call.
    messages = [
        AIMessage(content="", tool_calls=[exception.tool_call]),
        ToolMessage(
            tool_call_id=exception.tool_call["id"], content=str(exception.exception)
        ),
        HumanMessage(
            content="The last tool call raised an exception. Try calling the tool again with corrected arguments. Do not repeat mistakes."
        ),
    ]
    inputs["last_output"] = messages
    return inputs


# We add a last_output MessagesPlaceholder to our prompt which if not passed in doesn't
# affect the prompt at all, but gives us the option to insert an arbitrary list of Messages
# into the prompt if needed. We'll use this on retries to insert the error message.
prompt = ChatPromptTemplate.from_messages(
    [("human", "{input}"), ("placeholder", "{last_output}")]
)
chain = prompt | llm_with_tools | tool_custom_exception

# If the initial chain call fails, we rerun it withe the exception passed in as a message.
self_correcting_chain = chain.with_fallbacks(
    [exception_to_messages | chain], exception_key="exception"
)
```


```python
self_correcting_chain.invoke(
    {
        "input": "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
    }
)
```



```output
10.5
```


我们的链成功了！查看 [LangSmith 跟踪](https://smith.langchain.com/public/c11e804c-e14f-4059-bd09-64766f999c14/r)，我们可以看到我们的初始链确实仍然失败，只有在重试后链才成功。

## 下一步

现在你已经看到了一些处理工具调用错误的策略。接下来，你可以了解更多关于如何使用工具的信息：

- 少量示例提示 [与工具一起](/docs/how_to/tools_few_shot/)
- 流式 [工具调用](/docs/how_to/tool_streaming/)
- 将 [运行时值传递给工具](/docs/how_to/tool_runtime)

您还可以查看一些工具调用的更具体用法：

- 从模型获取 [结构化输出](/docs/how_to/structured_output/)
