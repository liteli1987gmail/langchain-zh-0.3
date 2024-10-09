---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/sambanova.ipynb
sidebar_label: SambaNovaCloud
---
# ChatSambaNovaCloud

这将帮助您开始使用 SambaNovaCloud [聊天模型](/docs/concepts/#chat-models)。有关所有 ChatSambaNovaCloud 功能和配置的详细文档，请访问 [API 参考](https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.sambanova.ChatSambaNovaCloud.html)。

**[SambaNova](https://sambanova.ai/)** 的 [SambaNova Cloud](https://cloud.sambanova.ai/) 是一个用于使用开源模型进行推理的平台

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 | 包下载 | 包最新 |
| :--- | :--- | :---: | :---: |  :---: | :---: | :---: |
| [ChatSambaNovaCloud](https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.sambanova.ChatSambaNovaCloud.html) | [langchain-community](https://python.langchain.com/v0.2/api_reference/community/index.html) | ❌ | ❌ | ❌ | ![PyPI - 下载量](https://img.shields.io/pypi/dm/langchain_community?style=flat-square&label=%20) | ![PyPI - 版本](https://img.shields.io/pypi/v/langchain_community?style=flat-square&label=%20) |

### 模型特性

| [工具调用](/docs/how_to/tool_calling) | [结构化输出](/docs/how_to/structured_output/) | JSON 模式 | [图像输入](/docs/how_to/multimodal_inputs/) | 音频输入 | 视频输入 | [令牌级流式处理](/docs/how_to/chat_streaming/) | 原生异步 | [令牌使用](/docs/how_to/chat_token_usage_tracking/) | [Logprobs](/docs/how_to/logprobs/) |
| :---: | :---: | :---: | :---: |  :---: | :---: | :---: | :---: | :---: | :---: |
| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

## 设置

要访问 ChatSambaNovaCloud 模型，您需要创建一个 [SambaNovaCloud](https://cloud.sambanova.ai/) 账户，获取 API 密钥，安装 `langchain_community` 集成包，并安装 `SSEClient` 包。

```bash
pip install langchain-community
pip install sseclient-py
```

### 凭证

从 [cloud.sambanova.ai](https://cloud.sambanova.ai/apis) 获取 API 密钥并将其添加到您的环境变量中：

``` bash
export SAMBANOVA_API_KEY="your-api-key-here"
```


```python
import getpass
import os

if not os.getenv("SAMBANOVA_API_KEY"):
    os.environ["SAMBANOVA_API_KEY"] = getpass.getpass(
        "Enter your SambaNova Cloud API key: "
    )
```

如果您想自动跟踪模型调用，您还可以通过取消注释下面的内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

### 安装

LangChain __SambaNovaCloud__ 集成位于 `langchain_community` 包中：


```python
%pip install -qU langchain-community
%pip install -qu sseclient-py
```

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：


```python
<!--IMPORTS:[{"imported": "ChatSambaNovaCloud", "source": "langchain_community.chat_models.sambanova", "docs": "https://python.langchain.com/api_reference/community/chat_models/langchain_community.chat_models.sambanova.ChatSambaNovaCloud.html", "title": "ChatSambaNovaCloud"}]-->
from langchain_community.chat_models.sambanova import ChatSambaNovaCloud

llm = ChatSambaNovaCloud(
    model="llama3-405b", max_tokens=1024, temperature=0.7, top_k=1, top_p=0.01
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
AIMessage(content="J'adore la programmation.", response_metadata={'finish_reason': 'stop', 'usage': {'acceptance_rate': 11, 'completion_tokens': 9, 'completion_tokens_after_first_per_sec': 97.07042823956884, 'completion_tokens_after_first_per_sec_first_ten': 276.3343994441849, 'completion_tokens_per_sec': 23.775192800224037, 'end_time': 1726158364.7954874, 'is_last_response': True, 'prompt_tokens': 56, 'start_time': 1726158364.3670964, 'time_to_first_token': 0.3459765911102295, 'total_latency': 0.3785458261316473, 'total_tokens': 65, 'total_tokens_per_sec': 171.70972577939582}, 'model_name': 'Meta-Llama-3.1-405B-Instruct', 'system_fingerprint': 'fastcoe', 'created': 1726158364}, id='7154b676-9d5a-4b1a-a425-73bbe69f28fc')
```



```python
print(ai_msg.content)
```
```output
J'adore la programmation.
```
## 链接

我们可以像这样使用提示词模板来 [链接](/docs/how_to/sequence/) 我们的模型：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "ChatSambaNovaCloud"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate(
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
AIMessage(content='Ich liebe Programmieren.', response_metadata={'finish_reason': 'stop', 'usage': {'acceptance_rate': 11, 'completion_tokens': 6, 'completion_tokens_after_first_per_sec': 47.80258530102961, 'completion_tokens_after_first_per_sec_first_ten': 215.59002827036753, 'completion_tokens_per_sec': 5.263977583489829, 'end_time': 1726158506.3777263, 'is_last_response': True, 'prompt_tokens': 51, 'start_time': 1726158505.1611376, 'time_to_first_token': 1.1119918823242188, 'total_latency': 1.1398224830627441, 'total_tokens': 57, 'total_tokens_per_sec': 50.00778704315337}, 'model_name': 'Meta-Llama-3.1-405B-Instruct', 'system_fingerprint': 'fastcoe', 'created': 1726158505}, id='226471ac-8c52-44bb-baa7-f9d2f8c54477')
```


## 流式处理


```python
system = "You are a helpful assistant with pirate accent."
human = "I want to learn more about this animal: {animal}"
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

chain = prompt | llm

for chunk in chain.stream({"animal": "owl"}):
    print(chunk.content, end="", flush=True)
```
```output
Yer lookin' fer some info on owls, eh? Alright then, matey, settle yerself down with a pint o' grog and listen close.

Owls be nocturnal birds o' prey, meanin' they do most o' their huntin' at night. They got big, round eyes that be perfect fer seein' in the dark, like a trusty lantern on a dark sea. Their ears be sharp as a cutlass, too, helpin' 'em pinpoint the slightest sound o' a scurvy rodent scurryin' through the underbrush.

These birds be known fer their silent flight, like a ghost ship sailin' through the night. Their feathers be special, with a soft, fringed edge that helps 'em sneak up on their prey. And when they strike, it be swift and deadly, like a pirate's sword.

Owls be found all over the world, from the frozen tundras o' the north to the scorching deserts o' the south. They come in all shapes and sizes, from the tiny elf owl to the great grey owl, which be as big as a small dog.

Now, I know what ye be thinkin', "Pirate, what about their hootin'?" Aye, owls be famous fer their hoots, which be a form o' communication. They use different hoots to warn off predators, attract a mate, or even just to say, "Shiver me timbers, I be happy to be alive!"

So there ye have it, me hearty. Owls be fascinatin' creatures, and I hope ye found this info as interestin' as a chest overflowin' with gold doubloons. Fair winds and following seas!
```
## 异步


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            "what is the capital of {country}?",
        )
    ]
)

chain = prompt | llm
await chain.ainvoke({"country": "France"})
```



```output
AIMessage(content='The capital of France is Paris.', response_metadata={'finish_reason': 'stop', 'usage': {'acceptance_rate': 13, 'completion_tokens': 8, 'completion_tokens_after_first_per_sec': 86.00726488715989, 'completion_tokens_after_first_per_sec_first_ten': 326.92555640828857, 'completion_tokens_per_sec': 21.74539360394493, 'end_time': 1726159287.9987085, 'is_last_response': True, 'prompt_tokens': 43, 'start_time': 1726159287.5738964, 'time_to_first_token': 0.34342360496520996, 'total_latency': 0.36789400760944074, 'total_tokens': 51, 'total_tokens_per_sec': 138.62688422514893}, 'model_name': 'Meta-Llama-3.1-405B-Instruct', 'system_fingerprint': 'fastcoe', 'created': 1726159287}, id='9b4ef015-50a2-434b-b980-29f8aa90c3e8')
```


## 异步流式处理


```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "human",
            "in less than {num_words} words explain me {topic} ",
        )
    ]
)
chain = prompt | llm

async for chunk in chain.astream({"num_words": 30, "topic": "quantum computers"}):
    print(chunk.content, end="", flush=True)
```
```output
Quantum computers use quantum bits (qubits) to process vast amounts of data simultaneously, leveraging quantum mechanics to solve complex problems exponentially faster than classical computers.
```
## API 参考

有关所有 ChatSambaNovaCloud 功能和配置的详细文档，请访问 API 参考： https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.sambanova.ChatSambaNovaCloud.html


## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [操作指南](/docs/how_to/#chat-models)
