---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/arthur_tracking.ipynb
---
# Arthur

>[Arthur](https://arthur.ai) 是一个模型监控和可观察性平台。

以下指南展示了如何使用 Arthur 回调处理程序运行注册的聊天大型语言模型，以自动记录模型推断到 Arthur。

如果您当前没有将模型接入 Arthur，请访问我们的 [生成文本模型接入指南](https://docs.arthur.ai/user-guide/walkthroughs/model-onboarding/generative_text_onboarding.html)。有关如何使用 `Arthur SDK` 的更多信息，请访问我们的 [文档](https://docs.arthur.ai/)。

## 安装和设置

在此处放置 Arthur 凭据


```python
arthur_url = "https://app.arthur.ai"
arthur_login = "your-arthur-login-username-here"
arthur_model_id = "your-arthur-model-id-here"
```

## 回调处理器


```python
<!--IMPORTS:[{"imported": "ArthurCallbackHandler", "source": "langchain_community.callbacks", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.arthur_callback.ArthurCallbackHandler.html", "title": "Arthur"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Arthur"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Arthur"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Arthur"}]-->
from langchain_community.callbacks import ArthurCallbackHandler
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
```

使用 Arthur 回调处理器创建 LangChain LLM


```python
def make_langchain_chat_llm():
    return ChatOpenAI(
        streaming=True,
        temperature=0.1,
        callbacks=[
            StreamingStdOutCallbackHandler(),
            ArthurCallbackHandler.from_credentials(
                arthur_model_id, arthur_url=arthur_url, arthur_login=arthur_login
            ),
        ],
    )
```


```python
chatgpt = make_langchain_chat_llm()
```
```output
Please enter password for admin: ········
```
使用此 `run` 函数运行聊天 LLM 将会在一个持续的列表中保存聊天历史，以便对话可以引用早期消息，并将每个响应记录到 Arthur 平台。您可以在您的 [模型仪表板页面](https://app.arthur.ai/) 查看该模型的推理历史。

输入 `q` 以退出运行循环


```python
def run(llm):
    history = []
    while True:
        user_input = input("\n>>> input >>>\n>>>: ")
        if user_input == "q":
            break
        history.append(HumanMessage(content=user_input))
        history.append(llm(history))
```


```python
run(chatgpt)
```
```output

>>> input >>>
>>>: What is a callback handler?
A callback handler, also known as a callback function or callback method, is a piece of code that is executed in response to a specific event or condition. It is commonly used in programming languages that support event-driven or asynchronous programming paradigms.

The purpose of a callback handler is to provide a way for developers to define custom behavior that should be executed when a certain event occurs. Instead of waiting for a result or blocking the execution, the program registers a callback function and continues with other tasks. When the event is triggered, the callback function is invoked, allowing the program to respond accordingly.

Callback handlers are commonly used in various scenarios, such as handling user input, responding to network requests, processing asynchronous operations, and implementing event-driven architectures. They provide a flexible and modular way to handle events and decouple different components of a system.
>>> input >>>
>>>: What do I need to do to get the full benefits of this
To get the full benefits of using a callback handler, you should consider the following:

1. Understand the event or condition: Identify the specific event or condition that you want to respond to with a callback handler. This could be user input, network requests, or any other asynchronous operation.

2. Define the callback function: Create a function that will be executed when the event or condition occurs. This function should contain the desired behavior or actions you want to take in response to the event.

3. Register the callback function: Depending on the programming language or framework you are using, you may need to register or attach the callback function to the appropriate event or condition. This ensures that the callback function is invoked when the event occurs.

4. Handle the callback: Implement the necessary logic within the callback function to handle the event or condition. This could involve updating the user interface, processing data, making further requests, or triggering other actions.

5. Consider error handling: It's important to handle any potential errors or exceptions that may occur within the callback function. This ensures that your program can gracefully handle unexpected situations and prevent crashes or undesired behavior.

6. Maintain code readability and modularity: As your codebase grows, it's crucial to keep your callback handlers organized and maintainable. Consider using design patterns or architectural principles to structure your code in a modular and scalable way.

By following these steps, you can leverage the benefits of callback handlers, such as asynchronous and event-driven programming, improved responsiveness, and modular code design.
>>> input >>>
>>>: q
```