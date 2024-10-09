---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/sentence_transformers.ipynb
---
# Hugging Face上的句子变换器

>[Hugging Face句子变换器](https://huggingface.co/sentence-transformers)是一个用于最先进的句子、文本和图像嵌入的Python框架。
>您可以使用`HuggingFaceEmbeddings`类中的这些嵌入模型。

:::caution

在本地运行句子变换器可能会受到您的操作系统和其他全球因素的影响。仅建议经验丰富的用户使用。

:::

## 设置

您需要安装`langchain_huggingface`包作为依赖：


```python
%pip install -qU langchain-huggingface
```

## 使用


```python
<!--IMPORTS:[{"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Sentence Transformers on Hugging Face"}]-->
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

text = "This is a test document."
query_result = embeddings.embed_query(text)

# show only the first 100 characters of the stringified vector
print(str(query_result)[:100] + "...")
```
```output
[-0.038338568061590195, 0.12346471101045609, -0.028642969205975533, 0.05365273356437683, 0.008845377...
```

```python
doc_result = embeddings.embed_documents([text, "This is not a test document."])
print(str(doc_result)[:100] + "...")
```
```output
[[-0.038338497281074524, 0.12346471846103668, -0.028642890974879265, 0.05365274101495743, 0.00884535...
```
## 故障排除

如果您遇到 `accelerate` 包未找到或导入失败的问题，安装/升级它可能会有所帮助：


```python
%pip install -qU accelerate
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
