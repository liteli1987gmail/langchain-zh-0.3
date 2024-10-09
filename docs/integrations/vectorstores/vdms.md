---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vdms.ipynb
---
# 英特尔的视觉数据管理系统 (VDMS)

> 英特尔的 [VDMS](https://github.com/IntelLabs/vdms) 是一个存储解决方案，旨在通过搜索存储为图形的视觉元数据来高效访问大规模“视觉”数据，并为视觉数据提供机器友好的增强，以实现更快的访问。VDMS 采用 MIT 许可证。

VDMS 支持：
* K 最近邻搜索
* 欧几里得距离 (L2) 和内积 (IP)
* 用于索引和计算距离的库：TileDBDense, TileDBSparse, FaissFlat (默认), FaissIVFFlat, Flinng
* 文本、图像和视频的嵌入
* 向量和元数据搜索

VDMS 具有服务器和客户端组件。要设置服务器，请参阅 [安装说明](https://github.com/IntelLabs/vdms/blob/master/INSTALL.md) 或使用 [docker 镜像](https://hub.docker.com/r/intellabs/vdms)。

本笔记本展示了如何使用 VDMS 作为向量存储，使用 docker 镜像。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成

首先，安装 VDMS 客户端和 Sentence Transformers 的 Python 包：


```python
# Pip install necessary package
%pip install --upgrade --quiet pip vdms sentence-transformers langchain-huggingface > /dev/null
```
```output
Note: you may need to restart the kernel to use updated packages.
```
## 启动 VDMS 服务器
在这里我们启动 VDMS 服务器，端口为 55555。


```python
!docker run --rm -d -p 55555:55555 --name vdms_vs_test_nb intellabs/vdms:latest
```
```output
b26917ffac236673ef1d035ab9c91fe999e29c9eb24aa6c7103d7baa6bf2f72d
```
## 基本示例（使用 Docker 容器）

在这个基本示例中，我们演示如何将文档添加到 VDMS 并将其用作向量数据库。

您可以单独在 Docker 容器中运行 VDMS 服务器，以便与 LangChain 一起使用，LangChain 通过 VDMS Python 客户端连接到服务器。

VDMS 能够处理多个文档集合，但 LangChain 接口期望只有一个，因此我们需要指定集合的名称。LangChain 使用的默认集合名称是 "langchain"。



```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders.text", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Intel's Visual Data Management System (VDMS)"}, {"imported": "VDMS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vdms.VDMS.html", "title": "Intel's Visual Data Management System (VDMS)"}, {"imported": "VDMS_Client", "source": "langchain_community.vectorstores.vdms", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vdms.VDMS_Client.html", "title": "Intel's Visual Data Management System (VDMS)"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Intel's Visual Data Management System (VDMS)"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters.character", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Intel's Visual Data Management System (VDMS)"}]-->
import time
import warnings

warnings.filterwarnings("ignore")

from langchain_community.document_loaders.text import TextLoader
from langchain_community.vectorstores import VDMS
from langchain_community.vectorstores.vdms import VDMS_Client
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters.character import CharacterTextSplitter

time.sleep(2)
DELIMITER = "-" * 50

# Connect to VDMS Vector Store
vdms_client = VDMS_Client(host="localhost", port=55555)
```

以下是一些用于打印结果的辅助函数。


```python
def print_document_details(doc):
    print(f"Content:\n\t{doc.page_content}\n")
    print("Metadata:")
    for key, value in doc.metadata.items():
        if value != "Missing property":
            print(f"\t{key}:\t{value}")


def print_results(similarity_results, score=True):
    print(f"{DELIMITER}\n")
    if score:
        for doc, score in similarity_results:
            print(f"Score:\t{score}\n")
            print_document_details(doc)
            print(f"{DELIMITER}\n")
    else:
        for doc in similarity_results:
            print_document_details(doc)
            print(f"{DELIMITER}\n")


def print_response(list_of_entities):
    for ent in list_of_entities:
        for key, value in ent.items():
            if value != "Missing property":
                print(f"\n{key}:\n\t{value}")
        print(f"{DELIMITER}\n")
```

### 加载文档并获取嵌入函数
在这里我们加载最近的国情咨文，并将文档分割成多个块。

LangChain 向量存储使用字符串/关键字 `id` 来管理文档。默认情况下，`id` 是一个 uuid，但在这里我们将其定义为一个转换为字符串的整数。文档还提供了额外的元数据，并且在这个示例中使用 HuggingFaceEmbeddings 作为嵌入函数。


```python
# load the document and split it into chunks
document_path = "../../how_to/state_of_the_union.txt"
raw_documents = TextLoader(document_path).load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(raw_documents)
ids = []
for doc_idx, doc in enumerate(docs):
    ids.append(str(doc_idx + 1))
    docs[doc_idx].metadata["id"] = str(doc_idx + 1)
    docs[doc_idx].metadata["page_number"] = int(doc_idx + 1)
    docs[doc_idx].metadata["president_included"] = (
        "president" in doc.page_content.lower()
    )
print(f"# Documents: {len(docs)}")


# create the open-source embedding function
model_name = "sentence-transformers/all-mpnet-base-v2"
embedding = HuggingFaceEmbeddings(model_name=model_name)
print(
    f"# Embedding Dimensions: {len(embedding.embed_query('This is a test document.'))}"
)
```
```output
# Documents: 42
# Embedding Dimensions: 768
```
### 使用 Faiss Flat 和欧几里得距离进行相似性搜索（默认）

在本节中，我们使用 FAISS IndexFlat 索引（默认）和欧几里得距离（默认）作为相似性搜索的距离度量，将文档添加到 VDMS。我们搜索与查询 `总统对 Ketanji Brown Jackson 说了什么` 相关的三份文档（`k=3`）。


```python
# add data
collection_name = "my_collection_faiss_L2"
db_FaissFlat = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name=collection_name,
    embedding=embedding,
)

# Query (No metadata filtering)
k = 3
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db_FaissFlat.similarity_search(query, k=k, filter=None)
print_results(returned_docs, score=False)
```
```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit. 

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children. 

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care. 

Third, support our veterans. 

Veterans are the best of us. 

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home. 

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```

```python
# Query (with filtering)
k = 3
constraints = {"page_number": [">", 30], "president_included": ["==", True]}
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db_FaissFlat.similarity_search(query, k=k, filter=constraints)
print_results(returned_docs, score=False)
```
```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Content:
	And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. 

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. 

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. 

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  

First, beat the opioid epidemic.

Metadata:
	id:	35
	page_number:	35
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Content:
	Last month, I announced our plan to supercharge  
the Cancer Moonshot that President Obama asked me to lead six years ago. 

Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  

More support for patients and families. 

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. 

It’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.  

ARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more. 

A unity agenda for the nation. 

We can do this. 

My fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. 

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. 

We have fought for freedom, expanded liberty, defeated totalitarianism and terror.

Metadata:
	id:	40
	page_number:	40
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 使用 Faiss IVFFlat 和内积（IP）距离进行相似性搜索

在本节中，我们使用 Faiss IndexIVFFlat 索引和内积作为相似性搜索的距离度量，将文档添加到 VDMS。我们搜索与查询 `总统对 Ketanji Brown Jackson 说了什么` 相关的三份文档（`k=3`），并返回文档及其分数。



```python
db_FaissIVFFlat = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_FaissIVFFlat_IP",
    embedding=embedding,
    engine="FaissIVFFlat",
    distance_strategy="IP",
)
# Query
k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_FaissIVFFlat.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```
```output
--------------------------------------------------

Score:	1.2032090425

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.4952471256

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit. 

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children. 

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care. 

Third, support our veterans. 

Veterans are the best of us. 

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home. 

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008399487

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 使用 FLINNG 和内积距离进行相似性搜索

在本节中，我们使用过滤器识别近邻组（FLINNG）索引和内积作为相似性搜索的距离度量，将文档添加到 VDMS。我们搜索与查询 `总统对 Ketanji Brown Jackson 说了什么` 相关的三份文档（`k=3`），并返回文档及其分数。


```python
db_Flinng = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_Flinng_IP",
    embedding=embedding,
    engine="Flinng",
    distance_strategy="IP",
)
# Query
k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_Flinng.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```
```output
--------------------------------------------------

Score:	1.2032090425

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.4952471256

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit. 

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children. 

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care. 

Third, support our veterans. 

Veterans are the best of us. 

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home. 

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008399487

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 使用 TileDBDense 和欧几里得距离进行相似性搜索

在本节中，我们使用 TileDB Dense 索引和 L2 作为相似性搜索的距离度量，将文档添加到 VDMS。我们搜索与查询 `总统对 Ketanji Brown Jackson 说了什么` 相关的三份文档（`k=3`），并返回文档及其分数。




```python
db_tiledbD = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_tiledbD_L2",
    embedding=embedding,
    engine="TileDBDense",
    distance_strategy="L2",
)

k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_tiledbD.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```
```output
--------------------------------------------------

Score:	1.2032090425

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.4952471256

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit. 

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children. 

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care. 

Third, support our veterans. 

Veterans are the best of us. 

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home. 

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008399487

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 更新和删除

在构建真实应用程序时，您希望超越添加数据，还要更新和删除数据。

这里是一个基本示例，展示如何做到这一点。首先，我们将通过添加日期来更新与查询最相关的文档的元数据。


```python
from datetime import datetime

doc = db_FaissFlat.similarity_search(query)[0]
print(f"Original metadata: \n\t{doc.metadata}")

# Update the metadata for a document by adding last datetime document read
datetime_str = datetime(2024, 5, 1, 14, 30, 0).isoformat()
doc.metadata["last_date_read"] = {"_date": datetime_str}
print(f"new metadata: \n\t{doc.metadata}")
print(f"{DELIMITER}\n")

# Update document in VDMS
id_to_update = doc.metadata["id"]
db_FaissFlat.update_document(collection_name, id_to_update, doc)
response, response_array = db_FaissFlat.get(
    collection_name,
    constraints={
        "id": ["==", id_to_update],
        "last_date_read": [">=", {"_date": "2024-05-01T00:00:00"}],
    },
)

# Display Results
print(f"UPDATED ENTRY (id={id_to_update}):")
print_response([response[0]["FindDescriptor"]["entities"][0]])
```
```output
Original metadata: 
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../how_to/state_of_the_union.txt'}
new metadata: 
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../how_to/state_of_the_union.txt', 'last_date_read': {'_date': '2024-05-01T14:30:00'}}
--------------------------------------------------

UPDATED ENTRY (id=32):

content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

id:
	32

last_date_read:
	2024-05-01T14:30:00+00:00

page_number:
	32

president_included:
	True

source:
	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
接下来，我们将通过ID（id=42）删除最后一个文档。


```python
print("Documents before deletion: ", db_FaissFlat.count(collection_name))

id_to_remove = ids[-1]
db_FaissFlat.delete(collection_name=collection_name, ids=[id_to_remove])
print(
    f"Documents after deletion (id={id_to_remove}): {db_FaissFlat.count(collection_name)}"
)
```
```output
Documents before deletion:  42
Documents after deletion (id=42): 41
```
## 其他信息
VDMS支持各种类型的视觉数据和操作。一些功能已集成在LangChain接口中，但随着VDMS的持续开发，将添加更多工作流程改进。

集成到LangChain中的其他功能如下。

### 通过向量进行相似性搜索
您还可以通过嵌入/向量进行搜索，而不是通过字符串查询。


```python
embedding_vector = embedding.embed_query(query)
returned_docs = db_FaissFlat.similarity_search_by_vector(embedding_vector)

# Print Results
print_document_details(returned_docs[0])
```
```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	last_date_read:	2024-05-01T14:30:00+00:00
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
```
### 基于元数据的过滤

在处理之前缩小集合范围可能会很有帮助。

例如，可以使用get方法根据元数据过滤集合。使用字典来过滤元数据。在这里，我们检索`id = 2`的文档并将其从向量存储中移除。


```python
response, response_array = db_FaissFlat.get(
    collection_name,
    limit=1,
    include=["metadata", "embeddings"],
    constraints={"id": ["==", "2"]},
)

# Delete id=2
db_FaissFlat.delete(collection_name=collection_name, ids=["2"])

print("Deleted entry:")
print_response([response[0]["FindDescriptor"]["entities"][0]])
```
```output
Deleted entry:

blob:
	True

content:
	Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. 

Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. 

Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. 

Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   

They keep moving.   

And the costs and the threats to America and the world keep rising.   

That’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. 

The United States is a member along with 29 other nations. 

It matters. American diplomacy matters. American resolve matters.

id:
	2

page_number:
	2

president_included:
	True

source:
	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 检索器选项

本节介绍如何将VDMS用作检索器的不同选项。


#### 相似性搜索

在这里，我们在检索器对象中使用相似性搜索。



```python
retriever = db_FaissFlat.as_retriever()
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```
```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	last_date_read:	2024-05-01T14:30:00+00:00
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
```
#### 最大边际相关性搜索 (MMR)

除了在检索器对象中使用相似性搜索外，您还可以使用`mmr`。


```python
retriever = db_FaissFlat.as_retriever(search_type="mmr")
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```
```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	last_date_read:	2024-05-01T14:30:00+00:00
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
```
我们也可以直接使用MMR。


```python
mmr_resp = db_FaissFlat.max_marginal_relevance_search_with_score(query, k=2, fetch_k=10)
print_results(mmr_resp)
```
```output
--------------------------------------------------

Score:	1.2032091618

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	last_date_read:	2024-05-01T14:30:00+00:00
	page_number:	32
	president_included:	True
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------

Score:	1.50705266

Content:
	But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. 

Danielle says Heath was a fighter to the very end. 

He didn’t know how to stop fighting, and neither did she. 

Through her pain she found purpose to demand we do better. 

Tonight, Danielle—we are. 

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits. 

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers. 

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve. 

And fourth, let’s end cancer as we know it. 

This is personal to me and Jill, to Kamala, and to so many of you. 

Cancer is the #2 cause of death in America–second only to heart disease.

Metadata:
	id:	39
	page_number:	39
	president_included:	False
	source:	../../how_to/state_of_the_union.txt
--------------------------------------------------
```
### 删除集合
之前，我们根据其`id`删除文档。在这里，由于未提供ID，因此所有文档都被删除。


```python
print("Documents before deletion: ", db_FaissFlat.count(collection_name))

db_FaissFlat.delete(collection_name=collection_name)

print("Documents after deletion: ", db_FaissFlat.count(collection_name))
```
```output
Documents before deletion:  40
Documents after deletion:  0
```
## 停止VDMS服务器


```python
!docker kill vdms_vs_test_nb
```
```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)
``````output
vdms_vs_test_nb
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
