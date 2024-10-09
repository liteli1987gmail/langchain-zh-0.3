---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/johnsnowlabs_embedding.ipynb
---
# John Snow Labs

>[John Snow Labs](https://nlp.johnsnowlabs.com/) 的NLP和LLM生态系统包括用于大规模最先进AI的软库、负责任的AI、无代码AI，以及访问超过20,000个医疗、法律、金融等领域的模型。
>
>模型通过[nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api)加载，Spark会话通过[nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession)在后台启动。
>有关所有24,000+模型，请参见[John Snow Labs模型中心](https://nlp.johnsnowlabs.com/models)


## 设置


```python
%pip install --upgrade --quiet  johnsnowlabs
```


```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## 示例


```python
<!--IMPORTS:[{"imported": "JohnSnowLabsEmbeddings", "source": "langchain_community.embeddings.johnsnowlabs", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.johnsnowlabs.JohnSnowLabsEmbeddings.html", "title": "John Snow Labs"}]-->
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

初始化 Johnsnowlabs 嵌入模型和 Spark 会话


```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

定义一些示例文本。这些可以是您想要分析的任何文档，例如新闻文章、社交媒体帖子或产品评论。


```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

生成并打印文本的嵌入。JohnSnowLabsEmbeddings 类为每个文档生成一个嵌入，这是文档内容的数值表示。这些嵌入可以用于各种自然语言处理任务，例如文档相似性比较或文本分类。


```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

为单个文本生成并打印嵌入。您还可以为单个文本生成嵌入，例如搜索查询。这对于信息检索等任务非常有用，您希望找到与给定查询相似的文档。


```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
