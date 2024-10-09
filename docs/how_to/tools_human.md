---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tools_human.ipynb
---
# 如何为工具添加人机协作

有些工具我们不信任模型单独执行。在这种情况下，我们可以在调用工具之前要求人类批准。

:::info

本使用手册展示了一种简单的方法，可以在Jupyter Notebook或终端中为代码运行添加人机协作。

要构建生产应用程序，您需要做更多工作以适当地跟踪应用程序状态。

我们建议使用 `langgraph` 来支持此功能。有关更多详细信息，请参见此 [指南](https://langchain-ai.github.io/langgraph/how-tos/human-in-the-loop/)。
:::


## 设置

我们需要安装以下软件包：


```python
%pip install --upgrade --quiet langchain
```

并设置这些环境变量：


```python
import getpass
import os

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 链

让我们创建一些简单的（虚拟）工具和一个工具调用链：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>



```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to add a human-in-the-loop for tools"}, {"imported": "Runnable", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html", "title": "How to add a human-in-the-loop for tools"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add a human-in-the-loop for tools"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to add a human-in-the-loop for tools"}]-->
from typing import Dict, List

from langchain_core.messages import AIMessage
from langchain_core.runnables import Runnable, RunnablePassthrough
from langchain_core.tools import tool


@tool
def count_emails(last_n_days: int) -> int:
    """Dummy function to count number of e-mails. Returns 2 * last_n_days."""
    return last_n_days * 2


@tool
def send_email(message: str, recipient: str) -> str:
    """Dummy function for sending an e-mail."""
    return f"Successfully sent email to {recipient}."


tools = [count_emails, send_email]
llm_with_tools = llm.bind_tools(tools)


def call_tools(msg: AIMessage) -> List[Dict]:
    """Simple sequential tool calling helper."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls


chain = llm_with_tools | call_tools
chain.invoke("how many emails did i get in the last 5 days?")
```



```output
[{'name': 'count_emails',
  'args': {'last_n_days': 5},
  'id': 'toolu_01QYZdJ4yPiqsdeENWHqioFW',
  'output': 10}]
```


## 添加人工审批

让我们在链中添加一个步骤，询问一个人是否批准或拒绝该调用请求。

在拒绝时，该步骤将引发异常，停止执行链的其余部分。


```python
import json


class NotApproved(Exception):
    """Custom exception."""


def human_approval(msg: AIMessage) -> AIMessage:
    """Responsible for passing through its input or raising an exception.

    Args:
        msg: output from the chat model

    Returns:
        msg: original output from the msg
    """
    tool_strs = "\n\n".join(
        json.dumps(tool_call, indent=2) for tool_call in msg.tool_calls
    )
    input_msg = (
        f"Do you approve of the following tool invocations\n\n{tool_strs}\n\n"
        "Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no.\n >>>"
    )
    resp = input(input_msg)
    if resp.lower() not in ("yes", "y"):
        raise NotApproved(f"Tool invocations not approved:\n\n{tool_strs}")
    return msg
```


```python
chain = llm_with_tools | human_approval | call_tools
chain.invoke("how many emails did i get in the last 5 days?")
```
```output
Do you approve of the following tool invocations

{
  "name": "count_emails",
  "args": {
    "last_n_days": 5
  },
  "id": "toolu_01WbD8XeMoQaRFtsZezfsHor"
}

Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no.
 >>> yes
```


```output
[{'name': 'count_emails',
  'args': {'last_n_days': 5},
  'id': 'toolu_01WbD8XeMoQaRFtsZezfsHor',
  'output': 10}]
```



```python
try:
    chain.invoke("Send sally@gmail.com an email saying 'What's up homie'")
except NotApproved as e:
    print()
    print(e)
```
```output
Do you approve of the following tool invocations

{
  "name": "send_email",
  "args": {
    "recipient": "sally@gmail.com",
    "message": "What's up homie"
  },
  "id": "toolu_014XccHFzBiVcc9GV1harV9U"
}

Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no.
 >>> no
``````output

Tool invocations not approved:

{
  "name": "send_email",
  "args": {
    "recipient": "sally@gmail.com",
    "message": "What's up homie"
  },
  "id": "toolu_014XccHFzBiVcc9GV1harV9U"
}
```