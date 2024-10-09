---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/gmail.ipynb
---
# Gmail 工具包

这将帮助您开始使用 GMail [工具包](/docs/concepts/#toolkits)。该工具包与 GMail API 交互，以读取消息、草拟和发送消息等。有关 GmailToolkit 所有功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.toolkit.GmailToolkit.html)。

## 设置

要使用此工具包，您需要设置在 [Gmail API 文档](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application) 中解释的凭据。下载 `credentials.json` 文件后，您可以开始使用 Gmail API。

### 安装

该工具包位于 `langchain-google-community` 包中。我们需要 `gmail` 附加功能：


```python
%pip install -qU langchain-google-community\[gmail\]
```

如果您想从单个工具的运行中获取自动跟踪，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

## 实例化

默认情况下，工具包会读取本地的 `credentials.json` 文件。您也可以手动提供一个 `Credentials` 对象。


```python
from langchain_google_community import GmailToolkit

toolkit = GmailToolkit()
```

### 自定义身份验证

在后台，使用以下方法创建一个 `googleapi` 资源。
您可以手动构建一个 `googleapi` 资源以获得更多的身份验证控制。


```python
from langchain_google_community.gmail.utils import (
    build_resource_service,
    get_gmail_credentials,
)

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```

## 工具

查看可用工具：


```python
tools = toolkit.get_tools()
tools
```



```output
[GmailCreateDraft(api_resource=<googleapiclient.discovery.Resource object at 0x1094509d0>),
 GmailSendMessage(api_resource=<googleapiclient.discovery.Resource object at 0x1094509d0>),
 GmailSearch(api_resource=<googleapiclient.discovery.Resource object at 0x1094509d0>),
 GmailGetMessage(api_resource=<googleapiclient.discovery.Resource object at 0x1094509d0>),
 GmailGetThread(api_resource=<googleapiclient.discovery.Resource object at 0x1094509d0>)]
```


- [GmailCreateDraft](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.create_draft.GmailCreateDraft.html)
- [GmailSendMessage](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.send_message.GmailSendMessage.html)
- [Gmail搜索](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.search.GmailSearch.html)
- [获取Gmail消息](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.get_message.GmailGetMessage.html)
- [获取Gmail线程](https://python.langchain.com/api_reference/google_community/gmail/langchain_google_community.gmail.get_thread.GmailGetThread.html)

## 在代理中使用

下面我们展示如何将工具包整合到一个[代理](/docs/tutorials/agents)中。

我们需要一个大型语言模型或聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />



```python
from langgraph.prebuilt import create_react_agent

agent_executor = create_react_agent(llm, tools)
```


```python
example_query = "Draft an email to fake@fake.com thanking them for coffee."

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    event["messages"][-1].pretty_print()
```
```output
================================[1m Human Message [0m=================================

Draft an email to fake@fake.com thanking them for coffee.
==================================[1m Ai Message [0m==================================
Tool Calls:
  create_gmail_draft (call_slGkYKZKA6h3Mf1CraUBzs6M)
 Call ID: call_slGkYKZKA6h3Mf1CraUBzs6M
  Args:
    message: Dear Fake,

I wanted to take a moment to thank you for the coffee yesterday. It was a pleasure catching up with you. Let's do it again soon!

Best regards,
[Your Name]
    to: ['fake@fake.com']
    subject: Thank You for the Coffee
=================================[1m Tool Message [0m=================================
Name: create_gmail_draft

Draft created. Draft Id: r-7233782721440261513
==================================[1m Ai Message [0m==================================

I have drafted an email to fake@fake.com thanking them for the coffee. You can review and send it from your email draft with the subject "Thank You for the Coffee".
```
## API参考

有关所有`GmailToolkit`功能和配置的详细文档，请访问[API参考](https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.gmail.toolkit.GmailToolkit.html)。


## 相关

- 工具[概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
