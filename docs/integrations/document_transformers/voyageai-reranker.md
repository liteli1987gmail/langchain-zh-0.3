---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/voyageai-reranker.ipynb
---
# VoyageAI 重新排序器

>[Voyage AI](https://www.voyageai.com/) 提供尖端的嵌入/向量化模型。

本笔记本展示了如何在检索器中使用 [Voyage AI 的重新排序端点](https://api.voyageai.com/v1/rerank)。这基于 [ContextualCompressionRetriever](/docs/how_to/contextual_compression) 中的思想。


```python
%pip install --upgrade --quiet  voyageai
%pip install --upgrade --quiet  langchain-voyageai
```


```python
%pip install --upgrade --quiet  faiss

# OR  (depending on Python version)

%pip install --upgrade --quiet  faiss-cpu
```


```python
# To obtain your key, create an account on https://www.voyageai.com

import getpass
import os

if "VOYAGE_API_KEY" not in os.environ:
    os.environ["VOYAGE_API_KEY"] = getpass.getpass("Voyage AI API Key:")
```


```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## 设置基础向量存储检索器
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以设置检索器以检索大量（20）文档。您可以使用以下任意嵌入模型：([来源](https://docs.voyageai.com/docs/embeddings))：

- `voyage-large-2`（默认）
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`
- `voyage-finance-2`
- `voyage-multilingual-2`


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "VoyageAI Reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "VoyageAI Reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "VoyageAI Reranker"}, {"imported": "VoyageAIEmbeddings", "source": "langchain_voyageai", "docs": "https://python.langchain.com/api_reference/voyageai/embeddings/langchain_voyageai.embeddings.VoyageAIEmbeddings.html", "title": "VoyageAI Reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_voyageai import VoyageAIEmbeddings

documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
retriever = FAISS.from_documents(
    texts, VoyageAIEmbeddings(model="voyage-law-2")
).as_retriever(search_kwargs={"k": 20})

query = "What did the president say about Ketanji Brown Jackson"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```
```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
----------------------------------------------------------------------------------------------------
Document 3:

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.
----------------------------------------------------------------------------------------------------
Document 4:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world.

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced.

The pandemic has been punishing.

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more.

I understand.
----------------------------------------------------------------------------------------------------
Document 5:

As I’ve told Xi Jinping, it is never a good bet to bet against the American people.

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America.

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.
----------------------------------------------------------------------------------------------------
Document 6:

I understand.

I remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it.

That’s why one of the first things I did as President was fight to pass the American Rescue Plan.

Because people were hurting. We needed to act, and we did.

Few pieces of legislation have done more in a critical moment in our history to lift us out of crisis.
----------------------------------------------------------------------------------------------------
Document 7:

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

So let’s not abandon our streets. Or choose between safety and equal justice.
----------------------------------------------------------------------------------------------------
Document 8:

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.
----------------------------------------------------------------------------------------------------
Document 9:

And tonight, I’m announcing that the Justice Department will name a chief prosecutor for pandemic fraud.

By the end of this year, the deficit will be down to less than half what it was before I took office.

The only president ever to cut the deficit by more than one trillion dollars in a single year.

Lowering your costs also means demanding more competition.

I’m a capitalist, but capitalism without competition isn’t capitalism.

It’s exploitation—and it drives up prices.
----------------------------------------------------------------------------------------------------
Document 10:

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.
----------------------------------------------------------------------------------------------------
Document 11:

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.
----------------------------------------------------------------------------------------------------
Document 12:

This was a bipartisan effort, and I want to thank the members of both parties who worked to make it happen.

We’re done talking about infrastructure weeks.

We’re going to have an infrastructure decade.

It is going to transform America and put us on a path to win the economic competition of the 21st Century that we face with the rest of the world—particularly with China.

As I’ve told Xi Jinping, it is never a good bet to bet against the American people.
----------------------------------------------------------------------------------------------------
Document 13:

So let’s not abandon our streets. Or choose between safety and equal justice.

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable.

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.
----------------------------------------------------------------------------------------------------
Document 14:

Let’s pass the Paycheck Fairness Act and paid leave.

Raise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty.

Let’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.

And let’s pass the PRO Act when a majority of workers want to form a union—they shouldn’t be stopped.
----------------------------------------------------------------------------------------------------
Document 15:

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
----------------------------------------------------------------------------------------------------
Document 16:

To all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world.

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.
----------------------------------------------------------------------------------------------------
Document 17:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
----------------------------------------------------------------------------------------------------
Document 18:

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

Vice President Harris and I ran for office with a new economic vision for America.

Invest in America. Educate Americans. Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.
----------------------------------------------------------------------------------------------------
Document 19:

Every Administration says they’ll do it, but we are actually doing it.

We will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America.

But to compete for the best jobs of the future, we also need to level the playing field with China and other competitors.
----------------------------------------------------------------------------------------------------
Document 20:

The only nation that can be defined by a single word: possibilities.

So on this night, in our 245th year as a nation, I have come to report on the State of the Union.

And my report is this: the State of the Union is strong—because you, the American people, are strong.

We are stronger today than we were a year ago.

And we will be stronger a year from now than we are today.

Now is our moment to meet and overcome the challenges of our time.

And we will, as one people.

One America.
```
## 使用VoyageAIRerank进行重排序
现在让我们用 `ContextualCompressionRetriever` 包装我们的基础检索器。我们将使用 Voyage AI 的重排序器对返回的结果进行重排序。您可以使用以下任一重排序模型: ([source](https://docs.voyageai.com/docs/reranker)):

- `rerank-1`
- `rerank-lite-1`


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "VoyageAI Reranker"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "VoyageAI Reranker"}, {"imported": "VoyageAIRerank", "source": "langchain_voyageai", "docs": "https://python.langchain.com/api_reference/voyageai/rerank/langchain_voyageai.rerank.VoyageAIRerank.html", "title": "VoyageAI Reranker"}]-->
from langchain.retrievers import ContextualCompressionRetriever
from langchain_openai import OpenAI
from langchain_voyageai import VoyageAIRerank

llm = OpenAI(temperature=0)
compressor = VoyageAIRerank(
    model="rerank-lite-1", voyageai_api_key=os.environ["VOYAGE_API_KEY"], top_k=3
)
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

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

So let’s not abandon our streets. Or choose between safety and equal justice.

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable.

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.
----------------------------------------------------------------------------------------------------
Document 3:

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

So let’s not abandon our streets. Or choose between safety and equal justice.
```
当然，您可以在 QA 流水线中使用这个检索器


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "VoyageAI Reranker"}]-->
from langchain.chains import RetrievalQA
```


```python
chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0), retriever=compression_retriever
)
```


```python
chain({"query": query})
```



```output
{'query': 'What did the president say about Ketanji Brown Jackson',
 'result': " The president nominated Ketanji Brown Jackson to serve on the United States Supreme Court. "}
```

