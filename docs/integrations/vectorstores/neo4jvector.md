---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/neo4jvector.ipynb
---
# Neo4j 向量索引

>[Neo4j](https://neo4j.com/) 是一个开源图数据库，集成了向量相似性搜索的支持

它支持：

- 近似最近邻搜索
- 欧几里得相似性和余弦相似性
- 结合向量和关键词搜索的混合搜索

本笔记本展示了如何使用 Neo4j 向量索引 (`Neo4jVector`)。

请参阅 [安装说明](https://neo4j.com/docs/operations-manual/current/installation/)。


```python
# Pip install necessary package
%pip install --upgrade --quiet  neo4j
%pip install --upgrade --quiet  langchain-openai langchain-community
%pip install --upgrade --quiet  tiktoken
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```
```output
OpenAI API Key: ········
```

```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Neo4j Vector Index"}, {"imported": "Neo4jVector", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.neo4j_vector.Neo4jVector.html", "title": "Neo4j Vector Index"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Neo4j Vector Index"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Neo4j Vector Index"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Neo4j Vector Index"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Neo4jVector
from langchain_core.documents import Document
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


```python
# Neo4jVector requires the Neo4j database credentials

url = "bolt://localhost:7687"
username = "neo4j"
password = "password"

# You can also use environment variables instead of directly passing named parameters
# os.environ["NEO4J_URI"] = "bolt://localhost:7687"
# os.environ["NEO4J_USERNAME"] = "neo4j"
# os.environ["NEO4J_PASSWORD"] = "pleaseletmein"
```

## 使用余弦距离进行相似性搜索（默认）


```python
# The Neo4jVector Module will connect to Neo4j and create a vector index if needed.

db = Neo4jVector.from_documents(
    docs, OpenAIEmbeddings(), url=url, username=username, password=password
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=2)
```


```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
```output
--------------------------------------------------------------------------------
Score:  0.9076391458511353
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.8912242650985718
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```
## 与向量存储一起工作

在上面，我们从头创建了一个向量存储。然而，通常我们希望使用现有的向量存储。
为了做到这一点，我们可以直接初始化它。


```python
index_name = "vector"  # default index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
)
```

我们还可以使用 `from_existing_graph` 方法从现有图形初始化向量存储。此方法从数据库中提取相关文本信息，并计算并将文本嵌入存储回数据库。


```python
# First we create sample data in graph
store.query(
    "CREATE (p:Person {name: 'Tomaz', location:'Slovenia', hobby:'Bicycle', age: 33})"
)
```



```output
[]
```



```python
# Now we initialize from existing graph
existing_graph = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    node_label="Person",
    text_node_properties=["name", "location"],
    embedding_node_property="embedding",
)
result = existing_graph.similarity_search("Slovenia", k=1)
```


```python
result[0]
```



```output
Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})
```


Neo4j 还支持关系向量索引，其中嵌入作为关系属性存储并被索引。关系向量索引不能通过 LangChain 填充，但您可以将其连接到现有的关系向量索引。


```python
# First we create sample data and index in graph
store.query(
    "MERGE (p:Person {name: 'Tomaz'}) "
    "MERGE (p1:Person {name:'Leann'}) "
    "MERGE (p1)-[:FRIEND {text:'example text', embedding:$embedding}]->(p2)",
    params={"embedding": OpenAIEmbeddings().embed_query("example text")},
)
# Create a vector index
relationship_index = "relationship_vector"
store.query(
    """
CREATE VECTOR INDEX $relationship_index
IF NOT EXISTS
FOR ()-[r:FRIEND]-() ON (r.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}
""",
    params={"relationship_index": relationship_index},
)
```



```output
[]
```



```python
relationship_vector = Neo4jVector.from_existing_relationship_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=relationship_index,
    text_node_property="text",
)
relationship_vector.similarity_search("Example")
```



```output
[Document(page_content='example text')]
```


### 元数据过滤

Neo4j 向量存储还支持通过结合并行运行时和精确最近邻搜索进行元数据过滤。
_需要 Neo4j 5.18 或更高版本._

相等过滤具有以下语法。


```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": "Bicycle", "name": "Tomaz"},
)
```



```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```


元数据过滤还支持以下操作符：

* `$eq: 等于`
* `$ne: 不等于`
* `$lt: 小于`
* `$lte: 小于或等于`
* `$gt: 大于`
* `$gte: 大于或等于`
* `$in: 在值列表中`
* `$nin: 不在值列表中`
* `$between: 在两个值之间`
* `$like: 文本包含值`
* `$ilike: 小写文本包含值`


```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": {"$eq": "Bicycle"}, "age": {"$gt": 15}},
)
```



```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```


您还可以在过滤器之间使用 `OR` 操作符


```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"$or": [{"hobby": {"$eq": "Bicycle"}}, {"age": {"$gt": 15}}]},
)
```



```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```


### 添加文档
我们可以将文档添加到现有的向量存储中。


```python
store.add_documents([Document(page_content="foo")])
```



```output
['acbd18db4cc2f85cedef654fccc4a4d8']
```



```python
docs_with_score = store.similarity_search_with_score("foo")
```


```python
docs_with_score[0]
```



```output
(Document(page_content='foo'), 0.9999997615814209)
```


## 使用检索查询自定义响应

您还可以通过使用自定义的 Cypher 代码片段来定制响应，该片段可以从图中获取其他信息。
在底层，最终的 Cypher 语句构造如下：

```
read_query = (
  "CALL db.index.vector.queryNodes($index, $k, $embedding) "
  "YIELD node, score "
) + retrieval_query
```

检索查询必须返回以下三列：

* `text`: Union[str, Dict] = 用于填充文档的 `page_content` 的值
* `score`: Float = 相似度分数
* `metadata`: Dict = 文档的附加元数据

在这篇 [博客文章](https://medium.com/neo4j/implementing-rag-how-to-write-a-graph-retrieval-query-in-langchain-74abf13044f2) 中了解更多信息。


```python
retrieval_query = """
RETURN "Name:" + node.name AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```



```output
[Document(page_content='Name:Tomaz', metadata={'foo': 'bar'})]
```


这是一个将除 `embedding` 之外的所有节点属性作为字典传递给 `text` 列的示例，


```python
retrieval_query = """
RETURN node {.name, .age, .hobby} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```



```output
[Document(page_content='name: Tomaz\nage: 33\nhobby: Bicycle\n', metadata={'foo': 'bar'})]
```


您还可以将 Cypher 参数传递给检索查询。
参数可用于额外的过滤、遍历等...


```python
retrieval_query = """
RETURN node {.*, embedding:Null, extra: $extra} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1, params={"extra": "ParamInfo"})
```



```output
[Document(page_content='location: Slovenia\nextra: ParamInfo\nname: Tomaz\nage: 33\nhobby: Bicycle\nembedding: None\n', metadata={'foo': 'bar'})]
```


## 混合搜索（向量 + 关键字）

Neo4j 集成了向量和关键字索引，这使您可以使用混合搜索方法


```python
# The Neo4jVector Module will connect to Neo4j and create a vector and keyword indices if needed.
hybrid_db = Neo4jVector.from_documents(
    docs,
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    search_type="hybrid",
)
```

要从现有索引加载混合搜索，您必须提供向量和关键字索引


```python
index_name = "vector"  # default index name
keyword_index_name = "keyword"  # default keyword index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
    keyword_index_name=keyword_index_name,
    search_type="hybrid",
)
```

## 检索器选项

本节展示如何使用 `Neo4jVector` 作为检索器。


```python
retriever = store.as_retriever()
retriever.invoke(query)[0]
```



```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt'})
```


## 带来源的问题回答

本节介绍如何在索引上进行带来源的问题回答。它通过使用 `RetrievalQAWithSourcesChain` 来查找索引中的文档。


```python
<!--IMPORTS:[{"imported": "RetrievalQAWithSourcesChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain.html", "title": "Neo4j Vector Index"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Neo4j Vector Index"}]-->
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import ChatOpenAI
```


```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    ChatOpenAI(temperature=0), chain_type="stuff", retriever=retriever
)
```


```python
chain.invoke(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```



```output
{'answer': 'The president honored Justice Stephen Breyer for his service to the country and mentioned his retirement from the United States Supreme Court.\n',
 'sources': '../../how_to/state_of_the_union.txt'}
```



## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
