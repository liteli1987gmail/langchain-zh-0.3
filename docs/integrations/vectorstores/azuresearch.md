---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/azuresearch.ipynb
---
# Azure AI Search

[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search)（前称为 `Azure Search` 和 `Azure Cognitive Search`）是一个云搜索服务，为开发者提供基础设施、API 和工具，以便在大规模下进行向量、关键字和混合查询的信息检索。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 安装 Azure AI Search SDK

使用 azure-search-documents 包版本 11.4.0 或更高版本。


```python
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## 导入所需库

`OpenAIEmbeddings` 被假定为使用，但如果您使用的是 Azure OpenAI，请改为导入 `AzureOpenAIEmbeddings`。


```python
<!--IMPORTS:[{"imported": "AzureSearch", "source": "langchain_community.vectorstores.azuresearch", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.azuresearch.AzureSearch.html", "title": "Azure AI Search"}, {"imported": "AzureOpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.azure.AzureOpenAIEmbeddings.html", "title": "Azure AI Search"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Azure AI Search"}]-->
import os

from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings
```

## 配置 OpenAI 设置
为您的 OpenAI 大模型供应商设置变量。您需要一个 [OpenAI 账户](https://platform.openai.com/docs/quickstart?context=python) 或一个 [Azure OpenAI 账户](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource) 来生成嵌入。


```python
# Option 1: use an OpenAI account
openai_api_key: str = "PLACEHOLDER FOR YOUR API KEY"
openai_api_version: str = "2023-05-15"
model: str = "text-embedding-ada-002"
```


```python
# Option 2: use an Azure OpenAI account with a deployment of an embedding model
azure_endpoint: str = "PLACEHOLDER FOR YOUR AZURE OPENAI ENDPOINT"
azure_openai_api_key: str = "PLACEHOLDER FOR YOUR AZURE OPENAI KEY"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

## 配置向量存储设置

您需要一个 [Azure 订阅](https://azure.microsoft.com/en-us/free/search) 和 [Azure AI 搜索服务](https://learn.microsoft.com/azure/search/search-create-service-portal) 来使用此向量存储集成。对于小型和有限的工作负载，提供无成本版本。
 
为您的 Azure AI 搜索 URL 和管理员 API 密钥设置变量。您可以从 [Azure 门户](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Search%2FsearchServices) 获取这些变量。


```python
vector_store_address: str = "YOUR_AZURE_SEARCH_ENDPOINT"
vector_store_password: str = "YOUR_AZURE_SEARCH_ADMIN_KEY"
```

## 创建嵌入和向量存储实例
 
创建 OpenAIEmbeddings 和 AzureSearch 类的实例。当您完成此步骤时，您应该在您的 Azure AI 搜索资源上拥有一个空的搜索索引。集成模块提供默认架构。


```python
# Option 1: Use OpenAIEmbeddings with OpenAI account
embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    openai_api_key=openai_api_key, openai_api_version=openai_api_version, model=model
)
```


```python
# Option 2: Use AzureOpenAIEmbeddings with an Azure account
embeddings: AzureOpenAIEmbeddings = AzureOpenAIEmbeddings(
    azure_deployment=azure_deployment,
    openai_api_version=azure_openai_api_version,
    azure_endpoint=azure_endpoint,
    api_key=azure_openai_api_key,
)
```

## 创建向量存储实例
 
使用上述嵌入创建 AzureSearch 类的实例


```python
index_name: str = "langchain-vector-demo"
vector_store: AzureSearch = AzureSearch(
    azure_search_endpoint=vector_store_address,
    azure_search_key=vector_store_password,
    index_name=index_name,
    embedding_function=embeddings.embed_query,
)
```


```python
# Specify additional properties for the Azure client such as the following https://github.com/Azure/azure-sdk-for-python/blob/main/sdk/core/azure-core/README.md#configurations
vector_store: AzureSearch = AzureSearch(
    azure_search_endpoint=vector_store_address,
    azure_search_key=vector_store_password,
    index_name=index_name,
    embedding_function=embeddings.embed_query,
    # Configure max retries for the Azure client
    additional_search_client_options={"retry_total": 4},
)
```

## 将文本和嵌入插入向量存储
 
此步骤加载、分块并向量化示例文档，然后将内容索引到 Azure AI Search 的搜索索引中。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Azure AI Search"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Azure AI Search"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```



```output
['M2U1OGM4YzAtYjMxYS00Nzk5LTlhNDgtZTc3MGVkNTg1Mjc0',
 'N2I2MGNiZDEtNDdmZS00YWNiLWJhYTYtYWEzMmFiYzU1ZjZm',
 'YWFmNDViNTQtZTc4MS00MTdjLTkzZjQtYTJkNmY1MDU4Yzll',
 'MjgwY2ExZDctYTUxYi00NjE4LTkxMjctZDA1NDQ1MzU4NmY1',
 'NGE4NzhkNTAtZWYxOC00ZmI5LTg0MTItZDQ1NzMxMWVmMTIz',
 'MTYwMWU3YjAtZDIzOC00NTYwLTgwMmEtNDI1NzA2MWVhMDYz',
 'NGM5N2NlZjgtMTc5Ny00OGEzLWI5YTgtNDFiZWE2MjBlMzA0',
 'OWQ4M2MyMTYtMmRkNi00ZDUxLWI0MDktOGE2NjMxNDFhYzFm',
 'YWZmZGJkOTAtOGM3My00MmNiLTg5OWUtZGMwMDQwYTk1N2Vj',
 'YTc3MTI2OTktYmVkMi00ZGU4LTgyNmUtNTY1YzZjMDg2YWI3',
 'MTQwMmVlYjEtNDI0MS00N2E0LWEyN2ItZjhhYWU0YjllMjRk',
 'NjJjYWY4ZjctMzgyNi00Y2I5LTkwY2UtZjRkMjJhNDQxYTFk',
 'M2ZiM2NiYTMtM2ZiMS00YWJkLWE3ZmQtNDZiODcyOTMyYWYx',
 'MzNmZTNkMWYtMjNmYS00Y2NmLTg3ZjQtYTZjOWM1YmJhZTRk',
 'ZDY3MDc1NzYtY2YzZS00ZjExLWEyMjAtODhiYTRmNDUzMTBi',
 'ZGIyYzA4NzUtZGM2Ni00MDUwLWEzZjYtNTg3MDYyOWQ5MWQy',
 'NTA0MjBhMzYtOTYzMi00MDQ2LWExYWQtMzNiN2I4ODM4ZGZl',
 'OTdjYzU2NGUtNWZjNC00N2ZmLWExMjQtNjhkYmZkODg4MTY3',
 'OThhMWZmMjgtM2EzYS00OWZkLTk1NGEtZTdkNmRjNWYxYmVh',
 'ZGVjMTQ0NzctNDVmZC00ZWY4LTg4N2EtMDQ1NWYxNWM5NDVh',
 'MjRlYzE4YzItZTMxNy00OGY3LThmM2YtMjM0YmRhYTVmOGY3',
 'MWU0NDA3ZDQtZDE4MS00OWMyLTlmMzktZjdkYzZhZmUwYWM3',
 'ZGM2ZDhhY2MtM2NkNi00MzZhLWJmNTEtMmYzNjEwMzE3NmZl',
 'YjBmMjkyZTItYTNlZC00MmY2LThiMzYtMmUxY2MyNDlhNGUw',
 'OThmYTQ0YzEtNjk0MC00NWIyLWE1ZDQtNTI2MTZjN2NlODcw',
 'NDdlOGU1ZGQtZTVkMi00M2MyLWExN2YtOTc2ODk3OWJmNmQw',
 'MDVmZGNkYTUtNWI2OS00YjllLTk0YTItZDRmNWQxMWU3OTVj',
 'YWFlNTVmNjMtMDZlNy00NmE5LWI0ODUtZTI3ZTFmZWRmNzU0',
 'MmIzOTkxODQtODYxMi00YWM2LWFjY2YtNjRmMmEyM2JlNzMw',
 'ZmI1NDhhNWItZWY0ZS00NTNhLWEyNDEtMTE2OWYyMjc4YTU2',
 'YTllYTc5OTgtMzJiNC00ZjZjLWJiMzUtNWVhYzFjYzgxMjU2',
 'ODZlZWUyOTctOGY4OS00ZjA3LWIyYTUtNDVlNDUyN2E4ZDFk',
 'Y2M0MWRlM2YtZDU4Ny00MjZkLWE5NzgtZmRkMTNhZDg2YjEy',
 'MDNjZWQ2ODEtMWZiMy00OTZjLTk3MzAtZjE4YjIzNWVhNTE1',
 'OTE1NDY0NzMtODNkZS00MTk4LTk4NWQtZGVmYjQ2YjFlY2Q0',
 'ZTgwYWQwMjEtN2ZlOS00NDk2LWIxNzUtNjk2ODE3N2U0Yzlj',
 'ZDkxOTgzMGUtZGExMC00Yzg0LWJjMGItOWQ2ZmUwNWUwOGJj',
 'ZGViMGI2NDEtZDdlNC00YjhiLTk0MDUtYjEyOTVlMGU1Y2I2',
 'ODliZTYzZTctZjdlZS00YjBjLWFiZmYtMDJmNjQ0YjU3ZDcy',
 'MDFjZGI1NzUtOTc0Ni00NWNmLThhYzYtYzRlZThkZjMwM2Vl',
 'ZjY2ZmRiN2EtZWVhNS00ODViLTk4YjYtYjQ2Zjc4MDdkYjhk',
 'ZTQ3NDMwODEtMTQwMy00NDFkLWJhZDQtM2UxN2RkOTU1MTdl']
```


## 执行向量相似性搜索
 
使用 similarity_search() 方法执行纯向量相似性搜索：


```python
# Perform a similarity search
docs = vector_store.similarity_search(
    query="What did the president say about Ketanji Brown Jackson",
    k=3,
    search_type="similarity",
)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 执行带相关性得分的向量相似性搜索
 
使用 similarity_search_with_relevance_scores() 方法执行纯向量相似性搜索。不满足阈值要求的查询将被排除。


```python
docs_and_scores = vector_store.similarity_search_with_relevance_scores(
    query="What did the president say about Ketanji Brown Jackson",
    k=4,
    score_threshold=0.80,
)
from pprint import pprint

pprint(docs_and_scores)
```
```output
[(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
  0.84402436),
 (Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
  0.82128483),
 (Document(page_content='And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. \n\nAs I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. \n\nAnd soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. \n\nSo tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  \n\nFirst, beat the opioid epidemic.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
  0.8151042),
 (Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
  0.8148832)]
```
## 执行混合搜索

使用 search_type 或 hybrid_search() 方法执行混合搜索。向量和非向量文本字段并行查询，结果合并，并返回统一结果集的最佳匹配。


```python
# Perform a hybrid search using the search_type parameter
docs = vector_store.similarity_search(
    query="What did the president say about Ketanji Brown Jackson",
    k=3,
    search_type="hybrid",
)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
# Perform a hybrid search using the hybrid_search method
docs = vector_store.hybrid_search(
    query="What did the president say about Ketanji Brown Jackson", k=3
)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 自定义模式和查询

本节向您展示如何用自定义模式替换默认模式。


### 创建一个具有自定义可过滤字段的新索引

此模式显示字段定义。它是默认模式，加上几个被标记为可过滤的新字段。由于它使用默认的向量配置，您在这里看不到向量配置或向量配置文件的覆盖。默认向量配置文件的名称是 "myHnswProfile"，它使用分层可导航小世界 (HNSW) 的向量配置进行索引和对 content_vector 字段的查询。

在此步骤中，此模式没有数据。当您执行单元格时，您应该在 Azure AI Search 上获得一个空索引。


```python
from azure.search.documents.indexes.models import (
    ScoringProfile,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    TextWeights,
)

#  Replace OpenAIEmbeddings with AzureOpenAIEmbeddings if Azure OpenAI is your provider.
embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    openai_api_key=openai_api_key, openai_api_version=openai_api_version, model=model
)
embedding_function = embeddings.embed_query

fields = [
    SimpleField(
        name="id",
        type=SearchFieldDataType.String,
        key=True,
        filterable=True,
    ),
    SearchableField(
        name="content",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    SearchField(
        name="content_vector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=len(embedding_function("Text")),
        vector_search_profile_name="myHnswProfile",
    ),
    SearchableField(
        name="metadata",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    # Additional field to store the title
    SearchableField(
        name="title",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    # Additional field for filtering on document source
    SimpleField(
        name="source",
        type=SearchFieldDataType.String,
        filterable=True,
    ),
]

index_name: str = "langchain-vector-demo-custom"

vector_store: AzureSearch = AzureSearch(
    azure_search_endpoint=vector_store_address,
    azure_search_key=vector_store_password,
    index_name=index_name,
    embedding_function=embedding_function,
    fields=fields,
)
```

### 添加数据并执行包含过滤器的查询

此示例根据自定义模式向向量存储添加数据。它将文本加载到标题和来源字段中。来源字段是可过滤的。本节中的示例查询根据来源字段中的内容过滤结果。


```python
# Data in the metadata dictionary with a corresponding field in the index will be added to the index.
# In this example, the metadata dictionary contains a title, a source, and a random field.
# The title and the source are added to the index as separate fields, but the random value is ignored because it's not defined in the schema.
# The random field is only stored in the metadata field.
vector_store.add_texts(
    ["Test 1", "Test 2", "Test 3"],
    [
        {"title": "Title 1", "source": "A", "random": "10290"},
        {"title": "Title 2", "source": "A", "random": "48392"},
        {"title": "Title 3", "source": "B", "random": "32893"},
    ],
)
```



```output
['ZjhmMTg0NTEtMjgwNC00N2M0LWFiZGEtMDllMGU1Mzk1NWRm',
 'MzQwYWUwZDEtNDJkZC00MzgzLWIwMzItYzMwOGZkYTRiZGRi',
 'ZjFmOWVlYTQtODRiMC00YTY3LTk2YjUtMzY1NDBjNjY5ZmQ2']
```



```python
res = vector_store.similarity_search(query="Test 3 source1", k=3, search_type="hybrid")
res
```



```output
[Document(page_content='Test 3', metadata={'title': 'Title 3', 'source': 'B', 'random': '32893'}),
 Document(page_content='Test 1', metadata={'title': 'Title 1', 'source': 'A', 'random': '10290'}),
 Document(page_content='Test 2', metadata={'title': 'Title 2', 'source': 'A', 'random': '48392'})]
```



```python
res = vector_store.similarity_search(
    query="Test 3 source1", k=3, search_type="hybrid", filters="source eq 'A'"
)
res
```



```output
[Document(page_content='Test 1', metadata={'title': 'Title 1', 'source': 'A', 'random': '10290'}),
 Document(page_content='Test 2', metadata={'title': 'Title 2', 'source': 'A', 'random': '48392'})]
```


### 创建一个具有评分配置文件的新索引

这是另一个包含评分配置文件定义的自定义模式。评分配置文件用于非向量内容的相关性调整，这在混合搜索场景中非常有用。


```python
from azure.search.documents.indexes.models import (
    FreshnessScoringFunction,
    FreshnessScoringParameters,
    ScoringProfile,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    TextWeights,
)

#  Replace OpenAIEmbeddings with AzureOpenAIEmbeddings if Azure OpenAI is your provider.
embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    openai_api_key=openai_api_key, openai_api_version=openai_api_version, model=model
)
embedding_function = embeddings.embed_query

fields = [
    SimpleField(
        name="id",
        type=SearchFieldDataType.String,
        key=True,
        filterable=True,
    ),
    SearchableField(
        name="content",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    SearchField(
        name="content_vector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=len(embedding_function("Text")),
        vector_search_profile_name="myHnswProfile",
    ),
    SearchableField(
        name="metadata",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    # Additional field to store the title
    SearchableField(
        name="title",
        type=SearchFieldDataType.String,
        searchable=True,
    ),
    # Additional field for filtering on document source
    SimpleField(
        name="source",
        type=SearchFieldDataType.String,
        filterable=True,
    ),
    # Additional data field for last doc update
    SimpleField(
        name="last_update",
        type=SearchFieldDataType.DateTimeOffset,
        searchable=True,
        filterable=True,
    ),
]
# Adding a custom scoring profile with a freshness function
sc_name = "scoring_profile"
sc = ScoringProfile(
    name=sc_name,
    text_weights=TextWeights(weights={"title": 5}),
    function_aggregation="sum",
    functions=[
        FreshnessScoringFunction(
            field_name="last_update",
            boost=100,
            parameters=FreshnessScoringParameters(boosting_duration="P2D"),
            interpolation="linear",
        )
    ],
)

index_name = "langchain-vector-demo-custom-scoring-profile"

vector_store: AzureSearch = AzureSearch(
    azure_search_endpoint=vector_store_address,
    azure_search_key=vector_store_password,
    index_name=index_name,
    embedding_function=embeddings.embed_query,
    fields=fields,
    scoring_profiles=[sc],
    default_scoring_profile=sc_name,
)
```


```python
# Adding same data with different last_update to show Scoring Profile effect
from datetime import datetime, timedelta

today = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S-00:00")
yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S-00:00")
one_month_ago = (datetime.utcnow() - timedelta(days=30)).strftime(
    "%Y-%m-%dT%H:%M:%S-00:00"
)

vector_store.add_texts(
    ["Test 1", "Test 1", "Test 1"],
    [
        {
            "title": "Title 1",
            "source": "source1",
            "random": "10290",
            "last_update": today,
        },
        {
            "title": "Title 1",
            "source": "source1",
            "random": "48392",
            "last_update": yesterday,
        },
        {
            "title": "Title 1",
            "source": "source1",
            "random": "32893",
            "last_update": one_month_ago,
        },
    ],
)
```



```output
['NjUwNGQ5ZDUtMGVmMy00OGM4LWIxMGYtY2Y2MDFmMTQ0MjE5',
 'NWFjN2YwY2UtOWQ4Yi00OTNhLTg2MGEtOWE0NGViZTVjOGRh',
 'N2Y2NWUyZjctMDBjZC00OGY4LWJlZDEtNTcxYjQ1MmI1NjYx']
```



```python
res = vector_store.similarity_search(query="Test 1", k=3, search_type="similarity")
res
```



```output
[Document(page_content='Test 1', metadata={'title': 'Title 1', 'source': 'source1', 'random': '32893', 'last_update': '2024-01-24T22:18:51-00:00'}),
 Document(page_content='Test 1', metadata={'title': 'Title 1', 'source': 'source1', 'random': '48392', 'last_update': '2024-02-22T22:18:51-00:00'}),
 Document(page_content='Test 1', metadata={'title': 'Title 1', 'source': 'source1', 'random': '10290', 'last_update': '2024-02-23T22:18:51-00:00'})]
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
