---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/llamacpp.ipynb
---
# Llama.cpp

[llama-cpp-python](https://github.com/abetlen/llama-cpp-python) 是 [llama.cpp](https://github.com/ggerganov/llama.cpp) 的 Python 绑定。

它支持对 [许多大型语言模型](https://github.com/ggerganov/llama.cpp#description) 的推理，这些模型可以在 [Hugging Face](https://huggingface.co/TheBloke) 上访问。

本笔记本介绍了如何在 LangChain 中运行 `llama-cpp-python`。

**注意：`llama-cpp-python` 的新版本使用 GGUF 模型文件（见 [这里](https://github.com/abetlen/llama-cpp-python/pull/633)）。**

这是一个重大变更。
 
要将现有的 GGML 模型转换为 GGUF，您可以在 [llama.cpp](https://github.com/ggerganov/llama.cpp) 中运行以下命令：

```
python ./convert-llama-ggmlv3-to-gguf.py --eps 1e-5 --input models/openorca-platypus2-13b.ggmlv3.q4_0.bin --output models/openorca-platypus2-13b.gguf.q4_0.bin
```

## 安装

有多种安装 llama-cpp 包的选项：
- 仅使用 CPU
- CPU + GPU（使用多种 BLAS 后端之一）
- Metal GPU（适用于带有 Apple Silicon 芯片的 MacOS）

### 仅 CPU 安装


```python
%pip install --upgrade --quiet  llama-cpp-python
```

### 使用 OpenBLAS / cuBLAS / CLBlast 安装

`llama.cpp` 支持多种 BLAS 后端以实现更快的处理。使用 `FORCE_CMAKE=1` 环境变量强制使用 cmake，并安装所需 BLAS 后端的 pip 包（[来源](https://github.com/abetlen/llama-cpp-python#installation-with-openblas--cublas--clblast)）。

使用 cuBLAS 后端的示例安装：


```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**重要**：如果您已经安装了仅 CPU 版本的包，则需要从头开始重新安装。请考虑以下命令：


```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### 使用 Metal 安装

`llama.cpp` 支持 Apple silicon 的原生支持 - 通过 ARM NEON、Accelerate 和 Metal 框架进行优化。使用 `FORCE_CMAKE=1` 环境变量强制使用 cmake 并安装支持 Metal 的 pip 包 ([源](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md))。

带有 Metal 支持的示例安装：


```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**重要**：如果您已经安装了仅 CPU 版本的包，则需要从头开始重新安装：请考虑以下命令：


```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### 使用 Windows 安装

通过从源代码编译安装 `llama-cpp-python` 库是稳定的。您可以遵循大部分存储库中的说明，但还有一些特定于 Windows 的说明可能会有用。

安装 `llama-cpp-python` 的要求，

- git
- python
- cmake
- Visual Studio Community（确保使用以下设置安装）
- C++桌面开发
- Python开发
- C++嵌入式Linux开发

1. 递归克隆git仓库以获取`llama.cpp`子模块

```
git clone --recursive -j8 https://github.com/abetlen/llama-cpp-python.git
```

2. 打开命令提示符并设置以下环境变量。


```
set FORCE_CMAKE=1
set CMAKE_ARGS=-DLLAMA_CUBLAS=OFF
```
如果您有NVIDIA GPU，请确保`DLLAMA_CUBLAS`设置为`ON`

#### 编译和安装

现在您可以`cd`进入`llama-cpp-python`目录并安装该包

```
python -m pip install -e .
```

**重要**：如果您已经安装了仅CPU版本的包，则需要从头重新安装：请考虑以下命令：


```python
!python -m pip install -e . --force-reinstall --no-cache-dir
```

## 使用

确保您遵循所有说明以[安装所有必要的模型文件](https://github.com/ggerganov/llama.cpp)。

您不需要 `API_TOKEN`，因为您将在本地运行大型语言模型。

了解哪些模型适合在所需机器上使用是很重要的。

[TheBloke's](https://huggingface.co/TheBloke) Hugging Face 模型有一个 `提供的文件` 部分，展示了运行不同量化大小和方法的模型所需的内存 (例如: [Llama2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF#provided-files))。

这个 [github 问题](https://github.com/facebookresearch/llama/issues/425) 也与找到适合您机器的正确模型相关。


```python
<!--IMPORTS:[{"imported": "LlamaCpp", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamacpp.LlamaCpp.html", "title": "Llama.cpp"}, {"imported": "CallbackManager", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.manager.CallbackManager.html", "title": "Llama.cpp"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "Llama.cpp"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Llama.cpp"}]-->
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

**考虑使用适合您模型的模板！请查看 Hugging Face 等的模型页面以获取正确的提示模板。**


```python
template = """Question: {question}

Answer: Let's work this out in a step by step way to be sure we have the right answer."""

prompt = PromptTemplate.from_template(template)
```


```python
# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
```

### CPU

使用 LLaMA 2 7B 模型的示例


```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    temperature=0.75,
    max_tokens=2000,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```


```python
question = """
Question: A rap battle between Stephen Colbert and John Oliver
"""
llm.invoke(question)
```
```output

Stephen Colbert:
Yo, John, I heard you've been talkin' smack about me on your show.
Let me tell you somethin', pal, I'm the king of late-night TV
My satire is sharp as a razor, it cuts deeper than a knife
While you're just a british bloke tryin' to be funny with your accent and your wit.
John Oliver:
Oh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.
My show is the one that people actually watch and listen to, not just for the laughs but for the facts.
While you're busy talkin' trash, I'm out here bringing the truth to light.
Stephen Colbert:
Truth? Ha! You think your show is about truth? Please, it's all just a joke to you.
You're just a fancy-pants british guy tryin' to be funny with your news and your jokes.
While I'm the one who's really makin' a difference, with my sat
``````output

llama_print_timings:        load time =   358.60 ms
llama_print_timings:      sample time =   172.55 ms /   256 runs   (    0.67 ms per token,  1483.59 tokens per second)
llama_print_timings: prompt eval time =   613.36 ms /    16 tokens (   38.33 ms per token,    26.09 tokens per second)
llama_print_timings:        eval time = 10151.17 ms /   255 runs   (   39.81 ms per token,    25.12 tokens per second)
llama_print_timings:       total time = 11332.41 ms
```


```output
"\nStephen Colbert:\nYo, John, I heard you've been talkin' smack about me on your show.\nLet me tell you somethin', pal, I'm the king of late-night TV\nMy satire is sharp as a razor, it cuts deeper than a knife\nWhile you're just a british bloke tryin' to be funny with your accent and your wit.\nJohn Oliver:\nOh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.\nMy show is the one that people actually watch and listen to, not just for the laughs but for the facts.\nWhile you're busy talkin' trash, I'm out here bringing the truth to light.\nStephen Colbert:\nTruth? Ha! You think your show is about truth? Please, it's all just a joke to you.\nYou're just a fancy-pants british guy tryin' to be funny with your news and your jokes.\nWhile I'm the one who's really makin' a difference, with my sat"
```


使用 LLaMA v1 模型的示例


```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="./ggml-model-q4_0.bin", callback_manager=callback_manager, verbose=True
)
```


```python
llm_chain = prompt | llm
```


```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```
```output


1. First, find out when Justin Bieber was born.
2. We know that Justin Bieber was born on March 1, 1994.
3. Next, we need to look up when the Super Bowl was played in that year.
4. The Super Bowl was played on January 28, 1995.
5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.
``````output

llama_print_timings:        load time =   434.15 ms
llama_print_timings:      sample time =    41.81 ms /   121 runs   (    0.35 ms per token)
llama_print_timings: prompt eval time =  2523.78 ms /    48 tokens (   52.58 ms per token)
llama_print_timings:        eval time = 23971.57 ms /   121 runs   (  198.11 ms per token)
llama_print_timings:       total time = 28945.95 ms
```


```output
'\n\n1. First, find out when Justin Bieber was born.\n2. We know that Justin Bieber was born on March 1, 1994.\n3. Next, we need to look up when the Super Bowl was played in that year.\n4. The Super Bowl was played on January 28, 1995.\n5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.'
```


### GPU

如果使用BLAS后端的安装正确，您将在模型属性中看到一个 `BLAS = 1` 指示器。

与GPU一起使用的两个最重要的参数是：

- `n_gpu_layers` - 确定有多少层模型被卸载到您的GPU上。
- `n_batch` - 并行处理的令牌数量。

正确设置这些参数将显著提高评估速度（有关更多详细信息，请参见 [wrapper code](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py)）。


```python
n_gpu_layers = -1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```


```python
llm_chain = prompt | llm
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```
```output


1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.

2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.

3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.

So, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl.
``````output

llama_print_timings:        load time =   427.63 ms
llama_print_timings:      sample time =   115.85 ms /   164 runs   (    0.71 ms per token,  1415.67 tokens per second)
llama_print_timings: prompt eval time =   427.53 ms /    45 tokens (    9.50 ms per token,   105.26 tokens per second)
llama_print_timings:        eval time =  4526.53 ms /   163 runs   (   27.77 ms per token,    36.01 tokens per second)
llama_print_timings:       total time =  5293.77 ms
```


```output
"\n\n1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.\n\n2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.\n\n3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.\n\nSo, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl."
```


### Metal

如果 Metal 的安装正确，您将在模型属性中看到 `NEON = 1` 指示器。

两个最重要的 GPU 参数是：

- `n_gpu_layers` - 确定有多少层模型被卸载到您的 Metal GPU。
- `n_batch` - 并行处理的令牌数量，默认值为 8，可以设置为更大的数字。
- `f16_kv` - 出于某种原因，Metal 仅支持 `True`，否则您将收到错误，例如 `Asserting on type 0'，'GGML_ASSERT: .../ggml-metal.m:706: false && "not implemented"`。
GGML_ASSERT: .../ggml-metal.m:706: false && "未实现"`

正确设置这些参数将显著提高评估速度（有关更多详细信息，请参见 [包装代码](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py)）。


```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

控制台日志将显示以下日志，以指示 Metal 已正确启用。

```
ggml_metal_init: allocating
ggml_metal_init: using MPS
...
```

您还可以通过观察进程的GPU使用情况来检查`活动监视器`，在将`n_gpu_layers=1`打开后，CPU使用率会显著下降。

由于在Metal GPU中进行模型编译，首次调用LLM时性能可能较慢。

### 语法

我们可以使用[语法](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md)来约束模型输出，并根据其中定义的规则采样令牌。

为了演示这个概念，我们包含了[示例语法文件](https://github.com/langchain-ai/langchain/tree/master/libs/langchain/langchain/llms/grammars)，将在下面的示例中使用。

创建gbnf语法文件可能会耗时，但如果您有输出模式重要的用例，有两个工具可以帮助您：
- [在线语法生成器应用](https://grammar.intrinsiclabs.ai/)，将TypeScript接口定义转换为gbnf文件。
- [Python脚本](https://github.com/ggerganov/llama.cpp/blob/master/examples/json-schema-to-grammar.py)，用于将json模式转换为gbnf文件。例如，您可以创建`pydantic`对象，使用`.schema_json()`方法生成其JSON模式，然后使用此脚本将其转换为gbnf文件。

在第一个示例中，提供指定的`json.gbnf`文件的路径以生成JSON：


```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/json.gbnf",
)
```


```python
%%capture captured --no-stdout
result = llm.invoke("Describe a person in JSON format:")
```
```output
{
  "name": "John Doe",
  "age": 34,
  "": {
    "title": "Software Developer",
    "company": "Google"
  },
  "interests": [
    "Sports",
    "Music",
    "Cooking"
  ],
  "address": {
    "street_number": 123,
    "street_name": "Oak Street",
    "city": "Mountain View",
    "state": "California",
    "postal_code": 94040
  }}
``````output

llama_print_timings:        load time =   357.51 ms
llama_print_timings:      sample time =  1213.30 ms /   144 runs   (    8.43 ms per token,   118.68 tokens per second)
llama_print_timings: prompt eval time =   356.78 ms /     9 tokens (   39.64 ms per token,    25.23 tokens per second)
llama_print_timings:        eval time =  3947.16 ms /   143 runs   (   27.60 ms per token,    36.23 tokens per second)
llama_print_timings:       total time =  5846.21 ms
```
我们还可以提供 `list.gbnf` 来返回一个列表：


```python
n_gpu_layers = 1
n_batch = 512
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/list.gbnf",
)
```


```python
%%capture captured --no-stdout
result = llm.invoke("List of top-3 my favourite books:")
```
```output
["The Catcher in the Rye", "Wuthering Heights", "Anna Karenina"]
``````output

llama_print_timings:        load time =   322.34 ms
llama_print_timings:      sample time =   232.60 ms /    26 runs   (    8.95 ms per token,   111.78 tokens per second)
llama_print_timings: prompt eval time =   321.90 ms /    11 tokens (   29.26 ms per token,    34.17 tokens per second)
llama_print_timings:        eval time =   680.82 ms /    25 runs   (   27.23 ms per token,    36.72 tokens per second)
llama_print_timings:       total time =  1295.27 ms
```

## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
