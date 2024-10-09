---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/graphs/amazon_neptune_sparql.ipynb
---
# Amazon Neptune与SPARQL

>[Amazon Neptune](https://aws.amazon.com/neptune/) 是一个高性能图形分析和无服务器数据库，具有卓越的可扩展性和可用性。
>
>此示例展示了一个QA链，它查询[资源描述框架 (RDF)](https://en.wikipedia.org/wiki/Resource_Description_Framework) 数据
在一个`Amazon Neptune`图数据库中，使用`SPARQL`查询语言并返回人类可读的响应。
>
>[SPARQL](https://en.wikipedia.org/wiki/SPARQL) 是`RDF`图的标准查询语言。


此示例使用`NeptuneRdfGraph`类连接到Neptune数据库并加载其架构。
`NeptuneSparqlQAChain`用于连接图和大型语言模型，以提出自然语言问题。

此笔记本演示了使用组织数据的示例。

运行此笔记本的要求：
- 可从此笔记本访问的 Neptune 1.2.x 集群
- Python 3.9 或更高版本的内核
- 对于 Bedrock 访问，确保 IAM 角色具有此策略

```json
{
        "Action": [
            "bedrock:ListFoundationModels",
            "bedrock:InvokeModel"
        ],
        "Resource": "*",
        "Effect": "Allow"
}
```

- S3 存储桶用于暂存示例数据。该存储桶应与 Neptune 在同一账户/区域内。

## 设置

### 初始化 W3C 组织数据

初始化 W3C 组织数据，W3C 组织本体及一些实例。
 
您需要在同一地区和账户中创建一个 S3 存储桶。将 `STAGE_BUCKET` 设置为该存储桶的名称。


```python
STAGE_BUCKET = "<bucket-name>"
```


```bash
%%bash  -s "$STAGE_BUCKET"

rm -rf data
mkdir -p data
cd data
echo getting org ontology and sample org instances
wget http://www.w3.org/ns/org.ttl 
wget https://raw.githubusercontent.com/aws-samples/amazon-neptune-ontology-example-blog/main/data/example_org.ttl 

echo Copying org ttl to S3
aws s3 cp org.ttl s3://$1/org.ttl
aws s3 cp example_org.ttl s3://$1/example_org.ttl

```

批量加载组织 ttl - 包括本体和实例


```python
%load -s s3://{STAGE_BUCKET} -f turtle --store-to loadres --run
```


```python
%load_status {loadres['payload']['loadId']} --errors --details
```

### 设置链


```python
!pip install --upgrade --quiet langchain langchain-community langchain-aws
```

** 重启内核 **

### 准备一个示例


```python
EXAMPLES = """

<question>
Find organizations.
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX org: <http://www.w3.org/ns/org#> 

select ?org ?orgName where {{
    ?org rdfs:label ?orgName .
}} 
</sparql>

<question>
Find sites of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX org: <http://www.w3.org/ns/org#> 

select ?org ?orgName ?siteName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasSite/rdfs:label ?siteName . 
}} 
</sparql>

<question>
Find suborganizations of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX org: <http://www.w3.org/ns/org#> 

select ?org ?orgName ?subName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasSubOrganization/rdfs:label ?subName  .
}} 
</sparql>

<question>
Find organizational units of an organization
</question>

<sparql>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX org: <http://www.w3.org/ns/org#> 

select ?org ?orgName ?unitName where {{
    ?org rdfs:label ?orgName .
    ?org org:hasUnit/rdfs:label ?unitName . 
}} 
</sparql>

<question>
Find members of an organization. Also find their manager, or the member they report to.
</question>

<sparql>
PREFIX org: <http://www.w3.org/ns/org#> 
PREFIX foaf: <http://xmlns.com/foaf/0.1/> 

select * where {{
    ?person rdf:type foaf:Person .
    ?person  org:memberOf ?org .
    OPTIONAL {{ ?person foaf:firstName ?firstName . }}
    OPTIONAL {{ ?person foaf:family_name ?lastName . }}
    OPTIONAL {{ ?person  org:reportsTo ??manager }} .
}}
</sparql>


<question>
Find change events, such as mergers and acquisitions, of an organization
</question>

<sparql>
PREFIX org: <http://www.w3.org/ns/org#> 

select ?event ?prop ?obj where {{
    ?org rdfs:label ?orgName .
    ?event rdf:type org:ChangeEvent .
    ?event org:originalOrganization ?origOrg .
    ?event org:resultingOrganization ?resultingOrg .
}}
</sparql>

"""
```


```python
<!--IMPORTS:[{"imported": "NeptuneSparqlQAChain", "source": "langchain_community.chains.graph_qa.neptune_sparql", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.graph_qa.neptune_sparql.NeptuneSparqlQAChain.html", "title": "Amazon Neptune with SPARQL"}, {"imported": "NeptuneRdfGraph", "source": "langchain_community.graphs", "docs": "https://python.langchain.com/api_reference/community/graphs/langchain_community.graphs.neptune_rdf_graph.NeptuneRdfGraph.html", "title": "Amazon Neptune with SPARQL"}]-->
import boto3
from langchain_aws import ChatBedrock
from langchain_community.chains.graph_qa.neptune_sparql import NeptuneSparqlQAChain
from langchain_community.graphs import NeptuneRdfGraph

host = "<your host>"
port = 8182  # change if different
region = "us-east-1"  # change if different
graph = NeptuneRdfGraph(host=host, port=port, use_iam_auth=True, region_name=region)

# Optionally change the schema
# elems = graph.get_schema_elements
# change elems ...
# graph.load_schema(elems)

MODEL_ID = "anthropic.claude-v2"
bedrock_client = boto3.client("bedrock-runtime")
llm = ChatBedrock(model_id=MODEL_ID, client=bedrock_client)

chain = NeptuneSparqlQAChain.from_llm(
    llm=llm,
    graph=graph,
    examples=EXAMPLES,
    verbose=True,
    top_K=10,
    return_intermediate_steps=True,
    return_direct=False,
)
```

## 提问
取决于我们上面摄取的数据


```python
chain.invoke("""How many organizations are in the graph""")
```


```python
chain.invoke("""Are there any mergers or acquisitions""")
```


```python
chain.invoke("""Find organizations""")
```


```python
chain.invoke("""Find sites of MegaSystems or MegaFinancial""")
```


```python
chain.invoke("""Find a member who is manager of one or more members.""")
```


```python
chain.invoke("""Find five members and who their manager is.""")
```


```python
chain.invoke(
    """Find org units or suborganizations of The Mega Group. What are the sites of those units?"""
)
```
