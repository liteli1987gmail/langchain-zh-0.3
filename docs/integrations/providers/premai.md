# PremAI

[PremAI](https://premai.io/) 是一个一体化平台，简化了由生成式人工智能驱动的强大、生产就绪应用程序的创建。通过简化开发过程，PremAI 使您能够专注于提升用户体验和推动应用程序的整体增长。您可以快速开始使用我们的平台 [这里](https://docs.premai.io/quick-start)。


## ChatPremAI

本示例介绍了如何使用 LangChain 与不同的聊天模型进行交互，使用 `ChatPremAI`。

### 安装和设置

我们首先安装 `langchain` 和 `premai-sdk`。您可以输入以下命令进行安装：

```bash
pip install premai langchain
```

在继续之前，请确保您已在PremAI上创建了账户并创建了项目。如果没有，请参考[快速入门](https://docs.premai.io/introduction)指南以开始使用PremAI平台。创建您的第一个项目并获取您的API密钥。

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### 在LangChain中设置PremAI客户端

一旦我们导入了所需的模块，让我们设置我们的客户端。现在假设我们的`project_id`是`8`。但请确保使用您的项目ID，否则会抛出错误。

要将langchain与prem一起使用，您不需要传递任何模型名称或设置任何参数与我们的聊天客户端。默认情况下，它将使用在[LaunchPad](https://docs.premai.io/get-started/launchpad)中使用的模型名称和参数。

> 注意：如果您在设置客户端时更改了`model`或其他参数，如`temperature`或`max_tokens`，它将覆盖在LaunchPad中使用的现有默认配置。


```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=1234, model_name="gpt-4o")
```

### 聊天完成

`ChatPremAI`支持两种方法：`invoke`（与`generate`相同）和`stream`。

第一个方法将给我们一个静态结果。而第二个方法将逐个流式传输令牌。以下是如何生成类似聊天的完成。

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

您可以在这里提供系统提示，如下所示：

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

您还可以在调用模型时更改生成参数。以下是您可以这样做的方式：

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

> 如果您要在此处放置系统提示，则它将覆盖您在从平台部署应用程序时固定的系统提示。

> 您可以在[这里](https://docs.premai.io/get-started/sdk#optional-parameters)找到所有可选参数。任何其他参数将会在调用模型之前自动删除。


### 与 Prem 存储库的原生 RAG 支持

Prem 存储库允许用户上传文档（.txt, .pdf 等）并将这些存储库连接到大型语言模型（LLMs）。您可以将 Prem 存储库视为原生 RAG，每个存储库可以被视为一个向量数据库。您可以连接多个存储库。您可以在[这里](https://docs.premai.io/get-started/repositories)了解更多关于存储库的信息。

在 langchain premai 中也支持存储库。以下是您可以如何操作。

```python 

query = "Which models are used for dense retrieval"
repository_ids = [1985,]
repositories = dict(
    ids=repository_ids,
    similarity_threshold=0.3,
    limit=3
)
```

首先，我们通过一些存储库 ID 来定义我们的存储库。确保这些 ID 是有效的存储库 ID。您可以在[这里](https://docs.premai.io/get-started/repositories)了解更多关于如何获取存储库 ID 的信息。

> 请注意：类似于 `model_name`，当您调用参数 `repositories` 时，您可能会覆盖在启动板中连接的存储库。

现在，我们将存储库与我们的聊天对象连接，以调用基于 RAG 的生成。

```python 
import json

response = chat.invoke(query, max_tokens=100, repositories=repositories)

print(response.content)
print(json.dumps(response.response_metadata, indent=4))
```

这就是输出的样子。

```bash
Dense retrieval models typically include:

1. **BERT-based Models**: Such as DPR (Dense Passage Retrieval) which uses BERT for encoding queries and passages.
2. **ColBERT**: A model that combines BERT with late interaction mechanisms.
3. **ANCE (Approximate Nearest Neighbor Negative Contrastive Estimation)**: Uses BERT and focuses on efficient retrieval.
4. **TCT-ColBERT**: A variant of ColBERT that uses a two-tower
{
    "document_chunks": [
        {
            "repository_id": 1985,
            "document_id": 1306,
            "chunk_id": 173899,
            "document_name": "[D] Difference between sparse and dense informati\u2026",
            "similarity_score": 0.3209080100059509,
            "content": "with the difference or anywhere\nwhere I can read about it?\n\n\n      17                  9\n\n\n      u/ScotiabankCanada        \u2022  Promoted\n\n\n                       Accelerate your study permit process\n                       with Scotiabank's Student GIC\n                       Program. We're here to help you tur\u2026\n\n\n                       startright.scotiabank.com         Learn More\n\n\n                            Add a Comment\n\n\nSort by:   Best\n\n\n      DinosParkour      \u2022 1y ago\n\n\n     Dense Retrieval (DR) m"
        }
    ]
}
```

所以，这也意味着在使用 Prem 平台时，您不需要自己构建 RAG 流水线。Prem 使用其自己的 RAG 技术来提供一流的检索增强生成性能。

> 理想情况下，您不需要在此处连接存储库 ID 以获取检索增强生成。如果您在 prem 平台中连接了存储库，仍然可以获得相同的结果。

### 流式处理

在本节中，让我们看看如何使用 LangChain 和 PremAI 流式传输令牌。以下是操作方法。

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

与上述类似，如果您想覆盖系统提示和生成参数，您需要添加以下内容：

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

这将一个接一个地流式传输令牌。

> 请注意：截至目前，流式处理的 RAG 不受支持。然而，我们仍然通过我们的 API 支持它。您可以在 [这里](https://docs.premai.io/get-started/chat-completion-sse) 了解更多信息。


## Prem 模板

编写提示模板可能会非常麻烦。提示模板很长，难以管理，并且必须不断调整以改进并在整个应用程序中保持一致。

使用 **Prem**，编写和管理提示可以变得非常简单。 [启动板](https://docs.premai.io/get-started/launchpad) 中的 **_模板_** 选项卡帮助您编写所需的多个提示，并在 SDK 中使用它，使您的应用程序能够使用这些提示运行。您可以在 [这里](https://docs.premai.io/get-started/prem-templates) 阅读更多关于提示模板的信息。

要在 LangChain 中原生使用 Prem 模板，您需要将一个 id 传递给 `HumanMessage`。这个 id 应该是您提示模板变量的名称。`HumanMessage` 中的 `content` 应该是该变量的值。

假设你的提示词模板是这样的：

```text
Say hello to my name and say a feel-good quote
from my age. My name is: {name} and age is {age}
```

所以现在你的 human_messages 应该看起来像：

```python
human_messages = [
    HumanMessage(content="Shawn", id="name"),
    HumanMessage(content="22", id="age")
]
```

将这个 `human_messages` 传递给 ChatPremAI 客户端。请注意：不要忘记
传递额外的 `template_id` 以调用 Prem 模板生成。如果你不知道 `template_id`，你可以在我们的文档中了解更多 [在这里](https://docs.premai.io/get-started/prem-templates)。这是一个示例：

```python
template_id = "78069ce8-xxxxx-xxxxx-xxxx-xxx"
response = chat.invoke([human_message], template_id=template_id)
```

Prem 模板也可以用于流式处理。

## Prem 嵌入

在这一部分，我们将介绍如何使用 `PremEmbeddings` 通过 LangChain 访问不同的嵌入模型。让我们先导入我们的模块并设置我们的 API 密钥。

```python
import os
import getpass
from langchain_community.embeddings import PremEmbeddings


if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

```

我们支持许多最先进的嵌入模型。你可以在 [这里](https://docs.premai.io/get-started/supported-models) 查看我们支持的 LLM 和嵌入模型列表。现在我们选择 `text-embedding-3-large` 模型作为示例。

```python

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)

query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

:::note
与聊天不同，设置 `model_name` 参数对于 PremAIEmbeddings 是强制性的。
:::

最后，让我们嵌入一些示例文档

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```python
print(f"Dimension of embeddings: {len(query_result)}")
```
嵌入维度：3072

```python
doc_result[:5]
```
>结果：
>
>[-0.02129288576543331,
0.0008162345038726926,
-0.004556538071483374,
0.02918623760342598,
-0.02547479420900345]

## 工具/函数调用

LangChain PremAI 支持工具/函数调用。工具/函数调用允许模型通过生成符合用户定义的模式的输出，来响应给定的提示。

- 您可以在[我们的文档中详细了解工具调用](https://docs.premai.io/get-started/function-calling)。
- 您可以在[文档的这一部分](https://python.langchain.com/v0.1/docs/modules/model_io/chat/function_calling)中了解更多关于LangChain工具调用的信息。

**注意：**

> 当前版本的LangChain ChatPremAI不支持带有流式支持的函数/工具调用。流式支持和函数调用将很快推出。

### 将工具传递给模型

为了传递工具并让大型语言模型选择需要调用的工具，我们需要传递一个工具模式。工具模式是函数定义以及关于该函数的作用、每个参数的含义等的适当文档字符串。以下是一些简单的算术函数及其模式。

**注意：**
> 在定义函数/工具模式时，请不要忘记添加有关函数参数的信息，否则会抛出错误。

```python
from langchain_core.tools import tool
from pydantic import BaseModel, Field 

# Define the schema for function arguments
class OperationInput(BaseModel):
    a: int = Field(description="First number")
    b: int = Field(description="Second number")


# Now define the function where schema for argument will be OperationInput
@tool("add", args_schema=OperationInput, return_direct=True)
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool("multiply", args_schema=OperationInput, return_direct=True)
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b
```

### 将工具模式与我们的LLM绑定

我们现在将使用`bind_tools`方法将上述函数转换为“工具”并与模型绑定。这意味着每次调用模型时，我们都将传递这些工具信息。

```python
tools = [add, multiply]
llm_with_tools = chat.bind_tools(tools)
```

在此之后，我们从模型中获取响应，该模型现在与工具绑定。

```python 
query = "What is 3 * 12? Also, what is 11 + 49?"

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
```

正如我们所看到的，当我们的聊天模型与工具绑定时，根据给定的提示，它会调用正确的一组工具并按顺序执行。

```python 
ai_msg.tool_calls
```
**输出**

```python
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_A9FL20u12lz6TpOLaiS6rFa8'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_MPKYGLHbf39csJIyb5BZ9xIk'}]
```

我们将上面显示的消息附加到大型语言模型（LLM），这作为上下文，使LLM意识到它调用了哪些函数。

```python 
messages.append(ai_msg)
```

由于工具调用分为两个阶段，其中：

1. 在第一次调用中，我们收集了LLM决定使用的所有工具，以便它可以获得结果作为附加上下文，从而提供更准确且无幻觉的结果。

2. 在第二次调用中，我们将解析LLM决定的那一组工具并运行它们（在我们的案例中，将是我们定义的函数，带有LLM提取的参数），并将此结果传递给LLM。

```python
from langchain_core.messages import ToolMessage

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))
```

最后，我们调用与工具绑定的LLM，并将函数响应添加到它的上下文中。

```python
response = llm_with_tools.invoke(messages)
print(response.content)
```
**输出**

```txt
The final answers are:

- 3 * 12 = 36
- 11 + 49 = 60
```

### 定义工具模式：Pydantic类 `Optional`

上面我们展示了如何使用 `tool` 装饰器定义模式，但我们也可以使用 Pydantic 等效地定义模式。当你的工具输入更复杂时，Pydantic 非常有用：

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

现在，我们可以将它们绑定到聊天模型并直接获取结果：

```python
chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

**输出**

```txt
[multiply(a=3, b=12), add(a=11, b=49)]
```

现在，像上面所做的那样，我们解析这个并运行这些函数，再次调用大型语言模型以获取结果。
