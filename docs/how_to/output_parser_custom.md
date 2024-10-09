---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_custom.ipynb
---
# 如何创建自定义输出解析器

在某些情况下，您可能希望实现一个自定义解析器，以将模型输出结构化为自定义格式。

实现自定义解析器有两种方法：

1. 使用 LCEL 中的 `RunnableLambda` 或 `RunnableGenerator` -- 我们强烈推荐这种方法用于大多数用例
2. 通过从一个基础类继承来进行输出解析 -- 这是一种较为复杂的方法

这两种方法之间的区别主要是表面的，主要体现在触发的回调（例如，`on_chain_start` 与 `on_parser_start`）以及在像 LangSmith 这样的追踪平台中，如何可视化可运行的 lambda 与解析器。

## 可运行的 Lambda 和生成器

推荐的解析方式是使用 **可运行的 lambda** 和 **可运行的生成器**！

在这里，我们将进行一个简单的解析，将模型输出的大小写反转。

例如，如果模型输出："Meow"，解析器将生成 "mEOW"。


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to create a custom Output Parser"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to create a custom Output Parser"}, {"imported": "AIMessageChunk", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessageChunk.html", "title": "How to create a custom Output Parser"}]-->
from typing import Iterable

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage, AIMessageChunk

model = ChatAnthropic(model_name="claude-2.1")


def parse(ai_message: AIMessage) -> str:
    """Parse the AI message."""
    return ai_message.content.swapcase()


chain = model | parse
chain.invoke("hello")
```



```output
'hELLO!'
```


:::tip

当使用 `|` 语法组合时，LCEL 会自动将函数 `parse` 升级为 `RunnableLambda(parse)`。

如果你不喜欢这样，你可以手动导入 `RunnableLambda`，然后运行 `parse = RunnableLambda(parse)`。
:::

流式处理有效吗？


```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```
```output
i'M cLAUDE, AN ai ASSISTANT CREATED BY aNTHROPIC TO BE HELPFUL, HARMLESS, AND HONEST.|
```
不，它无效，因为解析器在解析输出之前会聚合输入。

如果我们想实现一个流式解析器，我们可以让解析器接受一个可迭代的输入，并生成
结果，随着它们的可用性而生成。


```python
<!--IMPORTS:[{"imported": "RunnableGenerator", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableGenerator.html", "title": "How to create a custom Output Parser"}]-->
from langchain_core.runnables import RunnableGenerator


def streaming_parse(chunks: Iterable[AIMessageChunk]) -> Iterable[str]:
    for chunk in chunks:
        yield chunk.content.swapcase()


streaming_parse = RunnableGenerator(streaming_parse)
```

:::important

请将流式解析器包装在 `RunnableGenerator` 中，因为我们可能会停止使用 `|` 语法自动升级它。
:::


```python
chain = model | streaming_parse
chain.invoke("hello")
```



```output
'hELLO!'
```


让我们确认流式处理有效！


```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```
```output
i|'M| cLAUDE|,| AN| ai| ASSISTANT| CREATED| BY| aN|THROP|IC| TO| BE| HELPFUL|,| HARMLESS|,| AND| HONEST|.|
```
## 从解析基类继承

实现解析器的另一种方法是从 `BaseOutputParser`、`BaseGenerationOutputParser` 或其他基解析器继承，具体取决于你需要做什么。

一般来说，我们**不**推荐这种方法用于大多数用例，因为这会导致需要编写更多代码而没有显著的好处。

最简单的输出解析器类型扩展了 `BaseOutputParser` 类，并且必须实现以下方法：

* `parse`：接收模型的字符串输出并进行解析。
* （可选）`_type`：标识解析器的名称。

当聊天模型或大型语言模型的输出格式不正确时，可以抛出 `OutputParserException` 来指示解析失败是由于输入不良。使用此异常允许使用解析器的代码以一致的方式处理异常。

:::tip Parsers are Runnables! 🏃

因为 `BaseOutputParser` 实现了 `Runnable` 接口，所以您以这种方式创建的任何自定义解析器将成为有效的 LangChain 可运行对象，并将受益于自动异步支持、批处理接口、日志支持等。
:::


### 简单解析器

这是一个简单的解析器，可以解析布尔值的**字符串**表示（例如，`YES` 或 `NO`），并将其转换为相应的 `boolean` 类型。


```python
<!--IMPORTS:[{"imported": "OutputParserException", "source": "langchain_core.exceptions", "docs": "https://python.langchain.com/api_reference/core/exceptions/langchain_core.exceptions.OutputParserException.html", "title": "How to create a custom Output Parser"}, {"imported": "BaseOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.base.BaseOutputParser.html", "title": "How to create a custom Output Parser"}]-->
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser


# The [bool] desribes a parameterization of a generic.
# It's basically indicating what the return type of parse is
# in this case the return type is either True or False
class BooleanOutputParser(BaseOutputParser[bool]):
    """Custom boolean parser."""

    true_val: str = "YES"
    false_val: str = "NO"

    def parse(self, text: str) -> bool:
        cleaned_text = text.strip().upper()
        if cleaned_text not in (self.true_val.upper(), self.false_val.upper()):
            raise OutputParserException(
                f"BooleanOutputParser expected output value to either be "
                f"{self.true_val} or {self.false_val} (case-insensitive). "
                f"Received {cleaned_text}."
            )
        return cleaned_text == self.true_val.upper()

    @property
    def _type(self) -> str:
        return "boolean_output_parser"
```


```python
parser = BooleanOutputParser()
parser.invoke("YES")
```



```output
True
```



```python
try:
    parser.invoke("MEOW")
except Exception as e:
    print(f"Triggered an exception of type: {type(e)}")
```
```output
Triggered an exception of type: <class 'langchain_core.exceptions.OutputParserException'>
```
让我们测试更改参数化。


```python
parser = BooleanOutputParser(true_val="OKAY")
parser.invoke("OKAY")
```



```output
True
```


让我们确认其他 LCEL 方法是否存在。


```python
parser.batch(["OKAY", "NO"])
```



```output
[True, False]
```



```python
await parser.abatch(["OKAY", "NO"])
```



```output
[True, False]
```



```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic.chat_models", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to create a custom Output Parser"}]-->
from langchain_anthropic.chat_models import ChatAnthropic

anthropic = ChatAnthropic(model_name="claude-2.1")
anthropic.invoke("say OKAY or NO")
```



```output
AIMessage(content='OKAY')
```


让我们测试一下我们的解析器是否有效！


```python
chain = anthropic | parser
chain.invoke("say OKAY or NO")
```



```output
True
```


:::note
解析器可以处理来自大型语言模型（字符串）或聊天模型（`AIMessage`）的输出！
:::

### 解析原始模型输出

有时模型输出中除了原始文本之外还有其他重要的元数据。一个例子是工具调用，其中传递给被调用函数的参数在一个单独的属性中返回。如果您需要更细粒度的控制，可以子类化 `BaseGenerationOutputParser` 类。

该类需要一个单一的方法 `parse_result`。该方法接受原始模型输出（例如，`Generation` 或 `ChatGeneration` 的列表）并返回解析后的输出。

支持 `Generation` 和 `ChatGeneration` 使得解析器能够处理常规大型语言模型以及聊天模型。


```python
<!--IMPORTS:[{"imported": "OutputParserException", "source": "langchain_core.exceptions", "docs": "https://python.langchain.com/api_reference/core/exceptions/langchain_core.exceptions.OutputParserException.html", "title": "How to create a custom Output Parser"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to create a custom Output Parser"}, {"imported": "BaseGenerationOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.base.BaseGenerationOutputParser.html", "title": "How to create a custom Output Parser"}, {"imported": "ChatGeneration", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.chat_generation.ChatGeneration.html", "title": "How to create a custom Output Parser"}, {"imported": "Generation", "source": "langchain_core.outputs", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.generation.Generation.html", "title": "How to create a custom Output Parser"}]-->
from typing import List

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import BaseGenerationOutputParser
from langchain_core.outputs import ChatGeneration, Generation


class StrInvertCase(BaseGenerationOutputParser[str]):
    """An example parser that inverts the case of the characters in the message.

    This is an example parse shown just for demonstration purposes and to keep
    the example as simple as possible.
    """

    def parse_result(self, result: List[Generation], *, partial: bool = False) -> str:
        """Parse a list of model Generations into a specific format.

        Args:
            result: A list of Generations to be parsed. The Generations are assumed
                to be different candidate outputs for a single model input.
                Many parsers assume that only a single generation is passed it in.
                We will assert for that
            partial: Whether to allow partial results. This is used for parsers
                     that support streaming
        """
        if len(result) != 1:
            raise NotImplementedError(
                "This output parser can only be used with a single generation."
            )
        generation = result[0]
        if not isinstance(generation, ChatGeneration):
            # Say that this one only works with chat generations
            raise OutputParserException(
                "This output parser can only be used with a chat generation."
            )
        return generation.message.content.swapcase()


chain = anthropic | StrInvertCase()
```

让我们使用新的解析器！它应该反转模型的输出。


```python
chain.invoke("Tell me a short sentence about yourself")
```



```output
'hELLO! mY NAME IS cLAUDE.'
```

