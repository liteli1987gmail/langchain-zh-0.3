---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/zilliz_cloud_pipeline.ipynb
---
# Zilliz Cloud Pipeline

> [Zilliz Cloud Pipelines](https://docs.zilliz.com/docs/pipelines) 将您的非结构化数据转换为可搜索的向量集合，链式处理数据的嵌入、摄取、搜索和删除。
>
> Zilliz Cloud Pipelines 可在 Zilliz Cloud 控制台和通过 RestFul API 使用。

本笔记本演示如何准备 Zilliz Cloud Pipelines 并通过 LangChain 检索器使用它们。

## 准备 Zilliz Cloud Pipelines

要为 LangChain 检索器准备管道，您需要在 Zilliz Cloud 中创建和配置服务。

**1. 设置数据库**

- [注册 Zilliz Cloud](https://docs.zilliz.com/docs/register-with-zilliz-cloud)
- [创建集群](https://docs.zilliz.com/docs/create-cluster)

**2. 创建管道**

- [文档摄取、搜索、删除](https://docs.zilliz.com/docs/pipelines-doc-data)
- [文本摄取、搜索、删除](https://docs.zilliz.com/docs/pipelines-text-data)

## 使用 LangChain 检索器


```python
%pip install --upgrade --quiet langchain-milvus
```


```python
<!--IMPORTS:[{"imported": "ZillizCloudPipelineRetriever", "source": "langchain_milvus", "docs": "https://python.langchain.com/api_reference/milvus/retrievers/langchain_milvus.retrievers.zilliz_cloud_pipeline_retriever.ZillizCloudPipelineRetriever.html", "title": "Zilliz Cloud Pipeline"}]-->
from langchain_milvus import ZillizCloudPipelineRetriever

retriever = ZillizCloudPipelineRetriever(
    pipeline_ids={
        "ingestion": "<YOUR_INGESTION_PIPELINE_ID>",  # skip this line if you do NOT need to add documents
        "search": "<YOUR_SEARCH_PIPELINE_ID>",  # skip this line if you do NOT need to get relevant documents
        "deletion": "<YOUR_DELETION_PIPELINE_ID>",  # skip this line if you do NOT need to delete documents
    },
    token="<YOUR_ZILLIZ_CLOUD_API_KEY>",
)
```

### 添加文档

要添加文档，您可以使用 `add_texts` 或 `add_doc_url` 方法，该方法从文本列表或带有相应元数据的预签名/公共 URL 中插入文档到存储中。

- 如果使用 **文本摄取管道**，您可以使用 `add_texts` 方法，该方法将一批文本及其相应的元数据插入到 Zilliz Cloud 存储中。

**参数:**
- `texts`: 文本字符串的列表。
- `metadata`: 一个键值字典的元数据将作为摄取管道所需的保留字段插入。默认为 None。



```python
# retriever.add_texts(
#     texts = ["example text 1e", "example text 2"],
#     metadata={"<FIELD_NAME>": "<FIELD_VALUE>"}  # skip this line if no preserved field is required by the ingestion pipeline
#     )
```

- 如果使用 **文档摄取管道**，您可以使用 `add_doc_url` 方法，该方法将文档从 URL 及其相应的元数据插入到 Zilliz Cloud 存储中。

**参数:**
- `doc_url`: 文档 URL。
- `metadata`: 一个键值字典的元数据将作为摄取管道所需的保留字段插入。默认为 None。

以下示例适用于文档摄取管道，该管道需要将milvus版本作为元数据。我们将使用一个[示例文档](https://publicdataset.zillizcloud.com/milvus_doc.md)，描述如何在Milvus v2.3.x中删除实体。


```python
retriever.add_doc_url(
    doc_url="https://publicdataset.zillizcloud.com/milvus_doc.md",
    metadata={"version": "v2.3.x"},
)
```



```output
{'token_usage': 1247, 'doc_name': 'milvus_doc.md', 'num_chunks': 6}
```


### 获取相关文档

要查询检索器，可以使用方法`get_relevant_documents`，该方法返回一个LangChain文档对象的列表。

**参数：**
- `query`: 用于查找相关文档的字符串。
- `top_k`: 结果的数量。默认为10。
- `offset`: 在搜索结果中跳过的记录数。默认为0。
- `output_fields`: 在输出中呈现的额外字段。
- `filter`: 用于过滤搜索结果的Milvus表达式。默认为""。
- `run_manager`: 要使用的回调处理程序。


```python
retriever.get_relevant_documents(
    "Can users delete entities by complex boolean expressions?"
)
```



```output
[Document(page_content='# Delete Entities\nThis topic describes how to delete entities in Milvus.  \nMilvus supports deleting entities by primary key or complex boolean expressions. Deleting entities by primary key is much faster and lighter than deleting them by complex boolean expressions. This is because Milvus executes queries first when deleting data by complex boolean expressions.  \nDeleted entities can still be retrieved immediately after the deletion if the consistency level is set lower than Strong.\nEntities deleted beyond the pre-specified span of time for Time Travel cannot be retrieved again.\nFrequent deletion operations will impact the system performance.  \nBefore deleting entities by comlpex boolean expressions, make sure the collection has been loaded.\nDeleting entities by complex boolean expressions is not an atomic operation. Therefore, if it fails halfway through, some data may still be deleted.\nDeleting entities by complex boolean expressions is supported only when the consistency is set to Bounded. For details, see Consistency.\\\n\\\n# Delete Entities\n## Prepare boolean expression\nPrepare the boolean expression that filters the entities to delete.  \nMilvus supports deleting entities by primary key or complex boolean expressions. For more information on expression rules and supported operators, see Boolean Expression Rules.', metadata={'id': 448986959321277978, 'distance': 0.7871403694152832}),
 Document(page_content='# Delete Entities\n## Prepare boolean expression\n### Simple boolean expression\nUse a simple expression to filter data with primary key values of 0 and 1:  \n\`\`\`python\nexpr = "book_id in [0,1]"\n\`\`\`\\\n\\\n# Delete Entities\n## Prepare boolean expression\n### Complex boolean expression\nTo filter entities that meet specific conditions, define complex boolean expressions.  \nFilter entities whose word_count is greater than or equal to 11000:  \n\`\`\`python\nexpr = "word_count >= 11000"\n\`\`\`  \nFilter entities whose book_name is not Unknown:  \n\`\`\`python\nexpr = "book_name != Unknown"\n\`\`\`  \nFilter entities whose primary key values are greater than 5 and word_count is smaller than or equal to 9999:  \n\`\`\`python\nexpr = "book_id > 5 && word_count <= 9999"\n\`\`\`', metadata={'id': 448986959321277979, 'distance': 0.7775762677192688}),
 Document(page_content='# Delete Entities\n## Delete entities\nDelete the entities with the boolean expression you created. Milvus returns the ID list of the deleted entities.\n\`\`\`python\nfrom pymilvus import Collection\ncollection = Collection("book")      # Get an existing collection.\ncollection.delete(expr)\n\`\`\`  \nParameter\tDescription\nexpr\tBoolean expression that specifies the entities to delete.\npartition_name (optional)\tName of the partition to delete entities from.\\\n\\\n# Upsert Entities\nThis topic describes how to upsert entities in Milvus.  \nUpserting is a combination of insert and delete operations. In the context of a Milvus vector database, an upsert is a data-level operation that will overwrite an existing entity if a specified field already exists in a collection, and insert a new entity if the specified value doesn’t already exist.  \nThe following example upserts 3,000 rows of randomly generated data as the example data. When performing upsert operations, it\'s important to note that the operation may compromise performance. This is because the operation involves deleting data during execution.', metadata={'id': 448986959321277980, 'distance': 0.680284857749939}),
 Document(page_content='# Upsert Entities\n## Flush data\nWhen data is upserted into Milvus it is updated and inserted into segments. Segments have to reach a certain size to be sealed and indexed. Unsealed segments will be searched brute force. In order to avoid this with any remainder data, it is best to call flush(). The flush() call will seal any remaining segments and send them for indexing. It is important to only call this method at the end of an upsert session. Calling it too often will cause fragmented data that will need to be cleaned later on.\\\n\\\n# Upsert Entities\n## Limits\nUpdating primary key fields is not supported by upsert().\nupsert() is not applicable and an error can occur if autoID is set to True for primary key fields.', metadata={'id': 448986959321277983, 'distance': 0.5672488212585449}),
 Document(page_content='# Upsert Entities\n## Prepare data\nFirst, prepare the data to upsert. The type of data to upsert must match the schema of the collection, otherwise Milvus will raise an exception.  \nMilvus supports default values for scalar fields, excluding a primary key field. This indicates that some fields can be left empty during data inserts or upserts. For more information, refer to Create a Collection.  \n\`\`\`python\n# Generate data to upsert\n\nimport random\nnb = 3000\ndim = 8\nvectors = [[random.random() for _ in range(dim)] for _ in range(nb)]\ndata = [\n[i for i in range(nb)],\n[str(i) for i in range(nb)],\n[i for i in range(10000, 10000+nb)],\nvectors,\n[str("dy"*i) for i in range(nb)]\n]\n\`\`\`', metadata={'id': 448986959321277981, 'distance': 0.5107149481773376}),
 Document(page_content='# Upsert Entities\n## Upsert data\nUpsert the data to the collection.  \n\`\`\`python\nfrom pymilvus import Collection\ncollection = Collection("book") # Get an existing collection.\nmr = collection.upsert(data)\n\`\`\`  \nParameter\tDescription\ndata\tData to upsert into Milvus.\npartition_name (optional)\tName of the partition to upsert data into.\ntimeout (optional)\tAn optional duration of time in seconds to allow for the RPC. If it is set to None, the client keeps waiting until the server responds or error occurs.\nAfter upserting entities into a collection that has previously been indexed, you do not need to re-index the collection, as Milvus will automatically create an index for the newly upserted data. For more information, refer to Can indexes be created after inserting vectors?', metadata={'id': 448986959321277982, 'distance': 0.4341375529766083})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
