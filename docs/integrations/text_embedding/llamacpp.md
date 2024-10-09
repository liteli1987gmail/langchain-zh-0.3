---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/llamacpp.ipynb
---
# Llama.cpp

>[llama.cpp python](https://github.com/abetlen/llama-cpp-python) 库是 `@ggerganov` 的简单 Python 绑定
>[llama.cpp](https://github.com/ggerganov/llama.cpp)。
>
>该包提供：
>
> - 通过 ctypes 接口对 C API 的低级访问。
> - 用于文本补全的高级 Python API
>   - 类似于 `OpenAI` 的 API
>   - 与 `LangChain` 兼容
>   - `LlamaIndex` 兼容性
> - OpenAI 兼容的网络服务器
>   - 本地 Copilot 替代品
>   - 函数调用支持
>   - 视觉 API 支持
>   - 多模型支持



```python
%pip install --upgrade --quiet  llama-cpp-python
```


```python
<!--IMPORTS:[{"imported": "LlamaCppEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.llamacpp.LlamaCppEmbeddings.html", "title": "Llama.cpp"}]-->
from langchain_community.embeddings import LlamaCppEmbeddings
```


```python
llama = LlamaCppEmbeddings(model_path="/path/to/model/ggml-model-q4_0.bin")
```


```python
text = "This is a test document."
```


```python
query_result = llama.embed_query(text)
```


```python
doc_result = llama.embed_documents([text])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
