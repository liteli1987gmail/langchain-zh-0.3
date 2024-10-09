---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/oracleai.ipynb
---
# Oracle AI 向量搜索：生成摘要

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

本指南演示如何在 Oracle AI 向量搜索中使用摘要功能，为您的文档生成摘要，使用 OracleSummary。

如果您刚开始使用 Oracle 数据库，建议您探索 [免费 Oracle 23 AI](https://www.oracle.com/database/free/#resources)，它提供了设置数据库环境的良好介绍。在使用数据库时，通常建议避免默认使用系统用户；相反，您可以创建自己的用户以增强安全性和自定义。有关用户创建的详细步骤，请参阅我们的 [端到端指南](https://github.com/langchain-ai/langchain/blob/master/cookbook/oracleai_demo.ipynb)，该指南还展示了如何在 Oracle 中设置用户。此外，了解用户权限对于有效管理数据库安全性至关重要。您可以在官方 [Oracle 指南](https://docs.oracle.com/en/database/oracle/oracle-database/19/admqs/administering-user-accounts-and-security.html#GUID-36B21D72-1BBB-46C9-A0C9-F0D2A8591B8D) 中了解更多关于管理用户帐户和安全性的主题。

### 前提条件

请安装Oracle Python客户端驱动程序，以便将LangChain与Oracle AI向量搜索一起使用。


```python
# pip install oracledb
```

### 连接到Oracle数据库
以下示例代码将展示如何连接到Oracle数据库。默认情况下，python-oracledb以“Thin”模式运行，直接连接到Oracle数据库。此模式不需要Oracle客户端库。然而，当python-oracledb使用这些库时，会提供一些额外的功能。当使用Oracle客户端库时，python-oracledb被称为“Thick”模式。这两种模式都具有全面的功能，支持Python数据库API v2.0规范。请参阅以下[指南](https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html#featuresummary)，了解每种模式支持的功能。如果您无法使用thin模式，您可能需要切换到thick模式。


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

### 生成摘要
Oracle AI向量搜索Langchain库提供了一套用于文档摘要的API。它支持多个摘要大模型供应商，如数据库、OCIGENAI、HuggingFace等，允许用户选择最符合其需求的大模型供应商。要利用这些功能，用户必须按照规定配置摘要参数。有关这些参数的详细信息，请参阅[Oracle AI向量搜索指南](https://docs.oracle.com/en/database/oracle/oracle-database/23/arpls/dbms_vector_chain1.html#GUID-EC9DDB58-6A15-4B36-BA66-ECBA20D2CE57)。

***注意：*** 如果用户希望使用除Oracle内部和默认大模型供应商“database”之外的其他第三方摘要生成大模型供应商，则可能需要设置代理。如果您没有代理，请在实例化OracleSummary时删除代理参数。


```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

以下示例代码将展示如何生成摘要：


```python
<!--IMPORTS:[{"imported": "OracleSummary", "source": "langchain_community.utilities.oracleai", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.oracleai.OracleSummary.html", "title": "Oracle AI Vector Search: Generate Summary"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Oracle AI Vector Search: Generate Summary"}]-->
from langchain_community.utilities.oracleai import OracleSummary
from langchain_core.documents import Document

"""
# using 'ocigenai' provider
summary_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/summarizeText",
    "model": "cohere.command",
}

# using 'huggingface' provider
summary_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/models/",
    "model": "facebook/bart-large-cnn",
    "wait_for_model": "true"
}
"""

# using 'database' provider
summary_params = {
    "provider": "database",
    "glevel": "S",
    "numParagraphs": 1,
    "language": "english",
}

# get the summary instance
# Remove proxy if not required
summ = OracleSummary(conn=conn, params=summary_params, proxy=proxy)
summary = summ.get_summary(
    "In the heart of the forest, "
    + "a lone fox ventured out at dusk, seeking a lost treasure. "
    + "With each step, memories flooded back, guiding its path. "
    + "As the moon rose high, illuminating the night, the fox unearthed "
    + "not gold, but a forgotten friendship, worth more than any riches."
)

print(f"Summary generated by OracleSummary: {summary}")
```

### 端到端演示
请参考我们的完整演示指南[Oracle AI向量搜索端到端演示指南](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.ipynb)，以帮助构建端到端的RAG管道，使用Oracle AI向量搜索。



## 相关

- 工具[概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
