---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/custom_llm.ipynb
---
# 如何创建自定义 LLM 类

本笔记本介绍了如何创建自定义 LLM 包装器，以便您可以使用自己的 LLM 或与 LangChain 支持的包装器不同的包装器。

使用标准 `LLM` 接口包装您的 LLM 允许您在现有 LangChain 程序中以最小的代码修改使用您的 LLM！

作为额外奖励，您的 LLM 将自动成为 LangChain `Runnable`，并将受益于一些开箱即用的优化、异步支持、`astream_events` API 等。

## 实现

自定义 LLM 需要实现的只有两个必需的内容：


| 方法          | 描述                                                                  |
|---------------|-----------------------------------------------------------------------|
| `_call`       | 接收一个字符串和一些可选的停止词，并返回一个字符串。由 `invoke` 使用。 |
| `_llm_type`   | 返回一个字符串的属性，仅用于日志记录目的。



可选实现：


| 方法    | 描述                                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------------------------|
| `_identifying_params` | 用于帮助识别模型并打印LLM；应返回一个字典。这是一个 **@property**。                 |
| `_acall`              | 提供 `_call` 的异步原生实现，供 `ainvoke` 使用。                                    |
| `_stream`             | 逐个令牌流式输出的方式。                                                               |
| `_astream`            | 提供 `_stream` 的异步原生实现；在较新的LangChain版本中，默认为 `_stream`。 |



让我们实现一个简单的自定义LLM，它只返回输入的前n个字符。


```python
<!--IMPORTS:[{"imported": "CallbackManagerForLLMRun", "source": "langchain_core.callbacks.manager", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManagerForLLMRun.html", "title": "How to create a custom LLM class"}, {"imported": "LLM", "source": "langchain_core.language_models.llms", "docs": "https://python.langchain.com/api_reference/core/language_models/langchain_core.language_models.llms.LLM.html", "title": "How to create a custom LLM class"}, {"imported": "GenerationChunk", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.generation.GenerationChunk.html", "title": "How to create a custom LLM class"}]-->
from typing import Any, Dict, Iterator, List, Mapping, Optional

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models.llms import LLM
from langchain_core.outputs import GenerationChunk


class CustomLLM(LLM):
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

    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Run the LLM on the given input.

        Override this method to implement the LLM logic.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of the stop substrings.
                If stop tokens are not supported consider raising NotImplementedError.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            The model output as a string. Actual completions SHOULD NOT include the prompt.
        """
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        return prompt[: self.n]

    def _stream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        """Stream the LLM on the given prompt.

        This method should be overridden by subclasses that support streaming.

        If not implemented, the default behavior of calls to stream will be to
        fallback to the non-streaming version of the model and return
        the output as a single chunk.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of these substrings.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            An iterator of GenerationChunks.
        """
        for char in prompt[: self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)

            yield chunk

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "CustomChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "custom"
```

### 让我们测试一下 🧪

这个大型语言模型将实现 LangChain 的标准 `Runnable` 接口，许多 LangChain 抽象都支持该接口！


```python
llm = CustomLLM(n=5)
print(llm)
```
```output
[1mCustomLLM[0m
Params: {'model_name': 'CustomChatModel'}
```

```python
llm.invoke("This is a foobar thing")
```



```output
'This '
```



```python
await llm.ainvoke("world")
```



```output
'world'
```



```python
llm.batch(["woof woof woof", "meow meow meow"])
```



```output
['woof ', 'meow ']
```



```python
await llm.abatch(["woof woof woof", "meow meow meow"])
```



```output
['woof ', 'meow ']
```



```python
async for token in llm.astream("hello"):
    print(token, end="|", flush=True)
```
```output
h|e|l|l|o|
```
让我们确认它与其他 `LangChain` API 的良好集成。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to create a custom LLM class"}]-->
from langchain_core.prompts import ChatPromptTemplate
```


```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "you are a bot"), ("human", "{input}")]
)
```


```python
llm = CustomLLM(n=7)
chain = prompt | llm
```


```python
idx = 0
async for event in chain.astream_events({"input": "hello there!"}, version="v1"):
    print(event)
    idx += 1
    if idx > 7:
        # Truncate
        break
```
```output
{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
```
## 贡献

我们感谢所有聊天模型集成的贡献。

这是一个检查清单，帮助确保您的贡献被添加到 LangChain：

文档：

* 该模型包含所有初始化参数的文档字符串，因为这些将在 [APIReference](https://python.langchain.com/api_reference/langchain/index.html) 中显示。
* 如果该模型由服务提供支持，则模型的类文档字符串包含指向模型 API 的链接。

测试：

* [ ] 为重写的方法添加单元或集成测试。验证如果您重写了相应的代码，`invoke`、`ainvoke`、`batch`、`stream` 是否正常工作。

流式处理（如果您正在实现它）：

* [ ] 确保调用 `on_llm_new_token` 回调
* [ ] `on_llm_new_token` 在生成块之前被调用

停止令牌行为：

* [ ] 应尊重停止令牌
* [ ] 停止令牌应作为响应的一部分包含在内

秘密 API 密钥：

* [ ] 如果您的模型连接到 API，它可能会在初始化时接受 API 密钥。使用 Pydantic 的 `SecretStr` 类型来处理秘密，以便在打印模型时不会意外打印出来。
