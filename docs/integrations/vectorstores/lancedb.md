---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/lancedb.ipynb
---
# LanceDB

>[LanceDB](https://lancedb.com/) 是一个开源的向量搜索数据库，具有持久存储功能，极大简化了嵌入的检索、过滤和管理。完全开源。

本笔记本展示了如何使用与 `LanceDB` 向量数据库相关的功能，基于Lance数据格式。


```python
! pip install tantivy
```


```python
! pip install -U langchain-openai langchain-community
```


```python
! pip install lancedb
```

我们想使用 OpenAIEmbeddings，因此我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
! rm -rf /tmp/lancedb
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "LanceDB"}, {"imported": "LanceDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.lancedb.LanceDB.html", "title": "LanceDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "LanceDB"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "LanceDB"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import LanceDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter().split_documents(documents)
embeddings = OpenAIEmbeddings()
```

##### 对于 LanceDB 云，您可以如下调用向量存储：


```python
db_url = "db://lang_test" # url of db you created
api_key = "xxxxx" # your API key
region="us-east-1-dev"  # your selected region

vector_store = LanceDB(
    uri=db_url,
    api_key=api_key,
    region=region,
    embedding=embeddings,
    table_name='langchain_test'
    )
```

您还可以将 `region`、`api_key`、`uri` 添加到 `from_documents()` 类方法中。



```python
from lancedb.rerankers import LinearCombinationReranker

reranker = LinearCombinationReranker(weight=0.3)

docsearch = LanceDB.from_documents(documents, embeddings, reranker=reranker)
query = "What did the president say about Ketanji Brown Jackson"
```


```python
docs = docsearch.similarity_search_with_relevance_scores(query)
print("relevance score - ", docs[0][1])
print("text- ", docs[0][0].page_content[:1000])
```
```output
relevance score -  0.7066475030191711
text-  They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety. 

So let’s not abandon our streets. Or choose between safety and equal justice. 

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable. 

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers. 

That’s why the American Rescue
```

```python
docs = docsearch.similarity_search_with_score(query="Headaches", query_type="hybrid")
print("distance - ", docs[0][1])
print("text- ", docs[0][0].page_content[:1000])
```
```output
distance -  0.30000001192092896
text-  My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers. 

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more. 

When they came home, many of the world’s fittest and best trained warriors were never the same. 

Headaches. Numbness. Dizziness. 

A cancer that would put them in a flag-draped coffin. 

I know. 

One of those soldiers was my son Major Beau Biden. 

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. 

But I’m committed to finding out everything we can. 

Committed to military families like Danielle Robinson from Ohio. 

The widow of Sergeant First Class Heath Robinson.  

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq. 

Stationed near Baghdad, just ya
```

```python
print("reranker : ", docsearch._reranker)
```
```output
reranker :  <lancedb.rerankers.linear_combination.LinearCombinationReranker object at 0x107ef1130>
```
此外，要探索表格，您可以将其加载到数据框中或保存为 csv 文件：
```python
tbl = docsearch.get_table()
print("tbl:", tbl)
pd_df = tbl.to_pandas()
# pd_df.to_csv("docsearch.csv", index=False)

# you can also create a new vector store object using an older connection object:
vector_store = LanceDB(connection=tbl, embedding=embeddings)
```


```python
docs = docsearch.similarity_search(
    query=query, filter={"metadata.source": "../../how_to/state_of_the_union.txt"}
)

print("metadata :", docs[0].metadata)

# or you can directly supply SQL string filters :

print("\nSQL filtering :\n")
docs = docsearch.similarity_search(query=query, filter="text LIKE '%Officer Rivera%'")
print(docs[0].page_content)
```
```output
metadata : {'source': '../../how_to/state_of_the_union.txt'}

SQL filtering :

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety. 

So let’s not abandon our streets. Or choose between safety and equal justice. 

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable. 

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers. 

That’s why the American Rescue Plan provided $350 Billion that cities, states, and counties can use to hire more police and invest in proven strategies like community violence interruption—trusted messengers breaking the cycle of violence and trauma and giving young people hope.  

We should all agree: The answer is not to Defund the police. The answer is to FUND the police with the resources and training they need to protect our communities. 

I ask Democrats and Republicans alike: Pass my budget and keep our neighborhoods safe.  

And I will keep doing everything in my power to crack down on gun trafficking and ghost guns you can buy online and make at home—they have no serial numbers and can’t be traced. 

And I ask Congress to pass proven measures to reduce gun violence. Pass universal background checks. Why should anyone on a terrorist list be able to purchase a weapon? 

Ban assault weapons and high-capacity magazines. 

Repeal the liability shield that makes gun manufacturers the only industry in America that can’t be sued. 

These laws don’t infringe on the Second Amendment. They save lives. 

The most fundamental right in America is the right to vote – and to have it counted. And it’s under assault. 

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections. 

We cannot let this happen. 

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. 

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.
```
## 添加图像


```python
! pip install -U langchain-experimental
```


```python
! pip install open_clip_torch torch
```


```python
! rm -rf '/tmp/multimmodal_lance'
```


```python
<!--IMPORTS:[{"imported": "OpenCLIPEmbeddings", "source": "langchain_experimental.open_clip", "docs": "https://python.langchain.com/api_reference/experimental/open_clip/langchain_experimental.open_clip.open_clip.OpenCLIPEmbeddings.html", "title": "LanceDB"}]-->
from langchain_experimental.open_clip import OpenCLIPEmbeddings
```


```python
import os

import requests

# List of image URLs to download
image_urls = [
    "https://github.com/raghavdixit99/assets/assets/34462078/abf47cc4-d979-4aaa-83be-53a2115bf318",
    "https://github.com/raghavdixit99/assets/assets/34462078/93be928e-522b-4e37-889d-d4efd54b2112",
]

texts = ["bird", "dragon"]

# Directory to save images
dir_name = "./photos/"

# Create directory if it doesn't exist
os.makedirs(dir_name, exist_ok=True)

image_uris = []
# Download and save each image
for i, url in enumerate(image_urls, start=1):
    response = requests.get(url)
    path = os.path.join(dir_name, f"image{i}.jpg")
    image_uris.append(path)
    with open(path, "wb") as f:
        f.write(response.content)
```


```python
<!--IMPORTS:[{"imported": "LanceDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.lancedb.LanceDB.html", "title": "LanceDB"}]-->
from langchain_community.vectorstores import LanceDB

vec_store = LanceDB(
    table_name="multimodal_test",
    embedding=OpenCLIPEmbeddings(),
)
```


```python
vec_store.add_images(uris=image_uris)
```



```output
['b673620b-01f0-42ca-a92e-d033bb92c0a6',
 '99c3a5b0-b577-417a-8177-92f4a655dbfb']
```



```python
vec_store.add_texts(texts)
```



```output
['f7adde5d-a4a3-402b-9e73-088b230722c3',
 'cbed59da-0aec-4bff-8820-9e59d81a2140']
```



```python
img_embed = vec_store._embedding.embed_query("bird")
```


```python
vec_store.similarity_search_by_vector(img_embed)[0]
```



```output
Document(page_content='bird', metadata={'id': 'f7adde5d-a4a3-402b-9e73-088b230722c3'})
```



```python
vec_store._table
```



```output
LanceTable(connection=LanceDBConnection(/tmp/lancedb), name="multimodal_test")
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
