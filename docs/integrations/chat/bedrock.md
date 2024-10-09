---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/bedrock.ipynb
sidebar_label: AWS Bedrock
---
# ChatBedrock

本文件将帮助您开始使用 AWS Bedrock [聊天模型](/docs/concepts/#chat-models)。Amazon Bedrock 是一项完全托管的服务，提供来自 AI21 Labs、Anthropic、Cohere、Meta、Stability AI 和 Amazon 等领先 AI 公司的一系列高性能基础模型 (FMs)，通过单一 API 访问，并提供构建具有安全性、隐私性和负责任的 AI 的生成 AI 应用所需的广泛功能。使用 Amazon Bedrock，您可以轻松地针对您的用例实验和评估顶级 FMs，使用微调和检索增强生成 (RAG) 等技术私密地定制它们，并构建执行任务的代理，利用您的企业系统和数据源。由于 Amazon Bedrock 是无服务器的，您无需管理任何基础设施，并且可以使用您已经熟悉的 AWS 服务安全地集成和部署生成 AI 功能到您的应用中。

有关通过 Bedrock 访问哪些模型的更多信息，请访问 [AWS 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/models-features.html)。

有关所有 ChatBedrock 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/aws/chat_models/langchain_aws.chat_models.bedrock.ChatBedrock.html)。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/bedrock) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatBedrock](https://python.langchain.com/api_reference/aws/chat_models/langchain_aws.chat_models.bedrock.ChatBedrock.html) | [langchain-aws](https://python.langchain.com/api_reference/aws/index.html) | ❌ | beta | ✅ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain-aws?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain-aws?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |

## 设置

要访问Bedrock模型，您需要创建一个AWS账户，设置Bedrock API服务，获取访问密钥ID和秘密密钥，并安装`langchain-aws`集成包。

### 凭证

前往[AWS文档](https://docs.aws.amazon.com/bedrock/latest/userguide/setting-up.html)注册AWS并设置您的凭证。您还需要为您的账户开启模型访问，您可以按照[这些说明](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)进行操作。

如果您想要自动跟踪您的模型调用，您还可以通过取消下面的注释来设置您的[LangSmith](https://docs.smith.langchain.com/) API密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Bedrock 集成位于 `langchain-aws` 包中：


```python
%pip install -qU langchain-aws
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
from langchain_aws import ChatBedrock

llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs=dict(temperature=0),
    # other params...
)
```

## 调用


```python
messages = [
    (
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ),
    ("human", "I love programming."),
]
ai_msg = llm.invoke(messages)
ai_msg
```



```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", additional_kwargs={'usage': {'prompt_tokens': 29, 'completion_tokens': 21, 'total_tokens': 50}, 'stop_reason': 'end_turn', 'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0'}, response_metadata={'usage': {'prompt_tokens': 29, 'completion_tokens': 21, 'total_tokens': 50}, 'stop_reason': 'end_turn', 'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0'}, id='run-fdb07dc3-ff72-430d-b22b-e7824b15c766-0', usage_metadata={'input_tokens': 29, 'output_tokens': 21, 'total_tokens': 50})
```



```python
print(ai_msg.content)
```
```output
Voici la traduction en français :

J'aime la programmation.
```
## 链接

我们可以像这样使用提示词模板[链](/docs/how_to/sequence/)我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatBedrock"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```



```output
AIMessage(content='Ich liebe Programmieren.', additional_kwargs={'usage': {'prompt_tokens': 23, 'completion_tokens': 11, 'total_tokens': 34}, 'stop_reason': 'end_turn', 'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0'}, response_metadata={'usage': {'prompt_tokens': 23, 'completion_tokens': 11, 'total_tokens': 34}, 'stop_reason': 'end_turn', 'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0'}, id='run-5ad005ce-9f31-4670-baa0-9373d418698a-0', usage_metadata={'input_tokens': 23, 'output_tokens': 11, 'total_tokens': 34})
```


## Bedrock Converse API

AWS 最近发布了 Bedrock Converse API，它为 Bedrock 模型提供了统一的对话接口。此 API 目前尚不支持自定义模型。您可以在这里查看所有[支持的模型列表](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)。为了提高可靠性，ChatBedrock 集成将在与现有 Bedrock API 功能相当时切换到使用 Bedrock Converse API。在此之前，已发布了单独的[ChatBedrockConverse](https://python.langchain.com/api_reference/aws/chat_models/langchain_aws.chat_models.bedrock_converse.ChatBedrockConverse.html)集成。

我们建议不需要使用自定义模型的用户使用 `ChatBedrockConverse`。

你可以这样使用它：


```python
from langchain_aws import ChatBedrockConverse

llm = ChatBedrockConverse(
    model="anthropic.claude-3-sonnet-20240229-v1:0",
    temperature=0,
    max_tokens=None,
    # other params...
)

llm.invoke(messages)
```



```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", response_metadata={'ResponseMetadata': {'RequestId': '4fcbfbe9-f916-4df2-b0bd-ea1147b550aa', 'HTTPStatusCode': 200, 'HTTPHeaders': {'date': 'Wed, 21 Aug 2024 17:23:49 GMT', 'content-type': 'application/json', 'content-length': '243', 'connection': 'keep-alive', 'x-amzn-requestid': '4fcbfbe9-f916-4df2-b0bd-ea1147b550aa'}, 'RetryAttempts': 0}, 'stopReason': 'end_turn', 'metrics': {'latencyMs': 672}}, id='run-77ee9810-e32b-45dc-9ccb-6692253b1f45-0', usage_metadata={'input_tokens': 29, 'output_tokens': 21, 'total_tokens': 50})
```


### 流式处理

请注意，`ChatBedrockConverse` 在流式处理时会发出内容块：


```python
for chunk in llm.stream(messages):
    print(chunk)
```
```output
content=[] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'Vo', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'ici', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' la', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' tra', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'duction', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' en', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' français', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' :', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': '\n\nJ', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': "'", 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'a', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'ime', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' la', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': ' programm', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': 'ation', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'type': 'text', 'text': '.', 'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[{'index': 0}] id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[] response_metadata={'stopReason': 'end_turn'} id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8'
content=[] response_metadata={'metrics': {'latencyMs': 713}} id='run-2c92c5af-d771-4cc2-98d9-c11bbd30a1d8' usage_metadata={'input_tokens': 29, 'output_tokens': 21, 'total_tokens': 50}
```
如果需要，可以使用输出解析器来过滤文本：


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "ChatBedrock"}]-->
from langchain_core.output_parsers import StrOutputParser

chain = llm | StrOutputParser()

for chunk in chain.stream(messages):
    print(chunk, end="|")
```
```output
|Vo|ici| la| tra|duction| en| français| :|

J|'|a|ime| la| programm|ation|.||||
```
## API 参考

有关所有 ChatBedrock 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/aws/chat_models/langchain_aws.chat_models.bedrock.ChatBedrock.html

有关所有 ChatBedrockConverse 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/aws/chat_models/langchain_aws.chat_models.bedrock_converse.ChatBedrockConverse.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
