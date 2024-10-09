---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_el_carro.ipynb
---
# Google El Carro for Oracle Workloads

> Google [El Carro Oracle Operator](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)
提供了一种在Kubernetes中运行Oracle数据库的方法，作为一个可移植的开源、
社区驱动的，无供应商锁定的容器编排系统。El Carro
提供了一个强大的声明式API，用于全面和一致的
配置和部署，以及实时操作和
监控。
通过利用El Carro Langchain集成，扩展您的Oracle数据库的功能，以构建AI驱动的体验。
本指南介绍了如何使用El Carro Langchain集成来

本指南介绍如何使用 El Carro Langchain 集成
[保存、加载和删除 LangChain 文档](/docs/how_to#document-loaders)
使用 `ElCarroLoader` 和 `ElCarroDocumentSaver`。此集成适用于任何 Oracle 数据库，无论其运行在哪里。

在 [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/) 上了解更多关于该包的信息。

[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## 开始之前

请完成
[入门指南](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started)
部分内容
的 README 以设置您的 El Carro Oracle 数据库。

### 🦜🔗 库安装

集成位于其自己的 `langchain-google-el-carro` 包中，因此
我们需要安装它。


```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## 基本用法

### 设置 Oracle 数据库连接
填写以下变量，输入您的 Oracle 数据库连接详细信息。


```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```


如果您使用 El Carro，您可以在
El Carro Kubernetes 实例的状态中找到主机名和端口值。
使用您为 PDB 创建的用户密码。

示例输出：


```
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### ElCarroEngine 连接池

`ElCarroEngine` 配置一个连接池到您的 Oracle 数据库，使您的应用程序能够成功连接并遵循行业最佳实践。


```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### 初始化表格

初始化默认模式的表格
通过 `elcarro_engine.init_document_table(<table_name>)`。表格列：

- page_content (类型: 文本)
- langchain_metadata (类型: JSON)


```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### 保存文档

使用 `ElCarroDocumentSaver.add_documents(<documents>)` 保存 LangChain 文档。
要初始化 `ElCarroDocumentSaver` 类，您需要提供两样东西：

1. `elcarro_engine` - `ElCarroEngine` 引擎的实例。
2. `table_name` - 存储在 Oracle 数据库中的表名
LangChain 文档。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Google El Carro for Oracle Workloads"}]-->
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### 加载文档

使用 `ElCarroLoader.load()` 加载 LangChain 文档
或使用 `ElCarroLoader.lazy_load()`。
`lazy_load` 返回一个生成器，该生成器在迭代期间仅查询数据库。
要初始化 `ElCarroLoader` 类，您需要提供：

1. `elcarro_engine` - `ElCarroEngine` 引擎的实例。
2. `table_name` - Oracle 数据库中存储 LangChain 文档的表名。
LangChain 文档。



```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### 通过查询加载文档

除了从表中加载文档外，我们还可以选择从 SQL 查询生成的视图中加载文档。
例如：


```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

从 SQL 查询生成的视图可以具有不同于默认表的模式。
在这种情况下，ElCarroLoader 的行为与从具有非默认模式的表中加载相同。
请参考
部分 [使用自定义文档页面内容和元数据加载文档](#load-documents-with-customized-document-page-content--metadata)。

### 删除文档

从 Oracle 表中删除一组 langchain 文档
使用 `ElCarroDocumentSaver.delete(<documents>)`。

对于具有默认模式 (page_content, langchain_metadata) 的表，
删除标准为：

如果列表中存在一个 `document`，则应删除 `row`，满足以下条件：

- `document.page_content` 等于 `row[page_content]`
- `document.metadata` 等于 `row[langchain_metadata]`


```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## 高级用法

### 使用自定义文档页面内容和元数据加载文档

首先，我们准备一个具有非默认模式的示例表，并用
一些任意数据填充它。


```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

如果我们仍然使用 `ElCarroLoader` 的默认参数加载 langchain 文档
从这个示例表中，加载文档的 `page_content` 将是
表格的第一列，`metadata` 将由键值对组成
所有其他列。


```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

我们可以通过设置来指定要加载的内容和元数据
在初始化时的 `content_columns` 和 `metadata_columns`
的 `ElCarroLoader`。

1. `content_columns`: 要写入文档的 `page_content` 的列。
2. `metadata_columns`: 要写入文档的 `metadata` 的列。
2. `metadata_columns`: 要写入文档的 `metadata` 的列。

例如，这里 `content_columns` 中列的值将被连接
成一个以空格分隔的字符串，作为加载文档的 `page_content`，
加载的文档的 `metadata` 只会包含列的键值对
在 `metadata_columns` 中指定。


```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### 保存带有自定义页面内容和元数据的文档

为了将 LangChain 文档保存到具有自定义元数据字段的表中
我们需要首先通过 `ElCarroEngine.init_document_table()` 创建这样的表，并且
指定我们希望它拥有的 `metadata_columns` 列表。在这个例子中，
创建的表将具有以下表列：

- 内容 (类型: 文本): 用于存储水果描述。
- 类型 (类型 VARCHAR2(200)): 用于存储水果类型。
- 重量 (类型 INT): 用于存储水果重量。
- extra_json_metadata (类型: JSON): 用于存储其他元数据的信息。
水果。

我们可以使用以下参数
与 `elcarro_engine.init_document_table()` 一起创建表：

1. `table_name`: 在 Oracle 数据库中存储的表名
LangChain 文档。
2. `metadata_columns`: 一个 `sqlalchemy.Column` 的列表，指示我们需要的元数据列的列表。
3. `content_column`: 存储 LangChain 的 `page_content` 的列名。
3. `content_column`: 存储LangChain的`page_content`的列名
文档。默认值：`"page_content", "VARCHAR2(4000)"`
4. `metadata_json_column`：用于存储额外的
LangChain文档的JSON `metadata`。
默认值：`"langchain_metadata", "VARCHAR2(4000)"`。



```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

使用 `ElCarroDocumentSaver.add_documents(<documents>)` 保存文档。正如您
在这个例子中所看到的，

- `document.page_content` 将被保存到 `content` 列。
- `document.metadata.type` 将被保存到 `type` 列。
- `document.metadata.weight` 将被保存到 `weight` 列。
- `document.metadata.organic` 将被保存到 `extra_json_metadata` 列中。
JSON格式。



```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### 删除具有自定义页面内容和元数据的文档

我们还可以从表中删除具有自定义元数据列的文档
通过 `ElCarroDocumentSaver.delete(<documents>)`。删除标准是：

如果列表中存在一个 `document`，则应删除 `row`，满足以下条件：

- `document.page_content` 等于 `row[page_content]`
- 对于 `document.metadata` 中的每个元数据字段 `k`
- `document.metadata[k]` 等于 `row[k]` 或 `document.metadata[k]`
等于 `row[langchain_metadata][k]`
- `row` 中没有额外的元数据字段存在
在 `document.metadata` 中。


```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## 更多示例

请查看
在 [demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py)
和 [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py)
以获取
完整的代码示例。



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
