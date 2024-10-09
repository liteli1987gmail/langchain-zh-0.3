---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/gmail.ipynb
---
# GMail

该加载器介绍了如何从GMail加载数据。您可能希望从GMail加载数据的方式有很多种。该加载器目前在如何做到这一点上有明确的意见。它的做法是首先查找您发送的所有消息。然后查找您回复的先前电子邮件的消息。接着获取那封先前的电子邮件，并创建该电子邮件的训练示例，后面跟着您的电子邮件。

请注意，这里有明显的限制。例如，所有创建的示例仅查看先前电子邮件的上下文。

使用方法：

- 设置一个Google开发者账户：访问Google开发者控制台，创建一个项目，并为该项目启用Gmail API。这将为您提供一个credentials.json文件，您稍后需要它。

- 安装Google客户端库：运行以下命令以安装Google客户端库：


```python
%pip install --upgrade --quiet  google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```


```python
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


creds = None
# The file token.json stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists("email_token.json"):
    creds = Credentials.from_authorized_user_file("email_token.json", SCOPES)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            # your creds file here. Please create json file as here https://cloud.google.com/docs/authentication/getting-started
            "creds.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("email_token.json", "w") as token:
        token.write(creds.to_json())
```


```python
<!--IMPORTS:[{"imported": "GMailLoader", "source": "langchain_community.chat_loaders.gmail", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.gmail.GMailLoader.html", "title": "GMail"}]-->
from langchain_community.chat_loaders.gmail import GMailLoader
```


```python
loader = GMailLoader(creds=creds, n=3)
```


```python
data = loader.load()
```


```python
# Sometimes there can be errors which we silently ignore
len(data)
```



```output
2
```



```python
<!--IMPORTS:[{"imported": "map_ai_messages", "source": "langchain_community.chat_loaders.utils", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.utils.map_ai_messages.html", "title": "GMail"}]-->
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
)
```


```python
# This makes messages sent by hchase@langchain.com the AI Messages
# This means you will train an LLM to predict as if it's responding as hchase
training_data = list(
    map_ai_messages(data, sender="Harrison Chase <hchase@langchain.com>")
)
```
