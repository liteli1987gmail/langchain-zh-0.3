---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/ipex_llm.ipynb
---
# 在Intel CPU上使用IPEX-LLM的本地BGE嵌入

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm) 是一个用于在Intel CPU和GPU（例如，带有iGPU的本地PC、离散GPU如Arc、Flex和Max）上运行大型语言模型的PyTorch库，具有非常低的延迟。

本示例介绍了如何使用LangChain在Intel CPU上进行嵌入任务，并利用`ipex-llm`优化。这在RAG、文档问答等应用中将非常有帮助。

## 设置


```python
%pip install -qU langchain langchain-community
```

安装 IPEX-LLM 以在 Intel CPU 上进行优化，以及 `sentence-transformers`。


```python
%pip install --pre --upgrade ipex-llm[all] --extra-index-url https://download.pytorch.org/whl/cpu
%pip install sentence-transformers
```

> **注意**
>
> 对于 Windows 用户，安装 `ipex-llm` 时不需要 `--extra-index-url https://download.pytorch.org/whl/cpu`。

## 基本用法


```python
<!--IMPORTS:[{"imported": "IpexLLMBgeEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.ipex_llm.IpexLLMBgeEmbeddings.html", "title": "Local BGE Embeddings with IPEX-LLM on Intel CPU"}]-->
from langchain_community.embeddings import IpexLLMBgeEmbeddings

embedding_model = IpexLLMBgeEmbeddings(
    model_name="BAAI/bge-large-en-v1.5",
    model_kwargs={},
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
