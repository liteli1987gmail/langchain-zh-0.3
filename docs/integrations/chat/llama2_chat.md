---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/llama2_chat.ipynb
sidebar_label: Llama 2 Chat
---
# Llama2Chat

本笔记本展示了如何使用 `Llama2Chat` 包装器增强 Llama-2 `LLM`，以支持 [Llama-2 聊天提示格式](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)。LangChain 中的多个 `LLM` 实现可以作为 Llama-2 聊天模型的接口。这些包括 [ChatHuggingFace](/docs/integrations/chat/huggingface)、[LlamaCpp](/docs/tutorials/local_rag)、[GPT4All](/docs/integrations/llms/gpt4all) 等等，仅举几例。

`Llama2Chat` 是一个通用包装器，实现了 `BaseChatModel`，因此可以在应用程序中用作 [聊天模型](/docs/how_to#chat-models)。`Llama2Chat` 将消息列表转换为 [所需的聊天提示格式](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)，并将格式化的提示作为 `str` 转发给包装的 `LLM`。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Llama2Chat"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Llama2Chat"}, {"imported": "Llama2Chat", "source": "langchain_experimental.chat_models", "docs": "https://python.langchain.com/api_reference/experimental/chat_models/langchain_experimental.chat_models.llm_wrapper.Llama2Chat.html", "title": "Llama2Chat"}]-->
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_experimental.chat_models import Llama2Chat
```

对于下面的聊天应用示例，我们将使用以下聊天 `提示词模板`：


```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Llama2Chat"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Llama2Chat"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "Llama2Chat"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Llama2Chat"}]-->
from langchain_core.messages import SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

template_messages = [
    SystemMessage(content="You are a helpful assistant."),
    MessagesPlaceholder(variable_name="chat_history"),
    HumanMessagePromptTemplate.from_template("{text}"),
]
prompt_template = ChatPromptTemplate.from_messages(template_messages)
```

## 通过 `HuggingFaceTextGenInference` LLM 与 Llama-2 聊天

HuggingFaceTextGenInference LLM 封装了对 [text-generation-inference](https://github.com/huggingface/text-generation-inference) 服务器的访问。在以下示例中，推理服务器提供了一个 [meta-llama/Llama-2-13b-chat-hf](https://huggingface.co/meta-llama/Llama-2-13b-chat-hf) 模型。可以通过以下方式在本地启动：

```bash
docker run \
  --rm \
  --gpus all \
  --ipc=host \
  -p 8080:80 \
  -v ~/.cache/huggingface/hub:/data \
  -e HF_API_TOKEN=${HF_API_TOKEN} \
  ghcr.io/huggingface/text-generation-inference:0.9 \
  --hostname 0.0.0.0 \
  --model-id meta-llama/Llama-2-13b-chat-hf \
  --quantize bitsandbytes \
  --num-shard 4
```

例如，这在配备 4 个 RTX 3080ti 显卡的机器上运行。将 `--num_shard` 值调整为可用的 GPU 数量。`HF_API_TOKEN` 环境变量保存 Hugging Face API 令牌。


```python
# !pip3 install text-generation
```

创建一个连接到本地推理服务器的 `HuggingFaceTextGenInference` 实例，并将其包装到 `Llama2Chat` 中。


```python
<!--IMPORTS:[{"imported": "HuggingFaceTextGenInference", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.huggingface_text_gen_inference.HuggingFaceTextGenInference.html", "title": "Llama2Chat"}]-->
from langchain_community.llms import HuggingFaceTextGenInference

llm = HuggingFaceTextGenInference(
    inference_server_url="http://127.0.0.1:8080/",
    max_new_tokens=512,
    top_k=50,
    temperature=0.1,
    repetition_penalty=1.03,
)

model = Llama2Chat(llm=llm)
```

然后，您可以在 `LLMChain` 中将聊天 `模型` 与 `提示词模板` 和对话 `记忆` 一起使用。


```python
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chain = LLMChain(llm=model, prompt=prompt_template, memory=memory)
```


```python
print(
    chain.run(
        text="What can I see in Vienna? Propose a few locations. Names only, no details."
    )
)
```
```output
 Sure, I'd be happy to help! Here are a few popular locations to consider visiting in Vienna:

1. Schönbrunn Palace
2. St. Stephen's Cathedral
3. Hofburg Palace
4. Belvedere Palace
5. Prater Park
6. Vienna State Opera
7. Albertina Museum
8. Museum of Natural History
9. Kunsthistorisches Museum
10. Ringstrasse
```

```python
print(chain.run(text="Tell me more about #2."))
```
```output
 Certainly! St. Stephen's Cathedral (Stephansdom) is one of the most recognizable landmarks in Vienna and a must-see attraction for visitors. This stunning Gothic cathedral is located in the heart of the city and is known for its intricate stone carvings, colorful stained glass windows, and impressive dome.

The cathedral was built in the 12th century and has been the site of many important events throughout history, including the coronation of Holy Roman emperors and the funeral of Mozart. Today, it is still an active place of worship and offers guided tours, concerts, and special events. Visitors can climb up the south tower for panoramic views of the city or attend a service to experience the beautiful music and chanting.
```
## 通过 `LlamaCPP` LLM 与 Llama-2 聊天

要使用带有 [LlamaCPP](/docs/integrations/llms/llamacpp) 的 Llama-2 聊天模型，请使用 [这些安装说明](/docs/integrations/llms/llamacpp#installation) 安装 `llama-cpp-python` 库。以下示例使用一个量化的 [llama-2-7b-chat.Q4_0.gguf](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_0.gguf) 模型，该模型存储在本地的 `~/Models/llama-2-7b-chat.Q4_0.gguf`。

创建 `LlamaCpp` 实例后，`llm` 再次被包装到 `Llama2Chat` 中


```python
<!--IMPORTS:[{"imported": "LlamaCpp", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamacpp.LlamaCpp.html", "title": "Llama2Chat"}]-->
from os.path import expanduser

from langchain_community.llms import LlamaCpp

model_path = expanduser("~/Models/llama-2-7b-chat.Q4_0.gguf")

llm = LlamaCpp(
    model_path=model_path,
    streaming=False,
)
model = Llama2Chat(llm=llm)
```

并以与前一个示例相同的方式使用。


```python
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chain = LLMChain(llm=model, prompt=prompt_template, memory=memory)
```


```python
print(
    chain.run(
        text="What can I see in Vienna? Propose a few locations. Names only, no details."
    )
)
```
```output
  Of course! Vienna is a beautiful city with a rich history and culture. Here are some of the top tourist attractions you might want to consider visiting:
1. Schönbrunn Palace
2. St. Stephen's Cathedral
3. Hofburg Palace
4. Belvedere Palace
5. Prater Park
6. MuseumsQuartier
7. Ringstrasse
8. Vienna State Opera
9. Kunsthistorisches Museum
10. Imperial Palace

These are just a few of the many amazing places to see in Vienna. Each one has its own unique history and charm, so I hope you enjoy exploring this beautiful city!
``````output

llama_print_timings:        load time =     250.46 ms
llama_print_timings:      sample time =      56.40 ms /   144 runs   (    0.39 ms per token,  2553.37 tokens per second)
llama_print_timings: prompt eval time =    1444.25 ms /    47 tokens (   30.73 ms per token,    32.54 tokens per second)
llama_print_timings:        eval time =    8832.02 ms /   143 runs   (   61.76 ms per token,    16.19 tokens per second)
llama_print_timings:       total time =   10645.94 ms
```

```python
print(chain.run(text="Tell me more about #2."))
```
```output
Llama.generate: prefix-match hit
``````output
  Of course! St. Stephen's Cathedral (also known as Stephansdom) is a stunning Gothic-style cathedral located in the heart of Vienna, Austria. It is one of the most recognizable landmarks in the city and is considered a symbol of Vienna.
Here are some interesting facts about St. Stephen's Cathedral:
1. History: The construction of St. Stephen's Cathedral began in the 12th century on the site of a former Romanesque church, and it took over 600 years to complete. The cathedral has been renovated and expanded several times throughout its history, with the most significant renovation taking place in the 19th century.
2. Architecture: St. Stephen's Cathedral is built in the Gothic style, characterized by its tall spires, pointed arches, and intricate stone carvings. The cathedral features a mix of Romanesque, Gothic, and Baroque elements, making it a unique blend of styles.
3. Design: The cathedral's design is based on the plan of a cross with a long nave and two shorter arms extending from it. The main altar is
``````output

llama_print_timings:        load time =     250.46 ms
llama_print_timings:      sample time =     100.60 ms /   256 runs   (    0.39 ms per token,  2544.73 tokens per second)
llama_print_timings: prompt eval time =    5128.71 ms /   160 tokens (   32.05 ms per token,    31.20 tokens per second)
llama_print_timings:        eval time =   16193.02 ms /   255 runs   (   63.50 ms per token,    15.75 tokens per second)
llama_print_timings:       total time =   21988.57 ms
```

## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
