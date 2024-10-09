---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/yi.ipynb
---
# ChatYI

这将帮助您开始使用 Yi [聊天模型](/docs/concepts/#chat-models)。有关所有 ChatYi 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/lanchain_community/chat_models/lanchain_community.chat_models.yi.ChatYi.html)。

[01.AI](https://www.lingyiwanwu.com/en)，由李开复博士创立，是一家处于 AI 2.0 前沿的全球公司。他们提供尖端的大型语言模型，包括 Yi 系列，参数范围从 6B 到数百亿。01.AI 还提供多模态模型、开放 API 平台以及开源选项，如 Yi-34B/9B/6B 和 Yi-VL。

## 概述
### 集成细节


| 类别 | 包名 | 本地 | 可序列化 | JS 支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatYi](https://python.langchain.com/api_reference/lanchain_community/chat_models/lanchain_community.chat_models.yi.ChatYi.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ | ![PyPI - Downloads](https://img.shields.io/pypi/dm/langchain_community?style=flat-square&label=%20) | ![PyPI - Version](https://img.shields.io/pypi/v/langchain_community?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |

## 设置

要访问 ChatYi 模型，您需要创建一个 01.AI 账户，获取 API 密钥，并安装 `langchain_community` 集成包。

### 凭证

前往 [01.AI](https://platform.01.ai) 注册 01.AI 并生成 API 密钥。完成后设置 `YI_API_KEY` 环境变量：


```python
import getpass
import os

if "YI_API_KEY" not in os.environ:
    os.environ["YI_API_KEY"] = getpass.getpass("Enter your Yi API key: ")
```

如果您想要自动跟踪模型调用，可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain __ModuleName__ 集成位于 `langchain_community` 包中：


```python
%pip install -qU langchain_community
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

- TODO: 使用相关参数更新模型实例化。


```python
<!--IMPORTS:[{"imported": "ChatYi", "source": "langchain_community.chat_models.yi", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.yi.ChatYi.html", "title": "ChatYI"}]-->
from langchain_community.chat_models.yi import ChatYi

llm = ChatYi(
    model="yi-large",
    temperature=0,
    timeout=60,
    yi_api_base="https://api.01.ai/v1/chat/completions",
    # other params...
)
```

## 调用



```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "ChatYI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "ChatYI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(content="You are an AI assistant specializing in technology trends."),
    HumanMessage(
        content="What are the potential applications of large language models in healthcare?"
    ),
]

ai_msg = llm.invoke(messages)
ai_msg
```



```output
AIMessage(content="Large Language Models (LLMs) have the potential to significantly impact healthcare by enhancing various aspects of patient care, research, and administrative processes. Here are some potential applications:\n\n1. **Clinical Documentation and Reporting**: LLMs can assist in generating patient reports and documentation by understanding and summarizing clinical notes, making the process more efficient and reducing the administrative burden on healthcare professionals.\n\n2. **Medical Coding and Billing**: These models can help in automating the coding process for medical billing by accurately translating clinical notes into standardized codes, reducing errors and improving billing efficiency.\n\n3. **Clinical Decision Support**: LLMs can analyze patient data and medical literature to provide evidence-based recommendations to healthcare providers, aiding in diagnosis and treatment planning.\n\n4. **Patient Education and Communication**: By simplifying medical jargon, LLMs can help in educating patients about their conditions, treatment options, and preventive care, improving patient engagement and health literacy.\n\n5. **Natural Language Processing (NLP) for EHRs**: LLMs can enhance NLP capabilities in Electronic Health Records (EHRs) systems, enabling better extraction of information from unstructured data, such as clinical notes, to support data-driven decision-making.\n\n6. **Drug Discovery and Development**: LLMs can analyze biomedical literature and clinical trial data to identify new drug candidates, predict drug interactions, and support the development of personalized medicine.\n\n7. **Telemedicine and Virtual Health Assistants**: Integrated into telemedicine platforms, LLMs can provide preliminary assessments and triage, offering patients basic health advice and determining the urgency of their needs, thus optimizing the utilization of healthcare resources.\n\n8. **Research and Literature Review**: LLMs can expedite the process of reviewing medical literature by quickly identifying relevant studies and summarizing findings, accelerating research and evidence-based practice.\n\n9. **Personalized Medicine**: By analyzing a patient's genetic information and medical history, LLMs can help in tailoring treatment plans and medication dosages, contributing to the advancement of personalized medicine.\n\n10. **Quality Improvement and Risk Assessment**: LLMs can analyze healthcare data to identify patterns that may indicate areas for quality improvement or potential risks, such as hospital-acquired infections or adverse drug events.\n\n11. **Mental Health Support**: LLMs can provide mental health support by offering coping strategies, mindfulness exercises, and preliminary assessments, serving as a complement to professional mental health services.\n\n12. **Continuing Medical Education (CME)**: LLMs can personalize CME by recommending educational content based on a healthcare provider's practice area, patient demographics, and emerging medical literature, ensuring that professionals stay updated with the latest advancements.\n\nWhile the applications of LLMs in healthcare are promising, it's crucial to address challenges such as data privacy, model bias, and the need for regulatory approval to ensure that these technologies are implemented safely and ethically.", response_metadata={'token_usage': {'completion_tokens': 656, 'prompt_tokens': 40, 'total_tokens': 696}, 'model': 'yi-large'}, id='run-870850bd-e4bf-4265-8730-1736409c0acf-0')
```


## 链接

我们可以像这样使用提示词模板 [链](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatYI"}]-->
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
AIMessage(content='Ich liebe das Programmieren.', response_metadata={'token_usage': {'completion_tokens': 8, 'prompt_tokens': 33, 'total_tokens': 41}, 'model': 'yi-large'}, id='run-daa3bc58-8289-4d72-a24e-80622fa90d6d-0')
```


## API 参考

有关所有 ChatYi 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.yi.ChatYi.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
