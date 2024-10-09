---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/connery.ipynb
---
# Connery 工具包和工具

使用 Connery 工具包和工具，您可以将 Connery 动作集成到您的 LangChain 代理中。

## 什么是 Connery？

Connery 是一个开源的 AI 插件基础设施。

使用 Connery，您可以轻松创建自定义插件，包含一组动作，并将其无缝集成到您的 LangChain 代理中。
Connery 将处理关键方面，如运行时、授权、秘密管理、访问管理、审计日志和其他重要功能。

此外，Connery 在我们社区的支持下，提供了多种现成的开源插件，以便于使用。

了解更多关于 Connery 的信息：

- GitHub: https://github.com/connery-io/connery
- 文档: https://docs.connery.io

## 设置

### 安装

您需要安装 `langchain_community` 包才能使用 Connery 工具。


```python
%pip install -qU langchain-community
```

### 凭证

要在您的 LangChain 代理中使用 Connery Actions，您需要做一些准备：

1. 使用 [快速入门](https://docs.connery.io/docs/runner/quick-start/) 指南设置 Connery 运行器。
2. 安装您希望在代理中使用的所有插件及其操作。
3. 设置环境变量 `CONNERY_RUNNER_URL` 和 `CONNERY_RUNNER_API_KEY`，以便工具包可以与 Connery 运行器进行通信。


```python
import getpass
import os

for key in ["CONNERY_RUNNER_URL", "CONNERY_RUNNER_API_KEY"]:
    if key not in os.environ:
        os.environ[key] = getpass.getpass(f"Please enter the value for {key}: ")
```

## 工具包

在下面的示例中，我们创建一个代理，使用两个 Connery Actions 来总结一个公共网页并通过电子邮件发送摘要：

1. 来自 [Summarization](https://github.com/connery-io/summarization-plugin) 插件的 **总结公共网页** 操作。
2. 来自 [Gmail](https://github.com/connery-io/gmail) 插件的 **发送电子邮件** 操作。

您可以在 [这里](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r) 查看此示例的 LangSmith 跟踪。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Connery Toolkit and Tools"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Connery Toolkit and Tools"}, {"imported": "ConneryToolkit", "source": "langchain_community.agent_toolkits.connery", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.connery.toolkit.ConneryToolkit.html", "title": "Connery Toolkit and Tools"}, {"imported": "ConneryService", "source": "langchain_community.tools.connery", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.connery.service.ConneryService.html", "title": "Connery Toolkit and Tools"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Connery Toolkit and Tools"}]-->
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```
注意：Connery Action 是一个结构化工具，因此您只能在支持结构化工具的代理中使用它。

## 工具


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Connery Toolkit and Tools"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Connery Toolkit and Tools"}, {"imported": "ConneryService", "source": "langchain_community.tools.connery", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.connery.service.ConneryService.html", "title": "Connery Toolkit and Tools"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Connery Toolkit and Tools"}]-->
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

手动运行该操作。


```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

使用 OpenAI Functions 代理运行该操作。

您可以在 [这里](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r) 查看此示例的 LangSmith 跟踪。


```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```
注意：Connery Action 是一个结构化工具，因此您只能在支持结构化工具的代理中使用它。

## API 参考

有关所有 Connery 功能和配置的详细文档，请访问 API 参考：

- 工具包：https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.connery.toolkit.ConneryToolkit.html
- 工具：https://python.langchain.com/api_reference/community/tools/langchain_community.tools.connery.service.ConneryService.html


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
