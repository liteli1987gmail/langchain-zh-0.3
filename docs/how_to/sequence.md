---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/sequence.ipynb
keywords: [Runnable, Runnables, RunnableSequence, LCEL, chain, chains, chaining]
---
# 如何链式运行可运行对象

:::info Prerequisites

本指南假设您熟悉以下概念：
- [LangChain表达式 (LCEL)](/docs/concepts/#langchain-expression-language)
- [提示词模板](/docs/concepts/#prompt-templates)
- [聊天模型](/docs/concepts/#chat-models)
- [输出解析器](/docs/concepts/#output-parsers)

:::

关于[LangChain表达式](/docs/concepts/#langchain-expression-language)的一点是，任何两个可运行对象可以“链式”组合成序列。前一个可运行对象的 `.invoke()` 调用的输出作为输入传递给下一个可运行对象。这可以使用管道操作符 (`|`) 或更明确的 `.pipe()` 方法来完成，二者效果相同。

生成的 [`RunnableSequence`](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableSequence.html) 本身就是一个可运行对象，这意味着它可以像其他任何可运行对象一样被调用、流式处理或进一步链式组合。以这种方式链式运行可运行对象的优点是高效的流式处理（序列会在输出可用时立即流式输出），以及使用像[LangSmith](/docs/how_to/debugging)这样的工具进行调试和追踪。

## 管道操作符: `|`

为了展示这个是如何工作的，让我们通过一个示例来演示。我们将走过LangChain中的一个常见模式：使用[提示词模板](/docs/how_to#prompt-templates)将输入格式化为[聊天模型](/docs/how_to#chat-models)，最后将聊天消息输出转换为字符串，使用[输出解析器](/docs/how_to#output-parsers)。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="model"
/>



```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to chain runnables"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to chain runnables"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")

chain = prompt | model | StrOutputParser()
```

提示和模型都是可运行的，提示调用的输出类型与聊天模型的输入类型相同，因此我们可以将它们链在一起。然后我们可以像调用其他可运行的那样调用结果序列：


```python
chain.invoke({"topic": "bears"})
```



```output
"Here's a bear joke for you:\n\nWhy did the bear dissolve in water?\nBecause it was a polar bear!"
```


### 强制转换

我们甚至可以将这个链与更多的可运行项结合起来，创建另一个链。这可能涉及使用其他类型的可运行项进行一些输入/输出格式化，具体取决于链组件所需的输入和输出。

例如，假设我们想将生成笑话的链与另一个链组合，该链评估生成的笑话是否有趣。

我们需要小心如何将输入格式化为下一个链。在下面的示例中，链中的字典会自动解析并转换为[`RunnableParallel`](/docs/how_to/parallel)，它并行运行所有值并返回一个包含结果的字典。

这恰好是下一个提示模板所期望的相同格式。以下是它的实际应用：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to chain runnables"}]-->
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("is this a funny joke? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()

composed_chain.invoke({"topic": "bears"})
```



```output
'Haha, that\'s a clever play on words! Using "polar" to imply the bear dissolved or became polar/polarized when put in water. Not the most hilarious joke ever, but it has a cute, groan-worthy pun that makes it mildly amusing. I appreciate a good pun or wordplay joke.'
```


函数也会被强制转换为可运行项，因此您也可以向链中添加自定义逻辑。下面的链产生与之前相同的逻辑流程：


```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)

composed_chain_with_lambda.invoke({"topic": "beets"})
```



```output
"Haha, that's a cute and punny joke! I like how it plays on the idea of beets blushing or turning red like someone blushing. Food puns can be quite amusing. While not a total knee-slapper, it's a light-hearted, groan-worthy dad joke that would make me chuckle and shake my head. Simple vegetable humor!"
```


然而，请记住，以这种方式使用函数可能会干扰流式处理等操作。有关更多信息，请参见[本节](/docs/how_to/functions)。

## `.pipe()` 方法

我们也可以使用`.pipe()`方法组合相同的序列。以下是它的样子：


```python
<!--IMPORTS:[{"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to chain runnables"}]-->
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)

composed_chain_with_pipe.invoke({"topic": "battlestar galactica"})
```



```output
"I cannot reproduce any copyrighted material verbatim, but I can try to analyze the humor in the joke you provided without quoting it directly.\n\nThe joke plays on the idea that the Cylon raiders, who are the antagonists in the Battlestar Galactica universe, failed to locate the human survivors after attacking their home planets (the Twelve Colonies) due to using an outdated and poorly performing operating system (Windows Vista) for their targeting systems.\n\nThe humor stems from the juxtaposition of a futuristic science fiction setting with a relatable real-world frustration – the use of buggy, slow, or unreliable software or technology. It pokes fun at the perceived inadequacies of Windows Vista, which was widely criticized for its performance issues and other problems when it was released.\n\nBy attributing the Cylons' failure to locate the humans to their use of Vista, the joke creates an amusing and unexpected connection between a fictional advanced race of robots and a familiar technological annoyance experienced by many people in the real world.\n\nOverall, the joke relies on incongruity and relatability to generate humor, but without reproducing any copyrighted material directly."
```


或者简写为：


```python
composed_chain_with_pipe = RunnableParallel({"joke": chain}).pipe(
    analysis_prompt, model, StrOutputParser()
)
```

## 相关

- [流式处理](/docs/how_to/streaming/): 查看流式处理指南以了解链的流式行为

