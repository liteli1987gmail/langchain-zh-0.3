---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/activeloop_deeplake.ipynb
---
#  Activeloop Deep Lake

>[Activeloop Deep Lake](https://docs.activeloop.ai/) 作为一个多模态向量存储，存储嵌入及其元数据，包括文本、Json、图像、音频、视频等。它可以将数据保存在本地、云端或Activeloop存储中。它执行包括嵌入及其属性的混合搜索。

本笔记本展示了与 `Activeloop Deep Lake` 相关的基本功能。虽然 `Deep Lake` 可以存储嵌入，但它能够存储任何类型的数据。它是一个无服务器的数据湖，具有版本控制、查询引擎和流式数据加载器，支持深度学习框架。

有关更多信息，请参见 Deep Lake [文档](https://docs.activeloop.ai) 或 [API 参考](https://docs.deeplake.ai)

## 设置


```python
%pip install --upgrade --quiet  langchain-openai langchain-community 'deeplake[enterprise]' tiktoken
```

## Activeloop 提供的示例

[与 LangChain 的集成](https://docs.activeloop.ai/tutorials/vector-store/deep-lake-vector-store-in-langchain)。


## 本地 Deep Lake


```python
<!--IMPORTS:[{"imported": "DeepLake", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.deeplake.DeepLake.html", "title": "Activeloop Deep Lake"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Activeloop Deep Lake"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Activeloop Deep Lake"}]-->
from langchain_community.vectorstores import DeepLake
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
activeloop_token = getpass.getpass("activeloop token:")
embeddings = OpenAIEmbeddings()
```


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Activeloop Deep Lake"}]-->
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

### 创建本地数据集

在 `./deeplake/` 本地创建数据集，然后运行相似性搜索。Deeplake+LangChain 集成在底层使用 Deep Lake 数据集，因此 `dataset` 和 `vector store` 可以互换使用。要在您自己的云中或在 Deep Lake 存储中创建数据集，请 [相应调整路径](https://docs.activeloop.ai/storage-and-credentials/storage-options)。


```python
db = DeepLake(dataset_path="./my_deeplake/", embedding=embeddings, overwrite=True)
db.add_documents(docs)
# or shorter
# db = DeepLake.from_documents(docs, dataset_path="./my_deeplake/", embedding=embeddings, overwrite=True)
```

### 查询数据集


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```
```output
Dataset(path='./my_deeplake/', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  ------- 
 embedding  embedding  (42, 1536)  float32   None   
    id        text      (42, 1)      str     None   
 metadata     json      (42, 1)      str     None   
   text       text      (42, 1)      str     None
```
要禁用数据集摘要的持续打印，您可以在 VectorStore 初始化时指定 verbose=False。


```python
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
之后，您可以在不重新计算嵌入的情况下重新加载数据集。


```python
db = DeepLake(dataset_path="./my_deeplake/", embedding=embeddings, read_only=True)
docs = db.similarity_search(query)
```
```output
Deep Lake Dataset in ./my_deeplake/ already exists, loading from the storage
```
目前，Deep Lake 是单写入和多读取。设置 `read_only=True` 有助于避免获取写入锁。

### 检索问题/回答


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Activeloop Deep Lake"}]-->
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIChat

qa = RetrievalQA.from_chain_type(
    llm=OpenAIChat(model="gpt-3.5-turbo"),
    chain_type="stuff",
    retriever=db.as_retriever(),
)
```
```output
/home/ubuntu/langchain_activeloop/langchain/libs/langchain/langchain/llms/openai.py:786: UserWarning: You are trying to use a chat model. This way of initializing it is no longer supported. Instead, please use: `from langchain_openai import ChatOpenAI`
  warnings.warn(
```

```python
query = "What did the president say about Ketanji Brown Jackson"
qa.run(query)
```



```output
'The president said that Ketanji Brown Jackson is a former top litigator in private practice and a former federal public defender. She comes from a family of public school educators and police officers. She is a consensus builder and has received a broad range of support since being nominated.'
```


### 基于属性的元数据过滤

让我们创建另一个包含文档创建年份的向量存储。


```python
import random

for d in docs:
    d.metadata["year"] = random.randint(2012, 2014)

db = DeepLake.from_documents(
    docs, embeddings, dataset_path="./my_deeplake/", overwrite=True
)
```
```output
Dataset(path='./my_deeplake/', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape     dtype  compression
  -------    -------    -------   -------  ------- 
 embedding  embedding  (4, 1536)  float32   None   
    id        text      (4, 1)      str     None   
 metadata     json      (4, 1)      str     None   
   text       text      (4, 1)      str     None
```

```python
db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    filter={"metadata": {"year": 2013}},
)
```
```output
100%|██████████| 4/4 [00:00<00:00, 2936.16it/s]
```


```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013})]
```


### 选择距离函数
距离函数 `L2` 表示欧几里得距离，`L1` 表示核距离，`Max` 表示 l-infinity 距离，`cos` 表示余弦相似度，`dot` 表示点积


```python
db.similarity_search(
    "What did the president say about Ketanji Brown Jackson?", distance_metric="cos"
)
```



```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. \n\nAs I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. \n\nAnd soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. \n\nSo tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  \n\nFirst, beat the opioid epidemic.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2012})]
```


### 最大边际相关性
使用最大边际相关性


```python
db.max_marginal_relevance_search(
    "What did the president say about Ketanji Brown Jackson?"
)
```



```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. \n\nAs I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. \n\nAnd soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. \n\nSo tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  \n\nFirst, beat the opioid epidemic.', metadata={'source': '../../how_to/state_of_the_union.txt', 'year': 2012})]
```


### 删除数据集


```python
db.delete_dataset()
```

如果删除失败，您也可以强制删除


```python
DeepLake.force_delete_by_path("./my_deeplake")
```

## 云端的 Deep Lake 数据集 (Activeloop, AWS, GCS 等) 或内存中
默认情况下，Deep Lake 数据集存储在本地。要将它们存储在内存中、Deep Lake 管理的数据库中或任何对象存储中，您可以在创建向量存储时提供 [相应的路径和凭据](https://docs.activeloop.ai/storage-and-credentials/storage-options)。某些路径需要在 Activeloop 注册并创建可以 [在此处获取的 API 令牌](https://app.activeloop.ai/)


```python
os.environ["ACTIVELOOP_TOKEN"] = activeloop_token
```


```python
# Embed and store the texts
username = "<USERNAME_OR_ORG>"  # your username on app.activeloop.ai
dataset_path = f"hub://{username}/langchain_testing_python"  # could be also ./local/path (much faster locally), s3://bucket/path/to/dataset, gcs://path/to/dataset, etc.

docs = text_splitter.split_documents(documents)

embedding = OpenAIEmbeddings()
db = DeepLake(dataset_path=dataset_path, embedding=embeddings, overwrite=True)
ids = db.add_documents(docs)
```
```output
Your Deep Lake dataset has been successfully created!
``````output
Dataset(path='hub://adilkhan/langchain_testing_python', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  ------- 
 embedding  embedding  (42, 1536)  float32   None   
    id        text      (42, 1)      str     None   
 metadata     json      (42, 1)      str     None   
   text       text      (42, 1)      str     None
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
#### `tensor_db` 执行选项

为了利用 Deep Lake 的托管张量数据库，在创建向量存储时必须将运行时参数指定为 `{"tensor_db": True}`。此配置允许在托管张量数据库上执行查询，而不是在客户端执行。需要注意的是，此功能不适用于存储在本地或内存中的数据集。如果向量存储已经在托管张量数据库之外创建，可以按照规定的步骤将其转移到托管张量数据库。


```python
# Embed and store the texts
username = "<USERNAME_OR_ORG>"  # your username on app.activeloop.ai
dataset_path = f"hub://{username}/langchain_testing"

docs = text_splitter.split_documents(documents)

embedding = OpenAIEmbeddings()
db = DeepLake(
    dataset_path=dataset_path,
    embedding=embeddings,
    overwrite=True,
    runtime={"tensor_db": True},
)
ids = db.add_documents(docs)
```
```output
Your Deep Lake dataset has been successfully created!
``````output
|
``````output
Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  ------- 
 embedding  embedding  (42, 1536)  float32   None   
    id        text      (42, 1)      str     None   
 metadata     json      (42, 1)      str     None   
   text       text      (42, 1)      str     None
```
### TQL 搜索

此外，在 similarity_search 方法中也支持执行查询，可以使用 Deep Lake 的张量查询语言 (TQL) 指定查询。


```python
search_id = db.vectorstore.dataset.id[0].numpy()
```


```python
search_id[0]
```



```output
'8a6ff326-3a85-11ee-b840-13905694aaaf'
```



```python
docs = db.similarity_search(
    query=None,
    tql=f"SELECT * WHERE id == '{search_id[0]}'",
)
```


```python
db.vectorstore.summary()
```
```output
Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  ------- 
 embedding  embedding  (42, 1536)  float32   None   
    id        text      (42, 1)      str     None   
 metadata     json      (42, 1)      str     None   
   text       text      (42, 1)      str     None
```
### 在 AWS S3 上创建向量存储


```python
dataset_path = "s3://BUCKET/langchain_test"  # could be also ./local/path (much faster locally), hub://bucket/path/to/dataset, gcs://path/to/dataset, etc.

embedding = OpenAIEmbeddings()
db = DeepLake.from_documents(
    docs,
    dataset_path=dataset_path,
    embedding=embeddings,
    overwrite=True,
    creds={
        "aws_access_key_id": os.environ["AWS_ACCESS_KEY_ID"],
        "aws_secret_access_key": os.environ["AWS_SECRET_ACCESS_KEY"],
        "aws_session_token": os.environ["AWS_SESSION_TOKEN"],  # Optional
    },
)
```
```output
s3://hub-2.0-datasets-n/langchain_test loaded successfully.
``````output
Evaluating ingest: 100%|██████████| 1/1 [00:10<00:00
\
``````output
Dataset(path='s3://hub-2.0-datasets-n/langchain_test', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  ------- 
 embedding  generic  (4, 1536)  float32   None   
    ids      text     (4, 1)      str     None   
 metadata    json     (4, 1)      str     None   
   text      text     (4, 1)      str     None
```
## Deep Lake API
您可以在 `db.vectorstore` 访问 Deep Lake 数据集


```python
# get structure of the dataset
db.vectorstore.summary()
```
```output
Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  ------- 
 embedding  embedding  (42, 1536)  float32   None   
    id        text      (42, 1)      str     None   
 metadata     json      (42, 1)      str     None   
   text       text      (42, 1)      str     None
```

```python
# get embeddings numpy array
embeds = db.vectorstore.dataset.embedding.numpy()
```

### 将本地数据集转移到云
将已创建的数据集复制到云。您也可以从云转移到本地。


```python
import deeplake

username = "davitbun"  # your username on app.activeloop.ai
source = f"hub://{username}/langchain_testing"  # could be local, s3, gcs, etc.
destination = f"hub://{username}/langchain_test_copy"  # could be local, s3, gcs, etc.

deeplake.deepcopy(src=source, dest=destination, overwrite=True)
```
```output
Copying dataset: 100%|██████████| 56/56 [00:38<00:00
``````output
This dataset can be visualized in Jupyter Notebook by ds.visualize() or at https://app.activeloop.ai/davitbun/langchain_test_copy
Your Deep Lake dataset has been successfully created!
The dataset is private so make sure you are logged in!
```


```output
Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])
```



```python
db = DeepLake(dataset_path=destination, embedding=embeddings)
db.add_documents(docs)
```
```output
This dataset can be visualized in Jupyter Notebook by ds.visualize() or at https://app.activeloop.ai/davitbun/langchain_test_copy
``````output
/
``````output
hub://davitbun/langchain_test_copy loaded successfully.
``````output
Deep Lake Dataset in hub://davitbun/langchain_test_copy already exists, loading from the storage
``````output
Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  ------- 
 embedding  generic  (4, 1536)  float32   None   
    ids      text     (4, 1)      str     None   
 metadata    json     (4, 1)      str     None   
   text      text     (4, 1)      str     None
``````output
Evaluating ingest: 100%|██████████| 1/1 [00:31<00:00
-
``````output
Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  ------- 
 embedding  generic  (8, 1536)  float32   None   
    ids      text     (8, 1)      str     None   
 metadata    json     (8, 1)      str     None   
   text      text     (8, 1)      str     None
```


```output
['ad42f3fe-e188-11ed-b66d-41c5f7b85421',
 'ad42f3ff-e188-11ed-b66d-41c5f7b85421',
 'ad42f400-e188-11ed-b66d-41c5f7b85421',
 'ad42f401-e188-11ed-b66d-41c5f7b85421']
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
