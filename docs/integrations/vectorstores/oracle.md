---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/oracle.ipynb
---
# Oracle AI 向量搜索：向量存储

Oracle AI 向量搜索旨在处理人工智能 (AI) 工作负载，允许您基于语义而非关键字查询数据。
Oracle AI 向量搜索的最大好处之一是，可以将对非结构化数据的语义搜索与对业务数据的关系搜索结合在一个系统中。
这不仅强大，而且显著更有效，因为您无需添加专门的向量数据库，从而消除了多个系统之间数据碎片化的痛苦。

此外，您的向量可以受益于 Oracle 数据库的所有强大功能，如下所示：

* [分区支持](https://www.oracle.com/database/technologies/partitioning.html)
* [真实应用集群可扩展性](https://www.oracle.com/database/real-application-clusters/)
* [Exadata 智能扫描](https://www.oracle.com/database/technologies/exadata/software/smartscan/)
* [跨地理分布数据库的分片处理](https://www.oracle.com/database/distributed-database/)
* [事务](https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/transactions.html)
* [并行 SQL](https://docs.oracle.com/en/database/oracle/oracle-database/21/vldbg/parallel-exec-intro.html#GUID-D28717E4-0F77-44F5-BB4E-234C31D4E4BA)
* [灾难恢复](https://www.oracle.com/database/data-guard/)
* [安全性](https://www.oracle.com/security/database-security/)
* [Oracle 机器学习](https://www.oracle.com/artificial-intelligence/database-machine-learning/)
* [Oracle 图形数据库](https://www.oracle.com/database/integrated-graph-database/)
* [Oracle 空间和图形](https://www.oracle.com/database/spatial/)
* [Oracle 区块链](https://docs.oracle.com/en/database/oracle/oracle-database/23/arpls/dbms_blockchain_table.html#GUID-B469E277-978E-4378-A8C1-26D3FF96C9A6)
* [JSON](https://docs.oracle.com/en/database/oracle/oracle-database/23/adjsn/json-in-oracle-database.html)

如果您刚开始使用 Oracle 数据库，建议您探索 [免费 Oracle 23 AI](https://www.oracle.com/database/free/#resources)，它提供了设置数据库环境的良好介绍。在使用数据库时，通常建议默认避免使用系统用户；相反，您可以创建自己的用户以增强安全性和自定义。有关用户创建的详细步骤，请参阅我们的 [端到端指南](https://github.com/langchain-ai/langchain/blob/master/cookbook/oracleai_demo.ipynb)，该指南还展示了如何在 Oracle 中设置用户。此外，了解用户权限对于有效管理数据库安全性至关重要。您可以在官方 [Oracle 指南](https://docs.oracle.com/en/database/oracle/oracle-database/19/admqs/administering-user-accounts-and-security.html#GUID-36B21D72-1BBB-46C9-A0C9-F0D2A8591B8D) 中了解更多关于管理用户帐户和安全性的主题。

### 使用 Langchain 与 Oracle AI 向量搜索的先决条件

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成

请安装 Oracle Python 客户端驱动程序以便将 LangChain 与 Oracle AI 向量搜索一起使用。


```python
# pip install oracledb
```

### 连接到Oracle AI向量搜索

以下示例代码将展示如何连接到Oracle数据库。默认情况下，python-oracledb以“Thin”模式运行，直接连接到Oracle数据库。此模式不需要Oracle客户端库。然而，当python-oracledb使用这些库时，会提供一些额外的功能。当使用Oracle客户端库时，python-oracledb被称为“Thick”模式。这两种模式都具有全面的功能，支持Python数据库API v2.0规范。请参阅以下[指南](https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html#featuresummary)，了解每种模式支持的功能。如果您无法使用thin模式，您可能想切换到thick模式。


```python
import oracledb

username = "username"
password = "password"
dsn = "ipaddress:port/orclpdb1"

try:
    connection = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
```

### 导入所需的依赖项以使用Oracle AI向量搜索


```python
<!--IMPORTS:[{"imported": "OracleVS", "source": "langchain_community.vectorstores.oraclevs", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.oraclevs.OracleVS.html", "title": "Oracle AI Vector Search: Vector Store"}, {"imported": "DistanceStrategy", "source": "langchain_community.vectorstores.utils", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.utils.DistanceStrategy.html", "title": "Oracle AI Vector Search: Vector Store"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Oracle AI Vector Search: Vector Store"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Oracle AI Vector Search: Vector Store"}]-->
from langchain_community.vectorstores import oraclevs
from langchain_community.vectorstores.oraclevs import OracleVS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
```

### 加载文档


```python
# Define a list of documents (The examples below are 5 random documents from Oracle Concepts Manual )

documents_json_list = [
    {
        "id": "cncpt_15.5.3.2.2_P4",
        "text": "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-5387D7B2-C0CA-4C1E-811B-C7EB9B636442",
    },
    {
        "id": "cncpt_15.5.5_P1",
        "text": "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-D02B2220-E6F5-40D9-AFB5-BC69BCEF6CD4",
    },
    {
        "id": "cncpt_22.3.4.3.1_P2",
        "text": "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
    {
        "id": "cncpt_22.3.4.3.1_P3",
        "text": "The LOB segment stores data in pieces called chunks. A chunk is a logically contiguous set of data blocks and is the smallest unit of allocation for a LOB. A row in the table stores a pointer called a LOB locator, which points to the LOB index. When the table is queried, the database uses the LOB index to quickly locate the LOB chunks.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
]
```


```python
# Create Langchain Documents

documents_langchain = []

for doc in documents_json_list:
    metadata = {"id": doc["id"], "link": doc["link"]}
    doc_langchain = Document(page_content=doc["text"], metadata=metadata)
    documents_langchain.append(doc_langchain)
```

### 使用AI向量搜索创建具有不同距离度量的向量存储

首先，我们将创建三个向量存储，每个存储具有不同的距离函数。由于我们尚未在其中创建索引，因此它们现在只会创建表。稍后我们将使用这些向量存储创建HNSW索引。要了解Oracle AI向量搜索支持的不同类型的索引，请参阅以下[指南](https://docs.oracle.com/en/database/oracle/oracle-database/23/vecse/manage-different-categories-vector-indexes.html)。

您可以手动连接到Oracle数据库，并将看到三个表：
Documents_DOT、Documents_COSINE和Documents_EUCLIDEAN。

然后我们将创建三个额外的表Documents_DOT_IVF、Documents_COSINE_IVF和Documents_EUCLIDEAN_IVF，这些表将用于
在表上创建IVF索引，而不是HNSW索引。


```python
# Ingest documents into Oracle Vector Store using different distance strategies

# When using our API calls, start by initializing your vector store with a subset of your documents
# through from_documents(), then incrementally add more documents using add_texts().
# This approach prevents system overload and ensures efficient document processing.

model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

vector_store_dot = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)

# Ingest documents into Oracle Vector Store using different distance strategies
vector_store_dot_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT_IVF",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE_IVF",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN_IVF",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### 演示文本的添加和删除操作，以及基本的相似性搜索



```python
def manage_texts(vector_stores):
    """
    Adds texts to each vector store, demonstrates error handling for duplicate additions,
    and performs deletion of texts. Showcases similarity searches and index creation for each vector store.

    Args:
    - vector_stores (list): A list of OracleVS instances.
    """
    texts = ["Rohan", "Shailendra"]
    metadata = [
        {"id": "100", "link": "Document Example Test 1"},
        {"id": "101", "link": "Document Example Test 2"},
    ]

    for i, vs in enumerate(vector_stores, start=1):
        # Adding texts
        try:
            vs.add_texts(texts, metadata)
            print(f"\n\n\nAdd texts complete for vector store {i}\n\n\n")
        except Exception as ex:
            print(f"\n\n\nExpected error on duplicate add for vector store {i}\n\n\n")

        # Deleting texts using the value of 'id'
        vs.delete([metadata[0]["id"]])
        print(f"\n\n\nDelete texts complete for vector store {i}\n\n\n")

        # Similarity search
        results = vs.similarity_search("How are LOBS stored in Oracle Database", 2)
        print(f"\n\n\nSimilarity search results for vector store {i}: {results}\n\n\n")


vector_store_list = [
    vector_store_dot,
    vector_store_max,
    vector_store_euclidean,
    vector_store_dot_ivf,
    vector_store_max_ivf,
    vector_store_euclidean_ivf,
]
manage_texts(vector_store_list)
```

### 演示使用特定参数创建索引以适应每种距离策略



```python
def create_search_indices(connection):
    """
    Creates search indices for the vector stores, each with specific parameters tailored to their distance strategy.
    """
    # Index for DOT_PRODUCT strategy
    # Notice we are creating a HNSW index with default parameters
    # This will default to creating a HNSW index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot,
        params={"idx_name": "hnsw_idx1", "idx_type": "HNSW"},
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating a HNSW index with parallel 16 and Target Accuracy Specification as 97 percent
    oraclevs.create_index(
        connection,
        vector_store_max,
        params={
            "idx_name": "hnsw_idx2",
            "idx_type": "HNSW",
            "accuracy": 97,
            "parallel": 16,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating a HNSW index by specifying Power User Parameters which are neighbors = 64 and efConstruction = 100
    oraclevs.create_index(
        connection,
        vector_store_euclidean,
        params={
            "idx_name": "hnsw_idx3",
            "idx_type": "HNSW",
            "neighbors": 64,
            "efConstruction": 100,
        },
    )

    # Index for DOT_PRODUCT strategy with specific parameters
    # Notice we are creating an IVF index with default parameters
    # This will default to creating an IVF index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot_ivf,
        params={
            "idx_name": "ivf_idx1",
            "idx_type": "IVF",
        },
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating an IVF index with parallel 32 and Target Accuracy Specification as 90 percent
    oraclevs.create_index(
        connection,
        vector_store_max_ivf,
        params={
            "idx_name": "ivf_idx2",
            "idx_type": "IVF",
            "accuracy": 90,
            "parallel": 32,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating an IVF index by specifying Power User Parameters which is neighbor_part = 64
    oraclevs.create_index(
        connection,
        vector_store_euclidean_ivf,
        params={"idx_name": "ivf_idx3", "idx_type": "IVF", "neighbor_part": 64},
    )

    print("Index creation complete.")


create_search_indices(connection)
```

### 演示在所有六个向量存储上进行高级搜索，带有和不带有属性过滤 – 过滤时，我们只选择文档ID 101，其他不选


```python
# Conduct advanced searches after creating the indices
def conduct_advanced_searches(vector_stores):
    query = "How are LOBS stored in Oracle Database"
    # Constructing a filter for direct comparison against document metadata
    # This filter aims to include documents whose metadata 'id' is exactly '2'
    filter_criteria = {"id": ["101"]}  # Direct comparison filter

    for i, vs in enumerate(vector_stores, start=1):
        print(f"\n--- Vector Store {i} Advanced Searches ---")
        # Similarity search without a filter
        print("\nSimilarity search results without filter:")
        print(vs.similarity_search(query, 2))

        # Similarity search with a filter
        print("\nSimilarity search results with filter:")
        print(vs.similarity_search(query, 2, filter=filter_criteria))

        # Similarity search with relevance score
        print("\nSimilarity search with relevance score:")
        print(vs.similarity_search_with_score(query, 2))

        # Similarity search with relevance score with filter
        print("\nSimilarity search with relevance score with filter:")
        print(vs.similarity_search_with_score(query, 2, filter=filter_criteria))

        # Max marginal relevance search
        print("\nMax marginal relevance search results:")
        print(vs.max_marginal_relevance_search(query, 2, fetch_k=20, lambda_mult=0.5))

        # Max marginal relevance search with filter
        print("\nMax marginal relevance search results with filter:")
        print(
            vs.max_marginal_relevance_search(
                query, 2, fetch_k=20, lambda_mult=0.5, filter=filter_criteria
            )
        )


conduct_advanced_searches(vector_store_list)
```

### 端到端演示
请参考我们的完整演示指南 [Oracle AI 向量搜索端到端演示指南](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.ipynb)，以帮助构建端到端的RAG管道，使用Oracle AI向量搜索。



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
