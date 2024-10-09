---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/contextual_compression.ipynb
---
# 如何使用上下文压缩进行检索

检索的一个挑战是，通常在将数据导入系统时，你并不知道文档存储系统将面临的具体查询。这意味着与查询最相关的信息可能会埋藏在包含大量无关文本的文档中。将整个文档传递给你的应用程序可能会导致更昂贵的LLM调用和更差的响应。

上下文压缩旨在解决这个问题。这个想法很简单：你可以使用给定查询的上下文来压缩检索到的文档，而不是立即按原样返回它们，以便只返回相关信息。这里的“压缩”既指压缩单个文档的内容，也指整体过滤掉文档。

要使用上下文压缩检索器，你需要：

- 一个基础检索器
- 一个文档压缩器

上下文压缩检索器将查询传递给基础检索器，获取初始文档并将其传递给文档压缩器。文档压缩器接收文档列表，通过减少文档内容或完全删除文档来缩短列表。

## 开始使用


```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## 使用普通向量存储检索器
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以看到，给定一个示例问题，我们的检索器返回一到两个相关文档和一些不相关文档。即使是相关文档中也包含很多不相关的信息。



```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "How to do retrieval with contextual compression"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "How to do retrieval with contextual compression"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to do retrieval with contextual compression"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
retriever = FAISS.from_documents(texts, OpenAIEmbeddings()).as_retriever()

docs = retriever.invoke("What did the president say about Ketanji Brown Jackson")
pretty_print_docs(docs)
```
```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
----------------------------------------------------------------------------------------------------
Document 3:

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. 

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. 

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. 

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  

First, beat the opioid epidemic.
----------------------------------------------------------------------------------------------------
Document 4:

Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. 

And as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  

That ends on my watch. 

Medicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. 

We’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. 

Let’s pass the Paycheck Fairness Act and paid leave.  

Raise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. 

Let’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.
```
## 使用 `LLMChainExtractor` 添加上下文压缩
现在让我们用 `ContextualCompressionRetriever` 包装我们的基础检索器。我们将添加一个 `LLMChainExtractor`，它将遍历最初返回的文档，并仅提取与查询相关的内容。



```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "How to do retrieval with contextual compression"}, {"imported": "LLMChainExtractor", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.chain_extract.LLMChainExtractor.html", "title": "How to do retrieval with contextual compression"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
compressor = LLMChainExtractor.from_llm(llm)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```
## 更多内置压缩器：过滤器
### `LLMChainFilter`
`LLMChainFilter` 是一个稍微简单但更强大的压缩器，它使用 LLM 链来决定过滤掉哪些最初检索到的文档，以及返回哪些文档，而不操纵文档内容。




```python
<!--IMPORTS:[{"imported": "LLMChainFilter", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.chain_filter.LLMChainFilter.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain.retrievers.document_compressors import LLMChainFilter

_filter = LLMChainFilter.from_llm(llm)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=_filter, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
### `LLMListwiseRerank`

[LLMListwiseRerank](https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.listwise_rerank.LLMListwiseRerank.html) 使用 [零样本列表文档重排序](https://arxiv.org/pdf/2305.02156)，其功能类似于 `LLMChainFilter`，作为一种强大但更昂贵的选项。建议使用更强大的 LLM。

请注意，`LLMListwiseRerank` 需要实现 [with_structured_output](/docs/integrations/chat/) 方法的模型。


```python
<!--IMPORTS:[{"imported": "LLMListwiseRerank", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.listwise_rerank.LLMListwiseRerank.html", "title": "How to do retrieval with contextual compression"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain.retrievers.document_compressors import LLMListwiseRerank
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

_filter = LLMListwiseRerank.from_llm(llm, top_n=1)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=_filter, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
### `嵌入过滤器`

对每个检索到的文档进行额外的LLM调用是昂贵且缓慢的。`嵌入过滤器`通过对文档和查询进行嵌入，提供了一种更便宜和更快速的选项，仅返回与查询具有足够相似嵌入的文档。



```python
<!--IMPORTS:[{"imported": "EmbeddingsFilter", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.embeddings_filter.EmbeddingsFilter.html", "title": "How to do retrieval with contextual compression"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain.retrievers.document_compressors import EmbeddingsFilter
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
embeddings_filter = EmbeddingsFilter(embeddings=embeddings, similarity_threshold=0.76)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=embeddings_filter, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. 

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. 

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```
## 将压缩器和文档转换器串联在一起
使用`文档压缩器管道`，我们还可以轻松地将多个压缩器按顺序组合在一起。除了压缩器，我们还可以将`基础文档转换器`添加到我们的管道中，这些转换器不执行任何上下文压缩，而只是对一组文档进行某种转换。例如，`文本分割器`可以用作文档转换器，将文档拆分成更小的部分，而`嵌入冗余过滤器`可以根据文档之间的嵌入相似性过滤掉冗余文档。

下面我们创建一个压缩器管道，首先将文档拆分成更小的块，然后移除冗余文档，最后根据与查询的相关性进行过滤。



```python
<!--IMPORTS:[{"imported": "DocumentCompressorPipeline", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.base.DocumentCompressorPipeline.html", "title": "How to do retrieval with contextual compression"}, {"imported": "EmbeddingsRedundantFilter", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.embeddings_redundant_filter.EmbeddingsRedundantFilter.html", "title": "How to do retrieval with contextual compression"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to do retrieval with contextual compression"}]-->
from langchain.retrievers.document_compressors import DocumentCompressorPipeline
from langchain_community.document_transformers import EmbeddingsRedundantFilter
from langchain_text_splitters import CharacterTextSplitter

splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=0, separator=". ")
redundant_filter = EmbeddingsRedundantFilter(embeddings=embeddings)
relevant_filter = EmbeddingsFilter(embeddings=embeddings, similarity_threshold=0.76)
pipeline_compressor = DocumentCompressorPipeline(
    transformers=[splitter, redundant_filter, relevant_filter]
)
```


```python
compression_retriever = ContextualCompressionRetriever(
    base_compressor=pipeline_compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson
----------------------------------------------------------------------------------------------------
Document 2:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year
----------------------------------------------------------------------------------------------------
Document 3:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder
----------------------------------------------------------------------------------------------------
Document 4:

Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. 

We can do both
```