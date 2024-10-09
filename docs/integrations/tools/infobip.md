---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/infobip.ipynb
---
# Infobip
本笔记本展示了如何使用 [Infobip](https://www.infobip.com/) API 封装来发送短信和电子邮件。

Infobip 提供了许多服务，但本笔记本将重点关注短信和电子邮件服务。您可以在 [这里](https://www.infobip.com/docs/api) 找到有关 API 和其他渠道的更多信息。

## 设置

要使用此工具，您需要拥有一个 Infobip 账户。您可以创建 [免费试用账户](https://www.infobip.com/docs/essentials/free-trial)。


`InfobipAPIWrapper` 使用命名参数，您可以提供凭据：

- `infobip_api_key` - [API 密钥](https://www.infobip.com/docs/essentials/api-authentication#api-key-header)，您可以在 [开发者工具](https://portal.infobip.com/dev/api-keys) 中找到。
- `infobip_base_url` - [基础 URL](https://www.infobip.com/docs/essentials/base-url) 用于 Infobip API。您可以使用默认值 `https://api.infobip.com/`。

您还可以将 `infobip_api_key` 和 `infobip_base_url` 作为环境变量 `INFOBIP_API_KEY` 和 `INFOBIP_BASE_URL` 提供。

## 发送短信


```python
<!--IMPORTS:[{"imported": "InfobipAPIWrapper", "source": "langchain_community.utilities.infobip", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.infobip.InfobipAPIWrapper.html", "title": "Infobip"}]-->
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="41793026727",
    text="Hello, World!",
    sender="Langchain",
    channel="sms",
)
```

## 发送电子邮件


```python
<!--IMPORTS:[{"imported": "InfobipAPIWrapper", "source": "langchain_community.utilities.infobip", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.infobip.InfobipAPIWrapper.html", "title": "Infobip"}]-->
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="test@example.com",
    sender="test@example.com",
    subject="example",
    body="example",
    channel="email",
)
```

# 如何在代理中使用它


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Infobip"}, {"imported": "create_openai_functions_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_functions_agent.base.create_openai_functions_agent.html", "title": "Infobip"}, {"imported": "InfobipAPIWrapper", "source": "langchain_community.utilities.infobip", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.infobip.InfobipAPIWrapper.html", "title": "Infobip"}, {"imported": "StructuredTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.structured.StructuredTool.html", "title": "Infobip"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Infobip"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.utilities.infobip import InfobipAPIWrapper
from langchain_core.tools import StructuredTool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

instructions = "You are a coding teacher. You are teaching a student how to code. The student asks you a question. You answer the question."
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
llm = ChatOpenAI(temperature=0)


class EmailInput(BaseModel):
    body: str = Field(description="Email body text")
    to: str = Field(description="Email address to send to. Example: email@example.com")
    sender: str = Field(
        description="Email address to send from, must be 'validemail@example.com'"
    )
    subject: str = Field(description="Email subject")
    channel: str = Field(description="Email channel, must be 'email'")


infobip_api_wrapper: InfobipAPIWrapper = InfobipAPIWrapper()
infobip_tool = StructuredTool.from_function(
    name="infobip_email",
    description="Send Email via Infobip. If you need to send email, use infobip_email",
    func=infobip_api_wrapper.run,
    args_schema=EmailInput,
)
tools = [infobip_tool]

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)

agent_executor.invoke(
    {
        "input": "Hi, can you please send me an example of Python recursion to my email email@example.com"
    }
)
```

```bash
> Entering new AgentExecutor chain...

Invoking: `infobip_email` with `{'body': 'Hi,\n\nHere is a simple example of a recursive function in Python:\n\n```\ndef factorial(n):\n    if n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```\n\nThis function calculates the factorial of a number. The factorial of a number is the product of all positive integers less than or equal to that number. The function calls itself with a smaller argument until it reaches the base case where n equals 1.\n\nBest,\nCoding Teacher', 'to': 'email@example.com', 'sender': 'validemail@example.com', 'subject': 'Python Recursion Example', 'channel': 'email'}`


I have sent an example of Python recursion to your email. Please check your inbox.

> Finished chain.
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
