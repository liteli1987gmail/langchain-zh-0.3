---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/lantern.ipynb
---
# Lantern

>[Lantern](https://github.com/lanterndata/lantern) 是一个开源的向量相似性搜索工具，适用于 `Postgres`

它支持：
- 精确和近似最近邻搜索
- L2平方距离、汉明距离和余弦距离

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成

本笔记本展示了如何使用 Postgres 向量数据库（`Lantern`）。

请参阅 [安装说明](https://github.com/lanterndata/lantern#-quick-install)。

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。

# Pip 安装必要的包
!pip install openai
!pip install psycopg2-binary
!pip install tiktoken


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
## Loading Environment Variables
from typing import List, Tuple

from dotenv import load_dotenv

load_dotenv()
```



```output
False
```



```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Lantern"}, {"imported": "Lantern", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.lantern.Lantern.html", "title": "Lantern"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Lantern"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Lantern"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Lantern"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Lantern
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
# Lantern needs the connection string to the database.
# Example postgresql://postgres:postgres@localhost:5432/postgres
CONNECTION_STRING = getpass.getpass("DB Connection String:")

# # Alternatively, you can create it from environment variables.
# import os

# CONNECTION_STRING = Lantern.connection_string_from_db_params(
#     driver=os.environ.get("LANTERN_DRIVER", "psycopg2"),
#     host=os.environ.get("LANTERN_HOST", "localhost"),
#     port=int(os.environ.get("LANTERN_PORT", "5432")),
#     database=os.environ.get("LANTERN_DATABASE", "postgres"),
#     user=os.environ.get("LANTERN_USER", "postgres"),
#     password=os.environ.get("LANTERN_PASSWORD", "postgres"),
# )

# or you can pass it via `LANTERN_CONNECTION_STRING` env variable
```
```output
DB Connection String: ········
```
## 使用余弦距离的相似性搜索（默认）


```python
# The Lantern Module will try to create a table with the name of the collection.
# So, make sure that the collection name is unique and the user has the permission to create a table.

COLLECTION_NAME = "state_of_the_union_test"

db = Lantern.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    pre_delete_collection=True,
)
```


```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query)
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
Score:  0.18440479
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21727282
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.22621095
And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. 

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. 

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. 

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  

First, beat the opioid epidemic.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.22654456
Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. 

And as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  

That ends on my watch. 

Medicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. 

We’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. 

Let’s pass the Paycheck Fairness Act and paid leave.  

Raise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. 

Let’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.
--------------------------------------------------------------------------------
```
## 最大边际相关性搜索（MMR）
最大边际相关性优化查询的相似性和所选文档之间的多样性。


```python
docs_with_score = db.max_marginal_relevance_search_with_score(query)
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
Score:  0.18440479
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.23515457
We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. 

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. 

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.24478757
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

Stationed near Baghdad, just yards from burn pits the size of football fields. 

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.25137997
And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.  

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming. 

But I want you to know that we are going to be okay. 

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger. 

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.
--------------------------------------------------------------------------------
```
## 使用向量存储

上面，我们从头创建了一个向量存储。然而，我们通常希望使用现有的向量存储。
为了做到这一点，我们可以直接初始化它。


```python
store = Lantern(
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
)
```

### 添加文档
我们可以将文档添加到现有的向量存储中。


```python
store.add_documents([Document(page_content="foo")])
```



```output
['f8164598-aa28-11ee-a037-acde48001122']
```



```python
docs_with_score = db.similarity_search_with_score("foo")
```


```python
docs_with_score[0]
```



```output
(Document(page_content='foo'), -1.1920929e-07)
```



```python
docs_with_score[1]
```



```output
(Document(page_content='And let’s pass the PRO Act when a majority of workers want to form a union—they shouldn’t be stopped.  \n\nWhen we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America. \n\nFor more than two years, COVID-19 has impacted every decision in our lives and the life of the nation. \n\nAnd I know you’re tired, frustrated, and exhausted. \n\nBut I also know this. \n\nBecause of the progress we’ve made, because of your resilience and the tools we have, tonight I can say  \nwe are moving forward safely, back to more normal routines.  \n\nWe’ve reached a new moment in the fight against COVID-19, with severe cases down to a level not seen since last July.  \n\nJust a few days ago, the Centers for Disease Control and Prevention—the CDC—issued new mask guidelines. \n\nUnder these new guidelines, most Americans in most of the country can now be mask free.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
 0.24038416)
```


### 重写向量存储

如果您有现有的集合，可以通过执行 `from_documents` 并设置 `pre_delete_collection` = True 来重写它。
这将删除集合然后重新填充它


```python
db = Lantern.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    pre_delete_collection=True,
)
```


```python
docs_with_score = db.similarity_search_with_score("foo")
```


```python
docs_with_score[0]
```



```output
(Document(page_content='And let’s pass the PRO Act when a majority of workers want to form a union—they shouldn’t be stopped.  \n\nWhen we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America. \n\nFor more than two years, COVID-19 has impacted every decision in our lives and the life of the nation. \n\nAnd I know you’re tired, frustrated, and exhausted. \n\nBut I also know this. \n\nBecause of the progress we’ve made, because of your resilience and the tools we have, tonight I can say  \nwe are moving forward safely, back to more normal routines.  \n\nWe’ve reached a new moment in the fight against COVID-19, with severe cases down to a level not seen since last July.  \n\nJust a few days ago, the Centers for Disease Control and Prevention—the CDC—issued new mask guidelines. \n\nUnder these new guidelines, most Americans in most of the country can now be mask free.', metadata={'source': '../../how_to/state_of_the_union.txt'}),
 0.2403456)
```


### 将向量存储用作检索器


```python
retriever = store.as_retriever()
```


```python
print(retriever)
```
```output
tags=['Lantern', 'OpenAIEmbeddings'] vectorstore=<langchain_community.vectorstores.lantern.Lantern object at 0x11d02f9d0>
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
