---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/oracleai.ipynb
---
# Oracle AI 向量搜索：生成嵌入
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


本指南演示如何在 Oracle AI 向量搜索中使用嵌入功能，为您的文档生成嵌入，使用 OracleEmbeddings。

如果您刚开始使用 Oracle 数据库，建议您探索 [免费 Oracle 23 AI](https://www.oracle.com/database/free/#resources)，它提供了设置数据库环境的良好介绍。在使用数据库时，通常建议默认避免使用系统用户；相反，您可以创建自己的用户以增强安全性和自定义。有关用户创建的详细步骤，请参阅我们的 [端到端指南](https://github.com/langchain-ai/langchain/blob/master/cookbook/oracleai_demo.ipynb)，该指南还展示了如何在 Oracle 中设置用户。此外，了解用户权限对于有效管理数据库安全至关重要。您可以在官方 [Oracle 指南](https://docs.oracle.com/en/database/oracle/oracle-database/19/admqs/administering-user-accounts-and-security.html#GUID-36B21D72-1BBB-46C9-A0C9-F0D2A8591B8D) 中了解更多关于管理用户账户和安全性的话题。

### 前提条件

确保您已安装Oracle Python客户端驱动程序，以便将LangChain与Oracle AI向量搜索集成。


```python
# pip install oracledb
```

### 连接到Oracle数据库
以下示例代码将展示如何连接到Oracle数据库。默认情况下，python-oracledb以“Thin”模式运行，直接连接到Oracle数据库。此模式不需要Oracle客户端库。然而，当python-oracledb使用这些库时，会提供一些额外的功能。当使用Oracle客户端库时，python-oracledb被称为“Thick”模式。这两种模式都具有全面的功能，支持Python数据库API v2.0规范。请参阅以下[指南](https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html#featuresummary)，了解每种模式支持的功能。如果您无法使用thin模式，您可能想切换到thick模式。


```python
import sys

import oracledb

# Update the following variables with your Oracle database credentials and connection details
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

对于嵌入生成，用户可以选择多种大模型供应商选项，包括数据库内的嵌入生成和第三方服务，如OcigenAI、Hugging Face和OpenAI。选择第三方大模型供应商的用户必须建立包含所需身份验证信息的凭据。或者，如果用户选择“数据库”作为其大模型供应商，则需要将ONNX模型加载到Oracle数据库中以便于生成嵌入。

### 加载ONNX模型

Oracle支持多种嵌入大模型供应商，使用户能够在专有数据库解决方案和第三方服务（如OCIGENAI和HuggingFace）之间进行选择。此选择决定了生成和管理嵌入的方法。

***重要***：如果用户选择数据库选项，则必须将ONNX模型上传到Oracle数据库。相反，如果选择第三方大模型供应商进行嵌入生成，则不需要将ONNX模型上传到Oracle数据库。

直接在Oracle中使用ONNX模型的一个显著优势是，通过消除将数据传输到外部方的需要，增强了安全性和性能。此外，这种方法避免了通常与网络或REST API调用相关的延迟。

以下是将ONNX模型上传到Oracle数据库的示例代码：


```python
<!--IMPORTS:[{"imported": "OracleEmbeddings", "source": "langchain_community.embeddings.oracleai", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.oracleai.OracleEmbeddings.html", "title": "Oracle AI Vector Search: Generate Embeddings"}]-->
from langchain_community.embeddings.oracleai import OracleEmbeddings

# Update the directory and file names for your ONNX model
# make sure that you have onnx file in the system
onnx_dir = "DEMO_DIR"
onnx_file = "tinybert.onnx"
model_name = "demo_model"

try:
    OracleEmbeddings.load_onnx_model(conn, onnx_dir, onnx_file, model_name)
    print("ONNX model loaded.")
except Exception as e:
    print("ONNX model loading failed!")
    sys.exit(1)
```

### 创建凭据

在选择第三方大模型供应商生成嵌入时，用户需要建立凭据以安全访问大模型供应商的端点。

***重要:*** 选择 '数据库' 大模型供应商生成嵌入时不需要凭证。然而，如果用户决定使用第三方大模型供应商，他们必须为所选大模型供应商创建特定的凭证。

以下是一个示例：


```python
try:
    cursor = conn.cursor()
    cursor.execute(
        """
       declare
           jo json_object_t;
       begin
           -- HuggingFace
           dbms_vector_chain.drop_credential(credential_name  => 'HF_CRED');
           jo := json_object_t();
           jo.put('access_token', '<access_token>');
           dbms_vector_chain.create_credential(
               credential_name   =>  'HF_CRED',
               params            => json(jo.to_string));

           -- OCIGENAI
           dbms_vector_chain.drop_credential(credential_name  => 'OCI_CRED');
           jo := json_object_t();
           jo.put('user_ocid','<user_ocid>');
           jo.put('tenancy_ocid','<tenancy_ocid>');
           jo.put('compartment_ocid','<compartment_ocid>');
           jo.put('private_key','<private_key>');
           jo.put('fingerprint','<fingerprint>');
           dbms_vector_chain.create_credential(
               credential_name   => 'OCI_CRED',
               params            => json(jo.to_string));
       end;
       """
    )
    cursor.close()
    print("Credentials created.")
except Exception as ex:
    cursor.close()
    raise
```

### 生成嵌入

Oracle AI 向量搜索提供多种生成嵌入的方法，利用本地托管的 ONNX 模型或第三方 API。有关配置这些替代方案的详细说明，请参阅 [Oracle AI 向量搜索指南](https://docs.oracle.com/en/database/oracle/oracle-database/23/arpls/dbms_vector_chain1.html#GUID-C6439E94-4E86-4ECD-954E-4B73D53579DE)。

***注意:*** 用户可能需要配置代理以使用第三方嵌入生成大模型供应商，排除使用 ONNX 模型的 '数据库' 大模型供应商。


```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

以下示例代码将展示如何生成嵌入：


```python
<!--IMPORTS:[{"imported": "OracleEmbeddings", "source": "langchain_community.embeddings.oracleai", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.oracleai.OracleEmbeddings.html", "title": "Oracle AI Vector Search: Generate Embeddings"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Oracle AI Vector Search: Generate Embeddings"}]-->
from langchain_community.embeddings.oracleai import OracleEmbeddings
from langchain_core.documents import Document

"""
# using ocigenai
embedder_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/embedText",
    "model": "cohere.embed-english-light-v3.0",
}

# using huggingface
embedder_params = {
    "provider": "huggingface", 
    "credential_name": "HF_CRED", 
    "url": "https://api-inference.huggingface.co/pipeline/feature-extraction/", 
    "model": "sentence-transformers/all-MiniLM-L6-v2", 
    "wait_for_model": "true"
}
"""

# using ONNX model loaded to Oracle Database
embedder_params = {"provider": "database", "model": "demo_model"}

# If a proxy is not required for your environment, you can omit the 'proxy' parameter below
embedder = OracleEmbeddings(conn=conn, params=embedder_params, proxy=proxy)
embed = embedder.embed_query("Hello World!")

""" verify """
print(f"Embedding generated by OracleEmbeddings: {embed}")
```

### 端到端演示
请参阅我们的完整演示指南 [Oracle AI 向量搜索端到端演示指南](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.ipynb)，以帮助构建一个端到端的 RAG 管道，利用 Oracle AI 向量搜索。



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
