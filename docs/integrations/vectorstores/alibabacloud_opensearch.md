---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/alibabacloud_opensearch.ipynb
---
# 阿里云 OpenSearch

>[阿里云 OpenSearch](https://www.alibabacloud.com/product/opensearch) 是一个开发智能搜索服务的一站式平台。`OpenSearch` 基于 `阿里巴巴` 开发的大规模分布式搜索引擎构建。`OpenSearch` 为阿里巴巴集团的500多个业务案例和成千上万的阿里云客户提供服务。`OpenSearch` 帮助在不同的搜索场景中开发搜索服务，包括电子商务、O2O、多媒体、内容行业、社区和论坛，以及企业的大数据查询。

>`OpenSearch` 帮助您开发高质量、免维护和高性能的智能搜索服务，以为您的用户提供高搜索效率和准确性。

>`OpenSearch` 提供向量搜索功能。在特定场景中，特别是测试问题搜索和图像搜索场景，您可以将向量搜索功能与多模态搜索功能结合使用，以提高搜索结果的准确性。

本笔记本展示了如何使用与 `阿里云 OpenSearch 向量搜索版` 相关的功能。

## 设置


### 购买实例并进行配置

从 [阿里云](https://opensearch.console.aliyun.com) 购买 OpenSearch 向量搜索版，并根据帮助 [文档](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO) 配置实例。

要运行，您应该有一个正在运行的 [OpenSearch 向量搜索版](https://opensearch.console.aliyun.com) 实例。

  
### 阿里云 OpenSearch 向量存储类
`AlibabaCloudOpenSearch` 类支持的功能：
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`


阅读[帮助文档](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search)以快速熟悉和配置OpenSearch向量搜索版实例。

如果在使用过程中遇到任何问题，请随时联系xingshaomin.xsm@alibaba-inc.com，我们将竭尽所能为您提供帮助和支持。

实例启动并运行后，按照以下步骤分割文档、获取嵌入、连接到阿里云OpenSearch实例、索引文档并执行向量检索。

我们需要先安装以下Python包。


```python
%pip install --upgrade --quiet  langchain-community alibabacloud_ha3engine_vector
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 示例


```python
<!--IMPORTS:[{"imported": "AlibabaCloudOpenSearch", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.alibabacloud_opensearch.AlibabaCloudOpenSearch.html", "title": "Alibaba Cloud OpenSearch"}, {"imported": "AlibabaCloudOpenSearchSettings", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.alibabacloud_opensearch.AlibabaCloudOpenSearchSettings.html", "title": "Alibaba Cloud OpenSearch"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Alibaba Cloud OpenSearch"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Alibaba Cloud OpenSearch"}]-->
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

分割文档并获取嵌入。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Alibaba Cloud OpenSearch"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

创建 opensearch 设置。


```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

通过设置创建一个 opensearch 访问实例。


```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

或


```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

添加文本并构建索引。


```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

查询并检索数据。


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

查询并检索带有元数据的数据。



```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

如果在使用过程中遇到任何问题，请随时联系 xingshaomin.xsm@alibaba-inc.com，我们将竭尽所能为您提供帮助和支持。



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
