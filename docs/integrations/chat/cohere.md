---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/cohere.ipynb
sidebar_label: Cohere
---
# Cohere

本笔记本介绍如何开始使用[Cohere聊天模型](https://cohere.com/chat)。

前往[API参考](https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.cohere.ChatCohere.html)以获取所有属性和方法的详细文档。

## 设置

集成位于`langchain-cohere`包中。我们可以通过以下方式安装这些：

```bash
pip install -U langchain-cohere
```

我们还需要获取一个 [Cohere API 密钥](https://cohere.com/) 并设置 `COHERE_API_KEY` 环境变量：


```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

设置 [LangSmith](https://smith.langchain.com/) 以获得最佳的可观察性也是有帮助的（但不是必需的）


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 用法

ChatCohere 支持所有 [聊天模型](/docs/how_to#chat-models) 功能：


```python
<!--IMPORTS:[{"imported": "ChatCohere", "source": "langchain_cohere", "docs": "https://python.langchain.com/api_reference/cohere/chat_models/langchain_cohere.chat_models.ChatCohere.html", "title": "Cohere"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Cohere"}]-->
from langchain_cohere import ChatCohere
from langchain_core.messages import HumanMessage
```


```python
chat = ChatCohere()
```


```python
messages = [HumanMessage(content="1"), HumanMessage(content="2 3")]
chat.invoke(messages)
```



```output
AIMessage(content='4 && 5 \n6 || 7 \n\nWould you like to play a game of odds and evens?', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '2076b614-52b3-4082-a259-cc92cd3d9fea', 'token_count': {'prompt_tokens': 68, 'response_tokens': 23, 'total_tokens': 91, 'billed_tokens': 77}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '2076b614-52b3-4082-a259-cc92cd3d9fea', 'token_count': {'prompt_tokens': 68, 'response_tokens': 23, 'total_tokens': 91, 'billed_tokens': 77}}, id='run-3475e0c8-c89b-4937-9300-e07d652455e1-0')
```



```python
await chat.ainvoke(messages)
```



```output
AIMessage(content='4 && 5', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': 'f0708a92-f874-46ee-9b93-334d616ad92e', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': 'f0708a92-f874-46ee-9b93-334d616ad92e', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, id='run-1635e63e-2994-4e7f-986e-152ddfc95777-0')
```



```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```
```output
4 && 5
```

```python
chat.batch([messages])
```



```output
[AIMessage(content='4 && 5', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6770ca86-f6c3-4ba3-a285-c4772160612f', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6770ca86-f6c3-4ba3-a285-c4772160612f', 'token_count': {'prompt_tokens': 68, 'response_tokens': 3, 'total_tokens': 71, 'billed_tokens': 57}}, id='run-8d6fade2-1b39-4e31-ab23-4be622dd0027-0')]
```


## 链接

您还可以轻松地与提示词模板结合，以便于用户输入的结构化。我们可以使用 [LCEL](/docs/concepts#langchain-expression-language-lcel) 来做到这一点


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Cohere"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat
```


```python
chain.invoke({"topic": "bears"})
```



```output
AIMessage(content='What color socks do bears wear?\n\nThey don’t wear socks, they have bear feet. \n\nHope you laughed! If not, maybe this will help: laughter is the best medicine, and a good sense of humor is infectious!', additional_kwargs={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6edccf44-9bc8-4139-b30e-13b368f3563c', 'token_count': {'prompt_tokens': 68, 'response_tokens': 51, 'total_tokens': 119, 'billed_tokens': 108}}, response_metadata={'documents': None, 'citations': None, 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '6edccf44-9bc8-4139-b30e-13b368f3563c', 'token_count': {'prompt_tokens': 68, 'response_tokens': 51, 'total_tokens': 119, 'billed_tokens': 108}}, id='run-ef7f9789-0d4d-43bf-a4f7-f2a0e27a5320-0')
```


## 工具调用

Cohere 支持工具调用功能！


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Cohere"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "Cohere"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "Cohere"}]-->
from langchain_core.messages import (
    HumanMessage,
    ToolMessage,
)
from langchain_core.tools import tool
```


```python
@tool
def magic_function(number: int) -> int:
    """Applies a magic operation to an integer
    Args:
        number: Number to have magic operation performed on
    """
    return number + 10


def invoke_tools(tool_calls, messages):
    for tool_call in tool_calls:
        selected_tool = {"magic_function": magic_function}[tool_call["name"].lower()]
        tool_output = selected_tool.invoke(tool_call["args"])
        messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))
    return messages


tools = [magic_function]
```


```python
llm_with_tools = chat.bind_tools(tools=tools)
messages = [HumanMessage(content="What is the value of magic_function(2)?")]
```


```python
res = llm_with_tools.invoke(messages)
while res.tool_calls:
    messages.append(res)
    messages = invoke_tools(res.tool_calls, messages)
    res = llm_with_tools.invoke(messages)

res
```



```output
AIMessage(content='The value of magic_function(2) is 12.', additional_kwargs={'documents': [{'id': 'magic_function:0:2:0', 'output': '12', 'tool_name': 'magic_function'}], 'citations': [ChatCitation(start=34, end=36, text='12', document_ids=['magic_function:0:2:0'])], 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '96a55791-0c58-4e2e-bc2a-8550e137c46d', 'token_count': {'input_tokens': 998, 'output_tokens': 59}}, response_metadata={'documents': [{'id': 'magic_function:0:2:0', 'output': '12', 'tool_name': 'magic_function'}], 'citations': [ChatCitation(start=34, end=36, text='12', document_ids=['magic_function:0:2:0'])], 'search_results': None, 'search_queries': None, 'is_search_required': None, 'generation_id': '96a55791-0c58-4e2e-bc2a-8550e137c46d', 'token_count': {'input_tokens': 998, 'output_tokens': 59}}, id='run-f318a9cf-55c8-44f4-91d1-27cf46c6a465-0')
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
