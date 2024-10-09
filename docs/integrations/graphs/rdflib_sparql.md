---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/rdflib_sparql.ipynb
---
# RDFLib

>[RDFLib](https://rdflib.readthedocs.io/) 是一个纯 Python 包，用于处理 [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework)。`RDFLib` 包含了处理 `RDF` 所需的大部分内容，包括：
>- RDF/XML、N3、NTriples、N-Quads、Turtle、TriX、Trig 和 JSON-LD 的解析器和序列化器
>- 一个图形接口，可以由多种存储实现支持
>- 内存存储、持久化磁盘存储（Berkeley DB）和远程 SPARQL 端点的存储实现
>- SPARQL 1.1 实现 - 支持 SPARQL 1.1 查询和更新语句
>- SPARQL 函数扩展机制

图形数据库是基于网络模型的应用程序的优秀选择。为了标准化此类图形的语法和语义，W3C 推荐 `语义网技术`，参见 [语义网](https://www.w3.org/standards/semanticweb/)。

[SPARQL](https://www.w3.org/TR/sparql11-query/) 作为查询语言，类似于这些图形的 `SQL` 或 `Cypher`。本笔记本演示了 LLM 作为图形数据库的自然语言接口，通过生成 `SPARQL`。

**免责声明：** 到目前为止，通过 LLM 生成 `SPARQL` 查询仍然有些不稳定。特别注意 `UPDATE` 查询，这会改变图形。

## 设置

我们需要安装一个Python库：


```python
!pip install rdflib
```

您可以针对多个来源运行查询，包括网络上的文件、您本地可用的文件、SPARQL 端点，例如 [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page) 和 [三元组存储](https://www.w3.org/wiki/LargeTripleStores)。


```python
<!--IMPORTS:[{"imported": "GraphSparqlQAChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.sparql.GraphSparqlQAChain.html", "title": "RDFLib"}, {"imported": "RdfGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.rdf_graph.RdfGraph.html", "title": "RDFLib"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "RDFLib"}]-->
from langchain.chains import GraphSparqlQAChain
from langchain_community.graphs import RdfGraph
from langchain_openai import ChatOpenAI
```


```python
graph = RdfGraph(
    source_file="http://www.w3.org/People/Berners-Lee/card",
    standard="rdf",
    local_copy="test.ttl",
)
```

请注意，如果源是只读的，提供 `local_file` 是在本地存储更改所必需的。

## 刷新图形模式信息
如果数据库的模式发生变化，您可以刷新生成 SPARQL 查询所需的模式信息。


```python
graph.load_schema()
```


```python
graph.get_schema
```
```output
In the following, each IRI is followed by the local name and optionally its description in parentheses. 
The RDF graph supports the following node types:
<http://xmlns.com/foaf/0.1/PersonalProfileDocument> (PersonalProfileDocument, None), <http://www.w3.org/ns/auth/cert#RSAPublicKey> (RSAPublicKey, None), <http://www.w3.org/2000/10/swap/pim/contact#Male> (Male, None), <http://xmlns.com/foaf/0.1/Person> (Person, None), <http://www.w3.org/2006/vcard/ns#Work> (Work, None)
The RDF graph supports the following relationships:
<http://www.w3.org/2000/01/rdf-schema#seeAlso> (seeAlso, None), <http://purl.org/dc/elements/1.1/title> (title, None), <http://xmlns.com/foaf/0.1/mbox_sha1sum> (mbox_sha1sum, None), <http://xmlns.com/foaf/0.1/maker> (maker, None), <http://www.w3.org/ns/solid/terms#oidcIssuer> (oidcIssuer, None), <http://www.w3.org/2000/10/swap/pim/contact#publicHomePage> (publicHomePage, None), <http://xmlns.com/foaf/0.1/openid> (openid, None), <http://www.w3.org/ns/pim/space#storage> (storage, None), <http://xmlns.com/foaf/0.1/name> (name, None), <http://www.w3.org/2000/10/swap/pim/contact#country> (country, None), <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> (type, None), <http://www.w3.org/ns/solid/terms#profileHighlightColor> (profileHighlightColor, None), <http://www.w3.org/ns/pim/space#preferencesFile> (preferencesFile, None), <http://www.w3.org/2000/01/rdf-schema#label> (label, None), <http://www.w3.org/ns/auth/cert#modulus> (modulus, None), <http://www.w3.org/2000/10/swap/pim/contact#participant> (participant, None), <http://www.w3.org/2000/10/swap/pim/contact#street2> (street2, None), <http://www.w3.org/2006/vcard/ns#locality> (locality, None), <http://xmlns.com/foaf/0.1/nick> (nick, None), <http://xmlns.com/foaf/0.1/homepage> (homepage, None), <http://creativecommons.org/ns#license> (license, None), <http://xmlns.com/foaf/0.1/givenname> (givenname, None), <http://www.w3.org/2006/vcard/ns#street-address> (street-address, None), <http://www.w3.org/2006/vcard/ns#postal-code> (postal-code, None), <http://www.w3.org/2000/10/swap/pim/contact#street> (street, None), <http://www.w3.org/2003/01/geo/wgs84_pos#lat> (lat, None), <http://xmlns.com/foaf/0.1/primaryTopic> (primaryTopic, None), <http://www.w3.org/2006/vcard/ns#fn> (fn, None), <http://www.w3.org/2003/01/geo/wgs84_pos#location> (location, None), <http://usefulinc.com/ns/doap#developer> (developer, None), <http://www.w3.org/2000/10/swap/pim/contact#city> (city, None), <http://www.w3.org/2006/vcard/ns#region> (region, None), <http://xmlns.com/foaf/0.1/member> (member, None), <http://www.w3.org/2003/01/geo/wgs84_pos#long> (long, None), <http://www.w3.org/2000/10/swap/pim/contact#address> (address, None), <http://xmlns.com/foaf/0.1/family_name> (family_name, None), <http://xmlns.com/foaf/0.1/account> (account, None), <http://xmlns.com/foaf/0.1/workplaceHomepage> (workplaceHomepage, None), <http://purl.org/dc/terms/title> (title, None), <http://www.w3.org/ns/solid/terms#publicTypeIndex> (publicTypeIndex, None), <http://www.w3.org/2000/10/swap/pim/contact#office> (office, None), <http://www.w3.org/2000/10/swap/pim/contact#homePage> (homePage, None), <http://xmlns.com/foaf/0.1/mbox> (mbox, None), <http://www.w3.org/2000/10/swap/pim/contact#preferredURI> (preferredURI, None), <http://www.w3.org/ns/solid/terms#profileBackgroundColor> (profileBackgroundColor, None), <http://schema.org/owns> (owns, None), <http://xmlns.com/foaf/0.1/based_near> (based_near, None), <http://www.w3.org/2006/vcard/ns#hasAddress> (hasAddress, None), <http://xmlns.com/foaf/0.1/img> (img, None), <http://www.w3.org/2000/10/swap/pim/contact#assistant> (assistant, None), <http://xmlns.com/foaf/0.1/title> (title, None), <http://www.w3.org/ns/auth/cert#key> (key, None), <http://www.w3.org/ns/ldp#inbox> (inbox, None), <http://www.w3.org/ns/solid/terms#editableProfile> (editableProfile, None), <http://www.w3.org/2000/10/swap/pim/contact#postalCode> (postalCode, None), <http://xmlns.com/foaf/0.1/weblog> (weblog, None), <http://www.w3.org/ns/auth/cert#exponent> (exponent, None), <http://rdfs.org/sioc/ns#avatar> (avatar, None)
```
## 查询图形

现在，您可以使用图形 SPARQL QA 链来询问有关图形的问题。


```python
chain = GraphSparqlQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```


```python
chain.run("What is Tim Berners-Lee's work homepage?")
```
```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mSELECT[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?homepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?homepage .
}[0m
Full Context:
[32;1m[1;3m[][0m

[1m> Finished chain.[0m
```


```output
"Tim Berners-Lee's work homepage is http://www.w3.org/People/Berners-Lee/."
```


## 更新图形

类似地，您可以使用自然语言更新图形，即插入三元组。


```python
chain.run(
    "Save that the person with the name 'Timothy Berners-Lee' has a work homepage at 'http://www.w3.org/foo/bar/'"
)
```
```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mUPDATE[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
INSERT {
    ?person foaf:workplaceHomepage <http://www.w3.org/foo/bar/> .
}
WHERE {
    ?person foaf:name "Timothy Berners-Lee" .
}[0m

[1m> Finished chain.[0m
```


```output
'Successfully inserted triples into the graph.'
```


让我们验证结果：


```python
query = (
    """PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"""
    """SELECT ?hp\n"""
    """WHERE {\n"""
    """    ?person foaf:name "Timothy Berners-Lee" . \n"""
    """    ?person foaf:workplaceHomepage ?hp .\n"""
    """}"""
)
graph.query(query)
```



```output
[(rdflib.term.URIRef('https://www.w3.org/'),),
 (rdflib.term.URIRef('http://www.w3.org/foo/bar/'),)]
```


## 返回 SPARQL 查询
您可以使用 `return_sparql_query` 参数从 Sparql QA Chain 返回 SPARQL 查询步骤


```python
chain = GraphSparqlQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_sparql_query=True
)
```


```python
result = chain("What is Tim Berners-Lee's work homepage?")
print(f"SPARQL query: {result['sparql_query']}")
print(f"Final answer: {result['result']}")
```
```output


[1m> Entering new GraphSparqlQAChain chain...[0m
Identified intent:
[32;1m[1;3mSELECT[0m
Generated SPARQL:
[32;1m[1;3mPREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}[0m
Full Context:
[32;1m[1;3m[][0m

[1m> Finished chain.[0m
SPARQL query: PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}
Final answer: Tim Berners-Lee's work homepage is http://www.w3.org/People/Berners-Lee/.
```

```python
print(result["sparql_query"])
```
```output
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?workHomepage
WHERE {
    ?person foaf:name "Tim Berners-Lee" .
    ?person foaf:workplaceHomepage ?workHomepage .
}
```