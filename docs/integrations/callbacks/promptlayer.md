---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/promptlayer.ipynb
---
# PromptLayer

>[PromptLayer](https://docs.promptlayer.com/introduction) 是一个用于提示工程的平台。它还帮助 LLM 可观察性，以可视化请求、版本提示和跟踪使用情况。
>
>虽然 `PromptLayer` 确实有与 LangChain 直接集成的 LLM（例如 [`PromptLayerOpenAI`](/docs/integrations/llms/promptlayer_openai)），但使用回调是将 `PromptLayer` 与 LangChain 集成的推荐方式。

在本指南中，我们将介绍如何设置 `PromptLayerCallbackHandler`。

有关更多信息，请参见 [PromptLayer 文档](https://docs.promptlayer.com/languages/langchain)。

## 安装和设置


```python
%pip install --upgrade --quiet  langchain-community promptlayer --upgrade
```

### 获取 API 凭证

如果您没有 PromptLayer 账户，请在 [promptlayer.com](https://www.promptlayer.com) 上创建一个。然后通过点击导航栏中的设置齿轮获取 API 密钥，并
将其设置为名为 `PROMPTLAYER_API_KEY` 的环境变量


## 使用方法

`PromptLayerCallbackHandler` 的入门相当简单，它接受两个可选参数：
1. `pl_tags` - 一个可选的字符串列表，将作为标签在 PromptLayer 上进行跟踪。
2. `pl_id_callback` - 一个可选的函数，将 `promptlayer_request_id` 作为参数。此 ID 可与 PromptLayer 的所有跟踪功能一起使用，以跟踪元数据、分数和提示使用情况。

## 简单的 OpenAI 示例

在这个简单的示例中，我们使用 `PromptLayerCallbackHandler` 与 `ChatOpenAI`。我们添加了一个名为 `chatopenai` 的 PromptLayer 标签


```python
<!--IMPORTS:[{"imported": "PromptLayerCallbackHandler", "source": "langchain_community.callbacks.promptlayer_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.promptlayer_callback.PromptLayerCallbackHandler.html", "title": "PromptLayer"}]-->
import promptlayer  # Don't forget this 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "PromptLayer"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "PromptLayer"}]-->
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## GPT4All 示例


```python
<!--IMPORTS:[{"imported": "GPT4All", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gpt4all.GPT4All.html", "title": "PromptLayer"}]-->
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## 完整功能示例

在这个示例中，我们解锁了更多 `PromptLayer` 的功能。

PromptLayer 允许您可视化创建、版本控制和跟踪提示词模板。使用 [提示注册表](https://docs.promptlayer.com/features/prompt-registry)，我们可以以编程方式获取名为 `example` 的提示词模板。

我们还定义了一个 `pl_id_callback` 函数，该函数接收 `promptlayer_request_id` 并记录分数、元数据以及链接所使用的提示词模板。有关跟踪的更多信息，请参阅 [我们的文档](https://docs.promptlayer.com/features/prompt-history/request-id)。


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "PromptLayer"}]-->
from langchain_openai import OpenAI


def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # score is an integer 0-100
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # metadata is a dictionary of key value pairs that is tracked on PromptLayer
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # link the request to a prompt template


openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

这就是所需的一切！设置完成后，您的所有请求将显示在 PromptLayer 仪表板上。
此回调也适用于在 LangChain 上实现的任何大型语言模型。
