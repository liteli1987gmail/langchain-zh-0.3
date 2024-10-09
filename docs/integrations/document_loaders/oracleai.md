---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/oracleai.ipynb
---
# Oracle AI 向量搜索：文档处理
Oracle AI 向量搜索旨在处理人工智能 (AI) 工作负载，允许您基于语义而非关键字查询数据。
Oracle AI 向量搜索的最大好处之一是，可以在一个系统中将对非结构化数据的语义搜索与对业务数据的关系搜索相结合。
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


本指南演示了如何在 Oracle AI 向量搜索中使用文档处理功能，分别使用 OracleDocLoader 和 OracleTextSplitter 加载和分块文档。

如果您刚开始使用 Oracle 数据库，建议您探索 [免费 Oracle 23 AI](https://www.oracle.com/database/free/#resources)，它提供了设置数据库环境的良好介绍。在使用数据库时，通常建议默认避免使用系统用户；相反，您可以创建自己的用户以增强安全性和自定义。有关用户创建的详细步骤，请参阅我们的 [端到端指南](https://github.com/langchain-ai/langchain/blob/master/cookbook/oracleai_demo.ipynb)，该指南还展示了如何在 Oracle 中设置用户。此外，了解用户权限对于有效管理数据库安全至关重要。您可以在官方 [Oracle 指南](https://docs.oracle.com/en/database/oracle/oracle-database/19/admqs/administering-user-accounts-and-security.html#GUID-36B21D72-1BBB-46C9-A0C9-F0D2A8591B8D) 中了解更多关于管理用户帐户和安全性的话题。

### 前提条件

请安装Oracle Python客户端驱动程序，以便将LangChain与Oracle AI向量搜索一起使用。


```python
# pip install oracledb
```

### 连接到Oracle数据库
以下示例代码将展示如何连接到Oracle数据库。默认情况下，python-oracledb以“Thin”模式运行，直接连接到Oracle数据库。此模式不需要Oracle客户端库。然而，当python-oracledb使用这些库时，会提供一些额外的功能。当使用Oracle客户端库时，python-oracledb被称为“Thick”模式。这两种模式都具有全面的功能，支持Python数据库API v2.0规范。请参阅以下[指南](https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html#featuresummary)，了解每种模式支持的功能。如果您无法使用thin模式，您可能想切换到thick模式。


```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

现在让我们创建一个表并插入一些示例文档进行测试。


```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### 加载文档

用户可以灵活地从Oracle数据库、文件系统或两者加载文档，只需适当配置加载器参数。有关这些参数的详细信息，请参阅[Oracle AI向量搜索指南](https://docs.oracle.com/en/database/oracle/oracle-database/23/arpls/dbms_vector_chain1.html#GUID-73397E89-92FB-48ED-94BB-1AD960C4EA1F)。

使用OracleDocLoader的一个显著优势是其能够处理超过150种不同的文件格式，消除了对不同文档类型的多个加载器的需求。有关支持的格式的完整列表，请参阅[Oracle文本支持的文档格式](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)。

以下是一个示例代码片段，演示如何使用OracleDocLoader


```python
<!--IMPORTS:[{"imported": "OracleDocLoader", "source": "langchain_community.document_loaders.oracleai", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.oracleai.OracleDocLoader.html", "title": "Oracle AI Vector Search: Document Processing"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Oracle AI Vector Search: Document Processing"}]-->
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### 拆分文档
文档的大小可能有所不同，从小到非常大。用户通常更喜欢将文档分成较小的部分，以便生成嵌入。此拆分过程提供了广泛的自定义选项。有关这些参数的详细信息，请参阅[Oracle AI向量搜索指南](https://docs.oracle.com/en/database/oracle/oracle-database/23/arpls/dbms_vector_chain1.html#GUID-4E145629-7098-4C7C-804F-FC85D1F24240)。

以下是一个示例代码，说明如何实现这一点：


```python
<!--IMPORTS:[{"imported": "OracleTextSplitter", "source": "langchain_community.document_loaders.oracleai", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.oracleai.OracleTextSplitter.html", "title": "Oracle AI Vector Search: Document Processing"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Oracle AI Vector Search: Document Processing"}]-->
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### 端到端演示
请参考我们的完整演示指南 [Oracle AI 向量搜索端到端演示指南](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.ipynb)，以借助 Oracle AI 向量搜索构建端到端的 RAG 管道。



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
