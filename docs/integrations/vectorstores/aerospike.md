---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/aerospike.ipynb
---
# Aerospike

[Aerospike 向量搜索](https://aerospike.com/docs/vector) (AVS) 是一个
扩展到 Aerospike 数据库的功能，能够在存储在 Aerospike 中的非常大
数据集上进行搜索。这个新服务位于 Aerospike 之外，并且
构建一个索引来执行这些搜索。

这个笔记本展示了 LangChain Aerospike VectorStore 的
集成功能。

## 安装 AVS

在使用这个笔记本之前，我们需要有一个运行中的 AVS 实例。使用其中一个
[可用的安装方法](https://aerospike.com/docs/vector/install)。

完成后，存储您的 AVS 实例的 IP 地址和端口以便后续使用
在此演示中:


```python
PROXIMUS_HOST = "<avs-ip>"
PROXIMUS_PORT = 5000
```

## 安装依赖
依赖项 `sentence-transformers` 较大。此步骤可能需要几分钟才能完成。


```python
!pip install --upgrade --quiet aerospike-vector-search==0.6.1 langchain-community sentence-transformers langchain
```

## 下载引用数据集

我们将下载一个大约包含100,000条引用的数据集，并使用其中的一部分进行语义搜索。


```python
!wget https://github.com/aerospike/aerospike-vector-search-examples/raw/7dfab0fccca0852a511c6803aba46578729694b5/quote-semantic-search/container-volumes/quote-search/data/quotes.csv.tgz
```
```output
--2024-05-10 17:28:17--  https://github.com/aerospike/aerospike-vector-search-examples/raw/7dfab0fccca0852a511c6803aba46578729694b5/quote-semantic-search/container-volumes/quote-search/data/quotes.csv.tgz
Resolving github.com (github.com)... 140.82.116.4
Connecting to github.com (github.com)|140.82.116.4|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://raw.githubusercontent.com/aerospike/aerospike-vector-search-examples/7dfab0fccca0852a511c6803aba46578729694b5/quote-semantic-search/container-volumes/quote-search/data/quotes.csv.tgz [following]
--2024-05-10 17:28:17--  https://raw.githubusercontent.com/aerospike/aerospike-vector-search-examples/7dfab0fccca0852a511c6803aba46578729694b5/quote-semantic-search/container-volumes/quote-search/data/quotes.csv.tgz
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.110.133, 185.199.109.133, 185.199.111.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 11597643 (11M) [application/octet-stream]
Saving to: ‘quotes.csv.tgz’

quotes.csv.tgz      100%[===================>]  11.06M  1.94MB/s    in 6.1s    

2024-05-10 17:28:23 (1.81 MB/s) - ‘quotes.csv.tgz’ saved [11597643/11597643]
```
## 将引用加载到文档中

我们将使用 `CSVLoader` 文档加载器加载我们的引用数据集。在这种情况下，`lazy_load` 返回一个迭代器，以更高效地获取我们的引用。在这个例子中，我们只加载5,000条引用。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders.csv_loader", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Aerospike"}]-->
import itertools
import os
import tarfile

from langchain_community.document_loaders.csv_loader import CSVLoader

filename = "./quotes.csv"

if not os.path.exists(filename) and os.path.exists(filename + ".tgz"):
    # Untar the file
    with tarfile.open(filename + ".tgz", "r:gz") as tar:
        tar.extractall(path=os.path.dirname(filename))

NUM_QUOTES = 5000
documents = CSVLoader(filename, metadata_columns=["author", "category"]).lazy_load()
documents = list(
    itertools.islice(documents, NUM_QUOTES)
)  # Allows us to slice an iterator
```


```python
print(documents[0])
```
```output
page_content="quote: I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best." metadata={'source': './quotes.csv', 'row': 0, 'author': 'Marilyn Monroe', 'category': 'attributed-no-source, best, life, love, mistakes, out-of-control, truth, worst'}
```
## 创建嵌入器

在这一步中，我们使用 HuggingFaceEmbeddings 和 "all-MiniLM-L6-v2" 句子转换模型来嵌入我们的文档，以便我们可以执行向量搜索。


```python
<!--IMPORTS:[{"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Aerospike"}]-->
from aerospike_vector_search.types import VectorDistanceMetric
from langchain_community.embeddings import HuggingFaceEmbeddings

MODEL_DIM = 384
MODEL_DISTANCE_CALC = VectorDistanceMetric.COSINE
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
```

```output
modules.json:   0%|          | 0.00/349 [00:00<?, ?B/s]
```

```output
config_sentence_transformers.json:   0%|          | 0.00/116 [00:00<?, ?B/s]
```

```output
README.md:   0%|          | 0.00/10.7k [00:00<?, ?B/s]
```

```output
sentence_bert_config.json:   0%|          | 0.00/53.0 [00:00<?, ?B/s]
```
```output
/opt/conda/lib/python3.11/site-packages/huggingface_hub/file_download.py:1132: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`.
  warnings.warn(
```
```output
config.json:   0%|          | 0.00/612 [00:00<?, ?B/s]
```
```output
/opt/conda/lib/python3.11/site-packages/huggingface_hub/file_download.py:1132: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`.
  warnings.warn(
```
```output
model.safetensors:   0%|          | 0.00/90.9M [00:00<?, ?B/s]
```

```output
tokenizer_config.json:   0%|          | 0.00/350 [00:00<?, ?B/s]
```

```output
vocab.txt:   0%|          | 0.00/232k [00:00<?, ?B/s]
```

```output
tokenizer.json:   0%|          | 0.00/466k [00:00<?, ?B/s]
```

```output
special_tokens_map.json:   0%|          | 0.00/112 [00:00<?, ?B/s]
```

```output
1_Pooling/config.json:   0%|          | 0.00/190 [00:00<?, ?B/s]
```

## 创建 Aerospike 索引并嵌入文档

在添加文档之前，我们需要在 Aerospike 数据库中创建一个索引。在下面的示例中，我们使用一些便利代码来检查预期的索引是否已经存在。


```python
<!--IMPORTS:[{"imported": "Aerospike", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.aerospike.Aerospike.html", "title": "Aerospike"}]-->
from aerospike_vector_search import AdminClient, Client, HostPort
from aerospike_vector_search.types import VectorDistanceMetric
from langchain_community.vectorstores import Aerospike

# Here we are using the AVS host and port you configured earlier
seed = HostPort(host=PROXIMUS_HOST, port=PROXIMUS_PORT)

# The namespace of where to place our vectors. This should match the vector configured in your docstore.conf file.
NAMESPACE = "test"

# The name of our new index.
INDEX_NAME = "quote-miniLM-L6-v2"

# AVS needs to know which metadata key contains our vector when creating the index and inserting documents.
VECTOR_KEY = "vector"

client = Client(seeds=seed)
admin_client = AdminClient(
    seeds=seed,
)
index_exists = False

# Check if the index already exists. If not, create it
for index in admin_client.index_list():
    if index["id"]["namespace"] == NAMESPACE and index["id"]["name"] == INDEX_NAME:
        index_exists = True
        print(f"{INDEX_NAME} already exists. Skipping creation")
        break

if not index_exists:
    print(f"{INDEX_NAME} does not exist. Creating index")
    admin_client.index_create(
        namespace=NAMESPACE,
        name=INDEX_NAME,
        vector_field=VECTOR_KEY,
        vector_distance_metric=MODEL_DISTANCE_CALC,
        dimensions=MODEL_DIM,
        index_meta_data={
            "model": "miniLM-L6-v2",
            "date": "05/04/2024",
            "dim": str(MODEL_DIM),
            "distance": "cosine",
        },
    )

admin_client.close()

docstore = Aerospike.from_documents(
    documents,
    embedder,
    client=client,
    namespace=NAMESPACE,
    vector_key=VECTOR_KEY,
    index_name=INDEX_NAME,
    distance_strategy=MODEL_DISTANCE_CALC,
)
```
```output
quote-miniLM-L6-v2 does not exist. Creating index
```
## 搜索文档
现在我们已经嵌入了我们的向量，我们可以在我们的引用上使用向量搜索。


```python
query = "A quote about the beauty of the cosmos"
docs = docstore.similarity_search(
    query, k=5, index_name=INDEX_NAME, metadata_keys=["_id", "author"]
)


def print_documents(docs):
    for i, doc in enumerate(docs):
        print("~~~~ Document", i, "~~~~")
        print("auto-generated id:", doc.metadata["_id"])
        print("author: ", doc.metadata["author"])
        print(doc.page_content)
        print("~~~~~~~~~~~~~~~~~~~~\n")


print_documents(docs)
```
```output
~~~~ Document 0 ~~~~
auto-generated id: f53589dd-e3e0-4f55-8214-766ca8dc082f
author:  Carl Sagan, Cosmos
quote: The Cosmos is all that is or was or ever will be. Our feeblest contemplations of the Cosmos stir us -- there is a tingling in the spine, a catch in the voice, a faint sensation, as if a distant memory, of falling from a height. We know we are approaching the greatest of mysteries.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 1 ~~~~
auto-generated id: dde3e5d1-30b7-47b4-aab7-e319d14e1810
author:  Elizabeth Gilbert
quote: The love that moves the sun and the other stars.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 2 ~~~~
auto-generated id: fd56575b-2091-45e7-91c1-9efff2fe5359
author:  Renee Ahdieh, The Rose & the Dagger
quote: From the stars, to the stars.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 3 ~~~~
auto-generated id: 8567ed4e-885b-44a7-b993-e0caf422b3c9
author:  Dante Alighieri, Paradiso
quote: Love, that moves the sun and the other stars
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 4 ~~~~
auto-generated id: f868c25e-c54d-48cd-a5a8-14bf402f9ea8
author:  Thich Nhat Hanh, Teachings on Love
quote: Through my love for you, I want to express my love for the whole cosmos, the whole of humanity, and all beings. By living with you, I want to learn to love everyone and all species. If I succeed in loving you, I will be able to love everyone and all species on Earth... This is the real message of love.
~~~~~~~~~~~~~~~~~~~~
```
## 将额外的引用作为文本嵌入

我们可以使用 `add_texts` 来添加额外的引用。


```python
docstore = Aerospike(
    client,
    embedder,
    NAMESPACE,
    index_name=INDEX_NAME,
    vector_key=VECTOR_KEY,
    distance_strategy=MODEL_DISTANCE_CALC,
)

ids = docstore.add_texts(
    [
        "quote: Rebellions are built on hope.",
        "quote: Logic is the beginning of wisdom, not the end.",
        "quote: If wishes were fishes, we’d all cast nets.",
    ],
    metadatas=[
        {"author": "Jyn Erso, Rogue One"},
        {"author": "Spock, Star Trek"},
        {"author": "Frank Herbert, Dune"},
    ],
)

print("New IDs")
print(ids)
```
```output
New IDs
['972846bd-87ae-493b-8ba3-a3d023c03948', '8171122e-cbda-4eb7-a711-6625b120893b', '53b54409-ac19-4d90-b518-d7c40bf5ee5d']
```
## 使用最大边际相关性搜索文档

我们可以使用最大边际相关性搜索来找到与我们的查询相似但彼此不同的向量。在这个例子中，我们使用 `as_retriever` 创建一个检索器对象，但这也可以通过直接调用 `docstore.max_marginal_relevance_search` 来轻松完成。`lambda_mult` 搜索参数决定了我们查询响应的多样性。0 对应于最大多样性，1 对应于最小多样性。


```python
query = "A quote about our favorite four-legged pets"
retriever = docstore.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "lambda_mult": 0.7}
)
matched_docs = retriever.invoke(query)

print_documents(matched_docs)
```
```output
~~~~ Document 0 ~~~~
auto-generated id: 67d5b23f-b2d2-4872-80ad-5834ea08aa64
author:  John Grogan, Marley and Me: Life and Love With the World's Worst Dog
quote: Such short little lives our pets have to spend with us, and they spend most of it waiting for us to come home each day. It is amazing how much love and laughter they bring into our lives and even how much closer we become with each other because of them.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 1 ~~~~
auto-generated id: a9b28eb0-a21c-45bf-9e60-ab2b80e988d8
author:  John Grogan, Marley and Me: Life and Love With the World's Worst Dog
quote: Dogs are great. Bad dogs, if you can really call them that, are perhaps the greatest of them all.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 2 ~~~~
auto-generated id: ee7434c8-2551-4651-8a22-58514980fb4a
author:  Colleen Houck, Tiger's Curse
quote: He then put both hands on the door on either side of my head and leaned in close, pinning me against it. I trembled like a downy rabbit caught in the clutches of a wolf. The wolf came closer. He bent his head and began nuzzling my cheek. The problem was…I wanted the wolf to devour me.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 3 ~~~~
auto-generated id: 9170804c-a155-473b-ab93-8a561dd48f91
author:  Ray Bradbury
quote: Stuff your eyes with wonder," he said, "live as if you'd drop dead in ten seconds. See the world. It's more fantastic than any dream made or paid for in factories. Ask no guarantees, ask for no security, there never was such an animal. And if there were, it would be related to the great sloth which hangs upside down in a tree all day every day, sleeping its life away. To hell with that," he said, "shake the tree and knock the great sloth down on his ass.
~~~~~~~~~~~~~~~~~~~~
```
## 使用相关性阈值搜索文档

另一个有用的功能是带有相关性阈值的相似性搜索。通常，我们只希望结果与我们的查询最相似，但也在某个接近范围内。相关性为 1 是最相似的，相关性为 0 是最不相似的。


```python
query = "A quote about stormy weather"
retriever = docstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={
        "score_threshold": 0.4
    },  # A greater value returns items with more relevance
)
matched_docs = retriever.invoke(query)

print_documents(matched_docs)
```
```output
~~~~ Document 0 ~~~~
auto-generated id: 2c1d6ee1-b742-45ea-bed6-24a1f655c849
author:  Roy T. Bennett, The Light in the Heart
quote: Never lose hope. Storms make people stronger and never last forever.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 1 ~~~~
auto-generated id: 5962c2cf-ffb5-4e03-9257-bdd630b5c7e9
author:  Roy T. Bennett, The Light in the Heart
quote: Difficulties and adversities viciously force all their might on us and cause us to fall apart, but they are necessary elements of individual growth and reveal our true potential. We have got to endure and overcome them, and move forward. Never lose hope. Storms make people stronger and never last forever.
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 2 ~~~~
auto-generated id: 3bbcc4ca-de89-4196-9a46-190a50bf6c47
author:  Vincent van Gogh, The Letters of Vincent van Gogh
quote: There is peace even in the storm
~~~~~~~~~~~~~~~~~~~~

~~~~ Document 3 ~~~~
auto-generated id: 37d8cf02-fc2f-429d-b2b6-260a05286108
author:  Edwin Morgan, A Book of Lives
quote: Valentine WeatherKiss me with rain on your eyelashes,come on, let us sway together,under the trees, and to hell with thunder.
~~~~~~~~~~~~~~~~~~~~
```
## 清理

我们需要确保关闭我们的客户端以释放资源并清理线程。


```python
client.close()
```

## 准备好。开始搜索！

现在您已经熟悉了Aerospike向量搜索与LangChain的集成，您可以随时使用Aerospike数据库和LangChain生态系统。祝您构建愉快！


## 相关内容

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
