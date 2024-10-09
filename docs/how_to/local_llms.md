---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/local_llms.ipynb
---
# 在本地运行模型

## 用例

像 [llama.cpp](https://github.com/ggerganov/llama.cpp)、[Ollama](https://github.com/ollama/ollama)、[GPT4All](https://github.com/nomic-ai/gpt4all)、[llamafile](https://github.com/Mozilla-Ocho/llamafile) 等项目的流行突显了在本地（在您自己的设备上）运行大型语言模型（LLMs）的需求。

这至少有两个重要的好处：

1. `隐私`：您的数据不会发送给第三方，也不受商业服务条款的约束。
2. `成本`：没有推理费用，这对于需要大量令牌的应用程序（例如，[长时间运行的模拟](https://twitter.com/RLanceMartin/status/1691097659262820352?s=20)、摘要）非常重要。

## 概述

在本地运行大型语言模型（LLM）需要一些条件：

1. `开源LLM`：一个可以自由修改和共享的开源大型语言模型。
2. `推理`：能够在您的设备上以可接受的延迟运行该LLM。

### 开源大型语言模型

用户现在可以访问一组快速增长的[开源大型语言模型](https://cameronrwolfe.substack.com/p/the-history-of-open-source-llms-better)。

这些大型语言模型可以从至少两个维度进行评估（见图）：
 
1. `基础模型`：基础模型是什么，它是如何训练的？
2. `微调方法`：基础模型是否经过微调，如果是，使用了什么[指令集](https://cameronrwolfe.substack.com/p/beyond-llama-the-power-of-open-llms#%C2%A7alpaca-an-instruction-following-llama-model)？

![Image description](../../static/img/OSS_LLM_overview.png)

这些模型的相对性能可以通过几个排行榜进行评估，包括：

1. [LmSys](https://chat.lmsys.org/?arena)
2. [GPT4All](https://gpt4all.io/index.html)
3. [HuggingFace](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)

### 推理

为支持在各种设备上推理开源大型语言模型，已经出现了一些框架：

1. [`llama.cpp`](https://github.com/ggerganov/llama.cpp): C++实现的llama推理代码，具有[权重优化/量化](https://finbarr.ca/how-is-llama-cpp-possible/)
2. [`gpt4all`](https://docs.gpt4all.io/index.html): 优化的C后端用于推理
3. [`Ollama`](https://ollama.ai/): 将模型权重和环境打包成一个在设备上运行并提供大型语言模型的应用
4. [`llamafile`](https://github.com/Mozilla-Ocho/llamafile): 将模型权重和运行模型所需的一切打包到一个文件中，允许您从该文件本地运行大型语言模型，而无需任何额外的安装步骤

一般来说，这些框架会做几件事：

1. `量化`: 减少原始模型权重的内存占用
2. `高效的推理实现`: 支持在消费级硬件（例如，CPU或笔记本GPU）上进行推理

特别是，请参阅[这篇优秀的文章](https://finbarr.ca/how-is-llama-cpp-possible/)关于量化重要性的讨论。

![Image description](../../static/img/llama-memory-weights.png)

通过降低精度，我们大幅减少了存储大型语言模型所需的内存。

此外，我们可以看到GPU内存带宽的重要性 [表格](https://docs.google.com/spreadsheets/d/1OehfHHNSn66BP2h3Bxp2NJTVX97icU0GmCXF6pK23H8/edit#gid=0)！

由于更大的GPU内存带宽，Mac M2 Max在推理时比M1快5-6倍。

![Image description](../../static/img/llama_t_put.png)

### 格式化提示词

一些大模型供应商有 [聊天模型](/docs/concepts/#chat-models) 的封装，可以处理您所使用的特定本地模型的输入提示格式。然而，如果您使用 [文本输入/文本输出大型语言模型](/docs/concepts/#llms) 的封装来提示本地模型，您可能需要使用针对您特定模型的提示。

这可能 [需要包含特殊标记](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)。 [这是LLaMA 2的一个示例](https://smith.langchain.com/hub/rlm/rag-prompt-llama)。

## 快速入门

[`Ollama`](https://ollama.ai/) 是在macOS上轻松运行推理的一种方式。
 
这里的说明 [here](https://github.com/jmorganca/ollama?tab=readme-ov-file#ollama) 提供了详细信息，我们总结如下：
 
* [下载并运行](https://ollama.ai/download) 应用程序
* 从命令行中，从这个 [选项列表](https://github.com/jmorganca/ollama) 中获取模型：例如，`ollama pull llama3.1:8b`
* 当应用程序运行时，所有模型会自动在 `localhost:11434` 上提供服务



```python
%pip install -qU langchain_ollama
```


```python
<!--IMPORTS:[{"imported": "OllamaLLM", "source": "langchain_ollama", "docs": "https://python.langchain.com/api_reference/ollama/llms/langchain_ollama.llms.OllamaLLM.html", "title": "Run models locally"}]-->
from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="llama3.1:8b")

llm.invoke("The first man on the moon was ...")
```



```output
'...Neil Armstrong!\n\nOn July 20, 1969, Neil Armstrong became the first person to set foot on the lunar surface, famously declaring "That\'s one small step for man, one giant leap for mankind" as he stepped off the lunar module Eagle onto the Moon\'s surface.\n\nWould you like to know more about the Apollo 11 mission or Neil Armstrong\'s achievements?'
```


流式传输生成的令牌：


```python
for chunk in llm.stream("The first man on the moon was ..."):
    print(chunk, end="|", flush=True)
```
```output
...|
``````output
Neil| Armstrong|,| an| American| astronaut|.| He| stepped| out| of| the| lunar| module| Eagle| and| onto| the| surface| of| the| Moon| on| July| |20|,| |196|9|,| famously| declaring|:| "|That|'s| one| small| step| for| man|,| one| giant| leap| for| mankind|."||
```
Ollama 还包括一个聊天模型包装器，用于处理对话轮次的格式化：


```python
<!--IMPORTS:[{"imported": "ChatOllama", "source": "langchain_ollama", "docs": "https://python.langchain.com/api_reference/ollama/chat_models/langchain_ollama.chat_models.ChatOllama.html", "title": "Run models locally"}]-->
from langchain_ollama import ChatOllama

chat_model = ChatOllama(model="llama3.1:8b")

chat_model.invoke("Who was the first man on the moon?")
```



```output
AIMessage(content='The answer is a historic one!\n\nThe first man to walk on the Moon was Neil Armstrong, an American astronaut and commander of the Apollo 11 mission. On July 20, 1969, Armstrong stepped out of the lunar module Eagle onto the surface of the Moon, famously declaring:\n\n"That\'s one small step for man, one giant leap for mankind."\n\nArmstrong was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the Moon during the mission. Michael Collins remained in orbit around the Moon in the command module Columbia.\n\nNeil Armstrong passed away on August 25, 2012, but his legacy as a pioneering astronaut and engineer continues to inspire people around the world!', response_metadata={'model': 'llama3.1:8b', 'created_at': '2024-08-01T00:38:29.176717Z', 'message': {'role': 'assistant', 'content': ''}, 'done_reason': 'stop', 'done': True, 'total_duration': 10681861417, 'load_duration': 34270292, 'prompt_eval_count': 19, 'prompt_eval_duration': 6209448000, 'eval_count': 141, 'eval_duration': 4432022000}, id='run-7bed57c5-7f54-4092-912c-ae49073dcd48-0', usage_metadata={'input_tokens': 19, 'output_tokens': 141, 'total_tokens': 160})
```


## 环境

在本地运行模型时，推理速度是一个挑战（见上文）。

为了最小化延迟，最好在 GPU 上本地运行模型，许多消费类笔记本电脑都配备了 GPU [例如，Apple 设备](https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/)。

即使有 GPU，现有的 GPU 内存带宽（如上所述）也很重要。

### 运行 Apple 硅 GPU

`Ollama` 和 [`llamafile`](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#gpu-support) 将自动利用 Apple 设备上的 GPU。
 
其他框架要求用户设置环境以利用 Apple GPU。

例如，`llama.cpp` 的 Python 绑定可以通过 [Metal](https://developer.apple.com/metal/) 配置为使用 GPU。

Metal 是由 Apple 创建的图形和计算 API，提供对 GPU 的近乎直接访问。

请在这里查看[`llama.cpp`](/docs/integrations/llms/llamacpp)的设置，以启用此功能。

特别是，确保conda正在使用您创建的正确虚拟环境（`miniforge3`）。

例如，对我来说：

```
conda activate /Users/rlm/miniforge3/envs/llama
```

确认上述内容后，

```
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## 大型语言模型

有多种方法可以获取量化模型权重。

1. [`HuggingFace`](https://huggingface.co/TheBloke) - 许多量化模型可供下载，并可以使用[`llama.cpp`](https://github.com/ggerganov/llama.cpp)等框架运行。您还可以从HuggingFace下载[`llamafile`格式](https://huggingface.co/models?other=llamafile)的模型。
2. [`gpt4all`](https://gpt4all.io/index.html) - 模型浏览器提供了可下载的量化模型的指标排行榜。
3. [`Ollama`](https://github.com/jmorganca/ollama) - 可以通过`pull`直接访问多个模型。

### Ollama

使用 [Ollama](https://github.com/jmorganca/ollama)，通过 `ollama pull <模型系列>:<标签>` 获取模型：

* 例如，对于 Llama 2 7b：`ollama pull llama2` 将下载模型的最基本版本（例如，最小的参数数量和 4 位量化）
* 我们还可以从 [模型列表](https://github.com/jmorganca/ollama?tab=readme-ov-file#model-library) 指定特定版本，例如 `ollama pull llama2:13b`
* 请参阅 [API 参考页面](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ollama.Ollama.html) 以获取完整的参数集。


```python
llm = OllamaLLM(model="llama2:13b")
llm.invoke("The first man on the moon was ... think step by step")
```



```output
' Sure! Here\'s the answer, broken down step by step:\n\nThe first man on the moon was... Neil Armstrong.\n\nHere\'s how I arrived at that answer:\n\n1. The first manned mission to land on the moon was Apollo 11.\n2. The mission included three astronauts: Neil Armstrong, Edwin "Buzz" Aldrin, and Michael Collins.\n3. Neil Armstrong was the mission commander and the first person to set foot on the moon.\n4. On July 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind."\n\nSo, the first man on the moon was Neil Armstrong!'
```


### Llama.cpp

Llama.cpp 兼容 [广泛的模型集](https://github.com/ggerganov/llama.cpp)。

例如，下面我们在从 [HuggingFace](https://huggingface.co/TheBloke/Llama-2-13B-GGML/tree/main) 下载的 4 位量化的 `llama2-13b` 上运行推理。

如上所述，请参阅 [API 参考](https://python.langchain.com/api_reference/langchain/llms/langchain.llms.llamacpp.LlamaCpp.html?highlight=llamacpp#langchain.llms.llamacpp.LlamaCpp) 以获取完整的参数集。

从 [llama.cpp API 参考文档](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamacpp.LlamaCpp.html) 中，有几个值得评论：

`n_gpu_layers`：要加载到 GPU 内存中的层数

* 值: 1
* 意义: 仅会将模型的一层加载到GPU内存中（1通常是足够的）。

`n_batch`: 模型应并行处理的令牌数量

* 值: n_batch
* 意义: 建议选择一个介于1和n_ctx之间的值（在本例中设置为2048）

`n_ctx`: 令牌上下文窗口

* 值: 2048
* 意义: 模型将同时考虑2048个令牌的窗口

`f16_kv`: 模型是否应使用半精度进行键/值缓存

* 值: True
* 意思：模型将使用半精度，这可以更有效地利用内存；Metal 仅支持 True。


```python
%env CMAKE_ARGS="-DLLAMA_METAL=on"
%env FORCE_CMAKE=1
%pip install --upgrade --quiet  llama-cpp-python --no-cache-dirclear
```


```python
<!--IMPORTS:[{"imported": "LlamaCpp", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamacpp.LlamaCpp.html", "title": "Run models locally"}, {"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "Run models locally"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Run models locally"}]-->
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler

llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

控制台日志将显示以下内容，以指示 Metal 已正确启用：
```
ggml_metal_init: allocating
ggml_metal_init: using MPS
```


```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```
```output
Llama.generate: prefix-match hit
``````output
 and use logical reasoning to figure out who the first man on the moon was.

Here are some clues:

1. The first man on the moon was an American.
2. He was part of the Apollo 11 mission.
3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.
4. His last name is Armstrong.

Now, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.
Therefore, the first man on the moon was Neil Armstrong!
``````output

llama_print_timings:        load time =  9623.21 ms
llama_print_timings:      sample time =   143.77 ms /   203 runs   (    0.71 ms per token,  1412.01 tokens per second)
llama_print_timings: prompt eval time =   485.94 ms /     7 tokens (   69.42 ms per token,    14.40 tokens per second)
llama_print_timings:        eval time =  6385.16 ms /   202 runs   (   31.61 ms per token,    31.64 tokens per second)
llama_print_timings:       total time =  7279.28 ms
```


```output
" and use logical reasoning to figure out who the first man on the moon was.\n\nHere are some clues:\n\n1. The first man on the moon was an American.\n2. He was part of the Apollo 11 mission.\n3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.\n4. His last name is Armstrong.\n\nNow, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.\nTherefore, the first man on the moon was Neil Armstrong!"
```


### GPT4All

我们可以使用从 [GPT4All](/docs/integrations/llms/gpt4all) 模型浏览器下载的模型权重。

与上面所示类似，我们可以运行推理并使用 [API 参考](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gpt4all.GPT4All.html) 来设置感兴趣的参数。


```python
%pip install gpt4all
```


```python
<!--IMPORTS:[{"imported": "GPT4All", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gpt4all.GPT4All.html", "title": "Run models locally"}]-->
from langchain_community.llms import GPT4All

llm = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin"
)
```


```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```



```output
".\n1) The United States decides to send a manned mission to the moon.2) They choose their best astronauts and train them for this specific mission.3) They build a spacecraft that can take humans to the moon, called the Lunar Module (LM).4) They also create a larger spacecraft, called the Saturn V rocket, which will launch both the LM and the Command Service Module (CSM), which will carry the astronauts into orbit.5) The mission is planned down to the smallest detail: from the trajectory of the rockets to the exact movements of the astronauts during their moon landing.6) On July 16, 1969, the Saturn V rocket launches from Kennedy Space Center in Florida, carrying the Apollo 11 mission crew into space.7) After one and a half orbits around the Earth, the LM separates from the CSM and begins its descent to the moon's surface.8) On July 20, 1969, at 2:56 pm EDT (GMT-4), Neil Armstrong becomes the first man on the moon. He speaks these"
```


### llamafile

在本地运行 LLM 的最简单方法之一是使用 [llamafile](https://github.com/Mozilla-Ocho/llamafile)。您需要做的就是：

1) 从 [HuggingFace](https://huggingface.co/models?other=llamafile) 下载一个 llamafile
2) 使文件可执行
3) 运行该文件

llamafiles捆绑模型权重和一个[特别编译的](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details)版本的[`llama.cpp`](https://github.com/ggerganov/llama.cpp)，将其合并为一个可以在大多数计算机上运行的单一文件，包含任何额外的依赖项。它们还配备了一个嵌入式推理服务器，提供与您的模型交互的[API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints)。

这是一个简单的bash脚本，展示了所有3个设置步骤：

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

在您运行上述设置步骤后，您可以使用LangChain与您的模型进行交互：


```python
<!--IMPORTS:[{"imported": "Llamafile", "source": "langchain_community.llms.llamafile", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamafile.Llamafile.html", "title": "Run models locally"}]-->
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("The first man on the moon was ... Let's think step by step.")
```



```output
"\nFirstly, let's imagine the scene where Neil Armstrong stepped onto the moon. This happened in 1969. The first man on the moon was Neil Armstrong. We already know that.\n2nd, let's take a step back. Neil Armstrong didn't have any special powers. He had to land his spacecraft safely on the moon without injuring anyone or causing any damage. If he failed to do this, he would have been killed along with all those people who were on board the spacecraft.\n3rd, let's imagine that Neil Armstrong successfully landed his spacecraft on the moon and made it back to Earth safely. The next step was for him to be hailed as a hero by his people back home. It took years before Neil Armstrong became an American hero.\n4th, let's take another step back. Let's imagine that Neil Armstrong wasn't hailed as a hero, and instead, he was just forgotten. This happened in the 1970s. Neil Armstrong wasn't recognized for his remarkable achievement on the moon until after he died.\n5th, let's take another step back. Let's imagine that Neil Armstrong didn't die in the 1970s and instead, lived to be a hundred years old. This happened in 2036. In the year 2036, Neil Armstrong would have been a centenarian.\nNow, let's think about the present. Neil Armstrong is still alive. He turned 95 years old on July 20th, 2018. If he were to die now, his achievement of becoming the first human being to set foot on the moon would remain an unforgettable moment in history.\nI hope this helps you understand the significance and importance of Neil Armstrong's achievement on the moon!"
```


## 提示词

某些大型语言模型将受益于特定的提示词。

例如，LLaMA将使用[特殊标记](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20)。

我们可以使用`ConditionalPromptSelector`根据模型类型设置提示词。


```python
# Set our LLM
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

根据模型版本设置相关的提示词。


```python
<!--IMPORTS:[{"imported": "ConditionalPromptSelector", "source": "langchain.chains.prompt_selector", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.prompt_selector.ConditionalPromptSelector.html", "title": "Run models locally"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Run models locally"}]-->
from langchain.chains.prompt_selector import ConditionalPromptSelector
from langchain_core.prompts import PromptTemplate

DEFAULT_LLAMA_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""<<SYS>> \n You are an assistant tasked with improving Google search \
results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that \
are similar to this question. The output should be a numbered list of questions \
and each should have a question mark at the end: \n\n {question} [/INST]""",
)

DEFAULT_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an assistant tasked with improving Google search \
results. Generate THREE Google search queries that are similar to \
this question. The output should be a numbered list of questions and each \
should have a question mark at the end: {question}""",
)

QUESTION_PROMPT_SELECTOR = ConditionalPromptSelector(
    default_prompt=DEFAULT_SEARCH_PROMPT,
    conditionals=[(lambda llm: isinstance(llm, LlamaCpp), DEFAULT_LLAMA_SEARCH_PROMPT)],
)

prompt = QUESTION_PROMPT_SELECTOR.get_prompt(llm)
prompt
```



```output
PromptTemplate(input_variables=['question'], output_parser=None, partial_variables={}, template='<<SYS>> \n You are an assistant tasked with improving Google search results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that are similar to this question. The output should be a numbered list of questions and each should have a question mark at the end: \n\n {question} [/INST]', template_format='f-string', validate_template=True)
```



```python
# Chain
chain = prompt | llm
question = "What NFL team won the Super Bowl in the year that Justin Bieber was born?"
chain.invoke({"question": question})
```
```output
  Sure! Here are three similar search queries with a question mark at the end:

1. Which NBA team did LeBron James lead to a championship in the year he was drafted?
2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?
3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?
``````output

llama_print_timings:        load time = 14943.19 ms
llama_print_timings:      sample time =    72.93 ms /   101 runs   (    0.72 ms per token,  1384.87 tokens per second)
llama_print_timings: prompt eval time = 14942.95 ms /    93 tokens (  160.68 ms per token,     6.22 tokens per second)
llama_print_timings:        eval time =  3430.85 ms /   100 runs   (   34.31 ms per token,    29.15 tokens per second)
llama_print_timings:       total time = 18578.26 ms
```


```output
'  Sure! Here are three similar search queries with a question mark at the end:\n\n1. Which NBA team did LeBron James lead to a championship in the year he was drafted?\n2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?\n3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?'
```


我们还可以使用LangChain提示中心来获取和/或存储特定于模型的提示。

这将与您的[LangSmith API密钥](https://docs.smith.langchain.com/)一起使用。

例如，[这里](https://smith.langchain.com/hub/rlm/rag-prompt-llama)是一个针对RAG的提示，使用了LLaMA特定的标记。

## 用例

给定一个从上述模型之一创建的`llm`，您可以用于[许多用例](/docs/how_to#use-cases)。

例如，这里是一个关于[本地RAG](/docs/tutorials/local_rag)的指南，适用于本地LLMs。

一般来说，本地LLMs的用例可以由至少两个因素驱动：

* `隐私`: 用户不想分享的私人数据（例如，日记等）
* `成本`: 文本预处理（提取/标记）、摘要和代理模拟是使用令牌密集型的任务

此外，[这里](https://blog.langchain.dev/using-langsmith-to-support-fine-tuning-of-open-source-llms/)是关于微调的概述，可以利用开源大型语言模型（LLMs）。
