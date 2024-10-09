---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/ipex_llm_gpu.ipynb
---
# 本地 BGE 嵌入与 IPEX-LLM 在 Intel GPU 上

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm) 是一个用于在 Intel CPU 和 GPU（例如，带有 iGPU 的本地 PC、离散 GPU，如 Arc、Flex 和 Max）上运行大型语言模型的 PyTorch 库，具有非常低的延迟。

本示例介绍如何使用 LangChain 在 Intel GPU 上进行嵌入任务，并使用 `ipex-llm` 优化。这在 RAG、文档问答等应用中将非常有帮助。

> **注意**
>
> 建议仅 Windows 用户使用 Intel Arc A 系列 GPU（不包括 Intel Arc A300 系列或 Pro A60）直接运行此 Jupyter 笔记本。对于其他情况（例如 Linux 用户、Intel iGPU 等），建议在终端中使用 Python 脚本运行代码以获得最佳体验。

## 安装先决条件
为了在 Intel GPU 上受益于 IPEX-LLM，需要进行几个工具安装和环境准备的先决步骤。

如果您是 Windows 用户，请访问 [在 Windows 上安装 IPEX-LLM 与 Intel GPU 指南](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_windows_gpu.md)，并按照 [安装先决条件](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_windows_gpu.md#install-prerequisites) 更新 GPU 驱动程序（可选）并安装 Conda。

如果您是 Linux 用户，请访问 [在 Linux 上安装 IPEX-LLM 与 Intel GPU](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_linux_gpu.md)，并按照 [**安装先决条件**](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_linux_gpu.md#install-prerequisites) 安装 GPU 驱动程序、Intel® oneAPI 基础工具包 2024.0 和 Conda。

## 设置

在安装完所有先决条件后，您应该已经创建了一个安装了所有先决条件的conda环境。**在此conda环境中启动jupyter服务**:


```python
%pip install -qU langchain langchain-community
```

安装 IPEX-LLM 以在 Intel GPU 上进行优化，以及 `sentence-transformers`。


```python
%pip install --pre --upgrade ipex-llm[xpu] --extra-index-url https://pytorch-extension.intel.com/release-whl/stable/xpu/us/
%pip install sentence-transformers
```

> **注意**
>
> 您还可以使用 `https://pytorch-extension.intel.com/release-whl/stable/xpu/cn/` 作为额外的 indel-url。

## 运行时配置

为了获得最佳性能，建议根据您的设备设置几个环境变量：

### 对于使用 Intel Core Ultra 集成 GPU 的 Windows 用户


```python
import os

os.environ["SYCL_CACHE_PERSISTENT"] = "1"
os.environ["BIGDL_LLM_XMX_DISABLED"] = "1"
```

### 对于使用 Intel Arc A 系列 GPU 的 Windows 用户


```python
import os

os.environ["SYCL_CACHE_PERSISTENT"] = "1"
```

> **注意**
>
> 第一次在 Intel iGPU/Intel Arc A300 系列或 Pro A60 上运行每个模型时，可能需要几分钟来编译。
>
> 对于其他 GPU 类型，请参考 [这里](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Overview/install_gpu.md#runtime-configuration) 的 Windows 用户，以及 [这里](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Overview/install_gpu.md#runtime-configuration-1) 的 Linux 用户。


## 基本用法

在初始化 `IpexLLMBgeEmbeddings` 时，将 `device` 设置为 `"xpu"` 将把嵌入模型放在 Intel GPU 上，并受益于 IPEX-LLM 优化：


```python
<!--IMPORTS:[{"imported": "IpexLLMBgeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.ipex_llm.IpexLLMBgeEmbeddings.html", "title": "Local BGE Embeddings with IPEX-LLM on Intel GPU"}]-->
from langchain_community.embeddings import IpexLLMBgeEmbeddings

embedding_model = IpexLLMBgeEmbeddings(
    model_name="BAAI/bge-large-en-v1.5",
    model_kwargs={"device": "xpu"},
    encode_kwargs={"normalize_embeddings": True},
)
```

API 参考
- [IpexLLMBgeEmbeddings](https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.ipex_llm.IpexLLMBgeEmbeddings.html)


```python
sentence = "IPEX-LLM is a PyTorch library for running LLM on Intel CPU and GPU (e.g., local PC with iGPU, discrete GPU such as Arc, Flex and Max) with very low latency."
query = "What is IPEX-LLM?"

text_embeddings = embedding_model.embed_documents([sentence, query])
print(f"text_embeddings[0][:10]: {text_embeddings[0][:10]}")
print(f"text_embeddings[1][:10]: {text_embeddings[1][:10]}")

query_embedding = embedding_model.embed_query(query)
print(f"query_embedding[:10]: {query_embedding[:10]}")
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
