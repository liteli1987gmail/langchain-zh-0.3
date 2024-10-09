---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/singlestoredb.ipynb
---
# SingleStoreDB
>[SingleStoreDB](https://singlestore.com/) 是一个强大、高性能的分布式 SQL 数据库解决方案，旨在在 [云](https://www.singlestore.com/cloud/) 和本地环境中表现出色。它拥有多功能的特性集，提供无缝的部署选项，同时提供无与伦比的性能。

SingleStoreDB 的一个突出特点是其对向量存储和操作的高级支持，使其成为需要复杂 AI 功能（如文本相似性匹配）应用程序的理想选择。通过内置的向量函数，如 [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) 和 [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html)，SingleStoreDB 使开发人员能够高效地实现复杂算法。

对于希望在 SingleStoreDB 中利用向量数据的开发人员，提供了全面的教程，指导他们了解 [处理向量数据](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html) 的复杂性。该教程深入探讨了 SingleStoreDB 中的向量存储，展示了其基于向量相似性进行搜索的能力。利用向量索引，可以以惊人的速度执行查询，从而快速检索相关数据。

此外，SingleStoreDB 的向量存储与 [基于 Lucene 的全文索引](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/) 无缝集成，使强大的文本相似性搜索成为可能。用户可以根据所选文档元数据对象的字段过滤搜索结果，从而提高查询精度。

SingleStoreDB 的独特之处在于其能够以多种方式结合向量和全文搜索，提供灵活性和多样性。无论是通过文本或向量相似性进行预过滤并选择最相关的数据，还是采用加权求和方法计算最终相似性得分，开发人员都有多种选择可供使用。

总之，SingleStoreDB 提供了一个全面的解决方案，用于管理和查询向量数据，为 AI 驱动的应用程序提供无与伦比的性能和灵活性。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成


```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```


```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
<!--IMPORTS:[{"imported": "SingleStoreDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.singlestoredb.SingleStoreDB.html", "title": "SingleStoreDB"}, {"imported": "DistanceStrategy", "source": "langchain_community.vectorstores.utils", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.utils.DistanceStrategy.html", "title": "SingleStoreDB"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "SingleStoreDB"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "SingleStoreDB"}]-->
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```


```python
# loading docs
# we will use some artificial data for this example
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own 
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

有几种方法可以与数据库建立[连接](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html)。您可以设置环境变量或将命名参数传递给`SingleStoreDB构造函数`。另外，您也可以将这些参数提供给`from_documents`和`from_texts`方法。


```python
# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)
```


```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # Find documents that correspond to the query
print(docs[0].page_content)
```

SingleStoreDB通过允许用户基于元数据字段进行预过滤来提升搜索能力。这一功能使开发人员和数据分析师能够微调查询，确保搜索结果精确符合他们的要求。通过使用特定的元数据属性过滤搜索结果，用户可以缩小查询范围，仅关注相关的数据子集。


```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # Find documents that correspond to the query and has category "snow"
print(docs[0].page_content)
```

通过利用[ANN向量索引](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/)，在SingleStore DB 8.5或更高版本中提升您的搜索效率。在创建向量存储对象时设置`use_vector_index=True`可以激活此功能。此外，如果您的向量在维度上与默认的OpenAI嵌入大小1536不同，请确保相应地指定`vector_size`参数。

SingleStoreDB提供了一系列多样化的搜索策略，每种策略都经过精心设计，以满足特定的用例和用户偏好。默认的`VECTOR_ONLY`策略利用向量操作，如`dot_product`或`euclidean_distance`，直接计算向量之间的相似性分数，而`TEXT_ONLY`则采用基于Lucene的全文搜索，特别适合以文本为中心的应用。对于寻求平衡方法的用户，`FILTER_BY_TEXT`首先基于文本相似性精炼结果，然后进行向量比较，而`FILTER_BY_VECTOR`则优先考虑向量相似性，在评估文本相似性之前过滤结果，以获得最佳匹配。值得注意的是，`FILTER_BY_TEXT`和`FILTER_BY_VECTOR`都需要全文索引才能操作。此外，`WEIGHTED_SUM`作为一种复杂的策略，通过加权向量和文本相似性来计算最终相似性分数，但仅使用dot_product距离计算，并且也需要全文索引。这些多功能策略使用户能够根据其独特需求微调搜索，促进高效和精确的数据检索与分析。此外，SingleStoreDB的混合方法，如`FILTER_BY_TEXT`、`FILTER_BY_VECTOR`和`WEIGHTED_SUM`策略，完美结合了向量和基于文本的搜索，以最大化效率和准确性，确保用户能够充分利用平台的能力，适用于广泛的应用。


```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # Use dot product for similarity search
    use_vector_index=True,  # Use vector index for faster search
    use_full_text_search=True,  # Use full text index
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## 多模态示例：利用CLIP和OpenClip嵌入

在多模态数据分析领域，整合图像和文本等多种信息类型变得越来越重要。一个促进这种整合的强大工具是[CLIP](https://openai.com/research/clip)，这是一个能够将图像和文本嵌入到共享语义空间的前沿模型。通过这样做，CLIP使得通过相似性搜索在不同模态中检索相关内容成为可能。

为了说明这一点，让我们考虑一个应用场景，我们旨在有效分析多模态数据。在这个例子中，我们利用[OpenClip多模态嵌入](/docs/integrations/text_embedding/open_clip)的能力，该能力利用了CLIP的框架。通过OpenClip，我们可以无缝地将文本描述与相应的图像嵌入在一起，从而实现全面的分析和检索任务。无论是根据文本查询识别视觉上相似的图像，还是找到与特定视觉内容相关的文本段落，OpenClip都使用户能够以显著的效率和准确性探索和提取多模态数据中的洞察。


```python
%pip install -U langchain openai singlestoredb langchain-experimental # (newest versions required for multi-modal)
```


```python
<!--IMPORTS:[{"imported": "SingleStoreDB", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.singlestoredb.SingleStoreDB.html", "title": "SingleStoreDB"}, {"imported": "OpenCLIPEmbeddings", "source": "langchain_experimental.open_clip", "docs": "https://python.langchain.com/api_reference/experimental/open_clip/langchain_experimental.open_clip.open_clip.OpenCLIPEmbeddings.html", "title": "SingleStoreDB"}]-->
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# Add images
docsearch.add_images(uris=image_uris)
```


## 相关

- 向量存储[概念指南](/docs/concepts/#vector-stores)
- 向量存储[操作指南](/docs/how_to/#vector-stores)
