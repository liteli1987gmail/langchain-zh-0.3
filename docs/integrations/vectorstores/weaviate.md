---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/weaviate.ipynb
sidebar_label: Weaviate
---
# Weaviate

本笔记本介绍如何在LangChain中使用`langchain-weaviate`包开始使用Weaviate向量存储。

> [Weaviate](https://weaviate.io/) 是一个开源向量数据库。它允许您存储数据对象和来自您喜欢的机器学习模型的向量嵌入，并无缝扩展到数十亿个数据对象。

要使用此集成，您需要有一个正在运行的Weaviate数据库实例。

## 最低版本

此模块要求Weaviate `1.23.7`或更高版本。但是，我们建议您使用最新版本的Weaviate。

## 连接到Weaviate

在本笔记本中，我们假设您在`http://localhost:8080`上运行了一个本地的Weaviate实例，并且50051端口已开放以进行[gRPC流量](https://weaviate.io/blog/grpc-performance-improvements)。因此，我们将通过以下方式连接到Weaviate：

```python
weaviate_client = weaviate.connect_to_local()
```

### 其他部署选项

Weaviate 可以通过多种方式进行[部署](https://weaviate.io/developers/weaviate/starter-guides/which-weaviate)，例如使用[Weaviate Cloud Services (WCS)](https://console.weaviate.cloud)、[Docker](https://weaviate.io/developers/weaviate/installation/docker-compose)或[Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes)。

如果您的 Weaviate 实例以其他方式部署，[在这里阅读更多信息](https://weaviate.io/developers/weaviate/client-libraries/python#instantiate-a-client)关于连接到 Weaviate 的不同方式。您可以使用不同的[辅助函数](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-helper-functions)或[创建自定义实例](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection)。

> 请注意，您需要一个 `v4` 客户端 API，这将创建一个 `weaviate.WeaviateClient` 对象。

### 认证

一些 Weaviate 实例，例如运行在 WCS 上的实例，启用了认证，例如 API 密钥和/或用户名+密码认证。

阅读[客户端认证指南](https://weaviate.io/developers/weaviate/client-libraries/python#authentication)以获取更多信息，以及[深入的认证配置页面](https://weaviate.io/developers/weaviate/configuration/authentication)。

## 安装


```python
# install package
# %pip install -Uqq langchain-weaviate
# %pip install openai tiktoken langchain
```

## 环境设置

此笔记本通过 `OpenAIEmbeddings` 使用 OpenAI API。我们建议获取一个 OpenAI API 密钥并将其导出为名为 `OPENAI_API_KEY` 的环境变量。

完成后，您的 OpenAI API 密钥将被自动读取。如果您对环境变量不熟悉，可以在 [这里](https://docs.python.org/3/library/os.html#os.environ) 或 [本指南](https://www.twilio.com/en-us/blog/environment-variables-python) 中了解更多信息。

# 用法

## 按相似性查找对象

以下是如何根据查询查找与之相似的对象的示例，从数据导入到查询 Weaviate 实例。

### 步骤 1：数据导入

首先，我们将通过加载和分块长文本文件的内容来创建要添加到 `Weaviate` 的数据。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Weaviate"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Weaviate"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Weaviate"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.embeddings.openai.OpenAIEmbeddings` was deprecated in langchain-community 0.1.0 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAIEmbeddings`.
  warn_deprecated(
```
现在，我们可以导入数据。

为此，连接到 Weaviate 实例并使用生成的 `weaviate_client` 对象。例如，我们可以按如下所示导入文档：


```python
import weaviate
from langchain_weaviate.vectorstores import WeaviateVectorStore
```


```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```
### 步骤 2：执行搜索

现在我们可以执行相似性搜索。这将返回与查询文本最相似的文档，基于存储在 Weaviate 中的嵌入和从查询文本生成的等效嵌入。


```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# Print the first 100 characters of each result
for i, doc in enumerate(docs):
    print(f"\nDocument {i+1}:")
    print(doc.page_content[:100] + "...")
```
```output

Document 1:
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...

Document 2:
And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of ...

Document 3:
Vice President Harris and I ran for office with a new economic vision for America. 

Invest in Ameri...

Document 4:
A former top litigator in private practice. A former federal public defender. And from a family of p...
```
您还可以添加过滤器，这将根据过滤条件包含或排除结果。（请参见[更多过滤示例](https://weaviate.io/developers/weaviate/search/filters)）


```python
from weaviate.classes.query import Filter

for filter_str in ["blah.txt", "state_of_the_union.txt"]:
    search_filter = Filter.by_property("source").equal(filter_str)
    filtered_search_results = db.similarity_search(query, filters=search_filter)
    print(len(filtered_search_results))
    if filter_str == "state_of_the_union.txt":
        assert len(filtered_search_results) > 0  # There should be at least one result
    else:
        assert len(filtered_search_results) == 0  # There should be no results
```
```output
0
4
```
还可以提供 `k`，这是返回结果的上限。


```python
search_filter = Filter.by_property("source").equal("state_of_the_union.txt")
filtered_search_results = db.similarity_search(query, filters=search_filter, k=3)
assert len(filtered_search_results) <= 3
```

### 量化结果相似性

您可以选择性地检索相关性“分数”。这是一个相对分数，表示特定搜索结果在搜索结果池中的质量。

请注意，这是相对分数，这意味着它不应被用于确定相关性的阈值。然而，它可以用于比较整个搜索结果集中不同搜索结果的相关性。


```python
docs = db.similarity_search_with_score("country", k=5)

for doc in docs:
    print(f"{doc[1]:.3f}", ":", doc[0].page_content[:100] + "...")
```
```output
0.935 : For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to prot...
0.500 : And built the strongest, freest, and most prosperous nation the world has ever known. 

Now is the h...
0.462 : If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land. 

It won’t loo...
0.450 : And my report is this: the State of the Union is strong—because you, the American people, are strong...
0.442 : Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...
```
## 搜索机制

`similarity_search` 使用 Weaviate 的 [混合搜索](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid)。

混合搜索结合了向量搜索和关键词搜索，`alpha` 是向量搜索的权重。`similarity_search` 函数允许您将额外的参数作为关键字参数传递。有关可用参数，请参见此 [参考文档](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid)。

因此，您可以通过添加 `alpha=0` 来执行纯关键词搜索，如下所示：


```python
docs = db.similarity_search(query, alpha=0)
docs[0]
```



```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```


## 持久性

通过 `langchain-weaviate` 添加的任何数据将根据其配置在 Weaviate 中持久化。

例如，WCS 实例被配置为无限期持久化数据，而 Docker 实例可以设置为在卷中持久化数据。有关 [Weaviate 的持久化](https://weaviate.io/developers/weaviate/configuration/persistence) 的更多信息。

## 多租户

[多租户](https://weaviate.io/developers/weaviate/concepts/data#multi-tenancy) 允许您在单个 Weaviate 实例中拥有大量隔离的数据集合，且具有相同的集合配置。这对于多用户环境（例如构建 SaaS 应用程序）非常有用，其中每个最终用户将拥有自己的隔离数据集合。

要使用多租户，向量存储需要了解 `tenant` 参数。

因此，在添加任何数据时，请提供如下所示的 `tenant` 参数。


```python
db_with_mt = WeaviateVectorStore.from_documents(
    docs, embeddings, client=weaviate_client, tenant="Foo"
)
```
```output
2024-Mar-26 03:40 PM - langchain_weaviate.vectorstores - INFO - Tenant Foo does not exist in index LangChain_30b9273d43b3492db4fb2aba2e0d6871. Creating tenant.
```
在执行查询时，也请提供 `tenant` 参数。


```python
db_with_mt.similarity_search(query, tenant="Foo")
```



```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. \n\nThat’s why one of the first things I did as President was fight to pass the American Rescue Plan.  \n\nBecause people were hurting. We needed to act, and we did. \n\nFew pieces of legislation have done more in a critical moment in our history to lift us out of crisis. \n\nIt fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  \n\nHelped put food on their table, keep a roof over their heads, and cut the cost of health insurance. \n\nAnd as my Dad used to say, it gave people a little breathing room.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  \n\nBut drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. \n\nImagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  \n\nWhat it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be. \n\nJoshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  \n\nFor Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  \n\nDrug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': 'state_of_the_union.txt'})]
```


## 检索器选项

Weaviate 也可以用作检索器

### 最大边际相关性搜索 (MMR)

除了在检索器对象中使用相似性搜索，你还可以使用 `mmr`。


```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)[0]
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```


```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```


# 与 LangChain 一起使用

大型语言模型 (LLMs) 的一个已知限制是它们的训练数据可能过时，或者不包含你所需的特定领域知识。

请看下面的示例：


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Weaviate"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
llm.predict("What did the president say about Justice Breyer")
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.chat_models.openai.ChatOpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import ChatOpenAI`.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `predict` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```


```output
"I'm sorry, I cannot provide real-time information as my responses are generated based on a mixture of licensed data, data created by human trainers, and publicly available data. The last update was in October 2021."
```


向量存储通过提供存储和检索相关信息的方式来补充 LLMs。这使你能够结合 LLMs 和向量存储的优势，利用 LLM 的推理和语言能力与向量存储检索相关信息的能力。

结合 LLMs 和向量存储的两个知名应用是：
- 问答
- 检索增强生成 (RAG)

### 带来源的问答

在 LangChain 中，问答可以通过使用向量存储来增强。让我们看看如何实现这一点。

本节使用 `RetrievalQAWithSourcesChain`，该链从索引中查找文档。

首先，我们将文本再次分块并导入到 Weaviate 向量存储中。


```python
<!--IMPORTS:[{"imported": "RetrievalQAWithSourcesChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain.html", "title": "Weaviate"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Weaviate"}]-->
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import OpenAI
```


```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```


```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)
```

现在我们可以构建链，并指定检索器：


```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.llms.openai.OpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAI`.
  warn_deprecated(
```
并运行链，以提出问题：


```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```


```output
{'answer': ' The president thanked Justice Stephen Breyer for his service and announced his nomination of Judge Ketanji Brown Jackson to the Supreme Court.\n',
 'sources': '31-pl'}
```


### 检索增强生成

将大型语言模型（LLMs）与向量存储结合的另一个非常流行的应用是检索增强生成（RAG）。这是一种使用检索器从向量存储中查找相关信息，然后使用大型语言模型根据检索到的数据和提示提供输出的技术。

我们从类似的设置开始：


```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```


```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)

retriever = docsearch.as_retriever()
```

我们需要为 RAG 模型构建一个模板，以便检索到的信息将填充到模板中。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Weaviate"}]-->
from langchain_core.prompts import ChatPromptTemplate

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

print(prompt)
```
```output
input_variables=['context', 'question'] messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question}\nContext: {context}\nAnswer:\n"))]
```

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Weaviate"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

运行单元后，我们得到了非常相似的输出。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Weaviate"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "Weaviate"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What did the president say about Justice Breyer")
```
```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```


```output
"The president honored Justice Stephen Breyer for his service to the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. The president also mentioned nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to continue Justice Breyer's legacy of excellence. The president expressed gratitude towards Justice Breyer and highlighted the importance of nominating someone to serve on the United States Supreme Court."
```


但请注意，由于模板的构建由您决定，您可以根据自己的需求进行自定义。

### 总结与资源

Weaviate 是一个可扩展的、生产就绪的向量存储。

此集成允许 Weaviate 与 LangChain 一起使用，以增强大型语言模型的能力，提供强大的数据存储。它的可扩展性和生产就绪性使其成为您 LangChain 应用程序的优秀向量存储选择，并将减少您的生产时间。


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
