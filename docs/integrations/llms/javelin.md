---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/javelin.ipynb
---
# Javelin AI Gateway 教程

本 Jupyter Notebook 将探讨如何使用 Python SDK 与 Javelin AI Gateway 进行交互。
Javelin AI Gateway 通过提供一个安全和统一的端点，促进了大型语言模型 (LLMs) 的使用，如 OpenAI、Cohere、Anthropic 等。
网关本身提供了一个集中机制，以系统化地推出模型，
提供访问安全性、政策和成本保护措施等企业级功能。

有关 Javelin 所有功能和优势的完整列表，请访问 www.getjavelin.io



## 第一步：介绍
[Javelin AI Gateway](https://www.getjavelin.io) 是一个企业级的 AI 应用程序 API 网关。它集成了强大的访问安全性，确保与大型语言模型的安全交互。更多信息请参见 [官方文档](https://docs.getjavelin.io)。


## 第二步：安装
在开始之前，我们必须安装 `javelin_sdk` 并将 Javelin API 密钥设置为环境变量。


```python
pip install 'javelin_sdk'
```
```output
Requirement already satisfied: javelin_sdk in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (0.1.8)
Requirement already satisfied: httpx<0.25.0,>=0.24.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (0.24.1)
Requirement already satisfied: pydantic<2.0.0,>=1.10.7 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from javelin_sdk) (1.10.12)
Requirement already satisfied: certifi in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (2023.5.7)
Requirement already satisfied: httpcore<0.18.0,>=0.15.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (0.17.3)
Requirement already satisfied: idna in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (3.4)
Requirement already satisfied: sniffio in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpx<0.25.0,>=0.24.0->javelin_sdk) (1.3.0)
Requirement already satisfied: typing-extensions>=4.2.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from pydantic<2.0.0,>=1.10.7->javelin_sdk) (4.7.1)
Requirement already satisfied: h11<0.15,>=0.13 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (0.14.0)
Requirement already satisfied: anyio<5.0,>=3.0 in /usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages (from httpcore<0.18.0,>=0.15.0->httpx<0.25.0,>=0.24.0->javelin_sdk) (3.7.1)
Note: you may need to restart the kernel to use updated packages.
```
## 第3步：完成示例
本节将演示如何与Javelin AI网关交互，以从大型语言模型获取完成结果。以下是一个演示此功能的Python脚本：
(注意) 假设您在网关中设置了一个名为'eng_dept03'的路由


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Javelin AI Gateway Tutorial"}, {"imported": "JavelinAIGateway", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.javelin_ai_gateway.JavelinAIGateway.html", "title": "Javelin AI Gateway Tutorial"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Javelin AI Gateway Tutorial"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import JavelinAIGateway
from langchain_core.prompts import PromptTemplate

route_completions = "eng_dept03"

gateway = JavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route=route_completions,
    model_name="gpt-3.5-turbo-instruct",
)

prompt = PromptTemplate("Translate the following English text to French: {text}")

llmchain = LLMChain(llm=gateway, prompt=prompt)
result = llmchain.run("podcast player")

print(result)
```

```output
---------------------------------------------------------------------------
``````output
ImportError                               Traceback (most recent call last)
``````output
Cell In[6], line 2
      1 from langchain.chains import LLMChain
----> 2 from langchain.llms import JavelinAIGateway
      3 from langchain.prompts import PromptTemplate
      5 route_completions = "eng_dept03"
``````output
ImportError: cannot import name 'JavelinAIGateway' from 'langchain.llms' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/llms/__init__.py)
```

# 第4步：嵌入示例
本节演示如何使用 Javelin AI Gateway 获取文本查询和文档的嵌入。以下是一个说明这一点的 Python 脚本：
(注意) 假设您在网关中设置了一个名为“embeddings”的路由


```python
<!--IMPORTS:[{"imported": "JavelinAIGatewayEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.javelin_ai_gateway.JavelinAIGatewayEmbeddings.html", "title": "Javelin AI Gateway Tutorial"}]-->
from langchain_community.embeddings import JavelinAIGatewayEmbeddings

embeddings = JavelinAIGatewayEmbeddings(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="embeddings",
)

print(embeddings.embed_query("hello"))
print(embeddings.embed_documents(["hello"]))
```

```output
---------------------------------------------------------------------------
``````output
ImportError                               Traceback (most recent call last)
``````output
Cell In[9], line 1
----> 1 from langchain.embeddings import JavelinAIGatewayEmbeddings
      2 from langchain.embeddings.openai import OpenAIEmbeddings
      4 embeddings = JavelinAIGatewayEmbeddings(
      5     gateway_uri="http://localhost:8000", # replace with service URL or host/port of Javelin
      6     route="embeddings",
      7 )
``````output
ImportError: cannot import name 'JavelinAIGatewayEmbeddings' from 'langchain.embeddings' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/embeddings/__init__.py)
```

# 第5步：聊天示例
本节说明如何与Javelin AI网关交互，以便与大型语言模型进行聊天。以下是一个演示此功能的Python脚本：
(注意) 假设您在网关中设置了一个名为'mychatbot_route'的路由


```python
<!--IMPORTS:[{"imported": "ChatJavelinAIGateway", "source": "langchain_community.chat_models", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.javelin_ai_gateway.ChatJavelinAIGateway.html", "title": "Javelin AI Gateway Tutorial"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Javelin AI Gateway Tutorial"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Javelin AI Gateway Tutorial"}]-->
from langchain_community.chat_models import ChatJavelinAIGateway
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Artificial Intelligence has the power to transform humanity and make the world a better place"
    ),
]

chat = ChatJavelinAIGateway(
    gateway_uri="http://localhost:8000",  # replace with service URL or host/port of Javelin
    route="mychatbot_route",
    model_name="gpt-3.5-turbo",
    params={"temperature": 0.1},
)

print(chat(messages))
```

```output
---------------------------------------------------------------------------
``````output
ImportError                               Traceback (most recent call last)
``````output
Cell In[8], line 1
----> 1 from langchain.chat_models import ChatJavelinAIGateway
      2 from langchain.schema import HumanMessage, SystemMessage
      4 messages = [
      5     SystemMessage(
      6         content="You are a helpful assistant that translates English to French."
   (...)
     10     ),
     11 ]
``````output
ImportError: cannot import name 'ChatJavelinAIGateway' from 'langchain.chat_models' (/usr/local/Caskroom/miniconda/base/lib/python3.11/site-packages/langchain/chat_models/__init__.py)
```

第6步：结论
本教程介绍了 Javelin AI Gateway，并演示了如何使用 Python SDK 与其交互。
请记得查看 Javelin [Python SDK](https://www.github.com/getjavelin.io/javelin-python) 以获取更多示例，并探索官方文档以获取更多详细信息。

祝编码愉快！


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
