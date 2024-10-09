---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/llamafile.ipynb
---
# llamafile

让我们加载 [llamafile](https://github.com/Mozilla-Ocho/llamafile) 嵌入类。

## 设置

首先，有 3 个设置步骤：

1. 下载一个 llamafile。在这个笔记本中，我们使用 `TinyLlama-1.1B-Chat-v1.0.Q5_K_M`，但在 [HuggingFace](https://huggingface.co/models?other=llamafile) 上还有许多其他可用的选项。
2. 使 llamafile 可执行。
3. 以服务器模式启动 llamafile。

您可以运行以下 bash 脚本来完成所有这些：


```bash
%%bash
# llamafile setup

# Step 1: Download a llamafile. The download may take several minutes.
wget -nv -nc https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 2: Make the llamafile executable. Note: if you're on Windows, just append '.exe' to the filename.
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 3: Start llamafile server in background. All the server logs will be written to 'tinyllama.log'.
# Alternatively, you can just open a separate terminal outside this notebook and run: 
#   ./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding > tinyllama.log 2>&1 &
pid=$!
echo "${pid}" > .llamafile_pid  # write the process pid to a file so we can terminate the server later
```

## 使用 LlamafileEmbeddings 嵌入文本

现在，我们可以使用 `LlamafileEmbeddings` 类与当前在 http://localhost:8080 上提供 TinyLlama 模型的 llamafile 服务器进行交互。


```python
<!--IMPORTS:[{"imported": "LlamafileEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.llamafile.LlamafileEmbeddings.html", "title": "llamafile"}]-->
from langchain_community.embeddings import LlamafileEmbeddings
```


```python
embedder = LlamafileEmbeddings()
```


```python
text = "This is a test document."
```

要生成嵌入，您可以查询单个文本，或者查询文本列表。


```python
query_result = embedder.embed_query(text)
query_result[:5]
```


```python
doc_result = embedder.embed_documents([text])
doc_result[0][:5]
```


```bash
%%bash
# cleanup: kill the llamafile server process
kill $(cat .llamafile_pid)
rm .llamafile_pid
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
