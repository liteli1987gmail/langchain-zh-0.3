---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/long_context_reorder.ipynb
---
# 如何重新排序检索结果以减轻“迷失在中间”的效果

在[RAG](/docs/tutorials/rag)应用中，随着检索文档数量的增加（例如，超过十个），性能显著下降的情况已被[记录](https://arxiv.org/abs/2307.03172)。简而言之：模型容易在长上下文中遗漏相关信息。

相比之下，对向量存储的查询通常会按相关性降序返回文档（例如，通过[嵌入](/docs/concepts/#embedding-models)的余弦相似度来衡量）。

为了减轻[“迷失在中间”](https://arxiv.org/abs/2307.03172)的效果，您可以在检索后重新排序文档，使得最相关的文档位于极端位置（例如，上下文的第一和最后部分），而最不相关的文档位于中间。在某些情况下，这可以帮助LLMs更好地呈现最相关的信息。

[LongContextReorder](https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.long_context_reorder.LongContextReorder.html)文档转换器实现了这一重新排序过程。下面我们演示一个示例。


```python
%pip install --upgrade --quiet  sentence-transformers langchain-chroma langchain langchain-openai langchain-huggingface > /dev/null
```

首先，我们嵌入一些人工文档并将其索引到一个（内存中的）[Chroma](/docs/integrations/providers/chroma/) 向量存储中。我们将使用 [Hugging Face](/docs/integrations/text_embedding/huggingfacehub/) 嵌入，但任何 LangChain 向量存储或嵌入模型都可以。


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}]-->
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Get embeddings.
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

texts = [
    "Basquetball is a great sport.",
    "Fly me to the moon is one of my favourite songs.",
    "The Celtics are my favourite team.",
    "This is a document about the Boston Celtics",
    "I simply love going to the movies",
    "The Boston Celtics won the game by 20 points",
    "This is just a random text.",
    "Elden Ring is one of the best games in the last 15 years.",
    "L. Kornet is one of the best Celtics players.",
    "Larry Bird was an iconic NBA player.",
]

# Create a retriever
retriever = Chroma.from_texts(texts, embedding=embeddings).as_retriever(
    search_kwargs={"k": 10}
)
query = "What can you tell me about the Celtics?"

# Get relevant documents ordered by relevance score
docs = retriever.invoke(query)
docs
```



```output
[Document(page_content='This is a document about the Boston Celtics'),
 Document(page_content='The Celtics are my favourite team.'),
 Document(page_content='L. Kornet is one of the best Celtics players.'),
 Document(page_content='The Boston Celtics won the game by 20 points'),
 Document(page_content='Larry Bird was an iconic NBA player.'),
 Document(page_content='Elden Ring is one of the best games in the last 15 years.'),
 Document(page_content='Basquetball is a great sport.'),
 Document(page_content='I simply love going to the movies'),
 Document(page_content='Fly me to the moon is one of my favourite songs.'),
 Document(page_content='This is just a random text.')]
```


请注意，文档是按与查询的相关性降序返回的。`LongContextReorder` 文档转换器将实现上述重新排序：


```python
<!--IMPORTS:[{"imported": "LongContextReorder", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.long_context_reorder.LongContextReorder.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}]-->
from langchain_community.document_transformers import LongContextReorder

# Reorder the documents:
# Less relevant document will be at the middle of the list and more
# relevant elements at beginning / end.
reordering = LongContextReorder()
reordered_docs = reordering.transform_documents(docs)

# Confirm that the 4 relevant documents are at beginning and end.
reordered_docs
```



```output
[Document(page_content='The Celtics are my favourite team.'),
 Document(page_content='The Boston Celtics won the game by 20 points'),
 Document(page_content='Elden Ring is one of the best games in the last 15 years.'),
 Document(page_content='I simply love going to the movies'),
 Document(page_content='This is just a random text.'),
 Document(page_content='Fly me to the moon is one of my favourite songs.'),
 Document(page_content='Basquetball is a great sport.'),
 Document(page_content='Larry Bird was an iconic NBA player.'),
 Document(page_content='L. Kornet is one of the best Celtics players.'),
 Document(page_content='This is a document about the Boston Celtics')]
```


下面，我们展示如何将重新排序的文档纳入一个简单的问答链中：


```python
<!--IMPORTS:[{"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect"}]-->
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

llm = OpenAI()

prompt_template = """
Given these texts:
-----
{context}
-----
Please answer the following question:
{query}
"""

prompt = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "query"],
)

# Create and invoke the chain:
chain = create_stuff_documents_chain(llm, prompt)
response = chain.invoke({"context": reordered_docs, "query": query})
print(response)
```
```output

The Celtics are a professional basketball team and one of the most iconic franchises in the NBA. They are highly regarded and have a large fan base. The team has had many successful seasons and is often considered one of the top teams in the league. They have a strong history and have produced many great players, such as Larry Bird and L. Kornet. The team is based in Boston and is often referred to as the Boston Celtics.
```