---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/cerebras.ipynb
sidebar_label: Cerebras
---
# ChatCerebras

本笔记本提供了快速入门Cerebras [聊天模型](/docs/concepts/#chat-models) 的概述。有关所有ChatCerebras功能和配置的详细文档，请访问 [API参考](https://api.python.langchain.com/en/latest/chat_models/langchain_cerebras.chat_models.ChatCerebras.html)。

在Cerebras，我们开发了世界上最大和最快的AI处理器——晶圆级引擎-3 (WSE-3)。由WSE-3驱动的Cerebras CS-3系统代表了一种新的AI超级计算机类别，以无与伦比的性能和可扩展性为生成式AI训练和推理设定了标准。

作为您的推理大模型供应商，Cerebras可以让您：
- 实现前所未有的AI推理工作负载速度
- 以高吞吐量进行商业构建
- 通过我们无缝的集群技术轻松扩展您的AI工作负载

我们的CS-3系统可以快速且轻松地集群，创建世界上最大的AI超级计算机，使得放置和运行最大的模型变得简单。领先的企业、研究机构和政府已经在使用Cerebras解决方案开发专有模型和训练流行的开源模型。

想体验Cerebras的强大功能吗？请查看我们的 [网站](https://cerebras.ai) 获取更多资源，并探索通过Cerebras Cloud或本地部署访问我们技术的选项！

有关Cerebras Cloud的更多信息，请访问 [cloud.cerebras.ai](https://cloud.cerebras.ai/)。我们的API参考可在 [inference-docs.cerebras.ai](https://inference-docs.cerebras.ai/) 获取。

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | [JS支持](https://js.langchain.com/docs/integrations/chat/cerebras) | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatCerebras](https://api.python.langchain.com/en/latest/chat_models/langchain_cerebras.chat_models.ChatCerebras.html) | [langchain-cerebras](https://api.python.langchain.com/en/latest/cerebras_api_reference.html) | ❌ | beta | ❌ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain-cerebras?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain-cerebras?style=flat-square&label=%20) |

### 模型特性
| [工具调用](/docs/how_to/tool_calling/) | [结构化输出](/docs/how_to/structured_output/) | JSON模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅  | ✅ | ❌ |

## 设置

```bash
pip install langchain-cerebras
```

### 凭证

从 [cloud.cerebras.ai](https://cloud.cerebras.ai/) 获取 API 密钥并将其添加到您的环境变量中：
```
export CEREBRAS_API_KEY="your-api-key-here"
```


```python
import getpass
import os

if "CEREBRAS_API_KEY" not in os.environ:
    os.environ["CEREBRAS_API_KEY"] = getpass.getpass("Enter your Cerebras API key: ")
```
```output
Enter your Cerebras API key:  ········
```
如果您想要自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

LangChain Cerebras 集成位于 `langchain-cerebras` 包中：


```python
%pip install -qU langchain-cerebras
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：



```python
from langchain_cerebras import ChatCerebras

llm = ChatCerebras(
    model="llama3.1-70b",
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
AIMessage(content='Je adore le programmation.', response_metadata={'token_usage': {'completion_tokens': 7, 'prompt_tokens': 35, 'total_tokens': 42}, 'model_name': 'llama3-8b-8192', 'system_fingerprint': 'fp_be27ec77ff', 'finish_reason': 'stop'}, id='run-e5d66faf-019c-4ac6-9265-71093b13202d-0', usage_metadata={'input_tokens': 35, 'output_tokens': 7, 'total_tokens': 42})
```


## 链接

我们可以像这样将我们的模型与提示词模板 [链式](/docs/how_to/sequence/)：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatCerebras"}]-->
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate

llm = ChatCerebras(
    model="llama3.1-70b",
    # other params...
)

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
AIMessage(content='Ich liebe Programmieren!\n\n(Literally: I love programming!)', response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 30, 'total_tokens': 44}, 'model_name': 'llama3-8b-8192', 'system_fingerprint': 'fp_be27ec77ff', 'finish_reason': 'stop'}, id='run-e1d2ebb8-76d1-471b-9368-3b68d431f16a-0', usage_metadata={'input_tokens': 30, 'output_tokens': 14, 'total_tokens': 44})
```


## 流式处理


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatCerebras"}]-->
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate

llm = ChatCerebras(
    model="llama3.1-70b",
    # other params...
)

system = "You are an expert on animals who must answer questions in a manner that a 5 year old can understand."
human = "I want to learn more about this animal: {animal}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chain = prompt | llm

for chunk in chain.stream({"animal": "Lion"}):
    print(chunk.content, end="", flush=True)
```
```output
OH BOY! Let me tell you all about LIONS!

Lions are the kings of the jungle! They're really big and have beautiful, fluffy manes around their necks. The mane is like a big, golden crown!

Lions live in groups called prides. A pride is like a big family, and the lionesses (that's what we call the female lions) take care of the babies. The lionesses are like the mommies, and they teach the babies how to hunt and play.

Lions are very good at hunting. They work together to catch their food, like zebras and antelopes. They're super fast and can run really, really fast!

But lions are also very sleepy. They like to take long naps in the sun, and they can sleep for up to 20 hours a day! Can you imagine sleeping that much?

Lions are also very loud. They roar really loudly to talk to each other. It's like they're saying, "ROAR! I'm the king of the jungle!"

And guess what? Lions are very social. They like to play and cuddle with each other. They're like big, furry teddy bears!

So, that's lions! Aren't they just the coolest?
```
## 异步


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatCerebras"}]-->
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate

llm = ChatCerebras(
    model="llama3.1-70b",
    # other params...
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            "Let's play a game of opposites. What's the opposite of {topic}? Just give me the answer with no extra input.",
        )
    ]
)
chain = prompt | llm
await chain.ainvoke({"topic": "fire"})
```



```output
AIMessage(content='Ice', response_metadata={'token_usage': {'completion_tokens': 2, 'prompt_tokens': 36, 'total_tokens': 38}, 'model_name': 'llama3-8b-8192', 'system_fingerprint': 'fp_be27ec77ff', 'finish_reason': 'stop'}, id='run-7434bdde-1bec-44cf-827b-8d978071dfe8-0', usage_metadata={'input_tokens': 36, 'output_tokens': 2, 'total_tokens': 38})
```


## 异步流式处理


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatCerebras"}]-->
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate

llm = ChatCerebras(
    model="llama3.1-70b",
    # other params...
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            "Write a long convoluted story about {subject}. I want {num_paragraphs} paragraphs.",
        )
    ]
)
chain = prompt | llm

async for chunk in chain.astream({"num_paragraphs": 3, "subject": "blackholes"}):
    print(chunk.content, end="", flush=True)
```
```output
In the distant reaches of the cosmos, there existed a peculiar phenomenon known as the "Eclipse of Eternity," a swirling vortex of darkness that had been shrouded in mystery for eons. It was said that this blackhole, born from the cataclysmic collision of two ancient stars, had been slowly devouring the fabric of space-time itself, warping the very essence of reality. As the celestial bodies of the galaxy danced around it, they began to notice a strange, almost imperceptible distortion in the fabric of space, as if the blackhole's gravitational pull was exerting an influence on the very course of events itself.

As the centuries passed, astronomers from across the galaxy became increasingly fascinated by the Eclipse of Eternity, pouring over ancient texts and scouring the cosmos for any hint of its secrets. One such scholar, a brilliant and reclusive astrophysicist named Dr. Elara Vex, became obsessed with unraveling the mysteries of the blackhole. She spent years pouring over ancient texts, deciphering cryptic messages and hidden codes that hinted at the existence of a long-lost civilization that had once thrived in the heart of the blackhole itself. According to legend, this ancient civilization had possessed knowledge of the cosmos that was beyond human comprehension, and had used their mastery of the universe to create the Eclipse of Eternity as a gateway to other dimensions.

As Dr. Vex delved deeper into her research, she began to experience strange and vivid dreams, visions that seemed to transport her to the very heart of the blackhole itself. In these dreams, she saw ancient beings, their faces twisted in agony as they were consumed by the void. She saw stars and galaxies, their light warped and distorted by the blackhole's gravitational pull. And she saw the Eclipse of Eternity itself, its swirling vortex of darkness pulsing with an otherworldly energy that seemed to be calling to her. As the dreams grew more vivid and more frequent, Dr. Vex became convinced that she was being drawn into the heart of the blackhole, and that the secrets of the universe lay waiting for her on the other side.
```
## API 参考

有关所有 ChatCerebras 功能和配置的详细文档，请访问 API 参考： https://api.python.langchain.com/en/latest/chat_models/langchain_cerebras.chat_models.ChatCerebras.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
