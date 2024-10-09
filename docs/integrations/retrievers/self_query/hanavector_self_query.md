---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/hanavector_self_query.ipynb
---
# SAP HANA Cloud 向量引擎

有关如何设置 SAP HANA 向量存储的更多信息，请查看 [文档](/docs/integrations/vectorstores/sap_hanavector.md)。

我们在这里使用相同的设置：


```python
import os

# Use OPENAI_API_KEY env variable
# os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
from hdbcli import dbapi

# Use connection settings from the environment
connection = dbapi.connect(
    address=os.environ.get("HANA_DB_ADDRESS"),
    port=os.environ.get("HANA_DB_PORT"),
    user=os.environ.get("HANA_DB_USER"),
    password=os.environ.get("HANA_DB_PASSWORD"),
    autocommit=True,
    sslValidateCertificate=False,
)
```

为了能够以良好的性能进行自我查询，我们创建了额外的元数据字段
用于我们在 HANA 中的向量存储表：


```python
# Create custom table with attribute
cur = connection.cursor()
cur.execute("DROP TABLE LANGCHAIN_DEMO_SELF_QUERY", ignoreErrors=True)
cur.execute(
    (
        """CREATE TABLE "LANGCHAIN_DEMO_SELF_QUERY"  (
        "name" NVARCHAR(100), "is_active" BOOLEAN, "id" INTEGER, "height" DOUBLE,
        "VEC_TEXT" NCLOB, 
        "VEC_META" NCLOB, 
        "VEC_VECTOR" REAL_VECTOR
        )"""
    )
)
```

让我们添加一些文档。


```python
<!--IMPORTS:[{"imported": "HanaDB", "source": "langchain_community.vectorstores.hanavector", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.hanavector.HanaDB.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "SAP HANA Cloud Vector Engine"}]-->
from langchain_community.vectorstores.hanavector import HanaDB
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

# Prepare some test documents
docs = [
    Document(
        page_content="First",
        metadata={"name": "adam", "is_active": True, "id": 1, "height": 10.0},
    ),
    Document(
        page_content="Second",
        metadata={"name": "bob", "is_active": False, "id": 2, "height": 5.7},
    ),
    Document(
        page_content="Third",
        metadata={"name": "jane", "is_active": True, "id": 3, "height": 2.4},
    ),
]

db = HanaDB(
    connection=connection,
    embedding=embeddings,
    table_name="LANGCHAIN_DEMO_SELF_QUERY",
    specific_metadata_columns=["name", "is_active", "id", "height"],
)

# Delete already existing documents from the table
db.delete(filter={})
db.add_documents(docs)
```

## 自我查询

现在是主要环节：这是如何为 HANA 向量存储构建 SelfQueryRetriever 的：


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "HanaTranslator", "source": "langchain_community.query_constructors.hanavector", "docs": "https://python.langchain.com/api_reference/community/query_constructors/langchain_community.query_constructors.hanavector.HanaTranslator.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "SAP HANA Cloud Vector Engine"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.query_constructors.hanavector import HanaTranslator
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo")

metadata_field_info = [
    AttributeInfo(
        name="name",
        description="The name of the person",
        type="string",
    ),
    AttributeInfo(
        name="is_active",
        description="Whether the person is active",
        type="boolean",
    ),
    AttributeInfo(
        name="id",
        description="The ID of the person",
        type="integer",
    ),
    AttributeInfo(
        name="height",
        description="The height of the person",
        type="float",
    ),
]

document_content_description = "A collection of persons"

hana_translator = HanaTranslator()

retriever = SelfQueryRetriever.from_llm(
    llm,
    db,
    document_content_description,
    metadata_field_info,
    structured_query_translator=hana_translator,
)
```

让我们使用这个检索器为一个人准备一个（自我）查询：


```python
query_prompt = "Which person is not active?"

docs = retriever.invoke(input=query_prompt)
for doc in docs:
    print("-" * 80)
    print(doc.page_content, " ", doc.metadata)
```

我们还可以看看查询是如何构建的：


```python
<!--IMPORTS:[{"imported": "StructuredQueryOutputParser", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.base.StructuredQueryOutputParser.html", "title": "SAP HANA Cloud Vector Engine"}, {"imported": "get_query_constructor_prompt", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.base.get_query_constructor_prompt.html", "title": "SAP HANA Cloud Vector Engine"}]-->
from langchain.chains.query_constructor.base import (
    StructuredQueryOutputParser,
    get_query_constructor_prompt,
)

prompt = get_query_constructor_prompt(
    document_content_description,
    metadata_field_info,
)
output_parser = StructuredQueryOutputParser.from_components()
query_constructor = prompt | llm | output_parser

sq = query_constructor.invoke(input=query_prompt)

print("Structured query: ", sq)

print("Translated for hana vector store: ", hana_translator.visit_structured_query(sq))
```
