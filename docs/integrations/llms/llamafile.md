---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/llamafile.ipynb
---
# Llamafile

[Llamafile](https://github.com/Mozilla-Ocho/llamafile) 让你通过一个文件分发和运行大型语言模型。

Llamafile 通过将 [llama.cpp](https://github.com/ggerganov/llama.cpp) 和 [Cosmopolitan Libc](https://github.com/jart/cosmopolitan) 结合成一个框架，将大型语言模型的所有复杂性简化为一个单文件可执行文件（称为“llamafile”），该文件可以在大多数计算机上本地运行，无需安装。

## 设置

1. 下载你想使用的模型的 llamafile。你可以在 [HuggingFace](https://huggingface.co/models?other=llamafile) 上找到许多以 llamafile 格式提供的模型。在本指南中，我们将下载一个小模型 `TinyLlama-1.1B-Chat-v1.0.Q5_K_M`。注意：如果你没有 `wget`，你可以通过这个 [链接](https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile?download=true) 下载模型。

```bash
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile
```

2. 使 llamafile 可执行。首先，如果您还没有这样做，请打开终端。**如果您使用的是 MacOS、Linux 或 BSD，** 您需要使用 `chmod` 授予计算机执行此新文件的权限（见下文）。**如果您在 Windows 上，** 请通过在文件末尾添加“.exe”来重命名文件（模型文件应命名为 `TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile.exe`）。


```bash
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile  # run if you're on MacOS, Linux, or BSD
```

3. 以“服务器模式”运行 llamafile：

```bash
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

现在您可以调用 llamafile 的 REST API。默认情况下，llamafile 服务器在 http://localhost:8080 监听。您可以在 [这里](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) 找到完整的服务器文档。您可以通过 REST API 直接与 llamafile 交互，但在这里我们将展示如何使用 LangChain 与其交互。


## 用法


```python
<!--IMPORTS:[{"imported": "Llamafile", "source": "langchain_community.llms.llamafile", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.llamafile.Llamafile.html", "title": "Llamafile"}]-->
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("Tell me a joke")
```



```output
'? \nI\'ve got a thing for pink, but you know that.\n"Can we not talk about work anymore?" - What did she say?\nI don\'t want to be a burden on you.\nIt\'s hard to keep a good thing going.\nYou can\'t tell me what I want, I have a life too!'
```


要流式传输令牌，请使用 `.stream(...)` 方法：


```python
query = "Tell me a joke"

for chunks in llm.stream(query):
    print(chunks, end="")

print()
```
```output
.
- She said, "I’m tired of my life. What should I do?"
- The man replied, "I hear you. But don’t worry. Life is just like a joke. It has its funny parts too."
- The woman looked at him, amazed and happy to hear his wise words. - "Thank you for your wisdom," she said, smiling. - He replied, "Any time. But it doesn't come easy. You have to laugh and keep moving forward in life."
- She nodded, thanking him again. - The man smiled wryly. "Life can be tough. Sometimes it seems like you’re never going to get out of your situation."
- He said, "I know that. But the key is not giving up. Life has many ups and downs, but in the end, it will turn out okay."
- The woman's eyes softened. "Thank you for your advice. It's so important to keep moving forward in life," she said. - He nodded once again. "You’re welcome. I hope your journey is filled with laughter and joy."
- They both smiled and left the bar, ready to embark on their respective adventures.
```
要了解更多关于 LangChain 表达式语言及 LLM 上可用方法的信息，请参见 [LCEL 接口](/docs/concepts#interface)


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
