---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/clarifai.ipynb
---
# Clarifai

>[Clarifai](https://www.clarifai.com/) 是一个人工智能平台，提供完整的人工智能生命周期，包括数据探索、数据标注、模型训练、评估和推理。上传输入后，Clarifai 应用可以用作向量数据库。

本笔记本展示了如何使用与 `Clarifai` 向量数据库相关的功能。示例展示了文本语义搜索的能力。Clarifai 还支持图像、视频帧的语义搜索，以及本地化搜索（请参见 [Rank](https://docs.clarifai.com/api-guide/search/rank)）和属性搜索（请参见 [Filter](https://docs.clarifai.com/api-guide/search/filter)）。

要使用 Clarifai，您必须拥有一个账户和一个个人访问令牌 (PAT) 密钥。
[在这里检查](https://clarifai.com/settings/security) 获取或创建 PAT。

# 依赖项


```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai langchain-community
```

# 导入
在这里我们将设置个人访问令牌。您可以在平台的设置/安全中找到您的PAT。


```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```
```output
 ········
```

```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Clarifai"}, {"imported": "Clarifai", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.clarifai.Clarifai.html", "title": "Clarifai"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Clarifai"}]-->
# Import the required modules
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clarifai
from langchain_text_splitters import CharacterTextSplitter
```

# 设置
设置用户ID和应用ID，以便上传文本数据。注意：在创建该应用程序时，请选择适合索引您的文本文档的基础工作流程，例如语言理解工作流程。

您需要先在[Clarifai](https://clarifai.com/login)上创建一个帐户，然后创建一个应用程序。


```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 2
```

## 从文本
从文本列表创建一个Clarifai向量存储。此部分将每个文本及其相应的元数据上传到Clarifai应用程序。然后可以使用Clarifai应用程序进行语义搜索，以查找相关文本。


```python
texts = [
    "I really enjoy spending time with you",
    "I hate spending time with my dog",
    "I want to go for a run",
    "I went to the movies yesterday",
    "I love playing soccer with my friends",
]

metadatas = [
    {"id": i, "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

或者，您可以选择为输入提供自定义输入ID。


```python
idlist = ["text1", "text2", "text3", "text4", "text5"]
metadatas = [
    {"id": idlist[i], "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```


```python
# There is an option to initialize clarifai vector store with pat as argument!
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

将数据上传到Clarifai应用程序。


```python
# upload with metadata and custom input ids.
response = clarifai_vector_db.add_texts(texts=texts, ids=idlist, metadatas=metadatas)

# upload without metadata (Not recommended)- Since you will not be able to perform Search operation with respect to metadata.
# custom input_id (optional)
response = clarifai_vector_db.add_texts(texts=texts)
```

您可以创建一个Clarifai向量数据库存储，并通过以下方式直接将所有输入导入到您的应用程序中，


```python
clarifai_vector_db = Clarifai.from_texts(
    user_id=USER_ID,
    app_id=APP_ID,
    texts=texts,
    metadatas=metadatas,
)
```

使用相似性搜索功能搜索相似文本。


```python
docs = clarifai_vector_db.similarity_search("I would like to see you")
docs
```



```output
[Document(page_content='I really enjoy spending time with you', metadata={'text': 'I really enjoy spending time with you', 'id': 'text1', 'source': 'book 1', 'category': ['books', 'modern']})]
```


此外，您可以通过元数据过滤搜索结果。


```python
# There is lots powerful filtering you can do within an app by leveraging metadata filters.
# This one will limit the similarity query to only the texts that have key of "source" matching value of "book 1"
book1_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"source": "book 1"}
)

# you can also use lists in the input's metadata and then select things that match an item in the list. This is useful for categories like below:
book_category_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"category": ["books"]}
)
```

## 来自文档
从文档列表创建一个Clarifai向量存储。此部分将上传每个文档及其相应的元数据到Clarifai应用程序。然后可以使用Clarifai应用程序进行语义搜索，以查找相关文档。


```python
loader = TextLoader("your_local_file_path.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```


```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

创建一个Clarifai向量数据库类，并将所有文档导入Clarifai应用程序。


```python
clarifai_vector_db = Clarifai.from_documents(
    user_id=USER_ID,
    app_id=APP_ID,
    documents=docs,
    number_of_docs=NUMBER_OF_DOCS,
)
```


```python
docs = clarifai_vector_db.similarity_search("Texts related to population")
docs
```

## 来自现有应用
在Clarifai中，我们有很好的工具可以通过API或UI向应用程序（基本上是项目）添加数据。大多数用户在与LangChain交互之前已经完成了这一步，因此此示例将使用现有应用中的数据进行搜索。请查看我们的[API文档](https://docs.clarifai.com/api-guide/data/create-get-update-delete)和[UI文档](https://docs.clarifai.com/portal-guide/data)。然后可以使用Clarifai应用程序进行语义搜索，以查找相关文档。


```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```


```python
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```


```python
docs = clarifai_vector_db.similarity_search(
    "Texts related to ammuniction and president wilson"
)
```


```python
docs[0].page_content
```



```output
"President Wilson, generally acclaimed as the leader of the world's democracies,\nphrased for civilization the arguments against autocracy in the great peace conference\nafter the war. The President headed the American delegation to that conclave of world\nre-construction. With him as delegates to the conference were Robert Lansing, Secretary\nof State; Henry White, former Ambassador to France and Italy; Edward M. House and\nGeneral Tasker H. Bliss.\nRepresenting American Labor at the International Labor conference held in Paris\nsimultaneously with the Peace Conference were Samuel Gompers, president of the\nAmerican Federation of Labor; William Green, secretary-treasurer of the United Mine\nWorkers of America; John R. Alpine, president of the Plumbers' Union; James Duncan,\npresident of the International Association of Granite Cutters; Frank Duffy, president of\nthe United Brotherhood of Carpenters and Joiners, and Frank Morrison, secretary of the\nAmerican Federation of Labor.\nEstimating the share of each Allied nation in the great victory, mankind will\nconclude that the heaviest cost in proportion to prewar population and treasure was paid\nby the nations that first felt the shock of war, Belgium, Serbia, Poland and France. All\nfour were the battle-grounds of huge armies, oscillating in a bloody frenzy over once\nfertile fields and once prosperous towns.\nBelgium, with a population of 8,000,000, had a casualty list of more than 350,000;\nFrance, with its casualties of 4,000,000 out of a population (including its colonies) of\n90,000,000, is really the martyr nation of the world. Her gallant poilus showed the world\nhow cheerfully men may die in defense of home and liberty. Huge Russia, including\nhapless Poland, had a casualty list of 7,000,000 out of its entire population of\n180,000,000. The United States out of a population of 110,000,000 had a casualty list of\n236,117 for nineteen months of war; of these 53,169 were killed or died of disease;\n179,625 were wounded; and 3,323 prisoners or missing."
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
