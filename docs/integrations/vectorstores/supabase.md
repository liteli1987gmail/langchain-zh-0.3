---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/supabase.ipynb
---
# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) 是一个开源的 Firebase 替代品。`Supabase` 构建在 `PostgreSQL` 之上，提供强大的 SQL 查询能力，并与现有工具和框架实现简单的接口。

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)，也称为 `Postgres`，是一个免费的开源关系数据库管理系统 (RDBMS)，强调可扩展性和 SQL 兼容性。

本笔记本展示了如何使用 `Supabase` 和 `pgvector` 作为你的向量存储。

你需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

要运行此笔记本，请确保：
- `pgvector` 扩展已启用
- 你已安装 `supabase-py` 包
- 你在数据库中创建了 `match_documents` 函数
- 你在 `public` 模式中有一个类似于下面的 `documents` 表。

以下函数用于计算余弦相似度，但您可以根据需要进行调整。

```sql
-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table
  documents (
    id uuid primary key,
    content text, -- corresponds to Document.pageContent
    metadata jsonb, -- corresponds to Document.metadata
    embedding vector (1536) -- 1536 works for OpenAI embeddings, change if needed
  );

-- Create a function to search for documents
create function match_documents (
  query_embedding vector (1536),
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding;
end;
$$;
```


```python
# with pip
%pip install --upgrade --quiet  supabase

# with conda
# !conda install -c conda-forge supabase
```

我们想使用 `OpenAIEmbeddings`，所以我们必须获取 OpenAI API 密钥。


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```


```python
if "SUPABASE_URL" not in os.environ:
    os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
```


```python
if "SUPABASE_SERVICE_KEY" not in os.environ:
    os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
```


```python
# If you're storing your Supabase and OpenAI API keys in a .env file, you can load them with dotenv
from dotenv import load_dotenv

load_dotenv()
```

首先，我们将创建一个 Supabase 客户端并实例化一个 OpenAI 嵌入类。


```python
<!--IMPORTS:[{"imported": "SupabaseVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.supabase.SupabaseVectorStore.html", "title": "Supabase (Postgres)"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Supabase (Postgres)"}]-->
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

接下来，我们将加载并解析一些数据以供我们的向量存储使用（如果您已经在数据库中存储了带有嵌入的文档，可以跳过此步骤）。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Supabase (Postgres)"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Supabase (Postgres)"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

将上述文档插入数据库。每个文档将自动生成嵌入。您可以根据文档的数量调整 chunk_size。默认值为 500，但可能需要降低。


```python
vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
    chunk_size=500,
)
```

或者，如果您已经在数据库中有带有嵌入的文档，只需直接实例化一个新的 `SupabaseVectorStore`：


```python
vector_store = SupabaseVectorStore(
    embedding=embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

最后，通过执行相似性搜索来测试它：


```python
query = "What did the president say about Ketanji Brown Jackson"
matched_docs = vector_store.similarity_search(query)
```


```python
print(matched_docs[0].page_content)
```
```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
## 带分数的相似性搜索


返回的距离分数是余弦距离。因此，分数越低越好。


```python
matched_docs = vector_store.similarity_search_with_relevance_scores(query)
```


```python
matched_docs[0]
```



```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 0.802509746274066)
```


## 检索器选项

本节介绍如何将 SupabaseVectorStore 用作检索器的不同选项。

### 最大边际相关性搜索

除了在检索器对象中使用相似性搜索外，您还可以使用 `mmr`。



```python
retriever = vector_store.as_retriever(search_type="mmr")
```


```python
matched_docs = retriever.invoke(query)
```


```python
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```
```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

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

## Document 2

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.  

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming. 

But I want you to know that we are going to be okay. 

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger. 

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 3

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. 

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. 

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
