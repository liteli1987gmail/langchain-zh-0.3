---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/slack.ipynb
---
# Slack 工具包

这将帮助您开始使用 Slack [工具包](/docs/concepts/#toolkits)。有关所有 Slack 工具包功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.slack.toolkit.SlackToolkit.html)。

## 设置

要使用此工具包，您需要按照 [Slack API 文档](https://api.slack.com/tutorials/tracks/getting-a-token) 中的说明获取一个令牌。一旦您收到 SLACK_USER_TOKEN，您可以在下面作为环境变量输入。


```python
import getpass
import os

if not os.getenv("SLACK_USER_TOKEN"):
    os.environ["SLACK_USER_TOKEN"] = getpass.getpass("Enter your Slack user token: ")
```

如果您想从单个工具的运行中获取自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

该工具包位于 `langchain-community` 包中。我们还需要 Slack SDK：


```python
%pip install -qU langchain-community slack_sdk
```

可选地，我们可以安装 beautifulsoup4 来帮助解析 HTML 消息：


```python
%pip install -qU beautifulsoup4 # This is optional but is useful for parsing HTML messages
```

## 实例化

现在我们可以实例化我们的工具包：


```python
<!--IMPORTS:[{"imported": "SlackToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.slack.toolkit.SlackToolkit.html", "title": "Slack Toolkit"}]-->
from langchain_community.agent_toolkits import SlackToolkit

toolkit = SlackToolkit()
```

## 工具

查看可用工具：


```python
tools = toolkit.get_tools()

tools
```



```output
[SlackGetChannel(client=<slack_sdk.web.client.WebClient object at 0x113caa8c0>),
 SlackGetMessage(client=<slack_sdk.web.client.WebClient object at 0x113caa4d0>),
 SlackScheduleMessage(client=<slack_sdk.web.client.WebClient object at 0x113caa440>),
 SlackSendMessage(client=<slack_sdk.web.client.WebClient object at 0x113caa410>)]
```


该工具包加载：

- [SlackGetChannel](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.slack.get_channel.SlackGetChannel.html)
- [Slack获取消息](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.slack.get_message.SlackGetMessage.html)
- [Slack安排消息](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.slack.schedule_message.SlackScheduleMessage.html)
- [Slack发送消息](https://python.langchain.com/api_reference/community/tools/langchain_community.tools.slack.send_message.SlackSendMessage.html)

## 在代理中使用

让我们为代理配备Slack工具包，并查询有关频道的信息。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Slack Toolkit"}]-->
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

llm = ChatOpenAI(model="gpt-4o-mini")

agent_executor = create_react_agent(llm, tools)
```


```python
example_query = "When was the #general channel created?"

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    message = event["messages"][-1]
    if message.type != "tool":  # mask sensitive information
        event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

When was the #general channel created?
==================================[1m Ai Message [0m==================================
Tool Calls:
  get_channelid_name_dict (call_NXDkALjoOx97uF1v0CoZTqtJ)
 Call ID: call_NXDkALjoOx97uF1v0CoZTqtJ
  Args:
==================================[1m Ai Message [0m==================================

The #general channel was created on timestamp 1671043305.
```

```python
example_query = "Send a friendly greeting to channel C072Q1LP4QM."

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    message = event["messages"][-1]
    if message.type != "tool":  # mask sensitive information
        event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

Send a friendly greeting to channel C072Q1LP4QM.
==================================[1m Ai Message [0m==================================
Tool Calls:
  send_message (call_xQxpv4wFeAZNZgSBJRIuaizi)
 Call ID: call_xQxpv4wFeAZNZgSBJRIuaizi
  Args:
    message: Hello! Have a great day!
    channel: C072Q1LP4QM
==================================[1m Ai Message [0m==================================

I have sent a friendly greeting to the channel C072Q1LP4QM.
```
## API参考

有关所有`SlackToolkit`功能和配置的详细文档，请访问[API参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.slack.toolkit.SlackToolkit.html)。


## 相关

- 工具[概念指南](/docs/concepts/#tools)
- 工具[使用指南](/docs/how_to/#tools)
