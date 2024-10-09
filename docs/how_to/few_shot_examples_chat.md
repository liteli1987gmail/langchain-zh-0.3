---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/few_shot_examples_chat.ipynb
sidebar_position: 2
---
# 如何在聊天模型中使用少量示例

:::info Prerequisites

本指南假设您熟悉以下概念：
- [提示词模板](/docs/concepts/#prompt-templates)
- [示例选择器](/docs/concepts/#example-selectors)
- [聊天模型](/docs/concepts/#chat-model)
- [向量存储](/docs/concepts/#vector-stores)

:::

本指南涵盖如何使用示例输入和输出提示聊天模型。向模型提供少量这样的示例称为少量示例提示，这是引导生成的一种简单而强大的方法，在某些情况下可以显著提高模型性能。

目前似乎没有关于如何最好地进行少量示例提示的明确共识，最佳的提示编写可能因模型而异。因此，我们提供了像 [FewShotChatMessagePromptTemplate](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate) 这样的少量示例提示模板作为灵活的起点，您可以根据需要进行修改或替换。

少量示例提示模板的目标是根据输入动态选择示例，然后将示例格式化为最终提示以提供给模型。

**注意：** 以下代码示例仅适用于聊天模型，因为 `FewShotChatMessagePromptTemplates` 旨在输出格式化的 [聊天消息](/docs/concepts/#message-types)，而不是纯字符串。有关与完成模型（LLMs）兼容的纯字符串模板的类似少量示例提示，请参见 [少量示例提示模板](/docs/how_to/few_shot_examples/) 指南。

## 固定示例

最基本（也是最常见）的少量示例提示技术是使用固定的提示示例。通过这种方式，您可以选择一个链，评估它，并避免在生产中担心额外的可变部分。

模板的基本组件包括：
- `examples`: 包含在最终提示中的字典示例列表。
- `example_prompt`: 通过其 [`format_messages`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) 方法将每个示例转换为1个或多个消息。一个常见的示例是将每个示例转换为一个人类消息和一个AI消息响应，或者一个人类消息后跟一个函数调用消息。

下面是一个简单的演示。首先，定义您想要包含的示例。让我们给LLM一个不熟悉的数学运算符，用“🦜”表情符号表示：


```python
%pip install -qU langchain langchain-openai langchain-chroma

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

如果我们尝试询问模型这个表达式的结果，它将失败：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use few shot examples in chat models"}]-->
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)

model.invoke("What is 2 🦜 9?")
```



```output
AIMessage(content='The expression "2 🦜 9" is not a standard mathematical operation or equation. It appears to be a combination of the number 2 and the parrot emoji 🦜 followed by the number 9. It does not have a specific mathematical meaning.', response_metadata={'token_usage': {'completion_tokens': 54, 'prompt_tokens': 17, 'total_tokens': 71}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-aad12dda-5c47-4a1e-9949-6fe94e03242a-0', usage_metadata={'input_tokens': 17, 'output_tokens': 54, 'total_tokens': 71})
```


现在让我们看看如果给大型语言模型一些示例来处理会发生什么。我们将在下面定义一些：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use few shot examples in chat models"}, {"imported": "FewShotChatMessagePromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html", "title": "How to use few shot examples in chat models"}]-->
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

examples = [
    {"input": "2 🦜 2", "output": "4"},
    {"input": "2 🦜 3", "output": "5"},
]
```

接下来，将它们组装成少量示例提示模板。


```python
# This is a prompt template used to format each individual example.
example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

print(few_shot_prompt.invoke({}).to_messages())
```
```output
[HumanMessage(content='2 🦜 2'), AIMessage(content='4'), HumanMessage(content='2 🦜 3'), AIMessage(content='5')]
```
最后，我们将最终提示组装如下，将 `few_shot_prompt` 直接传递给 `from_messages` 工厂方法，并与模型一起使用：


```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

现在让我们向模型提出最初的问题，看看它的表现如何：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use few shot examples in chat models"}]-->
from langchain_openai import ChatOpenAI

chain = final_prompt | model

chain.invoke({"input": "What is 2 🦜 9?"})
```



```output
AIMessage(content='11', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 60, 'total_tokens': 61}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-5ec4e051-262f-408e-ad00-3f2ebeb561c3-0', usage_metadata={'input_tokens': 60, 'output_tokens': 1, 'total_tokens': 61})
```


我们可以看到，模型现在已经从给定的少量示例中推断出鹦鹉表情符号表示加法！

## 动态少量示例提示

有时您可能希望根据输入仅选择整体集合中的少量示例进行展示。为此，您可以用 `example_selector` 替换传递给 `FewShotChatMessagePromptTemplate` 的 `examples`。其他组件与上述相同！我们的动态少量示例提示模板如下所示：

- `example_selector`：负责为给定输入选择少量示例（以及返回的顺序）。这些实现了 [BaseExampleSelector](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector) 接口。一个常见的例子是基于向量存储的 [SemanticSimilarityExampleSelector](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector)
- `example_prompt`：通过其 [`format_messages`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) 方法将每个示例转换为 1 个或多个消息。一个常见的例子是将每个示例转换为一个人类消息和一个 AI 消息响应，或者一个人类消息后跟一个函数调用消息。

这些可以再次与其他消息和聊天模板组合，以组装您的最终提示。

让我们通过一个使用 `SemanticSimilarityExampleSelector` 的示例来演示。由于此实现使用向量存储根据语义相似性选择示例，我们首先需要填充存储。这里的基本思想是我们希望搜索并返回与文本输入最相似的示例，因此我们嵌入提示示例的 `values`，而不是考虑键：


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to use few shot examples in chat models"}, {"imported": "SemanticSimilarityExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html", "title": "How to use few shot examples in chat models"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use few shot examples in chat models"}]-->
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

examples = [
    {"input": "2 🦜 2", "output": "4"},
    {"input": "2 🦜 3", "output": "5"},
    {"input": "2 🦜 4", "output": "6"},
    {"input": "What did the cow say to the moon?", "output": "nothing at all"},
    {
        "input": "Write me a poem about the moon",
        "output": "One for the moon, and one for me, who are we to talk about the moon?",
    },
]

to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
```

### 创建 `example_selector`

创建了向量存储后，我们可以创建 `example_selector`。在这里，我们将单独调用它，并将 `k` 设置为仅获取与输入最接近的两个示例。


```python
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)

# The prompt template will load examples by passing the input do the `select_examples` method
example_selector.select_examples({"input": "horse"})
```



```output
[{'input': 'What did the cow say to the moon?', 'output': 'nothing at all'},
 {'input': '2 🦜 4', 'output': '6'}]
```


### 创建提示模板

我们现在组装提示模板，使用上面创建的 `example_selector`。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use few shot examples in chat models"}, {"imported": "FewShotChatMessagePromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html", "title": "How to use few shot examples in chat models"}]-->
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

# Define the few-shot prompt.
few_shot_prompt = FewShotChatMessagePromptTemplate(
    # The input variables select the values to pass to the example_selector
    input_variables=["input"],
    example_selector=example_selector,
    # Define how each example will be formatted.
    # In this case, each example will become 2 messages:
    # 1 human, and 1 AI
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    ),
)

print(few_shot_prompt.invoke(input="What's 3 🦜 3?").to_messages())
```
```output
[HumanMessage(content='2 🦜 3'), AIMessage(content='5'), HumanMessage(content='2 🦜 4'), AIMessage(content='6')]
```
我们可以将这个少量示例聊天消息提示模板传递到另一个聊天提示模板中：


```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

print(few_shot_prompt.invoke(input="What's 3 🦜 3?"))
```
```output
messages=[HumanMessage(content='2 🦜 3'), AIMessage(content='5'), HumanMessage(content='2 🦜 4'), AIMessage(content='6')]
```
### 与聊天模型一起使用

最后，您可以将模型连接到少量示例提示。


```python
chain = final_prompt | ChatOpenAI(model="gpt-4o-mini", temperature=0.0)

chain.invoke({"input": "What's 3 🦜 3?"})
```



```output
AIMessage(content='6', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 60, 'total_tokens': 61}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-d1863e5e-17cd-4e9d-bf7a-b9f118747a65-0', usage_metadata={'input_tokens': 60, 'output_tokens': 1, 'total_tokens': 61})
```


## 下一步

您现在已经学习了如何在聊天提示中添加少量示例。

接下来，请查看本节中关于提示词模板的其他使用手册，相关的关于[使用文本完成模型进行少量示例](/docs/how_to/few_shot_examples)的使用手册，或其他[示例选择器使用手册](/docs/how_to/example_selectors/)。
