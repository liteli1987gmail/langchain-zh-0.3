# Remembrall

本页面介绍如何在LangChain中使用[Remembrall](https://remembrall.dev)生态系统。

## 什么是Remembrall？

Remembrall为您的语言模型提供长期记忆、增强检索生成和完整的可观察性，只需几行代码。

![Screenshot of the Remembrall dashboard showing request statistics and model interactions.](/img/RemembrallDashboard.png "Remembrall Dashboard Interface")

它作为您OpenAI调用之上的轻量级代理工作，并在运行时简单地用收集到的相关事实增强聊天调用的上下文。

## 设置

要开始，请[在Remembrall平台上使用Github登录](https://remembrall.dev/login)并复制您的[API密钥，来自设置页面](https://remembrall.dev/dashboard/settings)。

您通过修改后的`openai_api_base`（见下文）和Remembrall API密钥发送的任何请求将自动在Remembrall仪表板中被跟踪。您**永远**不必与我们的平台共享您的OpenAI密钥，并且这些信息**永远**不会被Remembrall系统存储。

为此，我们需要安装以下依赖：

```bash
pip install -U langchain-openai
```

### 启用长期记忆

除了通过 `x-gp-api-key` 设置 `openai_api_base` 和 Remembrall API 密钥外，您还应该指定一个 UID 以维护记忆。这通常是一个唯一的用户标识符（如电子邮件）。

```python
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-remember": "user@email.com",
                            }
                        })

chat_model.predict("My favorite color is blue.")
import time; time.sleep(5)  # wait for system to save fact via auto save
print(chat_model.predict("What is my favorite color?"))
```

### 启用检索增强生成

首先，在 [Remembrall 仪表板](https://remembrall.dev/dashboard/spells) 中创建文档上下文。粘贴文档文本或上传 PDF 文档以进行处理。保存文档上下文 ID，并按如下所示插入。

```python
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-context": "document-context-id-goes-here",
                            }
                        })

print(chat_model.predict("This is a question that can be answered with my document."))
```
