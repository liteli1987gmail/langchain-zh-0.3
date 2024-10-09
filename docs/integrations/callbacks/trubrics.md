---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/trubrics.ipynb
---
# Trubrics


>[Trubrics](https://trubrics.com) 是一个大型语言模型用户分析平台，允许您收集、分析和管理用户
提示词和对AI模型的反馈。
>
>查看 [Trubrics 仓库](https://github.com/trubrics/trubrics-sdk) 以获取有关 `Trubrics` 的更多信息。

在本指南中，我们将介绍如何设置 `TrubricsCallbackHandler`。


## 安装和设置


```python
%pip install --upgrade --quiet  trubrics langchain langchain-community
```

### 获取 Trubrics 凭证

如果您没有 Trubrics 账户，请在 [这里](https://trubrics.streamlit.app/) 创建一个。在本教程中，我们将使用基于账户创建的 `default` 项目。

现在将您的凭证设置为环境变量：


```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```


```python
<!--IMPORTS:[{"imported": "TrubricsCallbackHandler", "source": "langchain_community.callbacks.trubrics_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.trubrics_callback.TrubricsCallbackHandler.html", "title": "Trubrics"}]-->
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### 用法

`TrubricsCallbackHandler` 可以接收各种可选参数。有关可以传递给 Trubrics 提示的 kwargs，请参见 [这里](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics)。

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.
    
    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## 示例

以下是如何使用 `TrubricsCallbackHandler` 与 Langchain [大型语言模型](/docs/how_to#llms) 或 [聊天模型](/docs/how_to#chat-models) 的两个示例。我们将使用 OpenAI 模型，因此在此设置您的 `OPENAI_API_KEY` 密钥：


```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. 使用 LLM


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Trubrics"}]-->
from langchain_openai import OpenAI
```


```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```
```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```
```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```
```output
--> GPT's joke:  

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:  

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```
### 2. 使用聊天模型


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Trubrics"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Trubrics"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Trubrics"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```


```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```


```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```
```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```
```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```