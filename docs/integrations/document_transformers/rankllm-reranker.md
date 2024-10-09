---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/rankllm-reranker.ipynb
---
# RankLLM 重新排序器


[RankLLM](https://github.com/castorini/rank_llm) 提供了一套列表式重新排序器，尽管主要关注于为该任务微调的开源大型语言模型 - RankVicuna 和 RankZephyr 是其中两个。


```python
%pip install --upgrade --quiet  rank_llm
```


```python
%pip install --upgrade --quiet  langchain_openai
```


```python
%pip install --upgrade --quiet  faiss-cpu
```


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
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
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "RankLLM Reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "RankLLM Reranker"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "RankLLM Reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "RankLLM Reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
for idx, text in enumerate(texts):
    text.metadata["id"] = idx

embedding = OpenAIEmbeddings(model="text-embedding-ada-002")
retriever = FAISS.from_documents(texts, embedding).as_retriever(search_kwargs={"k": 20})
```

# 检索 + RankLLM 重新排序 (RankZephyr)

无重新排序的检索


```python
query = "What was done to Russia?"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```
```output
Document 1:

And with an unwavering resolve that freedom will always triumph over tyranny. 

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. 

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. 

He met the Ukrainian people.
----------------------------------------------------------------------------------------------------
Document 2:

Together with our allies –we are right now enforcing powerful economic sanctions. 

We are cutting off Russia’s largest banks from the international financial system.  

Preventing Russia’s central bank from defending the Russian Ruble making Putin’s $630 Billion “war fund” worthless.   

We are choking off Russia’s access to technology that will sap its economic strength and weaken its military for years to come.
----------------------------------------------------------------------------------------------------
Document 3:

And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value. 

The Russian stock market has lost 40% of its value and trading remains suspended. Russia’s economy is reeling and Putin alone is to blame.
----------------------------------------------------------------------------------------------------
Document 4:

I spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  

We countered Russia’s lies with truth.   

And now that he has acted the free world is holding him accountable.
----------------------------------------------------------------------------------------------------
Document 5:

He rejected repeated efforts at diplomacy. 

He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   

We prepared extensively and carefully. 

We spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin.
----------------------------------------------------------------------------------------------------
Document 6:

And now that he has acted the free world is holding him accountable. 

Along with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland. 

We are inflicting pain on Russia and supporting the people of Ukraine. Putin is now isolated from the world more than ever. 

Together with our allies –we are right now enforcing powerful economic sanctions.
----------------------------------------------------------------------------------------------------
Document 7:

To all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. 

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.
----------------------------------------------------------------------------------------------------
Document 8:

And we remain clear-eyed. The Ukrainians are fighting back with pure courage. But the next few days weeks, months, will be hard on them.  

Putin has unleashed violence and chaos.  But while he may make gains on the battlefield – he will pay a continuing high price over the long run. 

And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.
----------------------------------------------------------------------------------------------------
Document 9:

Tonight I say to the Russian oligarchs and corrupt leaders who have bilked billions of dollars off this violent regime no more. 

The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs.  

We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains.
----------------------------------------------------------------------------------------------------
Document 10:

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming. 

But I want you to know that we are going to be okay. 

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.
----------------------------------------------------------------------------------------------------
Document 11:

They keep moving.   

And the costs and the threats to America and the world keep rising.   

That’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. 

The United States is a member along with 29 other nations. 

It matters. American diplomacy matters. American resolve matters. 

Putin’s latest attack on Ukraine was premeditated and unprovoked. 

He rejected repeated efforts at diplomacy.
----------------------------------------------------------------------------------------------------
Document 12:

Our forces are not going to Europe to fight in Ukraine, but to defend our NATO Allies – in the event that Putin decides to keep moving west.  

For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to protect NATO countries including Poland, Romania, Latvia, Lithuania, and Estonia. 

As I have made crystal clear the United States and our Allies will defend every inch of territory of NATO countries with the full force of our collective power.
----------------------------------------------------------------------------------------------------
Document 13:

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly. 

We see the unity among leaders of nations and a more unified Europe a more unified West. And we see unity among the people who are gathering in cities in large crowds around the world even in Russia to demonstrate their support for Ukraine.
----------------------------------------------------------------------------------------------------
Document 14:

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
----------------------------------------------------------------------------------------------------
Document 15:

In the battle between democracy and autocracy, democracies are rising to the moment, and the world is clearly choosing the side of peace and security. 

This is a real test. It’s going to take time. So let us continue to draw inspiration from the iron will of the Ukrainian people. 

To our fellow Ukrainian Americans who forge a deep bond that connects our two nations we stand with you. 

Putin may circle Kyiv with tanks, but he will never gain the hearts and souls of the Ukrainian people.
----------------------------------------------------------------------------------------------------
Document 16:

Together with our allies we are providing support to the Ukrainians in their fight for freedom. Military assistance. Economic assistance. Humanitarian assistance. 

We are giving more than $1 Billion in direct assistance to Ukraine. 

And we will continue to aid the Ukrainian people as they defend their country and to help ease their suffering.  

Let me be clear, our forces are not engaged and will not engage in conflict with Russian forces in Ukraine.
----------------------------------------------------------------------------------------------------
Document 17:

Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. 

Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. 

Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   

They keep moving.   

And the costs and the threats to America and the world keep rising.
----------------------------------------------------------------------------------------------------
Document 18:

It fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  

Helped put food on their table, keep a roof over their heads, and cut the cost of health insurance. 

And as my Dad used to say, it gave people a little breathing room.
----------------------------------------------------------------------------------------------------
Document 19:

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers. 

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more. 

When they came home, many of the world’s fittest and best trained warriors were never the same. 

Headaches. Numbness. Dizziness.
----------------------------------------------------------------------------------------------------
Document 20:

Every Administration says they’ll do it, but we are actually doing it. 

We will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. 

But to compete for the best jobs of the future, we also need to level the playing field with China and other competitors.
```
检索 + 使用 RankZephyr 重新排序


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers.contextual_compression", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "RankLLM Reranker"}, {"imported": "RankLLMRerank", "source": "langchain_community.document_compressors.rankllm_rerank", "docs": "https://python.langchain.com/api_reference/community/document_compressors/langchain_community.document_compressors.rankllm_rerank.RankLLMRerank.html", "title": "RankLLM Reranker"}]-->
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_community.document_compressors.rankllm_rerank import RankLLMRerank

compressor = RankLLMRerank(top_n=3, model="zephyr")
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)
```


```python
compressed_docs = compression_retriever.invoke(query)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

Together with our allies –we are right now enforcing powerful economic sanctions. 

We are cutting off Russia’s largest banks from the international financial system.  

Preventing Russia’s central bank from defending the Russian Ruble making Putin’s $630 Billion “war fund” worthless.   

We are choking off Russia’s access to technology that will sap its economic strength and weaken its military for years to come.
----------------------------------------------------------------------------------------------------
Document 2:

And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value. 

The Russian stock market has lost 40% of its value and trading remains suspended. Russia’s economy is reeling and Putin alone is to blame.
----------------------------------------------------------------------------------------------------
Document 3:

And now that he has acted the free world is holding him accountable. 

Along with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland. 

We are inflicting pain on Russia and supporting the people of Ukraine. Putin is now isolated from the world more than ever. 

Together with our allies –we are right now enforcing powerful economic sanctions.
```
可以在问答管道中使用


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "RankLLM Reranker"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "RankLLM Reranker"}]-->
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0), retriever=compression_retriever
)

chain({"query": query})
```



```output
{'query': 'What was done to Russia?',
 'result': 'Russia has been subjected to powerful economic sanctions, including cutting off its largest banks from the international financial system, preventing its central bank from defending the Russian Ruble, and choking off its access to technology. Additionally, American airspace has been closed to all Russian flights, further isolating Russia and adding pressure on its economy. These actions have led to a significant devaluation of the Ruble, a sharp decline in the Russian stock market, and overall economic turmoil in Russia.'}
```


# 检索 + RankLLM 重新排序 (RankGPT)

无重新排序的检索


```python
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

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
----------------------------------------------------------------------------------------------------
Document 4:

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
----------------------------------------------------------------------------------------------------
Document 5:

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century. 

Vice President Harris and I ran for office with a new economic vision for America. 

Invest in America. Educate Americans. Grow the workforce. Build the economy from the bottom up  
and the middle out, not from the top down.
----------------------------------------------------------------------------------------------------
Document 6:

And tonight, I’m announcing that the Justice Department will name a chief prosecutor for pandemic fraud. 

By the end of this year, the deficit will be down to less than half what it was before I took office.  

The only president ever to cut the deficit by more than one trillion dollars in a single year. 

Lowering your costs also means demanding more competition. 

I’m a capitalist, but capitalism without competition isn’t capitalism. 

It’s exploitation—and it drives up prices.
----------------------------------------------------------------------------------------------------
Document 7:

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety. 

So let’s not abandon our streets. Or choose between safety and equal justice.
----------------------------------------------------------------------------------------------------
Document 8:

As I’ve told Xi Jinping, it is never a good bet to bet against the American people. 

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America. 

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.
----------------------------------------------------------------------------------------------------
Document 9:

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  

Last year COVID-19 kept us apart. This year we are finally together again. 

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. 

With a duty to one another to the American people to the Constitution. 

And with an unwavering resolve that freedom will always triumph over tyranny.
----------------------------------------------------------------------------------------------------
Document 10:

As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” 

It’s time. 

But with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills.  

Inflation is robbing them of the gains they might otherwise feel. 

I get it. That’s why my top priority is getting prices under control.
----------------------------------------------------------------------------------------------------
Document 11:

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve. 

And fourth, let’s end cancer as we know it. 

This is personal to me and Jill, to Kamala, and to so many of you. 

Cancer is the #2 cause of death in America–second only to heart disease.
----------------------------------------------------------------------------------------------------
Document 12:

Headaches. Numbness. Dizziness. 

A cancer that would put them in a flag-draped coffin. 

I know. 

One of those soldiers was my son Major Beau Biden. 

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. 

But I’m committed to finding out everything we can. 

Committed to military families like Danielle Robinson from Ohio. 

The widow of Sergeant First Class Heath Robinson.
----------------------------------------------------------------------------------------------------
Document 13:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world. 

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced. 

The pandemic has been punishing. 

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. 

I understand.
----------------------------------------------------------------------------------------------------
Document 14:

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America. 

For more than two years, COVID-19 has impacted every decision in our lives and the life of the nation. 

And I know you’re tired, frustrated, and exhausted. 

But I also know this.
----------------------------------------------------------------------------------------------------
Document 15:

My plan to fight inflation will lower your costs and lower the deficit. 

17 Nobel laureates in economics say my plan will ease long-term inflationary pressures. Top business leaders and most Americans support my plan. And here’s the plan: 

First – cut the cost of prescription drugs. Just look at insulin. One in ten Americans has diabetes. In Virginia, I met a 13-year-old boy named Joshua Davis.
----------------------------------------------------------------------------------------------------
Document 16:

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. 

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  

First, beat the opioid epidemic. 

There is so much we can do. Increase funding for prevention, treatment, harm reduction, and recovery.
----------------------------------------------------------------------------------------------------
Document 17:

My plan will not only lower costs to give families a fair shot, it will lower the deficit. 

The previous Administration not only ballooned the deficit with tax cuts for the very wealthy and corporations, it undermined the watchdogs whose job was to keep pandemic relief funds from being wasted. 

But in my administration, the watchdogs have been welcomed back. 

We’re going after the criminals who stole billions in relief money meant for small businesses and millions of Americans.
----------------------------------------------------------------------------------------------------
Document 18:

So let’s not abandon our streets. Or choose between safety and equal justice. 

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable. 

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.
----------------------------------------------------------------------------------------------------
Document 19:

I understand. 

I remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. 

That’s why one of the first things I did as President was fight to pass the American Rescue Plan.  

Because people were hurting. We needed to act, and we did. 

Few pieces of legislation have done more in a critical moment in our history to lift us out of crisis.
----------------------------------------------------------------------------------------------------
Document 20:

And we will, as one people. 

One America. 

The United States of America. 

May God bless you all. May God protect our troops.
```
检索 + 使用 RankGPT 重新排序


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers.contextual_compression", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "RankLLM Reranker"}, {"imported": "RankLLMRerank", "source": "langchain_community.document_compressors.rankllm_rerank", "docs": "https://python.langchain.com/api_reference/community/document_compressors/langchain_community.document_compressors.rankllm_rerank.RankLLMRerank.html", "title": "RankLLM Reranker"}]-->
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_community.document_compressors.rankllm_rerank import RankLLMRerank

compressor = RankLLMRerank(top_n=3, model="gpt", gpt_model="gpt-3.5-turbo")
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)
```


```python
compressed_docs = compression_retriever.invoke(query)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
----------------------------------------------------------------------------------------------------
Document 3:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
```
您可以在问答管道中使用此检索器


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "RankLLM Reranker"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "RankLLM Reranker"}]-->
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0), retriever=compression_retriever
)

chain({"query": query})
```



```output
{'query': 'What did the president say about Ketanji Brown Jackson',
 'result': "The President mentioned that Ketanji Brown Jackson is one of the nation's top legal minds and that she will continue Justice Breyer's legacy of excellence. He highlighted her background as a former top litigator in private practice and a former federal public defender, as well as coming from a family of public school educators and police officers. He also mentioned that since her nomination, she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

