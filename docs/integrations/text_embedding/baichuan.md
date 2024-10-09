---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/baichuan.ipynb
---
# Baichuan 文本嵌入

截至今天（2024年1月25日），BaichuanTextEmbeddings在C-MTEB（中文多任务嵌入基准）排行榜中排名第1。


排行榜（在整体 -> 中文部分）：https://huggingface.co/spaces/mteb/leaderboard

官方网站：https://platform.baichuan-ai.com/docs/text-Embedding

使用此嵌入模型需要API密钥。您可以通过在https://platform.baichuan-ai.com/docs/text-Embedding注册来获取一个。

BaichuanTextEmbeddings支持512个token窗口，并生成1024维的向量。

请注意，BaichuanTextEmbeddings仅支持中文文本嵌入。多语言支持即将推出。


```python
<!--IMPORTS:[{"imported": "BaichuanTextEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.baichuan.BaichuanTextEmbeddings.html", "title": "Baichuan Text Embeddings"}]-->
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

或者，您可以通过这种方式设置API密钥：


```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```


```python
text_1 = "今天天气不错"
text_2 = "今天阳光很好"

query_result = embeddings.embed_query(text_1)
query_result
```


```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
