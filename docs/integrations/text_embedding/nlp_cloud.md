---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/nlp_cloud.ipynb
---
# NLP Cloud

>[NLP Cloud](https://docs.nlpcloud.com/#introduction) 是一个人工智能平台，允许您使用最先进的AI引擎，甚至可以使用自己的数据训练自己的引擎。

[嵌入](https://docs.nlpcloud.com/#embeddings) 端点提供以下模型：

* `paraphrase-multilingual-mpnet-base-v2`: Paraphrase Multilingual MPNet Base V2 是一个非常快速的模型，基于句子变换器，完美适用于50多种语言的嵌入提取（请查看完整列表）。


```python
%pip install --upgrade --quiet  nlpcloud
```


```python
<!--IMPORTS:[{"imported": "NLPCloudEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.nlpcloud.NLPCloudEmbeddings.html", "title": "NLP Cloud"}]-->
from langchain_community.embeddings import NLPCloudEmbeddings
```


```python
import os

os.environ["NLPCLOUD_API_KEY"] = "xxx"
nlpcloud_embd = NLPCloudEmbeddings()
```


```python
text = "This is a test document."
```


```python
query_result = nlpcloud_embd.embed_query(text)
```


```python
doc_result = nlpcloud_embd.embed_documents([text])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
