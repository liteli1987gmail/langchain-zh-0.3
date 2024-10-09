---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/cogniswitch.ipynb
---
# Cogniswitch 工具包

CogniSwitch 用于构建可以无缝消费、组织和检索知识的生产就绪应用程序。使用您选择的框架，在这种情况下是 LangChain，CogniSwitch 有助于减轻在选择正确的存储和检索格式时的决策压力。它还消除了生成响应时的可靠性问题和幻觉。

## 设置

访问 [此页面](https://www.cogniswitch.ai/developer?utm_source=langchain&utm_medium=langchainbuild&utm_id=dev) 注册一个 Cogniswitch 账户。

- 使用您的电子邮件注册并验证您的注册

- 您将收到一封包含平台令牌和用于使用服务的 OAuth 令牌的邮件。



```python
%pip install -qU langchain-community
```

## 导入必要的库


```python
<!--IMPORTS:[{"imported": "create_conversational_retrieval_agent", "source": "langchain.agents.agent_toolkits", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_toolkits.conversational_retrieval.openai_functions.create_conversational_retrieval_agent.html", "title": "Cogniswitch Toolkit"}, {"imported": "CogniswitchToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.cogniswitch.toolkit.CogniswitchToolkit.html", "title": "Cogniswitch Toolkit"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Cogniswitch Toolkit"}]-->
import warnings

warnings.filterwarnings("ignore")

import os

from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain_community.agent_toolkits import CogniswitchToolkit
from langchain_openai import ChatOpenAI
```

## Cogniswitch 平台令牌、OAuth 令牌和 OpenAI API 密钥


```python
cs_token = "Your CogniSwitch token"
OAI_token = "Your OpenAI API token"
oauth_token = "Your CogniSwitch authentication token"

os.environ["OPENAI_API_KEY"] = OAI_token
```

## 使用凭据实例化 cogniswitch 工具包


```python
cogniswitch_toolkit = CogniswitchToolkit(
    cs_token=cs_token, OAI_token=OAI_token, apiKey=oauth_token
)
```

### 获取 cogniswitch 工具列表


```python
tool_lst = cogniswitch_toolkit.get_tools()
```

## 实例化大型语言模型 (LLM)


```python
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=OAI_token,
    max_tokens=1500,
    model_name="gpt-3.5-turbo-0613",
)
```

## 使用工具包中的 LLM

### 创建一个带有 LLM 和工具包的代理


```python
agent_executor = create_conversational_retrieval_agent(llm, tool_lst, verbose=False)
```

### 调用代理上传 URL


```python
response = agent_executor.invoke("upload this url https://cogniswitch.ai/developer")

print(response["output"])
```
```output
The URL https://cogniswitch.ai/developer has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```
### 调用代理上传文件


```python
response = agent_executor.invoke("upload this file example_file.txt")

print(response["output"])
```
```output
The file example_file.txt has been uploaded successfully. The status of the document is currently being processed. You will receive an email notification once the processing is complete.
```
### 调用代理获取文档状态


```python
response = agent_executor.invoke("Tell me the status of this document example_file.txt")

print(response["output"])
```
```output
The status of the document example_file.txt is as follows:

- Created On: 2024-01-22T19:07:42.000+00:00
- Modified On: 2024-01-22T19:07:42.000+00:00
- Document Entry ID: 153
- Status: 0 (Processing)
- Original File Name: example_file.txt
- Saved File Name: 1705950460069example_file29393011.txt

The document is currently being processed.
```
### 使用查询调用代理并获取答案


```python
response = agent_executor.invoke("How can cogniswitch help develop GenAI applications?")

print(response["output"])
```
```output
CogniSwitch can help develop GenAI applications in several ways:

1. Knowledge Extraction: CogniSwitch can extract knowledge from various sources such as documents, websites, and databases. It can analyze and store data from these sources, making it easier to access and utilize the information for GenAI applications.

2. Natural Language Processing: CogniSwitch has advanced natural language processing capabilities. It can understand and interpret human language, allowing GenAI applications to interact with users in a more conversational and intuitive manner.

3. Sentiment Analysis: CogniSwitch can analyze the sentiment of text data, such as customer reviews or social media posts. This can be useful in developing GenAI applications that can understand and respond to the emotions and opinions of users.

4. Knowledge Base Integration: CogniSwitch can integrate with existing knowledge bases or create new ones. This allows GenAI applications to access a vast amount of information and provide accurate and relevant responses to user queries.

5. Document Analysis: CogniSwitch can analyze documents and extract key information such as entities, relationships, and concepts. This can be valuable in developing GenAI applications that can understand and process large amounts of textual data.

Overall, CogniSwitch provides a range of AI-powered capabilities that can enhance the development of GenAI applications by enabling knowledge extraction, natural language processing, sentiment analysis, knowledge base integration, and document analysis.
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
