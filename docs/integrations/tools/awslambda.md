---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/awslambda.ipynb
---
# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/) 是由 `Amazon Web Services` (`AWS`) 提供的无服务器计算服务。它帮助开发者构建和运行应用程序和服务，而无需配置或管理服务器。这种无服务器架构使您能够专注于编写和部署代码，同时 AWS 自动处理扩展、修补和管理运行应用程序所需的基础设施。

本笔记本介绍了如何使用 `AWS Lambda` 工具。

通过将 `AWS Lambda` 包含在提供给代理的工具列表中，您可以授予代理调用在 AWS 云中运行的代码的能力，以满足您的各种需求。

当代理使用 `AWS Lambda` 工具时，它将提供一个字符串类型的参数，该参数将通过事件参数传递给 Lambda 函数。

首先，您需要安装 `boto3` python 包。


```python
%pip install --upgrade --quiet  boto3 > /dev/null
%pip install --upgrade --quiet langchain-community
```

为了让代理使用该工具，您必须提供与您lambda函数逻辑功能相匹配的名称和描述。

您还必须提供函数的名称。

请注意，由于该工具实际上只是boto3库的一个包装，您需要运行`aws configure`才能使用该工具。有关更多详细信息，请参见[这里](https://docs.aws.amazon.com/cli/index.html)。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "AWS Lambda"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "AWS Lambda"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "AWS Lambda"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "AWS Lambda"}]-->
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
