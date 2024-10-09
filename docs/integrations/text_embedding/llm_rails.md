---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/llm_rails.ipynb
---
# LLMRails

让我们加载 LLMRails 嵌入类。

要使用 LLMRails 嵌入，您需要通过参数传递 API 密钥或在环境中设置 `LLM_RAILS_API_KEY` 密钥。
要获取 API 密钥，您需要在 https://console.llmrails.com/signup 注册，然后转到 https://console.llmrails.com/api-keys，在平台上创建一个密钥后从那里复制密钥。


```python
<!--IMPORTS:[{"imported": "LLMRailsEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.llm_rails.LLMRailsEmbeddings.html", "title": "LLMRails"}]-->
from langchain_community.embeddings import LLMRailsEmbeddings
```


```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```


```python
text = "This is a test document."
```

要生成嵌入，您可以查询单个文本，或者查询文本列表。


```python
query_result = embeddings.embed_query(text)
query_result[:5]
```



```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```



```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```



```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
