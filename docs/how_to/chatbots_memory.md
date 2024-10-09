---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/chatbots_memory.ipynb
sidebar_position: 1
---
# 如何为聊天机器人添加记忆

聊天机器人的一个关键特性是它们能够使用之前对话轮次的内容作为上下文。这种状态管理可以采取几种形式，包括：

- 直接将之前的消息塞入聊天模型提示中。
- 上述方法，但修剪旧消息以减少模型需要处理的干扰信息量。
- 更复杂的修改，例如为长时间运行的对话合成摘要。

我们将在下面详细介绍几种技术！

## 设置

您需要安装一些软件包，并将您的 OpenAI API 密钥设置为名为 `OPENAI_API_KEY` 的环境变量：


```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```
```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```


```output
True
```


让我们设置一个聊天模型，用于下面的示例。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add memory to chatbots"}]-->
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4o-mini")
```

## 消息传递

最简单的记忆形式就是将聊天历史消息传递到链中。以下是一个示例：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add memory to chatbots"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        ("placeholder", "{messages}"),
    ]
)

chain = prompt | chat

ai_msg = chain.invoke(
    {
        "messages": [
            (
                "human",
                "Translate this sentence from English to French: I love programming.",
            ),
            ("ai", "J'adore la programmation."),
            ("human", "What did you just say?"),
        ],
    }
)
print(ai_msg.content)
```
```output
I said "J'adore la programmation," which means "I love programming" in French.
```
我们可以看到，通过将之前的对话传递到链中，它可以将其作为上下文来回答问题。这是聊天机器人记忆的基本概念 - 本指南的其余部分将演示传递或重新格式化消息的便捷技术。

## 聊天历史

直接将消息作为数组存储和传递是完全可以的，但我们也可以使用LangChain内置的[消息历史类](https://python.langchain.com/api_reference/langchain/index.html#module-langchain.memory)来存储和加载消息。该类的实例负责从持久存储中存储和加载聊天消息。LangChain与许多提供商集成 - 你可以在这里查看[集成列表](/docs/integrations/memory) - 但在这个演示中，我们将使用一个临时演示类。

以下是API的示例：


```python
<!--IMPORTS:[{"imported": "ChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.ChatMessageHistory.html", "title": "How to add memory to chatbots"}]-->
from langchain_community.chat_message_histories import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```



```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```


我们可以直接使用它来存储我们链中的对话轮次：


```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```



```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.', response_metadata={'token_usage': {'completion_tokens': 18, 'prompt_tokens': 61, 'total_tokens': 79}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-5cbb21c2-9c30-4031-8ea8-bfc497989535-0', usage_metadata={'input_tokens': 61, 'output_tokens': 18, 'total_tokens': 79})
```


## 自动历史管理

之前的示例显式地将消息传递给链。这是一种完全可接受的方法，但确实需要对新消息进行外部管理。LangChain还包括一个可以自动处理此过程的LCEL链的包装器，称为`RunnableWithMessageHistory`。

为了演示它是如何工作的，让我们稍微修改一下上面的提示，以便在聊天历史之后获取一个最终的 `input` 变量，该变量填充一个 `HumanMessage` 模板。这意味着我们将期望一个 `chat_history` 参数，该参数包含当前消息之前的所有消息，而不是所有消息：


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

我们将在这里将最新的输入传递给对话，并让 `RunnableWithMessageHistory` 类包装我们的链，并完成将该 `input` 变量附加到聊天历史的工作。
 
接下来，让我们声明我们的包装链：


```python
<!--IMPORTS:[{"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "How to add memory to chatbots"}]-->
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

这个类除了我们想要包装的链之外，还接受一些参数：

- 一个工厂函数，它返回给定会话 ID 的消息历史。这允许您的链同时处理多个用户，通过为不同的对话加载不同的消息。
- 一个 `input_messages_key`，指定输入的哪个部分应该被跟踪并存储在聊天历史中。在这个例子中，我们想要跟踪作为 `input` 传入的字符串。
- 一个 `history_messages_key`，指定之前的消息应该以什么形式注入到提示中。我们的提示有一个名为 `chat_history` 的 `MessagesPlaceholder`，因此我们指定这个属性以匹配。
- （对于具有多个输出的链）一个 `output_messages_key`，指定哪个输出应存储为历史。这是 `input_messages_key` 的逆。

我们可以像往常一样调用这个新链，增加一个 `configurable` 字段，指定要传递给工厂函数的特定 `session_id`。在演示中未使用，但在实际的链中，您会希望返回与传递的会话对应的聊天历史：


```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```
```output
Parent run dc4e2f79-4bcd-4a36-9506-55ace9040588 not found for run 34b5773e-3ced-46a6-8daf-4d464c15c940. Treating as a root run.
```


```output
AIMessage(content='"J\'adore la programmation."', response_metadata={'token_usage': {'completion_tokens': 9, 'prompt_tokens': 39, 'total_tokens': 48}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-648b0822-b0bb-47a2-8e7d-7d34744be8f2-0', usage_metadata={'input_tokens': 39, 'output_tokens': 9, 'total_tokens': 48})
```



```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```
```output
Parent run cc14b9d8-c59e-40db-a523-d6ab3fc2fa4f not found for run 5b75e25c-131e-46ee-9982-68569db04330. Treating as a root run.
```


```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.', response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 63, 'total_tokens': 80}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-5950435c-1dc2-43a6-836f-f989fd62c95e-0', usage_metadata={'input_tokens': 63, 'output_tokens': 17, 'total_tokens': 80})
```


## 修改聊天历史

修改存储的聊天消息可以帮助您的聊天机器人处理各种情况。以下是一些示例：

### 修剪消息

大型语言模型和聊天模型的上下文窗口有限，即使您没有直接达到限制，您可能也希望限制模型需要处理的干扰量。一个解决方案是在将历史消息传递给模型之前修剪它们。让我们使用一个包含一些预加载消息的示例历史：


```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```



```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```


让我们使用上面声明的 `RunnableWithMessageHistory` 链的消息历史：


```python
chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```
```output
Parent run 7ff2d8ec-65e2-4f67-8961-e498e2c4a591 not found for run 3881e990-6596-4326-84f6-2b76949e0657. Treating as a root run.
```


```output
AIMessage(content='Your name is Nemo.', response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 66, 'total_tokens': 72}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-f8aabef8-631a-4238-a39b-701e881fbe47-0', usage_metadata={'input_tokens': 66, 'output_tokens': 6, 'total_tokens': 72})
```


我们可以看到链记住了预加载的名称。

但假设我们有一个非常小的上下文窗口，我们希望将传递给链的消息数量修剪为仅最近的两个。我们可以使用内置的 [trim_messages](/docs/how_to/trim_messages/) 工具，根据消息的令牌计数在到达提示之前修剪消息。在这种情况下，我们将每条消息计为 1 个“令牌”，并仅保留最后两条消息：


```python
<!--IMPORTS:[{"imported": "trim_messages", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.trim_messages.html", "title": "How to add memory to chatbots"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add memory to chatbots"}]-->
from operator import itemgetter

from langchain_core.messages import trim_messages
from langchain_core.runnables import RunnablePassthrough

trimmer = trim_messages(strategy="last", max_tokens=2, token_counter=len)

chain_with_trimming = (
    RunnablePassthrough.assign(chat_history=itemgetter("chat_history") | trimmer)
    | prompt
    | chat
)

chain_with_trimmed_history = RunnableWithMessageHistory(
    chain_with_trimming,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

让我们调用这个新链并检查之后的消息：


```python
chain_with_trimmed_history.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```
```output
Parent run 775cde65-8d22-4c44-80bb-f0b9811c32ca not found for run 5cf71d0e-4663-41cd-8dbe-e9752689cfac. Treating as a root run.
```


```output
AIMessage(content='P. Sherman is a fictional character from the animated movie "Finding Nemo" who lives at 42 Wallaby Way, Sydney.', response_metadata={'token_usage': {'completion_tokens': 27, 'prompt_tokens': 53, 'total_tokens': 80}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-5642ef3a-fdbe-43cf-a575-d1785976a1b9-0', usage_metadata={'input_tokens': 53, 'output_tokens': 27, 'total_tokens': 80})
```



```python
demo_ephemeral_chat_history.messages
```



```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!'),
 HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.', response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 66, 'total_tokens': 72}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-f8aabef8-631a-4238-a39b-701e881fbe47-0', usage_metadata={'input_tokens': 66, 'output_tokens': 6, 'total_tokens': 72}),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content='P. Sherman is a fictional character from the animated movie "Finding Nemo" who lives at 42 Wallaby Way, Sydney.', response_metadata={'token_usage': {'completion_tokens': 27, 'prompt_tokens': 53, 'total_tokens': 80}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-5642ef3a-fdbe-43cf-a575-d1785976a1b9-0', usage_metadata={'input_tokens': 53, 'output_tokens': 27, 'total_tokens': 80})]
```


我们可以看到我们的历史已删除了两条最旧的消息，同时仍在末尾添加了最近的对话。下次调用链时，`trim_messages` 将再次被调用，只有最近的两条消息将被传递给模型。在这种情况下，这意味着模型将在下次调用时忘记我们给它的名称：


```python
chain_with_trimmed_history.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```
```output
Parent run fde7123f-6fd3-421a-a3fc-2fb37dead119 not found for run 061a4563-2394-470d-a3ed-9bf1388ca431. Treating as a root run.
```


```output
AIMessage(content="I'm sorry, but I don't have access to your personal information, so I don't know your name. How else may I assist you today?", response_metadata={'token_usage': {'completion_tokens': 31, 'prompt_tokens': 74, 'total_tokens': 105}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-0ab03495-1f7c-4151-9070-56d2d1c565ff-0', usage_metadata={'input_tokens': 74, 'output_tokens': 31, 'total_tokens': 105})
```


查看我们的 [修剪消息指南](/docs/how_to/trim_messages/) 以获取更多信息。

### 摘要记忆

我们也可以以其他方式使用这种模式。例如，我们可以使用额外的LLM调用在调用我们的链之前生成对话的摘要。让我们重建我们的聊天历史和聊天机器人链：


```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```



```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```


我们将稍微修改提示，以使LLM意识到将接收到一个简化的摘要，而不是聊天历史：


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        ("placeholder", "{chat_history}"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

现在，让我们创建一个函数，将之前的交互提炼成摘要。我们也可以将这个添加到链的前面：


```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            ("placeholder", "{chat_history}"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

让我们看看它是否记得我们给它的名字：


```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```



```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```



```python
demo_ephemeral_chat_history.messages
```



```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```


请注意，再次调用链将生成另一个摘要，该摘要是从初始摘要加上新消息生成的。您还可以设计一种混合方法，其中保留一定数量的消息在聊天历史中，而其他消息则被总结。
