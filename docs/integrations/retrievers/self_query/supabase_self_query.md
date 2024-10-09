---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/self_query/supabase_self_query.ipynb
---
# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) 是一个开源的 `Firebase` 替代品。
> `Supabase` 构建在 `PostgreSQL` 之上，提供强大的 `SQL`
> 查询能力，并与现有工具和框架提供简单的接口。

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)，也称为 `Postgres`，
> 是一个免费的开源关系数据库管理系统 (RDBMS)
> 强调可扩展性和 `SQL` 兼容性。
>
>[Supabase](https://supabase.com/docs/guides/ai) 提供一个开源工具包，用于开发 AI 应用程序
> 使用 Postgres 和 pgvector。使用 Supabase 客户端库来存储、索引和查询您的向量嵌入，规模化处理。

在笔记本中，我们将演示围绕 `Supabase` 向量存储的 `SelfQueryRetriever`。

具体来说，我们将：
1. 创建一个 Supabase 数据库
2. 启用 `pgvector` 扩展
3. 创建一个 `documents` 表和 `match_documents` 函数，这将被 `SupabaseVectorStore` 使用
4. 将示例文档加载到向量存储（数据库表）中
5. 构建并测试一个自查询检索器

## 设置 Supabase 数据库

1. 前往 https://database.new 来配置您的 Supabase 数据库。
2. 在工作室中，跳转到 [SQL 编辑器](https://supabase.com/dashboard/project/_/sql/new) 并运行以下脚本以启用 `pgvector` 并将您的数据库设置为向量存储：
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

## 创建 Supabase 向量存储
接下来，我们想要创建一个 Supabase 向量存储并用一些数据进行初始化。我们创建了一小组包含电影摘要的演示文档。

请确保安装最新版本的 `langchain`，并支持 `openai`：


```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

自查询检索器需要您安装 `lark`：


```python
%pip install --upgrade --quiet  lark
```

我们还需要 `supabase` 包：


```python
%pip install --upgrade --quiet  supabase
```

由于我们使用 `SupabaseVectorStore` 和 `OpenAIEmbeddings`，我们必须加载它们的 API 密钥。

- 要找到您的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY`，请前往您的 Supabase 项目的 [API 设置](https://supabase.com/dashboard/project/_/settings/api)。
- `SUPABASE_URL` 对应于项目 URL
- `SUPABASE_SERVICE_KEY` 对应于 `service_role` API 密钥

- 要获取您的 `OPENAI_API_KEY`，请在您的 OpenAI 账户中导航到 [API 密钥](https://platform.openai.com/account/api-keys) 并创建一个新的密钥。


```python
import getpass
import os

if "SUPABASE_URL" not in os.environ:
    os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
if "SUPABASE_SERVICE_KEY" not in os.environ:
    os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_可选:_ 如果您将 Supabase 和 OpenAI API 密钥存储在 `.env` 文件中，可以使用 [`dotenv`](https://github.com/theskumar/python-dotenv) 加载它们。


```python
%pip install --upgrade --quiet  python-dotenv
```


```python
from dotenv import load_dotenv

load_dotenv()
```

首先，我们将创建一个 Supabase 客户端并实例化一个 OpenAI 嵌入类。


```python
<!--IMPORTS:[{"imported": "SupabaseVectorStore", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.supabase.SupabaseVectorStore.html", "title": "Supabase (Postgres)"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Supabase (Postgres)"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Supabase (Postgres)"}]-->
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

接下来，让我们创建我们的文档。


```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## 创建自查询检索器
现在我们可以实例化我们的检索器。为此，我们需要提前提供一些关于文档支持的元数据字段的信息以及文档内容的简短描述。


```python
<!--IMPORTS:[{"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.base", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "Supabase (Postgres)"}, {"imported": "SelfQueryRetriever", "source": "langchain.retrievers.self_query.base", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.self_query.base.SelfQueryRetriever.html", "title": "Supabase (Postgres)"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Supabase (Postgres)"}]-->
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## 测试一下
现在我们可以尝试实际使用我们的检索器！


```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```
```output
query='dinosaur' filter=None limit=None
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```



```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```
```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```


```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```



```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```
```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```


```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```



```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```
```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```


```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```



```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```
```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```


```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```


## 过滤 k

我们还可以使用自查询检索器来指定 `k`：要获取的文档数量。

我们可以通过将 `enable_limit=True` 传递给构造函数来实现这一点。


```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```


```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
```output
query='dinosaur' filter=None limit=2
```


```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

