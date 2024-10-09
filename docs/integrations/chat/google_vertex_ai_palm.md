---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/google_vertex_ai_palm.ipynb
sidebar_label: Google Cloud Vertex AI
---
# ChatVertexAI

本页面提供了关于如何开始使用 VertexAI [聊天模型](/docs/concepts/#chat-models) 的快速概述。有关所有 ChatVertexAI 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/google_vertexai/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html)。

ChatVertexAI 提供了 Google Cloud 中所有可用的基础模型，如 `gemini-1.5-pro`、`gemini-1.5-flash` 等。有关可用模型的完整和最新列表，请访问 [VertexAI 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/overview)。

:::info Google Cloud VertexAI vs Google PaLM

Google Cloud VertexAI 集成与 [Google PaLM 集成](/docs/integrations/chat/google_generative_ai/) 是分开的。Google 选择通过 GCP 提供 PaLM 的企业版本，并支持通过该版本提供的模型。

:::

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/chat/google_vertex_ai) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatVertexAI](https://python.langchain.com/api_reference/google_vertexai/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html) | [langchain-google-vertexai](https://python.langchain.com/api_reference/google_vertexai/index.html) | ❌ | beta | ✅ | ![PyPI - 下载](https://img.shields.io/pypi/dm/langchain-google-vertexai?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-google-vertexai?style=flat-square&label=%20) |

### 模型特性
| [函数/工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## 设置

要访问 VertexAI 模型，您需要创建一个 Google Cloud Platform 账户，设置凭据，并安装 `langchain-google-vertexai` 集成包。

### 凭据

要使用该集成，您必须：
- 为您的环境配置凭据 (gcloud、工作负载身份等...)
- 将服务账户 JSON 文件的路径存储为 GOOGLE_APPLICATION_CREDENTIALS 环境变量

此代码库使用 `google.auth` 库，首先查找上述提到的应用程序凭据变量，然后查找系统级身份验证。

有关更多信息，请参见：
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

如果您想自动跟踪模型调用，可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain VertexAI 集成位于 `langchain-google-vertexai` 包中：


```python
%pip install -qU langchain-google-vertexai
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(
    model="gemini-1.5-flash-001",
    temperature=0,
    max_tokens=None,
    max_retries=6,
    stop=None,
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
AIMessage(content="J'adore programmer. \n", response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'usage_metadata': {'prompt_token_count': 20, 'candidates_token_count': 7, 'total_token_count': 27}}, id='run-7032733c-d05c-4f0c-a17a-6c575fdd1ae0-0', usage_metadata={'input_tokens': 20, 'output_tokens': 7, 'total_tokens': 27})
```



```python
print(ai_msg.content)
```
```output
J'adore programmer.
```
## 链接

我们可以像这样使用提示词模板[链接](/docs/how_to/sequence/)我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatVertexAI"}]-->
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
AIMessage(content='Ich liebe Programmieren. \n', response_metadata={'is_blocked': False, 'safety_ratings': [{'category': 'HARM_CATEGORY_HATE_SPEECH', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_HARASSMENT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}, {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'probability_label': 'NEGLIGIBLE', 'blocked': False}], 'usage_metadata': {'prompt_token_count': 15, 'candidates_token_count': 8, 'total_token_count': 23}}, id='run-c71955fd-8dc1-422b-88a7-853accf4811b-0', usage_metadata={'input_tokens': 15, 'output_tokens': 8, 'total_tokens': 23})
```


## API 参考

有关所有 ChatVertexAI 功能和配置的详细文档，例如如何发送多模态输入和配置安全设置，请访问 API 参考：https://python.langchain.com/api_reference/google_vertexai/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
