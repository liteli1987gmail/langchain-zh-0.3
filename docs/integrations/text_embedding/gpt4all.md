---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/gpt4all.ipynb
---
# GPT4All

[GPT4All](https://gpt4all.io/index.html) 是一个免费使用的、本地运行的、注重隐私的聊天机器人。无需GPU或互联网。它具有流行模型和自己的模型，如GPT4All Falcon、Wizard等。

本笔记本解释了如何在LangChain中使用 [GPT4All嵌入](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All)。

## 安装GPT4All的Python绑定


```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

注意：您可能需要重启内核以使用更新的包。


```python
<!--IMPORTS:[{"imported": "GPT4AllEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.gpt4all.GPT4AllEmbeddings.html", "title": "GPT4All"}]-->
from langchain_community.embeddings import GPT4AllEmbeddings
```


```python
gpt4all_embd = GPT4AllEmbeddings()
```
```output
100%|████████████████████████| 45.5M/45.5M [00:02<00:00, 18.5MiB/s]
``````output
Model downloaded at:  /Users/rlm/.cache/gpt4all/ggml-all-MiniLM-L6-v2-f16.bin
``````output
objc[45711]: Class GGMLMetalClass is implemented in both /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libreplit-mainline-metal.dylib (0x29fe18208) and /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libllamamodel-mainline-metal.dylib (0x2a0244208). One of the two will be used. Which one is undefined.
```

```python
text = "This is a test document."
```

## 嵌入文本数据


```python
query_result = gpt4all_embd.embed_query(text)
```

使用 embed_documents，您可以嵌入多段文本。您还可以将这些嵌入与 [Nomic's Atlas](https://docs.nomic.ai/index.html) 进行映射，以查看数据的可视化表示。


```python
doc_result = gpt4all_embd.embed_documents([text])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
