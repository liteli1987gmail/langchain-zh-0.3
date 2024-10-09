---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/tidb_vector.ipynb
---
# TiDB 向量

> [TiDB Cloud](https://www.pingcap.com/tidb-serverless) 是一个综合性的数据库即服务 (DBaaS) 解决方案，提供专用和无服务器选项。TiDB Serverless 现在将内置向量搜索集成到 MySQL 生态中。通过此增强功能，您可以无缝地使用 TiDB Serverless 开发 AI 应用，而无需新的数据库或额外的技术栈。创建一个免费的 TiDB Serverless 集群，并开始在 https://pingcap.com/ai 上使用向量搜索功能。

本笔记本提供了关于如何利用 TiDB 向量功能的详细指南，展示其特性和实际应用。

## 设置环境

首先安装必要的包。


```python
%pip install langchain langchain-community
%pip install langchain-openai
%pip install pymysql
%pip install tidb-vector
```

配置您需要的 OpenAI 和 TiDB 主机设置。在本笔记本中，我们将遵循 TiDB Cloud 提供的标准连接方法，以建立安全高效的数据库连接。


```python
# Here we useimport getpass
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
# tidb_connection_string_template = "mysql+pymysql://root:<PASSWORD>@34.212.137.91:4000/test"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

准备以下数据


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "TiDB Vector"}, {"imported": "TiDBVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.tidb_vector.TiDBVectorStore.html", "title": "TiDB Vector"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "TiDB Vector"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "TiDB Vector"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import TiDBVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## 语义相似性搜索

TiDB 支持余弦距离和欧几里得距离（'cosine', 'l2'），其中 'cosine' 是默认选择。

下面的代码片段在 TiDB 中创建一个名为 `TABLE_NAME` 的表，优化用于向量搜索。成功执行此代码后，您将能够直接在 TiDB 数据库中查看和访问 `TABLE_NAME` 表。


```python
TABLE_NAME = "semantic_embeddings"
db = TiDBVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    table_name=TABLE_NAME,
    connection_string=tidb_connection_string,
    distance_strategy="cosine",  # default, another option is "l2"
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=3)
```

请注意，较低的余弦距离表示更高的相似性。


```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Score:  0.18459301498220004
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2172729943284636
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2262166799003692
And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. 

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. 

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. 

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  

First, beat the opioid epidemic.
--------------------------------------------------------------------------------
```
此外，similarity_search_with_relevance_scores 方法可用于获取相关性分数，其中较高的分数表示更大的相似性。


```python
docs_with_relevance_score = db.similarity_search_with_relevance_scores(query, k=2)
for doc, score in docs_with_relevance_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Score:  0.8154069850178
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.7827270056715364
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```
# 使用元数据过滤

使用元数据过滤器执行搜索，以检索与应用的过滤器对齐的特定数量的最近邻结果。

## 支持的元数据类型

TiDB 向量存储中的每个向量都可以与元数据配对，元数据结构为 JSON 对象中的键值对。键是字符串，值可以是以下类型：

- 字符串
- 数字（整数或浮点数）
- 布尔值（真，假）

例如，考虑以下有效的元数据负载：

```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

## 元数据过滤器语法

可用的过滤器包括：

- $or - 选择满足任一给定条件的向量。
- $and - 选择满足所有给定条件的向量。
- $eq - 等于
- $ne - 不等于
- $gt - 大于
- $gte - 大于或等于
- $lt - 小于
- $lte - 小于或等于
- $in - 在数组中
- $nin - 不在数组中

假设一个带有元数据的向量：
```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

以下元数据过滤器将匹配该向量

```json
{"page": 12}

{"page":{"$eq": 12}}

{"page":{"$in": [11, 12, 13]}}

{"page":{"$nin": [13]}}

{"page":{"$lt": 11}}

{
    "$or": [{"page": 11}, {"page": 12}],
    "$and": [{"page": 12}, {"page": 13}],
}
```

请注意，元数据过滤器中的每个键值对被视为单独的过滤子句，这些子句使用 AND 逻辑运算符组合。


```python
db.add_texts(
    texts=[
        "TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.",
        "TiDB Vector, starting as low as $10 per month for basic usage",
    ],
    metadatas=[
        {"title": "TiDB Vector functionality"},
        {"title": "TiDB Vector Pricing"},
    ],
)
```



```output
[UUID('c782cb02-8eec-45be-a31f-fdb78914f0a7'),
 UUID('08dcd2ba-9f16-4f29-a9b7-18141f8edae3')]
```



```python
docs_with_score = db.similarity_search_with_score(
    "Introduction to TiDB Vector", filter={"title": "TiDB Vector functionality"}, k=4
)
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Score:  0.12761409169211535
TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.
--------------------------------------------------------------------------------
```
### 作为检索器使用

在LangChain中，检索器是一个接口，用于响应非结构化查询以检索文档，提供比向量存储更广泛的功能。下面的代码演示了如何将TiDB Vector用作检索器。


```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.8},
)
docs_retrieved = retriever.invoke(query)
for doc in docs_retrieved:
    print("-" * 80)
    print(doc.page_content)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
```
## 高级用例场景

让我们看一个高级用例 - 一位旅行代理正在为希望拥有特定设施（如干净的休息室和素食选项）的客户制作定制旅行报告。这个过程包括：
- 在机场评论中进行语义搜索，以提取满足这些设施的机场代码。
- 随后的SQL查询将这些代码与航线信息连接，详细说明与客户偏好一致的航空公司和目的地。

首先，让我们准备一些与航空相关的数据


```python
# create table to store airplan data
db.tidb_vector_client.execute(
    """CREATE TABLE airplan_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        airport_code VARCHAR(10),
        airline_code VARCHAR(10),
        destination_code VARCHAR(10),
        route_details TEXT,
        duration TIME,
        frequency INT,
        airplane_type VARCHAR(50),
        price DECIMAL(10, 2),
        layover TEXT
    );"""
)

# insert some data into Routes and our vector table
db.tidb_vector_client.execute(
    """INSERT INTO airplan_routes (
        airport_code,
        airline_code,
        destination_code,
        route_details,
        duration,
        frequency,
        airplane_type,
        price,
        layover
    ) VALUES 
    ('JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', '06:00:00', 5, 'Boeing 777', 299.99, 'None'),
    ('LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', '04:00:00', 3, 'Airbus A320', 149.99, 'None'),
    ('EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', '02:30:00', 7, 'Boeing 737', 129.99, 'None');
    """
)
db.add_texts(
    texts=[
        "Clean lounges and excellent vegetarian dining options. Highly recommended.",
        "Comfortable seating in lounge areas and diverse food selections, including vegetarian.",
        "Small airport with basic facilities.",
    ],
    metadatas=[
        {"airport_code": "JFK"},
        {"airport_code": "LAX"},
        {"airport_code": "EFGH"},
    ],
)
```



```output
[UUID('6dab390f-acd9-4c7d-b252-616606fbc89b'),
 UUID('9e811801-0e6b-4893-8886-60f4fb67ce69'),
 UUID('f426747c-0f7b-4c62-97ed-3eeb7c8dd76e')]
```


通过向量搜索查找拥有干净设施和素食选项的机场


```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.85},
)
semantic_query = "Could you recommend a US airport with clean lounges and good vegetarian dining options?"
reviews = retriever.invoke(semantic_query)
for r in reviews:
    print("-" * 80)
    print(r.page_content)
    print(r.metadata)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Clean lounges and excellent vegetarian dining options. Highly recommended.
{'airport_code': 'JFK'}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Comfortable seating in lounge areas and diverse food selections, including vegetarian.
{'airport_code': 'LAX'}
--------------------------------------------------------------------------------
```

```python
# Extracting airport codes from the metadata
airport_codes = [review.metadata["airport_code"] for review in reviews]

# Executing a query to get the airport details
search_query = "SELECT * FROM airplan_routes WHERE airport_code IN :codes"
params = {"codes": tuple(airport_codes)}

airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```



```output
[(1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None'),
 (2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None')]
```


或者，我们可以通过利用单个SQL查询来简化流程，一步完成搜索。


```python
search_query = f"""
    SELECT 
        VEC_Cosine_Distance(se.embedding, :query_vector) as distance, 
        ar.*,
        se.document as airport_review
    FROM 
        airplan_routes ar
    JOIN 
        {TABLE_NAME} se ON ar.airport_code = JSON_UNQUOTE(JSON_EXTRACT(se.meta, '$.airport_code'))
    ORDER BY distance ASC 
    LIMIT 5;
"""
query_vector = embeddings.embed_query(semantic_query)
params = {"query_vector": str(query_vector)}
airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```



```output
[(0.1219207353407008, 1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None', 'Clean lounges and excellent vegetarian dining options. Highly recommended.'),
 (0.14613754359804654, 2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None', 'Comfortable seating in lounge areas and diverse food selections, including vegetarian.'),
 (0.19840519342700513, 3, 'EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', datetime.timedelta(seconds=9000), 7, 'Boeing 737', Decimal('129.99'), 'None', 'Small airport with basic facilities.')]
```



```python
# clean up
db.tidb_vector_client.execute("DROP TABLE airplan_routes")
```



```output
{'success': True, 'result': 0, 'error': None}
```


# 删除

您可以使用 `.drop_vectorstore()` 方法删除 TiDB 向量存储。


```python
db.drop_vectorstore()
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
