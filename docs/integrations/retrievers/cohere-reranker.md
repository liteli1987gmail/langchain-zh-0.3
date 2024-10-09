---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/cohere-reranker.ipynb
---
# Cohere 重新排序器

>[Cohere](https://cohere.ai/about) 是一家加拿大初创公司，提供自然语言处理模型，帮助公司改善人机交互。

本笔记本展示了如何在检索器中使用 [Cohere 的重新排序端点](https://docs.cohere.com/docs/reranking)。这基于 [ContextualCompressionRetriever](/docs/how_to/contextual_compression) 中的思想。


```python
%pip install --upgrade --quiet  cohere
```


```python
%pip install --upgrade --quiet  faiss

# OR  (depending on Python version)

%pip install --upgrade --quiet  faiss-cpu
```


```python
# get a new token: https://dashboard.cohere.ai/

import getpass
import os

if "COHERE_API_KEY" not in os.environ:
    os.environ["COHERE_API_KEY"] = getpass.getpass("Cohere API Key:")
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
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以设置检索器以检索大量（20个）文档。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Cohere reranker"}, {"imported": "CohereEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.cohere.CohereEmbeddings.html", "title": "Cohere reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Cohere reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Cohere reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
retriever = FAISS.from_documents(
    texts, CohereEmbeddings(model="embed-english-v3.0")
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

We cannot let this happen. 

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.
----------------------------------------------------------------------------------------------------
Document 3:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
----------------------------------------------------------------------------------------------------
Document 4:

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety. 

So let’s not abandon our streets. Or choose between safety and equal justice.
----------------------------------------------------------------------------------------------------
Document 5:

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
----------------------------------------------------------------------------------------------------
Document 6:

So let’s not abandon our streets. Or choose between safety and equal justice. 

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable. 

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.
----------------------------------------------------------------------------------------------------
Document 7:

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century. 

Vice President Harris and I ran for office with a new economic vision for America. 

Invest in America. Educate Americans. Grow the workforce. Build the economy from the bottom up  
and the middle out, not from the top down.
----------------------------------------------------------------------------------------------------
Document 8:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
----------------------------------------------------------------------------------------------------
Document 9:

The widow of Sergeant First Class Heath Robinson.  

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq. 

Stationed near Baghdad, just yards from burn pits the size of football fields. 

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter. 

But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. 

Danielle says Heath was a fighter to the very end.
----------------------------------------------------------------------------------------------------
Document 10:

As I’ve told Xi Jinping, it is never a good bet to bet against the American people. 

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America. 

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.
----------------------------------------------------------------------------------------------------
Document 11:

As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” 

It’s time. 

But with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills.  

Inflation is robbing them of the gains they might otherwise feel. 

I get it. That’s why my top priority is getting prices under control.
----------------------------------------------------------------------------------------------------
Document 12:

This was a bipartisan effort, and I want to thank the members of both parties who worked to make it happen. 

We’re done talking about infrastructure weeks. 

We’re going to have an infrastructure decade. 

It is going to transform America and put us on a path to win the economic competition of the 21st Century that we face with the rest of the world—particularly with China.  

As I’ve told Xi Jinping, it is never a good bet to bet against the American people.
----------------------------------------------------------------------------------------------------
Document 13:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world. 

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced. 

The pandemic has been punishing. 

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. 

I understand.
----------------------------------------------------------------------------------------------------
Document 14:

I understand. 

I remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. 

That’s why one of the first things I did as President was fight to pass the American Rescue Plan.  

Because people were hurting. We needed to act, and we did. 

Few pieces of legislation have done more in a critical moment in our history to lift us out of crisis.
----------------------------------------------------------------------------------------------------
Document 15:

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers. 

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more. 

When they came home, many of the world’s fittest and best trained warriors were never the same. 

Headaches. Numbness. Dizziness.
----------------------------------------------------------------------------------------------------
Document 16:

Danielle says Heath was a fighter to the very end. 

He didn’t know how to stop fighting, and neither did she. 

Through her pain she found purpose to demand we do better. 

Tonight, Danielle—we are. 

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits. 

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.
----------------------------------------------------------------------------------------------------
Document 17:

Cancer is the #2 cause of death in America–second only to heart disease. 

Last month, I announced our plan to supercharge  
the Cancer Moonshot that President Obama asked me to lead six years ago. 

Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  

More support for patients and families. 

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health.
----------------------------------------------------------------------------------------------------
Document 18:

My plan to fight inflation will lower your costs and lower the deficit. 

17 Nobel laureates in economics say my plan will ease long-term inflationary pressures. Top business leaders and most Americans support my plan. And here’s the plan: 

First – cut the cost of prescription drugs. Just look at insulin. One in ten Americans has diabetes. In Virginia, I met a 13-year-old boy named Joshua Davis.
----------------------------------------------------------------------------------------------------
Document 19:

Let’s pass the Paycheck Fairness Act and paid leave.  

Raise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. 

Let’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges. 

And let’s pass the PRO Act when a majority of workers want to form a union—they shouldn’t be stopped.
----------------------------------------------------------------------------------------------------
Document 20:

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  

Last year COVID-19 kept us apart. This year we are finally together again. 

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. 

With a duty to one another to the American people to the Constitution. 

And with an unwavering resolve that freedom will always triumph over tyranny.
```
## 使用CohereRerank进行重新排序
现在让我们用`ContextualCompressionRetriever`包装我们的基础检索器。我们将添加一个`CohereRerank`，使用Cohere重新排序端点对返回的结果进行重新排序。
请注意，必须在CohereRerank中指定模型名称！


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers.contextual_compression", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "Cohere reranker"}, {"imported": "CohereRerank", "source": "langchain_cohere", "docs": "https://python.langchain.com/api_reference/cohere/rerank/langchain_cohere.rerank.CohereRerank.html", "title": "Cohere reranker"}, {"imported": "Cohere", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.cohere.Cohere.html", "title": "Cohere reranker"}]-->
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
from langchain_community.llms import Cohere

llm = Cohere(temperature=0)
compressor = CohereRerank(model="rerank-english-v3.0")
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```

当然，您可以在QA管道中使用此检索器


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Cohere reranker"}]-->
from langchain.chains import RetrievalQA
```


```python
chain = RetrievalQA.from_chain_type(
    llm=Cohere(temperature=0), retriever=compression_retriever
)
```


```python
chain({"query": query})
```



```output
{'query': 'What did the president say about Ketanji Brown Jackson',
 'result': " The president speaks highly of Ketanji Brown Jackson, stating that she is one of the nation's top legal minds, and will continue the legacy of excellence of Justice Breyer. The president also mentions that he worked with her family and that she comes from a family of public school educators and police officers. Since her nomination, she has received support from various groups, including the Fraternal Order of Police and judges from both major political parties. \n\nWould you like me to extract another sentence from the provided text? "}
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
